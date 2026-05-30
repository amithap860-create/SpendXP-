/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout Session for SpendXP Premium (price TBD).
 * Uses the Stripe REST API directly — no npm package needed.
 * Returns: { url: string } — client redirects to this Stripe-hosted page.
 *
 * ENV VARS (add to Vercel Dashboard → Settings → Environment Variables):
 *   STRIPE_SECRET_KEY           — sk_live_... or sk_test_... from Stripe → API Keys
 *   STRIPE_PRICE_ID             — price_... from Stripe → Products → SpendXP Premium
 *   NEXT_PUBLIC_APP_URL         — https://spendxp.vercel.app
 *   FIREBASE_ADMIN_SDK_KEY      — full JSON service account from Firebase console
 *
 * ONE-TIME STRIPE SETUP:
 *   1. stripe.com/dashboard → Products → + Add product
 *      Name: "SpendXP Premium"  |  Price: set your price (TBD — confirm with team)
 *      Copy the Price ID (price_xxx) → add as STRIPE_PRICE_ID
 *   2. Developers → Webhooks → + Add endpoint
 *      URL: https://spendxp.vercel.app/api/webhooks/stripe
 *      Events: checkout.session.completed, customer.subscription.created,
 *              customer.subscription.updated, customer.subscription.deleted
 *      Copy the signing secret → add as STRIPE_WEBHOOK_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

// Map currency codes to their Stripe Price ID env vars
const CURRENCY_PRICE_ENV: Record<string, string> = {
  INR: 'STRIPE_PRICE_ID_INR',
  USD: 'STRIPE_PRICE_ID_USD',
  GBP: 'STRIPE_PRICE_ID_GBP',
  EUR: 'STRIPE_PRICE_ID_EUR',
  AUD: 'STRIPE_PRICE_ID_AUD',
  SGD: 'STRIPE_PRICE_ID_SGD',
};

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendxp.vercel.app';

  if (!stripeKey) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to Vercel env vars.' },
      { status: 503 }
    );
  }

  // ── Authenticate via Firebase ID token ────────────────────────────────────
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let uid: string;
  let userEmail: string | undefined;

  try {
    const { auth } = await getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
    userEmail = decoded.email;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // ── Reuse existing Stripe customer if we have one ─────────────────────────
  const { db } = await getFirebaseAdmin();
  const userSnap = await db.collection('users').doc(uid).get();
  const userData = userSnap.data() || {};
  let customerId: string | undefined = userData.stripeCustomerId;

  if (!customerId) {
    // Search by Firebase UID in metadata — safer than email (emails can be shared
    // across re-created accounts). Email search is intentionally avoided here.
    const searchRes = await fetch(
      `https://api.stripe.com/v1/customers/search?query=metadata%5B%22firebaseUid%22%5D%3A%22${encodeURIComponent(uid)}%22&limit=1`,
      { headers: { Authorization: `Bearer ${stripeKey}` } }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.data?.length > 0) {
        customerId = searchData.data[0].id;
        // Persist to Firestore if missing
        if (!userData.stripeCustomerId) {
          await db.collection('users').doc(uid).update({ stripeCustomerId: customerId }).catch(() => {});
        }
      }
    }
  }

  if (!customerId) {
    // Create a new Stripe customer
    const createBody = new URLSearchParams({
      'metadata[firebaseUid]': uid,
    });
    if (userEmail) createBody.append('email', userEmail);

    const createRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: createBody.toString(),
    });

    if (createRes.ok) {
      const customer = await createRes.json();
      customerId = customer.id;
    }
  }

  // Save customer ID to Firestore for future checkouts
  if (customerId && !userData.stripeCustomerId) {
    await db.collection('users').doc(uid).update({ stripeCustomerId: customerId }).catch(() => {});
  }

  // ── Resolve currency-specific price ID ───────────────────────────────────
  // User's currency is stored in their Firestore profile (set during onboarding/profile)
  const userCurrency: string = (userData.currencyCode || 'USD').toUpperCase();
  const currencyEnvVar = CURRENCY_PRICE_ENV[userCurrency];
  const priceId =
    (currencyEnvVar ? process.env[currencyEnvVar] : null) ||
    process.env.STRIPE_PRICE_ID || // fallback to default
    null;

  if (!priceId) {
    return NextResponse.json(
      { error: 'Stripe pricing is not configured yet. Check back soon!' },
      { status: 503 }
    );
  }

  // ── Build Checkout Session params ─────────────────────────────────────────
  const params = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'success_url': `${appUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    'cancel_url': `${appUrl}/upgrade/cancel`,
    // metadata on the session (read by webhook via checkout.session.completed)
    'metadata[firebaseUid]': uid,
    // metadata on the subscription itself (read by subscription events)
    'subscription_data[metadata][firebaseUid]': uid,
    allow_promotion_codes: 'true',
    billing_address_collection: 'auto',
  });

  if (customerId) {
    params.append('customer', customerId);
  } else if (userEmail) {
    params.append('customer_email', userEmail);
  }

  // ── Create the session ────────────────────────────────────────────────────
  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[create-checkout] Stripe error:', err);
      return NextResponse.json(
        { error: err?.error?.message || 'Stripe error' },
        { status: 500 }
      );
    }

    const session = await res.json();
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[create-checkout] Network error:', err);
    return NextResponse.json({ error: 'Failed to reach Stripe' }, { status: 500 });
  }
}
