import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { parsePagination, paginationMeta } from '@/lib/utils';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth('products');
    if (!auth.authorized) return auth.response;
    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePagination(searchParams);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';
    const grade = searchParams.get('grade') || '';
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    let query = adminDb.collection(COLLECTIONS.PRODUCTS)
      .orderBy(sort, order as 'asc' | 'desc');

    if (category) {
      query = query.where('category', '==', category);
    }

    if (grade) {
      query = query.where('grade', '==', grade.toUpperCase());
    }

    const allSnap = await query.get();
    let docs = allSnap.docs;

    // Client-side search filter (Firestore doesn't support full-text search)
    if (search) {
      docs = docs.filter(doc => {
        const data = doc.data();
        return (
          data.name?.toLowerCase().includes(search) ||
          data.sku?.toLowerCase().includes(search) ||
          data.description?.toLowerCase().includes(search)
        );
      });
    }

    const total = docs.length;
    const startIndex = (page - 1) * limit;
    const paginatedDocs = docs.slice(startIndex, startIndex + limit);

    const products = paginatedDocs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      products,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth('products');
    if (!auth.authorized) return auth.response;

    const body = await request.json();

    const product = {
      name: body.name || '',
      description: body.description || '',
      price: parseFloat(body.price) || 0,
      originalPrice: parseFloat(body.originalPrice) || 0,
      sku: body.sku || '',
      grade: body.grade || 'B',
      category: body.category || '',
      condition: body.condition || 'Used',
      mileage: body.mileage || '',
      warranty: body.warranty || '',
      availability: body.availability !== false,
      images: body.images || [],
      compatibility: body.compatibility || '',
      supplier: body.supplier || '',
      featured: body.featured || false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(COLLECTIONS.PRODUCTS).add(product);

    return NextResponse.json(
      { id: docRef.id, ...product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
