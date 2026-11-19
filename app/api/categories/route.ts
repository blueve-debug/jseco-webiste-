import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth('categories');
    if (!auth.authorized) return auth.response;

    const snap = await adminDb
      .collection(COLLECTIONS.CATEGORIES)
      .orderBy('order', 'asc')
      .get();

    const categories = await Promise.all(
      snap.docs.map(async (doc) => {
        const data = doc.data();
        // Count products in this category
        const productCount = await adminDb
          .collection(COLLECTIONS.PRODUCTS)
          .where('category', '==', data.name)
          .count()
          .get();

        return {
          id: doc.id,
          ...data,
          productCount: productCount.data().count,
        };
      })
    );

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth('categories');
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const imageUrl = body.imageUrl || '';
    const icon = imageUrl || body.icon || 'category';

    const category = {
      name: body.name || '',
      description: body.description || '',
      icon: icon,
      imageUrl: imageUrl,
      order: body.order || 0,
      active: body.active !== false,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(COLLECTIONS.CATEGORIES).add(category);

    return NextResponse.json(
      { id: docRef.id, ...category },
      { status: 201 }
    );
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth('categories');
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    if (updates.imageUrl !== undefined) {
      updates.icon = updates.imageUrl;
    }

    updates.updatedAt = FieldValue.serverTimestamp();
    await adminDb.collection(COLLECTIONS.CATEGORIES).doc(id).update(updates);

    return NextResponse.json({ id, ...updates });
  } catch (error) {
    console.error('Categories PUT error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth('categories');
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Check if any products use this category
    const productsSnap = await adminDb
      .collection(COLLECTIONS.PRODUCTS)
      .where('category', '==', id)
      .limit(1)
      .get();

    if (!productsSnap.empty) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products' },
        { status: 400 }
      );
    }

    await adminDb.collection(COLLECTIONS.CATEGORIES).doc(id).delete();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Categories DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
