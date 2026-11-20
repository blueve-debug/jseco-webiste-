import { NextRequest, NextResponse } from 'next/server';
import { adminDb, COLLECTIONS } from '@/lib/firebase-admin';
import { DEFAULT_ROLES, DEFAULT_STAFF, DEFAULT_POLICIES, normalizeRoles } from '@/lib/rbac';
import { requireAuth } from '@/lib/auth';

const SETTINGS_DOC_ID = 'global';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;
    const doc = await adminDb
      .collection(COLLECTIONS.SETTINGS)
      .doc(SETTINGS_DOC_ID)
      .get();

    const baseDefaults = {
      storeName: 'Good Eco Solutions',
      storeTagline: 'Genuine Scrap Parts — Up to 70% Off',
      currency: 'INR',
      currencySymbol: '₹',
      taxRate: 8,
      shippingType: 'flat',
      flatShippingRate: 45,
      freeShippingThreshold: 500,
      maintenanceMode: false,
      contactEmail: 'care@jseco.in',
      contactPhone: '+91 93108 56385, +91 78272 57887',
      inquiryEmailNotificationsEnabled: true,
      inquiryNotificationEmails: process.env.INQUIRY_NOTIFY_EMAILS || 'care@jseco.in, imran@jseco.in',
      hostingerApiKey: process.env.HOSTINGER_MAIL_API_KEY || '',
      hostingerMailboxId: process.env.HOSTINGER_MAILBOX_ID || '',
      hostingerSenderEmail: process.env.HOSTINGER_SENDER_EMAIL || 'care@jseco.in',
      hostingerSenderName: process.env.HOSTINGER_SENDER_NAME || 'JSECO',
      smtpHost: process.env.SMTP_HOST || '',
      smtpPort: Number(process.env.SMTP_PORT) || 587,
      smtpSecure: process.env.SMTP_SECURE === 'true',
      smtpUser: process.env.SMTP_USER || '',
      smtpPassword: process.env.SMTP_PASSWORD || '',
      smtpFromEmail: process.env.SMTP_FROM || '"JSECO" <care@jseco.in>',
      rbacRoles: DEFAULT_ROLES,
      rbacStaff: DEFAULT_STAFF,
      rbacPolicies: DEFAULT_POLICIES,
    };

    if (!doc.exists) {
      return NextResponse.json(baseDefaults);
    }

    const data = doc.data() || {};
    return NextResponse.json({
      ...baseDefaults,
      ...data,
      rbacRoles: normalizeRoles(data.rbacRoles && data.rbacRoles.length > 0 ? data.rbacRoles : DEFAULT_ROLES),
      rbacStaff: data.rbacStaff && data.rbacStaff.length > 0 ? data.rbacStaff : DEFAULT_STAFF,
      rbacPolicies: data.rbacPolicies ? { ...DEFAULT_POLICIES, ...data.rbacPolicies } : DEFAULT_POLICIES,
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth('settings');
    if (!auth.authorized) return auth.response;

    const body = await request.json();

    await adminDb
      .collection(COLLECTIONS.SETTINGS)
      .doc(SETTINGS_DOC_ID)
      .set(body, { merge: true });

    return NextResponse.json({ success: true, ...body });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
