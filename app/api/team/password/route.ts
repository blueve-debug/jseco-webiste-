import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { requireAuth, isPrimarySuperAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth('settings');
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { id, password } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6 || password.length > 100) {
      return NextResponse.json(
        { error: 'Password must be between 6 and 100 characters' },
        { status: 400 }
      );
    }

    const isTargetSuper = id === 'kUwXnXdVTNYEunUTJjz6vC1aa8m2';
    const callerIsSuper = isPrimarySuperAdmin(auth.session);

    // Non-super admins cannot reset the primary super administrator's credentials
    if (isTargetSuper && !callerIsSuper) {
      return NextResponse.json(
        { error: 'Permission denied: Cannot modify primary super administrator credentials' },
        { status: 403 }
      );
    }

    // Update password in Firebase Auth
    try {
      await adminAuth.updateUser(id, { password: password.trim() });
    } catch (authError: unknown) {
      const err = authError as { message?: string };
      console.error('Password update auth error:', authError);
      return NextResponse.json(
        { error: err.message || 'Failed to update user password in authentication service' },
        { status: 400 }
      );
    }

    // Record password update timestamp in Firestore for security auditing
    await adminDb.collection(COLLECTIONS.ADMIN).doc(id).set(
      {
        passwordUpdatedAt: new Date().toISOString(),
        passwordUpdatedBy: auth.session.email,
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
