import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth, COLLECTIONS } from '@/lib/firebase-admin';
import { parsePagination, paginationMeta } from '@/lib/utils';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth('customers');
    if (!auth.authorized) return auth.response;
    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePagination(searchParams);
    const search = searchParams.get('search')?.toLowerCase() || '';

    // Get users from Firebase Auth
    const listResult = await adminAuth.listUsers(1000);

    let users = listResult.users.map(user => ({
      uid: user.uid,
      phoneNumber: user.phoneNumber || '',
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      disabled: user.disabled,
      createdAt: user.metadata.creationTime || '',
      lastSignIn: user.metadata.lastSignInTime || '',
    }));

    // Search filter
    if (search) {
      users = users.filter(user =>
        user.phoneNumber?.toLowerCase().includes(search) ||
        user.displayName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.uid.toLowerCase().includes(search)
      );
    }

    const total = users.length;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = users.slice(startIndex, startIndex + limit);

    // Enrich with Firestore profile data
    const enrichedUsers = await Promise.all(
      paginatedUsers.map(async (user) => {
        try {
          const profileDoc = await adminDb
            .collection(COLLECTIONS.USERS)
            .doc(user.uid)
            .get();

          const profile = profileDoc.exists ? profileDoc.data() : {};

          // Count orders
          const ordersSnap = await adminDb
            .collection(COLLECTIONS.ORDERS)
            .where('userId', '==', user.uid)
            .count()
            .get();

          return {
            ...user,
            profile,
            orderCount: ordersSnap.data().count,
          };
        } catch {
          return { ...user, profile: {}, orderCount: 0 };
        }
      })
    );

    return NextResponse.json({
      customers: enrichedUsers,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
