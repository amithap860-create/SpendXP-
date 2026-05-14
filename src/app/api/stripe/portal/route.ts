import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session so premium users can manage their
 * subscription (cancel, update payment method, download invoices).
 * Stripe hosts the entire UI — we just redirect to their URL.
 *
 * Auth: Bearer <Firebase ID token>
 * Returns: { url: string }
 *
 * One-time setup:
 *   Stripe Dashboard → Settings → Billing → Customer portal → Activate
 */
export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendxp.vercel.app';

  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization') || '';
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

  const { db } = await getFirebaseAdmin();
  const userSnap = await db.collection('users').doc(uid).get();
  const customerId = userSnap.data()?.stripeCustomerId;

  if (!customerId) {
    return NextResponse.json({ error: 'No Stripe customer found for this account.' }, { status: 404 });
  }

  // Create a portal session via Stripe REST API
  const body = new URLSearchParams({
    customer: customerId,
    return_url: `${appUrl}/profile`,
  });

  const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('[portal] Stripe error:', err);
    return NextResponse.json({ error: err?.error?.message || 'Stripe error' }, { status: 500 });
  }

  const session = await res.json();
  return NextResponse.json({ url: session.url });
}
