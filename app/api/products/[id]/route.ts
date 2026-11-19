import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection(COLLECTIONS.PRODUCTS).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Only update provided fields
    const allowedFields = [
      'name', 'description', 'price', 'originalPrice', 'sku', 'grade',
      'category', 'condition', 'mileage', 'warranty', 'availability',
      'images', 'compatibility', 'supplier', 'featured',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'price' || field === 'originalPrice') {
          updates[field] = parseFloat(body[field]) || 0;
        } else {
          updates[field] = body[field];
        }
      }
    }

    await adminDb.collection(COLLECTIONS.PRODUCTS).doc(id).update(updates);

    return NextResponse.json({ id, ...updates });
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminDb.collection(COLLECTIONS.PRODUCTS).doc(id).delete();
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
