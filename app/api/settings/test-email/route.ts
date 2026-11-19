import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetEmail, ...emailSettings } = body;

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid target email is required for testing' },
        { status: 400 }
      );
    }

    const hasHostingerApi = Boolean(
      emailSettings.hostingerApiKey || process.env.HOSTINGER_MAIL_API_KEY
    );
    const hasSmtp = Boolean(emailSettings.smtpHost && emailSettings.smtpUser);

    if (!hasHostingerApi && !hasSmtp) {
      return NextResponse.json(
        { error: 'Hostinger API Key or SMTP credentials are required to send a test email.' },
        { status: 400 }
      );
    }

    const result = await sendTestEmail(emailSettings, targetEmail);

    return NextResponse.json({
      success: true,
      method: result.method,
      message: `Test email sent successfully to ${targetEmail} via ${
        result.method === 'hostinger_mail_api' ? 'Hostinger Mail API' : 'SMTP Server'
      }`,
    });
  } catch (error: unknown) {
    console.error('Test email error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
