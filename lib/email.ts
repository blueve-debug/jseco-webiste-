import nodemailer from 'nodemailer';
import { adminDb, COLLECTIONS } from './firebase-admin';
import { Configuration, SendApi, AccountApi } from 'hostinger-mail-api-sdk';

export interface EmailSettings {
  inquiryEmailNotificationsEnabled?: boolean;
  inquiryNotificationEmails?: string;
  // Hostinger Mail API
  hostingerApiKey?: string;
  hostingerMailboxId?: string;
  hostingerSenderEmail?: string;
  hostingerSenderName?: string;
  // Fallback SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
}

export interface InquiryNotificationData {
  reference?: string;
  vehicleType: string;
  regNumber?: string;
  name?: string;
  email?: string;
  phone: string;
  pincode?: string;
  estimate?: {
    min?: number | string;
    max?: number | string;
    label?: string;
    concession?: string;
  };
  preferredSlot?: string;
  source?: string;
  notes?: string;
  createdAt?: string;
}

// In-memory cache for resolved mailbox ID
let cachedMailboxId: string | null = null;

/**
 * Escapes dangerous HTML characters to prevent XSS / HTML injection in email clients
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Fetch current email & notification settings from Firestore settings/global
 */
export async function getEmailSettings(): Promise<EmailSettings> {
  try {
    const doc = await adminDb
      .collection(COLLECTIONS.SETTINGS)
      .doc('global')
      .get();

    if (doc.exists) {
      const data = doc.data() || {};
      return {
        inquiryEmailNotificationsEnabled:
          data.inquiryEmailNotificationsEnabled !== undefined
            ? Boolean(data.inquiryEmailNotificationsEnabled)
            : true,
        inquiryNotificationEmails:
          data.inquiryNotificationEmails ||
          process.env.INQUIRY_NOTIFY_EMAILS ||
          data.contactEmail ||
          'care@jseco.in, imran@jseco.in',
        hostingerApiKey: data.hostingerApiKey || process.env.HOSTINGER_MAIL_API_KEY || '',
        hostingerMailboxId: data.hostingerMailboxId || process.env.HOSTINGER_MAILBOX_ID || '',
        hostingerSenderEmail:
          data.hostingerSenderEmail || process.env.HOSTINGER_SENDER_EMAIL || 'care@jseco.in',
        hostingerSenderName:
          data.hostingerSenderName || process.env.HOSTINGER_SENDER_NAME || 'JSECO',
        smtpHost: data.smtpHost || process.env.SMTP_HOST || '',
        smtpPort: data.smtpPort ? Number(data.smtpPort) : Number(process.env.SMTP_PORT) || 587,
        smtpSecure:
          data.smtpSecure !== undefined
            ? Boolean(data.smtpSecure)
            : process.env.SMTP_SECURE === 'true',
        smtpUser: data.smtpUser || process.env.SMTP_USER || '',
        smtpPassword: data.smtpPassword || process.env.SMTP_PASSWORD || '',
        smtpFromEmail:
          data.smtpFromEmail ||
          process.env.SMTP_FROM ||
          '"JSECO" <care@jseco.in>',
      };
    }
  } catch (err) {
    console.error('Error fetching email settings:', err);
  }

  return {
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
  };
}

/**
 * Send an email directly using the Hostinger Mail API SDK
 */
export async function sendViaHostingerMailApi(
  settings: EmailSettings,
  payload: {
    to: string[];
    subject: string;
    html: string;
    text?: string;
    displayName?: string;
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  const apiKey = (settings.hostingerApiKey || process.env.HOSTINGER_MAIL_API_KEY || '').trim();
  if (!apiKey) {
    return { success: false, error: 'Hostinger Mail API Key is missing.' };
  }

  const config = new Configuration({ accessToken: apiKey });

  let mailboxId = (settings.hostingerMailboxId || process.env.HOSTINGER_MAILBOX_ID || cachedMailboxId || '').trim();

  // If mailbox ID is not explicitly set, fetch it automatically from the Account API
  if (!mailboxId) {
    try {
      const accountApi = new AccountApi(config);
      const accRes = await accountApi.getCurrentAccount();
      const mailboxes = accRes.data?.data?.mailboxes || [];
      if (mailboxes.length > 0 && mailboxes[0].resourceId) {
        mailboxId = mailboxes[0].resourceId;
        cachedMailboxId = mailboxId;
      }
    } catch (err: unknown) {
      console.warn('Could not auto-fetch Hostinger mailbox ID:', err);
    }
  }

  if (!mailboxId) {
    return { success: false, error: 'Hostinger Mailbox ID could not be resolved.' };
  }

  const sendApi = new SendApi(config);
  const displayName =
    payload.displayName ||
    settings.hostingerSenderName ||
    process.env.HOSTINGER_SENDER_NAME ||
    'Good Eco Solutions';

  const cleanText =
    payload.text ||
    payload.html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  try {
    await sendApi.sendEmail(mailboxId, {
      to: payload.to,
      displayName,
      cc: [],
      bcc: [],
      subject: payload.subject,
      text: cleanText,
      html: payload.html,
    } as any);

    return { success: true };
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
    const errorMsg =
      axiosErr?.response?.data?.error ||
      axiosErr?.response?.data?.message ||
      axiosErr?.message ||
      String(err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Creates a nodemailer transport instance using the provided settings
 */
export function createTransport(settings: EmailSettings) {
  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
    return null;
  }

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort || 587,
    secure: settings.smtpSecure || settings.smtpPort === 465,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword || '',
    },
  });
}

