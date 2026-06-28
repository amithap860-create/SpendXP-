import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    // Basic email format check
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Message length guard
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: 'Message must be under 2000 characters.' }, { status: 400 });
    }

    const ticket = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category: category?.trim() || 'other',
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'open',
      source: 'support_page',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    // Save to Firestore (Admin SDK uses .collection().add(), not client-SDK addDoc)
    try {
      const { db: adminDb } = await getFirebaseAdmin();
      await adminDb.collection('supportTickets').add(ticket);
    } catch (dbErr) {
      // Non-fatal — still log and return success so user isn't blocked
      console.error('[SpendXP] Failed to write support ticket to Firestore:', dbErr);
    }

    // Always log to server output so Vercel logs capture it
    console.log('[SpendXP] SUPPORT TICKET:', JSON.stringify(ticket, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Support ticket received. We will reply to your email within 24 hours.',
    });
  } catch (err) {
    console.error('[SpendXP] Support route error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
