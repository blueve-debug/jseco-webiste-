import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection(COLLECTIONS.ORDERS).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (body.status) {
      updates.status = body.status;

      // Add to status history
      const doc = await adminDb.collection(COLLECTIONS.ORDERS).doc(id).get();
      const currentData = doc.data();
      const statusHistory = currentData?.statusHistory || [];
      statusHistory.push({
        status: body.status,
        timestamp: new Date().toISOString(),
        note: body.note || '',
      });
      updates.statusHistory = statusHistory;
    }

    if (body.trackingNumber) updates.trackingNumber = body.trackingNumber;
    if (body.note) updates.note = body.note;

    await adminDb.collection(COLLECTIONS.ORDERS).doc(id).update(updates);

    return NextResponse.json({ id, ...updates });
  } catch (error) {
    console.error('Order PUT error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
