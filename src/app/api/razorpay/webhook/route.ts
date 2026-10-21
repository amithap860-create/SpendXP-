/**
 * POST /api/razorpay/webhook
 *
 * Razorpay → server notification. Grants Premium even if the user closed the
 * app before the browser callback (/verify-payment) ran.
 *
 * SETUP (Razorpay Dashboard → Settings → Webhooks → Add):
 *   URL:    https://spendxp.vercel.app/api/razorpay/webhook
 *   Secret: any long random string → also set as RAZORPAY_WEBHOOK_SECRET in Vercel
 *   Events: payment.captured, order.paid
 */

import { NextRequest, NextResponse } from 'next/server';
import { grantPremiumForPayment, hmacHex, safeEqualHex } from '@/lib/razorpayServer';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });

  // Signature is over the RAW body — read text, not json().
  const raw = await req.text();
  const sig = req.headers.get('x-razorpay-signature') || '';
  if (!safeEqualHex(hmacHex(secret, raw), sig)) {
    return NextResponse.json({ error: 'Bad signature' }, { status: 400 });
  }

  let evt: any;
  try { evt = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }); }

  // Replay protection: each event id is processed once.
  const eventId = req.headers.get('x-razorpay-event-id');
  if (eventId) {
    const { db } = getFirebaseAdmin();
    try {
      await db.collection('razorpayWebhookEvents').doc(eventId).create({ event: evt.event, receivedAt: new Date() });
    } catch {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  if (evt.event !== 'payment.captured' && evt.event !== 'order.paid') {
    return NextResponse.json({ ok: true, ignored: evt.event });
  }

  const payment = evt.payload?.payment?.entity;
  if (!payment?.id || !payment?.order_id) return NextResponse.json({ ok: true, ignored: 'no payment' });

  try {
    const result = await grantPremiumForPayment(payment.id, payment.order_id);
    if (!result.ok) console.warn('[razorpay-webhook] not granted:', payment.id, result.error);
    // 200 either way for validation failures — retrying won't fix them.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[razorpay-webhook] error:', err);
    // Non-2xx → Razorpay retries later. Remove the event marker so the retry is processed.
    if (eventId) {
      try { await getFirebaseAdmin().db.collection('razorpayWebhookEvents').doc(eventId).delete(); } catch {}
    }
    return NextResponse.json({ error: 'Temporary failure' }, { status: 500 });
  }
}