/**
 * Helper to dispatch an email via Hostinger Mail API first, with fallback to standard SMTP
 */
async function dispatchEmail(
  settings: EmailSettings,
  options: {
    to: string[];
    subject: string;
    html: string;
    text?: string;
    displayName?: string;
  }
): Promise<{ success: boolean; method: 'hostinger_mail_api' | 'smtp' | 'none'; error?: string }> {
  // 1. Try Hostinger Mail API (Primary)
  if (settings.hostingerApiKey || process.env.HOSTINGER_MAIL_API_KEY) {
    try {
      const apiRes = await sendViaHostingerMailApi(settings, options);
      if (apiRes.success) {
        return { success: true, method: 'hostinger_mail_api' };
      }
      console.warn('Hostinger Mail API delivery failed:', apiRes.error);
    } catch (apiErr: unknown) {
      const axiosErr = apiErr as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errMsg = axiosErr?.response?.data?.error || axiosErr?.message || String(apiErr);
      console.warn('Hostinger Mail API error:', errMsg);
    }
  }

  // 2. Fallback to standard SMTP
  const transporter = createTransport(settings);
  if (transporter) {
    try {
      await transporter.sendMail({
        from: settings.smtpFromEmail || `"Good Eco Solutions" <${settings.smtpUser}>`,
        to: options.to.join(', '),
        subject: options.subject,
        html: options.html,
      });
      return { success: true, method: 'smtp' };
    } catch (smtpErr: unknown) {
      const errStr = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
      console.error('SMTP fallback failed:', errStr);
      return { success: false, method: 'smtp', error: errStr };
    }
  }

  return { success: false, method: 'none', error: 'No email service configured.' };
}

/**
 * Format Vehicle Type into a polished human-readable label
 */
export function formatVehicleType(type: string): string {
  switch (type?.toLowerCase()) {
    case 'bike':
    case '2-wheeler':
    case 'two-wheeler':
      return 'Two-Wheeler';
    case 'truck':
    case 'commercial':
      return 'Commercial Vehicle';
    case '3-wheeler':
    case 'three-wheeler':
      return 'Three-Wheeler';
    case 'car':
    default:
      return 'Passenger Car';
  }
}

/**
 * Dispatch Team/Admin Notification for a newly submitted vehicle valuation inquiry
 * Designed professionally under the Good Eco Solutions brand (no "scrap alert" terminology)
 */
