/**
 * POST /api/razorpay/create-order
 *
 * Creates a Razorpay order server-side. The frontend uses the returned
 * order_id to open the Razorpay checkout modal.
 *
 * ENV VARS (add to Vercel → Settings → Environment Variables):
 *   RAZORPAY_KEY_ID     — rzp_live_T7rvEPuehbeRPt
 *   RAZORPAY_KEY_SECRET — from rzp-key.csv (delete that file after adding here)
 *   FIREBASE_ADMIN_SDK_KEY — full Firebase service account JSON
 *
 * Request body: { plan: 'monthly' | 'annual' }
 * Response:     { orderId, amount, currency, keyId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

// Pricing in paise (1 INR = 100 paise)
// Monthly: ₹149 | Annual: ₹599 (saves ₹1,189 vs monthly × 12)
const PLANS = {
  monthly: { amount: 10000, label: 'SpendXP Premium — 1 Month' },
  annual:  { amount: 39900, label: 'SpendXP Premium — 12 Months' },
} as const;

type PlanKey = keyof typeof PLANS;

export async function POST(request: NextRequest) {
  // NEXT_PUBLIC_ prefix makes it available client-side too; server can also read it
  const keyId     = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: 'Razorpay is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Vercel env vars.' },
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

  // ── Parse plan ───────────────────────────────────────────────────────────────
  let plan: PlanKey = 'monthly';
  try {
    const body = await request.json();
    if (body.plan === 'annual') plan = 'annual';
  } catch { /* default to monthly */ }

  const { amount, label } = PLANS[plan];
  const receipt = `spendxp_${uid.slice(0, 8)}_${Date.now()}`;

  // ── Call Razorpay Orders API ─────────────────────────────────────────────────
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  try {
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt,
        notes: {
          firebaseUid: uid,
          plan,
          product: label,
        },
      }),
    });

    if (!rzpRes.ok) {
      const err = await rzpRes.json();
      console.error('[create-order] Razorpay error:', err);
      return NextResponse.json(
        { error: err?.error?.description || 'Failed to create order' },
        { status: 500 }
      );
    }

    const order = await rzpRes.json();

    return NextResponse.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId,        // safe to expose — this is the public key ID, not the secret
      plan,
    });
  } catch (err) {
    console.error('[create-order] Network error:', err);
    return NextResponse.json({ error: 'Failed to reach Razorpay' }, { status: 500 });
  }
}
