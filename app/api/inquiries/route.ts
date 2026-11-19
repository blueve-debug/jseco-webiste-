import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { parsePagination, paginationMeta } from '@/lib/utils';
import { sendInquiryNotificationEmail, sendCustomerAcknowledgmentEmail } from '@/lib/email';
import { getClientIp, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/auth';

const VALID_VEHICLE_TYPES = new Set(['car', 'commercial', '2-wheeler', '3-wheeler']);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth('inquiries');
    if (!auth.authorized) return auth.response;
    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePagination(searchParams);
    const status = searchParams.get('status') || '';
    const vehicleType = searchParams.get('vehicleType') || '';
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    // Fetch inquiries ordered by createdAt desc
    const snap = await adminDb.collection(COLLECTIONS.INQUIRIES).orderBy('createdAt', 'desc').get();
    let docs = snap.docs;

    if (status && status !== 'all') {
      docs = docs.filter((doc) => doc.data().status === status);
    }

    if (vehicleType && vehicleType !== 'all') {
      docs = docs.filter((doc) => {
        const vt = (doc.data().vehicleType || '').toLowerCase();
        if (vehicleType === '2-wheeler' || vehicleType === 'bike') {
          return vt === '2-wheeler' || vt === 'bike' || vt === 'two-wheeler';
        }
        if (vehicleType === 'commercial' || vehicleType === 'truck') {
          return vt === 'commercial' || vt === 'truck';
        }
        if (vehicleType === '3-wheeler') {
          return vt === '3-wheeler' || vt === 'three-wheeler';
        }
        return vt === vehicleType;
      });
    }

    if (search) {
      docs = docs.filter((doc) => {
        const d = doc.data();
        return (
          doc.id.toLowerCase().includes(search) ||
          (d.reference && d.reference.toLowerCase().includes(search)) ||
          (d.name && d.name.toLowerCase().includes(search)) ||
          (d.phone && d.phone.toLowerCase().includes(search)) ||
          (d.regNumber && d.regNumber.toLowerCase().includes(search)) ||
          (d.pincode && d.pincode.toLowerCase().includes(search))
        );
      });
    }

    const total = docs.length;
    const startIndex = (page - 1) * limit;
    const paginatedDocs = docs.slice(startIndex, startIndex + limit);

    const inquiries = paginatedDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Status counts
    const allInquiriesSnap = await adminDb.collection(COLLECTIONS.INQUIRIES).get();
    const statusCounts: Record<string, number> = {
      all: allInquiriesSnap.size,
      new: 0,
      contacted: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    };

    allInquiriesSnap.docs.forEach((doc) => {
      const s = doc.data().status;
      if (s && statusCounts[s] !== undefined) {
        statusCounts[s]++;
      }
    });

    return NextResponse.json({
      inquiries,
      pagination: paginationMeta(total, page, limit),
      statusCounts,
    });
  } catch (error) {
    console.error('Inquiries GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    // Rate Limiting: Max 8 inquiries per 5 minutes per IP
    const rateCheck = checkRateLimit('public_inquiries', clientIp, 8, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before submitting another valuation inquiry.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetInSeconds),
          },
        }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid or malformed JSON payload' },
        { status: 400 }
      );
    }

    // Honeypot Protection: Automated bots fill hidden fields; silently discard
    if (body.website || body.hp_website || body.company_website || body.fax) {
      return NextResponse.json({
        success: true,
        reference: `GES-VAL-${Math.floor(10000 + Math.random() * 90000)}`,
      });
    }

    // Strict Phone Validation
    const rawPhone = String(body.phone || '').replace(/\D/g, '');
    if (rawPhone.length < 10) {
      return NextResponse.json(
        { error: 'Valid 10-digit phone number is required' },
        { status: 400 }
      );
    }
    const cleanPhone = rawPhone.slice(-10);

    // Email Validation (required so both customer and admin receive confirmation)
    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!rawEmail || rawEmail.length > 120 || !EMAIL_REGEX.test(rawEmail)) {
      return NextResponse.json(
        { error: 'A valid email address is required to receive your official vehicle valuation estimate' },
        { status: 400 }
      );
    }
    const customerEmail = rawEmail;

    // Vehicle Type Whitelist
    const rawVehicleType = String(body.vehicleType || 'car').toLowerCase();
    const vehicleType = VALID_VEHICLE_TYPES.has(rawVehicleType) ? rawVehicleType : 'car';

    // Registration Number Sanitization
    const cleanReg = String(body.regNumber || '')
      .toUpperCase()
      .replace(/[^A-Z0-9 -]/g, '')
      .trim()
      .slice(0, 20);

    // Name Sanitization (limit to 100 chars)
    const cleanName = String(body.name || '')
      .trim()
      .slice(0, 100) || 'Valued Vehicle Owner';

    // Pincode Sanitization (limit to 10 chars)
    const cleanPincode = String(body.pincode || '')
      .trim()
      .replace(/[^0-9A-Za-z -]/g, '')
      .slice(0, 10);

    // Notes / Remarks Sanitization (limit to 1000 chars)
    const cleanNotes = String(body.notes || '')
      .trim()
      .slice(0, 1000);

    const preferredSlot = String(body.preferredSlot || body.preferredDate || '').trim().slice(0, 60);
    const source = String(body.source || 'homepage_estimate_widget').trim().slice(0, 60);

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const reference = `GES-VAL-${randomSuffix}`;

    const newInquiry = {
      reference,
      vehicleType,
      regNumber: cleanReg,
      name: cleanName,
      phone: cleanPhone,
      email: customerEmail,
      pincode: cleanPincode,
      estimate: (body.estimate && typeof body.estimate === 'object') ? (body.estimate as any) : null,
      preferredSlot,
      status: 'new', // 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled'
      source,
      notes: cleanNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection(COLLECTIONS.INQUIRIES).add(newInquiry);

    // Dispatch notifications to both configured Admins and the Customer
    const emailTasks: Promise<unknown>[] = [
      sendInquiryNotificationEmail({
        ...newInquiry,
        reference,
      }).catch((err) => {
        console.error('Admin inquiry notification email failed:', err);
        return { success: false, error: String(err) };
      }),
    ];

    if (customerEmail && customerEmail.includes('@')) {
      emailTasks.push(
        sendCustomerAcknowledgmentEmail({
          ...newInquiry,
          reference,
        }).catch((err) => {
          console.error('Customer acknowledgment email failed:', err);
          return { success: false, error: String(err) };
        })
      );
    }

    // Await delivery with a safety timeout so API responds reliably
    try {
      await Promise.race([
        Promise.allSettled(emailTasks),
        new Promise((resolve) => setTimeout(resolve, 3500)),
      ]);
    } catch (err) {
      console.warn('Email dispatch non-blocking error:', err);
    }

    return NextResponse.json(
      {
        success: true,
        id: docRef.id,
        reference,
        inquiry: {
          id: docRef.id,
          ...newInquiry,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Inquiries POST error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
