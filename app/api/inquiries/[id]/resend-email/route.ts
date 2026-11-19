import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/auth';
import { sendInquiryNotificationEmail, sendCustomerAcknowledgmentEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('inquiries');
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const target = body.target || 'both'; // 'admin' | 'customer' | 'both'

    const doc = await adminDb.collection(COLLECTIONS.INQUIRIES).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Inquiry record not found' }, { status: 404 });
    }

    const data = doc.data() || {};
    const inquiryData = {
      reference: data.reference || `GES-VAL-${id.slice(0, 5)}`,
      vehicleType: data.vehicleType || 'car',
      regNumber: data.regNumber || '',
      name: data.name || 'Valued Vehicle Owner',
      email: data.email || '',
      phone: data.phone || '',
      pincode: data.pincode || '',
      estimate: data.estimate,
      preferredSlot: data.preferredSlot || '',
      source: data.source || 'admin_panel',
      notes: data.notes || '',
    };

    const results: { admin?: any; customer?: any } = {};

    if (target === 'admin' || target === 'both') {
      results.admin = await sendInquiryNotificationEmail(inquiryData);
    }

    if (target === 'customer' || target === 'both') {
      if (inquiryData.email && inquiryData.email.includes('@')) {
        results.customer = await sendCustomerAcknowledgmentEmail(inquiryData);
      } else {
        results.customer = { success: false, reason: 'No customer email address on record' };
      }
    }

    return NextResponse.json({
      success: true,
      message: `Email notification triggered successfully (${target})`,
      results,
    });
  } catch (error: unknown) {
    console.error('Resend email error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