export async function sendInquiryNotificationEmail(data: InquiryNotificationData) {
  try {
    const settings = await getEmailSettings();

    if (!settings.inquiryEmailNotificationsEnabled) {
      console.log('Inquiry email notifications are disabled in settings.');
      return { success: false, reason: 'disabled' };
    }

    const rawEmails = settings.inquiryNotificationEmails || '';
    const recipients = rawEmails
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 3 && e.includes('@'));

    if (recipients.length === 0) {
      console.warn('No valid recipient emails configured for inquiry notifications.');
      return { success: false, reason: 'no_recipients' };
    }

    const cleanReg = (data.regNumber || '').toUpperCase().trim();
    const cleanPhone = (data.phone || '').replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone}` : data.phone;
    const vehicleLabel = formatVehicleType(data.vehicleType);
    const customerName = (data.name || '').trim() || 'Valued Vehicle Owner';
    const customerEmail = (data.email || '').trim().toLowerCase();

    const estimateText = data.estimate
      ? typeof data.estimate.min === 'number'
        ? `₹${Number(data.estimate.min).toLocaleString('en-IN')} – ₹${Number(data.estimate.max).toLocaleString('en-IN')}`
        : `${data.estimate.min} – ${data.estimate.max}`
      : 'Comprehensive Valuation Requested';

    const safeRef = escapeHtml(data.reference || 'GES-VAL-PENDING');
    const safeCustomerName = escapeHtml(customerName);
    const safeCleanReg = escapeHtml(cleanReg);
    const safeVehicleLabel = escapeHtml(vehicleLabel);
    const safeFormattedPhone = escapeHtml(formattedPhone);
    const safeCustomerEmail = escapeHtml(customerEmail);
    const safeUrlEmail = encodeURIComponent(customerEmail);
    const safePincode = escapeHtml(data.pincode || 'Location not specified');
    const safePreferredSlot = escapeHtml(data.preferredSlot || '');
    const safeNotes = escapeHtml(data.notes || '');
    const safeEstimateText = escapeHtml(estimateText);
    const safeConcession = escapeHtml(data.estimate?.concession || '');

    const whatsappLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
      `Hello ${customerName}, this is regarding your vehicle valuation inquiry (${cleanReg || vehicleLabel}) with Good Eco Solutions.`
    )}`;

    const timestamp = data.createdAt
      ? new Date(data.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
      : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

    // Professional Subject Line
    const subject = `[GoodEco Solutions] Vehicle Valuation Inquiry — ${cleanReg || vehicleLabel} | ${customerName}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vehicle Valuation Inquiry — Good Eco Solutions</title>
</head>
<body style="margin: 0; padding: 28px 14px; background-color: #f1f5f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.5;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 620px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); border: 1px solid #d9e2dc;">
    
    <!-- Brand Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 55%, #059669 100%); padding: 34px 32px 30px; text-align: left; color: #ffffff;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #a7f3d0; font-weight: 800; margin-bottom: 6px;">
                GoodEco Solutions &bull; Authorized RVSF Network
              </div>
              <h1 style="margin: 0; font-size: 23px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1.25;">
                New Vehicle Valuation Inquiry
              </h1>
              <div style="margin-top: 6px; font-size: 13px; color: #d1fae5; font-weight: 400;">
                Submitted on ${timestamp} &bull; Ref: #${safeRef}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Section -->
    <tr>
      <td style="padding: 30px 32px 24px;">
        
        <!-- Registration Plate & Vehicle Specs Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: #f8faf8; border: 1px solid #d1fae5; border-radius: 12px; padding: 18px 20px; margin-bottom: 26px;">
          <tr>
            <td style="vertical-align: middle;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #047857; font-weight: 800; margin-bottom: 8px;">
                Vehicle Identification
              </div>
              
              <!-- HSRP Styled Registration Badge -->
              <div style="display: inline-block; background: #ffffff; border: 2px solid #0f172a; border-radius: 6px; padding: 5px 14px 5px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right: 8px; border-right: 1.5px solid #cbd5e1; font-size: 10px; font-weight: 900; color: #1e3a8a; letter-spacing: 0.5px; text-align: center;">
                      IND
                    </td>
                    <td style="padding-left: 10px; font-size: 19px; font-weight: 900; color: #0f172a; letter-spacing: 1.5px; font-family: monospace;">
                      ${safeCleanReg || 'REGISTRATION UNLISTED'}
                    </td>
                  </tr>
                </table>
              </div>

              <div style="font-size: 13.5px; color: #334155; margin-top: 10px; font-weight: 600;">
                Category: <span style="color: #065f46; font-weight: 700;">${safeVehicleLabel}</span>
              </div>
            </td>
            
            <td style="vertical-align: top; text-align: right; width: 35%;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 4px;">
                Status
              </div>
              <span style="display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700;">
                New Lead
              </span>
            </td>
          </tr>
        </table>

        <!-- Key Valuation Metric Card -->
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-left: 4px solid #10b981; border-radius: 8px; padding: 14px 18px; margin-bottom: 26px;">
          <div style="font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.8px; color: #065f46; font-weight: 800;">
            Estimated Valuation Range
          </div>
          <div style="font-size: 20px; font-weight: 800; color: #047857; margin-top: 4px; letter-spacing: -0.02em;">
            ${safeEstimateText}
          </div>
          ${
            safeConcession
              ? `<div style="font-size: 12.5px; color: #0284c7; font-weight: 600; margin-top: 3px;">
                  &bull; Certificate of Deposit Benefit: ${safeConcession}
                </div>`
              : ''
          }
        </div>

        <!-- Customer & Request Specification Table -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 26px;">
          <tr>
            <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; width: 36%;">Customer Name</td>
            <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; font-size: 14px; color: #0f172a;">${safeCustomerName}</td>
          </tr>
          <tr>
            <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px;">Phone Contact</td>
            <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; font-size: 14px; color: #047857;">
              <a href="tel:${cleanPhone}" style="color: #047857; text-decoration: none;">${safeFormattedPhone}</a>
            </td>
          </tr>
          ${
            customerEmail
              ? `<tr>
                  <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px;">Customer Email</td>
                  <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; font-size: 13.5px; color: #0f172a;">
                    <a href="mailto:${safeUrlEmail}" style="color: #0284c7; text-decoration: none;">${safeCustomerEmail}</a>
                  </td>
                </tr>`
              : ''
          }
          <tr>
            <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px;">Pickup Pincode / Area</td>
            <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; font-size: 13.5px; color: #0f172a;">${safePincode}</td>
          </tr>
          ${
            safePreferredSlot
              ? `<tr>
                  <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px;">Inspection Window</td>
                  <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; font-size: 13.5px; color: #0f172a;">${safePreferredSlot}</td>
                </tr>`
              : ''
          }
          ${
            safeNotes
              ? `<tr>
                  <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; vertical-align: top;">Customer Remarks</td>
                  <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; line-height: 1.5;">${safeNotes}</td>
                </tr>`
              : ''
          }
        </table>

        <!-- Direct Action Buttons -->
        <div style="text-align: center; margin-top: 28px; padding-top: 10px;">
          <a href="tel:${cleanPhone}" style="display: inline-block; background: #047857; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-right: 10px; margin-bottom: 8px; box-shadow: 0 4px 12px rgba(4, 120, 87, 0.2);">
            Call Customer
          </a>
          <a href="${whatsappLink}" target="_blank" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-bottom: 8px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);">
            Open WhatsApp Chat
          </a>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background: #f8faf8; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #eef2ef;">
        <div style="font-weight: 600; color: #475569; margin-bottom: 4px;">Good Eco Solutions &bull; Official Management Alert</div>
        Delivered to <strong>${recipients.join(', ')}</strong> according to active communication preferences.
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const result = await dispatchEmail(settings, {
      to: recipients,
      subject,
      html,
      displayName: 'Good Eco Solutions',
    });

    if (result.success) {
      console.log(`Inquiry notification delivered via ${result.method} to:`, recipients);
      return { success: true, method: result.method };
    } else {
      console.error('Inquiry notification delivery failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to send inquiry notification email:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Dispatch Customer Acknowledgment Email
 * Reassures the customer that their valuation inquiry has been received,
 * outlines next steps, and confirms that an advisor will be in touch ASAP.
 */
export async function sendCustomerAcknowledgmentEmail(data: InquiryNotificationData) {
  try {
    const customerEmail = (data.email || '').trim().toLowerCase();
    if (!customerEmail || !customerEmail.includes('@')) {
      return { success: false, reason: 'no_customer_email' };
    }

    const settings = await getEmailSettings();
    const cleanReg = (data.regNumber || '').toUpperCase().trim();
    const cleanPhone = (data.phone || '').replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone}` : data.phone;
    const vehicleLabel = formatVehicleType(data.vehicleType);
    const customerName = (data.name || '').trim() || 'Valued Vehicle Owner';
    const reference = data.reference || 'GES-VAL-PENDING';

    const estimateText = data.estimate
      ? typeof data.estimate.min === 'number'
        ? `₹${Number(data.estimate.min).toLocaleString('en-IN')} – ₹${Number(data.estimate.max).toLocaleString('en-IN')}`
        : `${data.estimate.min} – ${data.estimate.max}`
      : 'Comprehensive Inspection Estimate';

    const safeRef = escapeHtml(reference);
    const safeCustomerName = escapeHtml(customerName);
    const safeCleanReg = escapeHtml(cleanReg);
    const safeVehicleLabel = escapeHtml(vehicleLabel);
    const safeEstimateText = escapeHtml(estimateText);
    const safeFormattedPhone = escapeHtml(formattedPhone);
    const safePreferredSlot = escapeHtml(data.preferredSlot || '');

    // Professional Subject Line to the Customer
    const subject = `We've Received Your Valuation Request — Good Eco Solutions [Ref: #${reference}]`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Confirmation — Good Eco Solutions</title>
</head>
<body style="margin: 0; padding: 32px 14px; background-color: #f1f5f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 620px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); border: 1px solid #d9e2dc;">
    
    <!-- Corporate Brand Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%); padding: 36px 36px 32px; text-align: left; color: #ffffff;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #a7f3d0; font-weight: 800; margin-bottom: 8px;">
          Good Eco Solutions
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1.25;">
          We Have Received Your Inquiry
        </h1>
        <div style="margin-top: 6px; font-size: 13.5px; color: #d1fae5;">
          Reference ID: <strong style="color: #ffffff; font-family: monospace; letter-spacing: 0.5px;">#${safeRef}</strong>
        </div>
      </td>
    </tr>

    <!-- Body Section -->
    <tr>
      <td style="padding: 34px 36px 28px;">
        
        <p style="font-size: 15px; color: #1e293b; margin-top: 0; margin-bottom: 18px; line-height: 1.6;">
          Dear <strong>${safeCustomerName}</strong>,
        </p>

        <p style="font-size: 14.5px; color: #334155; margin-bottom: 24px; line-height: 1.65;">
          Thank you for reaching out to <strong>Good Eco Solutions</strong>, India's authorized vehicle recycling network. We have successfully registered your valuation request for your <strong>${safeVehicleLabel}</strong> (${safeCleanReg || 'Registration Pending'}).
        </p>

        <!-- Summary Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: #f8faf8; border: 1px solid #d1fae5; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
          <tr>
            <td>
              <div style="font-size: 11.5px; text-transform: uppercase; letter-spacing: 1px; color: #047857; font-weight: 800; margin-bottom: 12px;">
                Request Summary
              </div>
              
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; font-size: 13.5px; color: #334155;">
                ${
                  safeCleanReg
                    ? `<tr>
                        <td style="padding: 6px 0; color: #64748b; width: 40%;">Vehicle Registration</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-family: monospace; letter-spacing: 0.5px;">${safeCleanReg}</td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Vehicle Category</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${safeVehicleLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Valuation Offer</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #047857;">Our Team Will Connect Shortly With Best Offer</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Contact Mobile</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${safeFormattedPhone}</td>
                </tr>
                ${
                  safePreferredSlot
                    ? `<tr>
                        <td style="padding: 6px 0; color: #64748b;">Preferred Inspection</td>
                        <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${safePreferredSlot}</td>
                      </tr>`
                    : ''
                }
              </table>
            </td>
          </tr>
        </table>

        <!-- Next Steps Roadmap -->
        <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 16px;">
          What Happens Next?
        </h2>

        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 28px;">
          <tr>
            <td style="vertical-align: top; width: 34px; padding-bottom: 16px;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #ecfdf5; color: #047857; text-align: center; line-height: 24px; font-weight: 800; font-size: 12px; border: 1.5px solid #a7f3d0;">
                1
              </div>
            </td>
            <td style="padding-bottom: 16px;">
              <div style="font-weight: 700; font-size: 14px; color: #0f172a;">Advisor Review &amp; Consultation</div>
              <div style="font-size: 13px; color: #475569; margin-top: 2px;">
                Our certified technical assessor will review your vehicle data and contact you via phone or WhatsApp shortly to address any queries and confirm your pickup window.
              </div>
            </td>
          </tr>

          <tr>
            <td style="vertical-align: top; width: 34px; padding-bottom: 16px;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #ecfdf5; color: #047857; text-align: center; line-height: 24px; font-weight: 800; font-size: 12px; border: 1.5px solid #a7f3d0;">
                2
              </div>
            </td>
            <td style="padding-bottom: 16px;">
              <div style="font-weight: 700; font-size: 14px; color: #0f172a;">Complimentary Doorstep Inspection</div>
              <div style="font-size: 13px; color: #475569; margin-top: 2px;">
                A certified field technician inspects the chassis and physical status at your location. Absolutely zero towing or convenience charges apply.
              </div>
            </td>
          </tr>

          <tr>
            <td style="vertical-align: top; width: 34px;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #ecfdf5; color: #047857; text-align: center; line-height: 24px; font-weight: 800; font-size: 12px; border: 1.5px solid #a7f3d0;">
                3
              </div>
            </td>
            <td>
              <div style="font-weight: 700; font-size: 14px; color: #0f172a;">Instant Payment &amp; RTO Certificate (Form 2B)</div>
              <div style="font-size: 13px; color: #475569; margin-top: 2px;">
                Receive immediate digital bank transfer on vehicle handover, alongside the official Certificate of Deposit required for road-tax concessions on new vehicle purchases.
              </div>
            </td>
          </tr>
        </table>

        <!-- Dedicated Help Card -->
        <div style="background: #f1f5f9; border-radius: 10px; padding: 16px 20px; font-size: 13px; color: #334155; line-height: 1.5; margin-bottom: 26px;">
          <strong>Need immediate assistance or wish to reschedule?</strong><br />
          Feel free to reply directly to this email at <a href="mailto:care@jseco.in" style="color: #047857; font-weight: 600; text-decoration: none;">care@jseco.in</a> or <a href="mailto:imran@jseco.in" style="color: #047857; font-weight: 600; text-decoration: none;">imran@jseco.in</a> or speak with our support desk at <a href="tel:9310856385" style="color: #047857; font-weight: 600; text-decoration: none;">+91 93108 56385</a> / <a href="tel:7827257887" style="color: #047857; font-weight: 600; text-decoration: none;">+91 78272 57887</a>.
        </div>

        <p style="font-size: 14px; color: #334155; margin-bottom: 0;">
          Warm regards,<br />
          <strong>Client Relations &amp; Valuation Team</strong><br />
          <span style="color: #64748b; font-size: 13px;">JSECO &bull; Authorized RVSF Network</span>
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background: #f8faf8; padding: 22px 36px; text-align: center; font-size: 11.5px; color: #64748b; border-top: 1px solid #eef2ef;">
        <div>JSECO &bull; Ministry of Road Transport &amp; Highways Compliant Facilities</div>
        <div style="margin-top: 4px;">You received this automated receipt because an inquiry was placed with reference #${reference}.</div>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const result = await dispatchEmail(settings, {
      to: [customerEmail],
      subject,
      html,
      displayName: 'Good Eco Solutions',
    });

    if (result.success) {
      console.log(`Customer acknowledgment delivered via ${result.method} to:`, customerEmail);
      return { success: true, method: result.method };
    } else {
      console.error('Customer acknowledgment delivery failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to send customer acknowledgment email:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Send a test email to verify Hostinger Mail API or SMTP configuration
 */
export async function sendTestEmail(settings: EmailSettings, targetEmail: string) {
  const hasHostingerApi = Boolean(settings.hostingerApiKey || process.env.HOSTINGER_MAIL_API_KEY);

  const testSubject = '[Verification] Good Eco Solutions Inquiry Dispatch Active';
  const testHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 520px; margin: 0 auto; border: 1px solid #d1fae5; border-radius: 14px; background: #ffffff;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #047857; font-weight: 800; margin-bottom: 6px;">
        Good Eco Solutions &bull; Service Verification
      </div>
      <h2 style="color: #047857; margin-top: 0; margin-bottom: 12px; font-size: 20px;">Email System Verified</h2>
      <p style="font-size: 14px; color: #334155; line-height: 1.55; margin-bottom: 16px;">
        Your inquiry notification and customer acknowledgment service is verified and active via <strong>${
          hasHostingerApi ? 'Hostinger Mail API' : 'SMTP Server'
        }</strong>.
      </p>
      <div style="background: #f8faf8; border-left: 3px solid #10b981; padding: 12px 16px; font-size: 13px; color: #475569; border-radius: 4px; margin-bottom: 18px;">
        When a vehicle owner submits an inquiry, team alerts and customer receipts will automatically be dispatched in real-time.
      </div>
      <hr style="border: none; border-top: 1px solid #eef2ef; margin: 18px 0;" />
      <div style="font-size: 12px; color: #94a3b8;">Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
    </div>
  `;

  // 1. If Hostinger API is provided, use it directly
  if (hasHostingerApi) {
    const apiRes = await sendViaHostingerMailApi(settings, {
      to: [targetEmail],
      subject: testSubject,
      html: testHtml,
    });

    if (!apiRes.success) {
      throw new Error(apiRes.error || 'Failed to dispatch test email via Hostinger Mail API');
    }

    return { method: 'hostinger_mail_api', success: true };
  }

  // 2. Otherwise use SMTP
  const transporter = createTransport(settings);
  if (!transporter) {
    throw new Error('Hostinger API Key or SMTP Host + Username are required.');
  }

  await transporter.verify();

  const info = await transporter.sendMail({
    from: settings.smtpFromEmail || `"Good Eco Solutions" <${settings.smtpUser}>`,
    to: targetEmail,
    subject: testSubject,
    html: testHtml,
  });

  return { method: 'smtp', success: true, messageId: info.messageId };
}
