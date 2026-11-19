import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SEO_PAGES } from '@/lib/seo-data';

const SESSION_COOKIE_NAME = 'sp-admin-session';

const rawSecret = process.env.JWT_SECRET;
const JWT_SECRET_KEY = new TextEncoder().encode(
  rawSecret || 'fallback-secret-key-change-in-production-ges-rvsf-2026'
);

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  return res;
}

const PUBLIC_STATIC_PATHS = new Set([
  '/',
  '/about',
  '/sell',
  '/login',
  '/robots.txt',
  '/sitemap.xml',
  '/firebase-messaging-sw.js',
  ...Object.keys(SEO_PAGES).map((slug) => `/${slug}`),
]);

const isPublicPath = (pathname: string, method?: string) => {
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  if (PUBLIC_STATIC_PATHS.has(cleanPath)) return true;

  return (
    cleanPath.startsWith('/sell') ||
    cleanPath.startsWith('/models/') ||
    cleanPath.startsWith('/draco/') ||
    cleanPath.startsWith('/videos/') ||
    cleanPath.startsWith('/images/') ||
    cleanPath.startsWith('/api/auth/login') ||
    (cleanPath === '/api/inquiries' && method === 'POST') ||
    (cleanPath.startsWith('/api/scrap-categories') && method === 'GET') ||
    (cleanPath.startsWith('/api/scrap-products') && method === 'GET')
  );
};

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Immediate redirect for /dashboard legacy/alternate paths to /admin
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const targetPath = pathname === '/dashboard' ? '/admin' : pathname.replace(/^\/dashboard/, '/admin');
    return applySecurityHeaders(NextResponse.redirect(new URL(targetPath, request.url)));
  }

  // Allow public paths
  if (isPublicPath(pathname, request.method)) {
    // If already logged in and trying to access login, redirect to admin dashboard
    if (pathname === '/login') {
      const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (token) {
        try {
          await jwtVerify(token, JWT_SECRET_KEY);
          return applySecurityHeaders(NextResponse.redirect(new URL('/admin', request.url)));
        } catch {
          // Token invalid, let them see login
        }
      }
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // Check auth for protected routes
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 })
      );
    }
    const loginUrl = new URL('/login', request.url);
    if (pathname && pathname !== '/login') {
      const redirectParam = (pathname === '/dashboard' || pathname.startsWith('/dashboard'))
        ? pathname.replace(/^\/dashboard/, '/admin') || '/admin'
        : pathname;
      loginUrl.searchParams.set('redirect', redirectParam);
    }
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  try {
    await jwtVerify(token, JWT_SECRET_KEY);
    return applySecurityHeaders(NextResponse.next());
  } catch {
    // Token expired or invalid
    const loginUrl = new URL('/login', request.url);
    if (pathname && pathname !== '/login') {
      const redirectParam = (pathname === '/dashboard' || pathname.startsWith('/dashboard'))
        ? pathname.replace(/^\/dashboard/, '/admin') || '/admin'
        : pathname;
      loginUrl.searchParams.set('redirect', redirectParam);
    }
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Session expired' }, { status: 401 })
      : NextResponse.redirect(loginUrl);

    response.cookies.delete(SESSION_COOKIE_NAME);
    return applySecurityHeaders(response);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov|m4v|ogg|glb|gltf|bin|wasm|css|js|map|json|woff2|woff|ttf|eot)$).*)',
  ],
};
