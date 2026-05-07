/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout Session for SpendXP Premium ($4.99/month).
 * Requires the user to be authenticated with Firebase.
 *
 * Returns: { url: string }  — redirect the browser to this URL.
 *
 * ENV VARS NEEDED (add to Vercel Dashboard → Settings → Environment Variables):
 *   STRIPE_SECRET_KEY           — from Stripe Dashboard → API Keys → Secret key
 *   NEXT_PUBLIC_APP_URL         — your production URL, e.g. https://spendxp.vercel.app
 *   STRIPE_PREMIUM_PRICE_ID     — Price ID from Stripe Dashboard → Products → SpendXP Premium
 *   FIREBASE_ADMIN_SDK_KEY      — full JSON service account key from Firebase console
 *
 * HOW TO GET STRIPE_PREMIUM_PRICE_ID:
 *   1. Go to https://dashboard.stripe.com/products
 *   2. Click "+ Add product"
 *   3. Name: "SpendXP Agent"  |  Pricing: $4.99 recurring, monthly
 *   4. Save — then copy the Price ID (starts with price_...)
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const dynamic = 'force-dynamic';

function initAdmin() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');
  if (!serviceAccount.project_id) return null;
  const existing = getApps().find((a) => a.name === 'admin');
  if (existing) return existing;
  return initializeApp({ credential: cert(serviceAccount) }, 'admin');
}

export async function POST(request: NextRequest) {
  // Check env vars
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendxp.vercel.app';

  if (!stripeKey || !priceId) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PREMIUM_PRICE_ID to env vars.' },
      { status: 503 }
    );
  }

  // Authenticate the user
  const adminApp = initAdmin();
  if (!adminApp) {
    return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 503 });
  }
  const adminAuth = getAuth(adminApp);

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let uid: string;
  let email: string | undefined;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split(' ')[1]);
    uid = decoded.uid;
    email = decoded.email;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create a Stripe Checkout Session using the REST API directly
  // (avoids installing the stripe npm package)
  const params = new URLSearchParams({
    'mode': 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'success_url': `${appUrl}/upgrade?success=true`,
    'cancel_url': `${appUrl}/upgrade`,
    'metadata[firebaseUid]': uid,
    'allow_promotion_codes': 'true',
    'billing_address_collection': 'auto',
  });

  if (email) {
    params.append('customer_email', email);
  }

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
      console.error('[Stripe] Checkout session creation failed:', err);
      return NextResponse.json({ error: err?.error?.message || 'Stripe error' }, { status: 500 });
    }

    const session = await res.json();
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[Stripe] Network error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
