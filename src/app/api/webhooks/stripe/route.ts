/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe webhook events and keeps Firestore's isPremium flag in sync.
 *
 * Events handled:
 *   customer.subscription.created  → isPremium = true
 *   customer.subscription.updated  → isPremium = (status === 'active' || 'trialing')
 *   customer.subscription.deleted  → isPremium = false
 *   checkout.session.completed     → isPremium = true (for one-time or first sub)
 *
 * Setup steps (do this once in Stripe Dashboard):
 *   1. Create a product: Stripe Dashboard → Products → + Add product
 *      Name: "SpendXP Premium"   Price: set your price (TBD)
 *   2. Go to Stripe Dashboard → Developers → Webhooks → + Add endpoint
 *      URL: https://spendxp.vercel.app/api/webhooks/stripe
 *      Events to listen for:
 *        • customer.subscription.created
 *        • customer.subscription.updated
 *        • customer.subscription.deleted
 *        • checkout.session.completed
 *   3. Copy the "Signing secret" from that webhook page.
 *   4. Add to Vercel env vars:
 *        STRIPE_SECRET_KEY=sk_live_...
 *        STRIPE_WEBHOOK_SECRET=whsec_...
 *   5. Also add FIREBASE_ADMIN_SDK_KEY (the full JSON key from Firebase console)
 *      to Vercel env vars if not already done.
 *
 * How the uid link works:
 *   When the user starts checkout (from /upgrade page), pass their Firebase UID
 *   as metadata: { metadata: { firebaseUid: user.uid } }
 *   This webhook reads that field and updates the correct Firestore document.
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

// ── Lazy-initialise Firebase Admin ───────────────────────────────────────────
function getAdminDb() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');
  if (!serviceAccount.project_id) return null;

  const existing = getApps().find((a) => a.name === 'admin');
  const app =
    existing ||
    initializeApp({ credential: cert(serviceAccount) }, 'admin');
  return getFirestore(app);
}

// ── Stripe signature verification (raw body required) ────────────────────────
async function verifyStripeSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // Stripe signs with HMAC-SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Parse the Stripe-Signature header: t=...,v1=...
  const parts: Record<string, string> = {};
  for (const part of signature.split(',')) {
    const idx = part.indexOf('=');
    if (idx !== -1) parts[part.slice(0, idx)] = part.slice(idx + 1);
  }
  const timestamp = parts['t'];
  const expectedSig = parts['v1'];

  if (!timestamp || !expectedSig) return false;

  // ── Replay attack prevention: reject events older than 5 minutes ──────────
  const eventTime = parseInt(timestamp, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - eventTime) > 300) {
    console.warn('[Stripe Webhook] Rejected: timestamp too old or too far in future');
    return false;
  }

  const payload = `${timestamp}.${rawBody}`;
  const signed = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
  const hex = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison via XOR (avoids short-circuit timing leaks)
  if (hex.length !== expectedSig.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) {
    diff |= hex.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return diff === 0;
}

// ── Set isPremium on a Firestore user doc ────────────────────────────────────
async function setPremium(uid: string, isPremium: boolean, adminDb: ReturnType<typeof getFirestore>) {
  if (!uid) return;
  const userRef = adminDb.collection('users').doc(uid);
  await userRef.set(
    {
      isPremium,
      premiumUpdatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  console.log(`[Stripe Webhook] uid=${uid} → isPremium=${isPremium}`);
}

// ── Extract Firebase UID from Stripe object metadata ─────────────────────────
function extractUid(obj: any): string {
  return (
    obj?.metadata?.firebaseUid ||
    obj?.metadata?.firebase_uid ||
    obj?.metadata?.uid ||
    ''
  );
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature') || '';
  const rawBody = await request.text();

  // Verify Stripe signature
  const valid = await verifyStripeSignature(rawBody, signature, webhookSecret);
  if (!valid) {
    console.warn('[Stripe Webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error('[Stripe Webhook] Firebase Admin not configured');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const { type, data } = event;
  const obj = data?.object;

  try {
    switch (type) {
      // ── New subscription created ────────────────────────────────────────────
      case 'customer.subscription.created': {
        const uid = extractUid(obj);
        if (uid) await setPremium(uid, true, adminDb);
        break;
      }

      // ── Subscription status changed (e.g. payment failed → past_due) ────────
      case 'customer.subscription.updated': {
        const uid = extractUid(obj);
        const status: string = obj?.status || '';
        const isActive = status === 'active' || status === 'trialing';
        if (uid) await setPremium(uid, isActive, adminDb);
        break;
      }

      // ── Subscription cancelled / expired ────────────────────────────────────
      case 'customer.subscription.deleted': {
        const uid = extractUid(obj);
        if (uid) await setPremium(uid, false, adminDb);
        break;
      }

      // ── Checkout session completed (handles first-time subscriptions) ────────
      case 'checkout.session.completed': {
        const uid = extractUid(obj);
        const mode: string = obj?.mode || '';
        // Only grant premium for subscription-mode checkouts
        if (uid && mode === 'subscription') {
          await setPremium(uid, true, adminDb);
        }
        break;
      }

      default:
        // Unhandled event type — log and ignore
        console.log(`[Stripe Webhook] Ignored event: ${type}`);
    }
  } catch (err) {
    console.error('[Stripe Webhook] Handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
