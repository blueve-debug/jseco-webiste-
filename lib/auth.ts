import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'sp-admin-session';

const rawSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && (!rawSecret || rawSecret.length < 32)) {
  console.warn(
    'SECURITY WARNING: JWT_SECRET environment variable is missing or shorter than 32 characters. Ensure a strong 64-character secret is set in production.'
  );
}

const JWT_SECRET_KEY = new TextEncoder().encode(
  rawSecret || 'fallback-secret-key-change-in-production-ges-rvsf-2026'
);

export interface SessionPayload {
  uid: string;
  email: string;
  name?: string;
  role: 'admin';
  allowedModules?: string[];
  iat: number;
  exp: number;
}

export async function createSession(
  uid: string,
  email: string,
  name?: string,
  allowedModules?: string[]
): Promise<string> {
  const token = await new SignJWT({
    uid,
    email,
    name: name || 'Admin',
    role: 'admin' as const,
    allowedModules: allowedModules || [
      'dashboard',
      'products',
      'categories',
      'orders',
      'customers',
      'inquiries',
      'scrapCategories',
      'scrapProducts',
      'content',
      'settings',
    ],
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return token;
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

export function isPrimarySuperAdmin(session: SessionPayload | null | undefined): boolean {
  if (!session) return false;
  return (
    session.uid === 'kUwXnXdVTNYEunUTJjz6vC1aa8m2' ||
    session.email === 'imran@jseco.in' ||
    session.email === 'care@jseco.in' ||
    session.email === 'blueve.tech@gmail.com'
  );
}

export type AuthResult =
  | { authorized: true; session: SessionPayload }
  | { authorized: false; response: NextResponse };

/**
 * Validates session and ensures the user has access to the required administrative module.
 * Defense-in-depth: Route handlers check this in addition to middleware proxy.
 */
export async function requireAuth(requiredModule?: string): Promise<AuthResult> {
  const session = await verifySession();
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized: Valid administrative session required' },
        { status: 401 }
      ),
    };
  }

  const isSuper = isPrimarySuperAdmin(session);

  if (requiredModule && !isSuper) {
    const modules = session.allowedModules || [];
    if (!modules.includes(requiredModule)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: `Forbidden: Access to '${requiredModule}' module is restricted` },
          { status: 403 }
        ),
      };
    }
  }

  return { authorized: true, session };
}
