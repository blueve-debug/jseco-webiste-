import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { parsePagination, paginationMeta } from '@/lib/utils';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth('orders');
    if (!auth.authorized) return auth.response;
    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePagination(searchParams);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search')?.toLowerCase() || '';

    let query = adminDb.collection(COLLECTIONS.ORDERS)
      .orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const allSnap = await query.get();
    let docs = allSnap.docs;

    if (search) {
      docs = docs.filter(doc => {
        const data = doc.data();
        return (
          doc.id.toLowerCase().includes(search) ||
          data.customerPhone?.toLowerCase().includes(search) ||
          data.customerName?.toLowerCase().includes(search)
        );
      });
    }

    const total = docs.length;
    const startIndex = (page - 1) * limit;
    const paginatedDocs = docs.slice(startIndex, startIndex + limit);

    const orders = paginatedDocs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get status counts
    const allOrdersSnap = await adminDb.collection(COLLECTIONS.ORDERS).get();
    const statusCounts: Record<string, number> = {
      all: allOrdersSnap.size,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    allOrdersSnap.docs.forEach(doc => {
      const s = doc.data().status;
      if (s && statusCounts[s] !== undefined) {
        statusCounts[s]++;
      }
    });

    return NextResponse.json({
      orders,
      statusCounts,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
