import { NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth('dashboard');
    if (!auth.authorized) return auth.response;
    // Get counts
    const [productsSnap, ordersSnap, categoriesSnap] = await Promise.all([
      adminDb.collection(COLLECTIONS.PRODUCTS).count().get(),
      adminDb.collection(COLLECTIONS.ORDERS).count().get(),
      adminDb.collection(COLLECTIONS.CATEGORIES).count().get(),
    ]);

    const totalProducts = productsSnap.data().count;
    const totalOrders = ordersSnap.data().count;
    const totalCategories = categoriesSnap.data().count;

    // Get recent orders
    const recentOrdersSnap = await adminDb
      .collection(COLLECTIONS.ORDERS)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentOrders = recentOrdersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate revenue from orders
    let totalRevenue = 0;
    const allOrdersSnap = await adminDb.collection(COLLECTIONS.ORDERS).get();
    allOrdersSnap.docs.forEach(doc => {
      const data = doc.data();
      totalRevenue += data.total || 0;
    });

    // Get customer count from users collection
    const usersSnap = await adminDb.collection(COLLECTIONS.USERS).count().get();
    const totalCustomers = usersSnap.data().count;

    // Revenue and orders by day (last 7 days)
    const now = new Date();
    const revenueByDay: { date: string; revenue: number; orders: number; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      revenueByDay.push({ date: dayStr, revenue: 0, orders: 0, label });
    }

    allOrdersSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.createdAt) {
        const orderDate = data.createdAt.toDate
          ? data.createdAt.toDate().toISOString().split('T')[0]
          : new Date(data.createdAt).toISOString().split('T')[0];
        const entry = revenueByDay.find(d => d.date === orderDate);
        if (entry) {
          entry.revenue += data.total || 0;
          entry.orders += 1;
        }
      }
    });

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        totalCategories,
      },
      recentOrders,
      revenueByDay,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
