import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { getClientIp, checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    // Brute-force protection: Max 5 attempts per 15 minutes per IP
    const rateCheck = checkRateLimit('admin_login', clientIp, MAX_FAILED_ATTEMPTS, LOCKOUT_WINDOW_MS);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts from this IP. Please wait ${Math.ceil(
            rateCheck.resetInSeconds / 60
          )} minutes before trying again.`,
        },
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
    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const rawPassword = typeof body.password === 'string' ? body.password : '';

    if (!rawEmail || !rawPassword || rawEmail.length > 120 || rawPassword.length > 128) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Authentication service is not configured' },
        { status: 500 }
      );
    }

    // Authenticate with Firebase Auth REST API
    const authRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: rawEmail, password: rawPassword, returnSecureToken: true }),
      }
    );

    const authData = await authRes.json();

    if (!authRes.ok) {
      const errorMsg = authData?.error?.message || 'Authentication failed';
      let userFriendlyError = 'Invalid email or password';
      if (errorMsg.includes('USER_DISABLED')) {
        userFriendlyError = 'This user account has been disabled';
      } else if (errorMsg.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
        userFriendlyError = 'Too many failed attempts. Please try again later.';
      }
      return NextResponse.json(
        { error: userFriendlyError },
        { status: 401 }
      );
    }

    const uid = authData.localId;
    const userEmail = authData.email;

    // Check if the uid exists in the 'admin' collection in Firestore
    const adminDocRef = adminDb.collection(COLLECTIONS.ADMIN).doc(uid);
    const adminDoc = await adminDocRef.get();

    if (!adminDoc.exists) {
      return NextResponse.json(
        { error: 'Access denied: not an administrator' },
        { status: 403 }
      );
    }

    const adminData = adminDoc.data() || {};

    if (adminData.status === 'suspended') {
      return NextResponse.json(
        { error: 'Your account has been suspended by the administrator.' },
        { status: 403 }
      );
    }

    const adminName = adminData.name || authData.displayName || 'Administrator';
    const allowedModules = Array.isArray(adminData.allowedModules) && adminData.allowedModules.length > 0
      ? adminData.allowedModules
      : [
          'dashboard', 'products', 'categories', 'orders', 'customers',
          'inquiries', 'scrapCategories', 'scrapProducts', 'content', 'settings'
        ];

    // Reset failed login attempt counter on successful authentication
    resetRateLimit('admin_login', clientIp);

    // Record last login telemetry
    await adminDocRef.set(
      {
        lastLogin: new Date().toISOString(),
        lastLoginIp: clientIp,
      },
      { merge: true }
    );

    await createSession(uid, userEmail, adminName, allowedModules);

    return NextResponse.json({
      success: true,
      user: {
        uid,
        email: userEmail,
        name: adminName,
        role: 'admin',
        allowedModules,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during authentication' },
      { status: 500 }
    );
  }
}
