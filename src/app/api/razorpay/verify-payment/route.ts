/**
 * POST /api/razorpay/verify-payment
 *
 * Verifies a Razorpay payment signature and activates Premium in Firestore.
 *
 * Algorithm (per Razorpay docs):
 *   signature = HMAC-SHA256( order_id + "|" + payment_id, KEY_SECRET )
 *   Compare with razorpay_signature received from the frontend.
 *
 * Request body:
 *   { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan }
 *
 * On success: sets isPremium=true, razorpayCustomerId, subscriptionEndAt
 *             in the user's Firestore document via Admin SDK.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

// How long each plan grants Premium access
const PLAN_DURATION_DAYS: Record<string, number> = {
  monthly: 30,
  annual:  365,
};

export async function POST(request: NextRequest) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return NextResponse.json(
      { error: 'Razorpay is not configured' },
      { status: 503 }
    );
  }

  // ── Auth: require Firebase ID token ─────────────────────────────────────────
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let uid: string;
  try {
    const { auth } = await getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // ── Parse body ───────────────────────────────────────────────────────────────
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json(
      { error: 'Missing payment fields: razorpay_payment_id, razorpay_order_id, razorpay_signature required' },
      { status: 400 }
    );
  }

  // ── Verify signature ─────────────────────────────────────────────────────────
  const payload   = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generated = createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');

  if (generated !== razorpay_signature) {
    console.warn('[verify-payment] Signature mismatch for uid:', uid);
    return NextResponse.json(
      { error: 'Payment verification failed — signature mismatch' },
      { status: 400 }
    );
  }

  // ── Activate Premium in Firestore (Admin SDK — bypasses security rules) ──────
  const durationDays = PLAN_DURATION_DAYS[plan] ?? 30;
  const subscriptionEndAt = new Date();
  subscriptionEndAt.setDate(subscriptionEndAt.getDate() + durationDays);

  try {
    const { db } = await getFirebaseAdmin();
    await db.collection('users').doc(uid).set(
      {
        isPremium: true,
        premiumActivatedAt: FieldValue.serverTimestamp(),
        subscriptionEndAt,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId:   razorpay_order_id,
        premiumPlan:       plan || 'monthly',
      },
      { merge: true }
    );

    // Log the payment for audit trail
    await db.collection('payments').add({
      uid,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId:   razorpay_order_id,
      plan:              plan || 'monthly',
      amount:            durationDays === 90 ? 34900 : 14900,
      currency:          'INR',
      activatedAt:       FieldValue.serverTimestamp(),
      subscriptionEndAt,
    });

    return NextResponse.json({ success: true, isPremium: true, plan: plan || 'monthly' });
  } catch (err) {
    console.error('[verify-payment] Firestore error:', err);
    // Payment was valid but DB write failed — return success anyway so user isn't confused.
    // The payment record should be checked manually.
    return NextResponse.json({
      success: true,
      isPremium: true,
      warning: 'Payment verified but profile update delayed — contact support if Premium is not active.',
    });
  }
}
