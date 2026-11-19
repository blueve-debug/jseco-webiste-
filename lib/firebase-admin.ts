import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
const privateKey = rawPrivateKey?.replace(/\\n/g, '\n');

if (!getApps().length) {
  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    });
  } else {
    // Safe fallback for build time / static page data collection when environment variables are not injected
    initializeApp({
      projectId: projectId || 'jseco-build-placeholder',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'jseco-build-placeholder.appspot.com',
    });
  }
}

export const adminDb = getFirestore();
try {
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch {
  // Settings already locked or initialized
}
export const adminAuth = getAuth();
export const adminStorage = getStorage();

// Firestore collection names
export const COLLECTIONS = {
  ADMIN: 'admin',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  USERS: 'users',
  APP_CONTENT: 'app_content',
  FLASH_SALES: 'flash_sales',
  SETTINGS: 'settings',
  OTP_BUFFER: 'otp_buffer',
  SCRAP_CATEGORIES: 'scrap_categories',
  SCRAP_PRODUCTS: 'scrap_products',
  INQUIRIES: 'inquiries',
} as const;
