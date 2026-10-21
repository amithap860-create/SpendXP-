/**
 * POST /api/razorpay/verify-payment
 *
 * Browser callback after Razorpay checkout succeeds.
 * 1. Verifies the caller's Firebase ID token.
 * 2. Verifies the checkout signature HMAC(order_id|payment_id) (constant-time).
 * 3. Re-fetches the payment + order from Razorpay and grants Premium via
 *    grantPremiumForPayment() — plan/amount/owner come from the server-created
 *    order, never from this request body. Idempotent per payment id.
 *
 * Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 * (a `plan` field may still be sent by old clients — it is ignored.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUid, rateLimit } from '@/lib/serverSecurity';
import { grantPremiumForPayment, hmacHex, safeEqualHex } from '@/lib/razorpayServer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 503 });
  }

  const authed = await requireUid(request);
  if (authed instanceof NextResponse) return authed;
  const uid = authed.uid;

  const limited = await rateLimit(`verify-payment:${uid}`, 20, 3600);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const paymentId = typeof body.razorpay_payment_id === 'string' ? body.razorpay_payment_id : '';
  const orderId = typeof body.razorpay_order_id === 'string' ? body.razorpay_order_id : '';
  const signature = typeof body.razorpay_signature === 'string' ? body.razorpay_signature : '';

  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^order_[A-Za-z0-9]+$/.test(orderId) || !signature) {
    return NextResponse.json({ error: 'Missing or malformed payment fields' }, { status: 400 });
  }

  if (!safeEqualHex(hmacHex(keySecret, `${orderId}|${paymentId}`), signature)) {
    console.warn('[verify-payment] Signature mismatch for uid:', uid);
    return NextResponse.json({ error: 'Payment verification failed — signature mismatch' }, { status: 400 });
  }

  try {
    const result = await grantPremiumForPayment(paymentId, orderId, uid);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ success: true, isPremium: true, plan: result.plan });
  } catch (err) {
    // Do NOT claim success here (the old code did). If the money was taken,
    // the webhook will still grant Premium once Razorpay retries it.
    console.error('[verify-payment] Error:', err);
    return NextResponse.json(
      { error: 'We received your payment but could not activate Premium yet. It will activate automatically within a few minutes — contact support if it does not.' },
      { status: 502 }
    );
  }
}
