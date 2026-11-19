import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      uid: session.uid,
      email: session.email,
      name: session.name || 'Admin',
      role: session.role,
      allowedModules: session.allowedModules || [
        'dashboard', 'products', 'categories', 'orders', 'customers',
        'inquiries', 'scrapCategories', 'scrapProducts', 'content', 'settings'
      ],
    },
  });
}
