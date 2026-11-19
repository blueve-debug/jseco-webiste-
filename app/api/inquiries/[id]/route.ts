import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection(COLLECTIONS.INQUIRIES).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Inquiry GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    delete updateData.id;

    await adminDb.collection(COLLECTIONS.INQUIRIES).doc(id).set(updateData, { merge: true });

    const updated = await adminDb.collection(COLLECTIONS.INQUIRIES).doc(id).get();
    return NextResponse.json({ id, ...updated.data() });
  } catch (error) {
    console.error('Inquiry PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminDb.collection(COLLECTIONS.INQUIRIES).doc(id).delete();
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Inquiry DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
