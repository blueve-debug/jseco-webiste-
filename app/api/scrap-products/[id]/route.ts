import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection(COLLECTIONS.SCRAP_PRODUCTS).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ product: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Scrap Product GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch scrap product' }, { status: 500 });
  }
}
