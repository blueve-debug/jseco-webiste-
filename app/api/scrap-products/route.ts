import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || '';

    let query = adminDb.collection(COLLECTIONS.SCRAP_PRODUCTS)
      .orderBy('name', 'asc');

    if (categoryId) {
      query = query.where('categoryId', '==', categoryId);
    }

    const allSnap = await query.get();
    const products = allSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Scrap Products GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch scrap products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth('scrapProducts');
    if (!auth.authorized) return auth.response;

    const body = await request.json();

    const product = {
      name: body.name || '',
      categoryId: body.categoryId || '',
      icon: body.icon || 'Car',
      desc: body.desc || '',
      badge: body.badge || 'auto-badge',
      badgeText: body.badgeText || 'Automotive',
      rate: body.rate || '',
      unit: body.unit || 'per unit',
      hot: body.hot === true,
      active: body.active !== false,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(COLLECTIONS.SCRAP_PRODUCTS).add(product);

    return NextResponse.json(
      { id: docRef.id, ...product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Scrap Products POST error:', error);
    return NextResponse.json({ error: 'Failed to create scrap product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth('scrapProducts');
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    updates.updatedAt = FieldValue.serverTimestamp();
    await adminDb.collection(COLLECTIONS.SCRAP_PRODUCTS).doc(id).update(updates);

    return NextResponse.json({ id, ...updates });
  } catch (error) {
    console.error('Scrap Products PUT error:', error);
    return NextResponse.json({ error: 'Failed to update scrap product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth('scrapProducts');
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await adminDb.collection(COLLECTIONS.SCRAP_PRODUCTS).doc(id).delete();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Scrap Products DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete scrap product' }, { status: 500 });
  }
}
