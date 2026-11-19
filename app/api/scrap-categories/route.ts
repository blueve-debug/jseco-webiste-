import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const snap = await adminDb
      .collection(COLLECTIONS.SCRAP_CATEGORIES)
      .orderBy('order', 'asc')
      .get();

    const categories = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Scrap Categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch scrap categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth('scrapCategories');
    if (!auth.authorized) return auth.response;

    const body = await request.json();

    const category = {
      label: body.label || '',
      order: body.order || 0,
      active: body.active !== false,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(COLLECTIONS.SCRAP_CATEGORIES).add(category);

    return NextResponse.json(
      { id: docRef.id, ...category },
      { status: 201 }
    );
  } catch (error) {
    console.error('Scrap Categories POST error:', error);
    return NextResponse.json({ error: 'Failed to create scrap category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth('scrapCategories');
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    updates.updatedAt = FieldValue.serverTimestamp();
    await adminDb.collection(COLLECTIONS.SCRAP_CATEGORIES).doc(id).update(updates);

    return NextResponse.json({ id, ...updates });
  } catch (error) {
    console.error('Scrap Categories PUT error:', error);
    return NextResponse.json({ error: 'Failed to update scrap category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth('scrapCategories');
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const productsSnap = await adminDb
      .collection(COLLECTIONS.SCRAP_PRODUCTS)
      .where('categoryId', '==', id)
      .limit(1)
      .get();

    if (!productsSnap.empty) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products' },
        { status: 400 }
      );
    }

    await adminDb.collection(COLLECTIONS.SCRAP_CATEGORIES).doc(id).delete();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Scrap Categories DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete scrap category' }, { status: 500 });
  }
}
