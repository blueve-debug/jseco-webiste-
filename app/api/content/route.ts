import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/auth';

const CONTENT_DOC_ID = 'main';

export async function GET() {
  try {
    const auth = await requireAuth('content');
    if (!auth.authorized) return auth.response;

    const doc = await adminDb
      .collection(COLLECTIONS.APP_CONTENT)
      .doc(CONTENT_DOC_ID)
      .get();

    if (!doc.exists) {
      // Return defaults
      const defaults = {
        heroBanners: [
          {
            title: 'Genuine Scrap Parts\nUp to 70% Off',
            subtitle: 'Quality inspected, professionally dismantled components.',
            ctaText: 'Shop Inventory',
            ctaLink: '/products',
            imageUrl: 'https://plus.unsplash.com/premium_photo-1661933050836-3f9e3d7eda61?q=80&w=2070&auto=format&fit=crop',
            badge: 'PREMIUM SALVAGE',
            active: true,
          },
        ],
        flashSale: {
          productName: 'Used V6 Engine Complete Assembly',
          sku: 'ENG-V6-3847',
          grade: 'A',
          price: 850,
          originalPrice: 1200,
          imageUrl: 'https://images.unsplash.com/photo-1552656967-7a0991a13906?q=80&w=3087',
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          active: true,
        },
        trendingSearches: [
          '2015 Honda Civic Bumper',
          'V6 Engine',
          'Brake Pads',
        ],
        featuredCategories: ['Engines', 'Tires', 'Lights', 'Interior', 'Gearbox'],
      };

      return NextResponse.json(defaults);
    }

    return NextResponse.json(doc.data());
  } catch (error) {
    console.error('Content GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth('content');
    if (!auth.authorized) return auth.response;

    const body = await request.json();

    await adminDb
      .collection(COLLECTIONS.APP_CONTENT)
      .doc(CONTENT_DOC_ID)
      .set(body, { merge: true });

    return NextResponse.json({ success: true, ...body });
  } catch (error) {
    console.error('Content PUT error:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
