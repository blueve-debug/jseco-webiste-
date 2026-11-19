import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'goodecosolution-6f531.firebasestorage.app',
  });
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
