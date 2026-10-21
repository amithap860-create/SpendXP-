import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

/**
 * Shared Razorpay → Premium grant logic (2026-10-20 security pass).
 *
 * Used by BOTH /api/razorpay/verify-payment (browser callback) and
 * /api/razorpay/webhook (Razorpay server → us). Whichever arrives first grants
 * Premium; the second is a no-op because payments/{paymentId} already exists.
 *
 * What the old code got wrong, and what this enforces instead:
 *   - plan came from the client body → pay ₹100, claim 'annual'.
 *     Now: plan + amount come from the ORDER we created server-side.
 *   - no check the payment belonged to the caller → one payment unlocked
 *     unlimited accounts. Now: order.notes.firebaseUid must equal the uid.
 *   - no replay protection → resubmitting an old payment renewed forever.
 *     Now: payments/{paymentId} is created once, in a transaction.
 */

export const PLANS = {
  monthly: { amount: 10000, days: 30, label: 'SpendXP Premium — 1 Month' },
  annual: { amount: 39900, days: 365, label: 'SpendXP Premium — 12 Months' },
} as const;
export type PlanKey = keyof typeof PLANS;

export function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a || '', 'utf8');
  const bb = Buffer.from(b || '', 'utf8');
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function hmacHex(secret: string, payload: string | Buffer): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

async function rzpGet(path: string): Promise<any> {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay not configured');
  const res = await fetch(`https://api.razorpay.com/v1/${path}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Razorpay GET ${path} failed: ${res.status}`);
  return res.json();
}

export type GrantResult =
  | { ok: true; plan: PlanKey; alreadyProcessed: boolean; subscriptionEndAt: Date }
  | { ok: false; status: number; error: string };

/**
 * Fetches the payment + order from Razorpay (source of truth), validates them,
 * and grants Premium exactly once per payment.
 * expectedUid: pass the caller's uid from the browser route; omit for webhooks
 * (the uid then comes from the order notes we wrote at create-order time).
 */
export async function grantPremiumForPayment(paymentId: string, orderId: string, expectedUid?: string): Promise<GrantResult> {
  const [payment, order] = await Promise.all([rzpGet(`payments/${encodeURIComponent(paymentId)}`), rzpGet(`orders/${encodeURIComponent(orderId)}`)]);

  if (payment.order_id !== order.id) return { ok: false, status: 400, error: 'Payment does not belong to this order.' };
  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    return { ok: false, status: 402, error: `Payment not completed (status: ${payment.status}).` };
  }
  if (payment.currency !== 'INR' || payment.amount !== order.amount) {
    return { ok: false, status: 400, error: 'Payment amount does not match the order.' };
  }

  const uid: string | undefined = order.notes?.firebaseUid;
  const planKey = order.notes?.plan as PlanKey | undefined;
  if (!uid || !planKey || !(planKey in PLANS)) return { ok: false, status: 400, error: 'Order is missing SpendXP metadata.' };
  if (expectedUid && uid !== expectedUid) {
    console.warn('[razorpay] uid mismatch: order for', uid, 'claimed by', expectedUid);
    return { ok: false, status: 403, error: 'This payment belongs to a different account.' };
  }
  const plan = PLANS[planKey];
  if (order.amount !== plan.amount) return { ok: false, status: 400, error: 'Order amount does not match plan price.' };

  const { db } = getFirebaseAdmin();
  const paymentRef = db.collection('payments').doc(paymentId);
  const userRef = db.collection('users').doc(uid);

  return db.runTransaction(async (tx) => {
    const [paySnap, userSnap] = await Promise.all([tx.get(paymentRef), tx.get(userRef)]);
    if (paySnap.exists) {
      const end = paySnap.data()!.subscriptionEndAt;
      return { ok: true as const, plan: planKey, alreadyProcessed: true, subscriptionEndAt: end?.toDate?.() ?? new Date(end) };
    }

    // Stack renewals: extend from the later of now / current expiry.
    const cur = userSnap.data()?.subscriptionEndAt;
    const curDate: Date | null = cur instanceof Timestamp ? cur.toDate() : cur ? new Date(cur) : null;
    const base = curDate && curDate.getTime() > Date.now() ? curDate : new Date();
    const subscriptionEndAt = new Date(base.getTime() + plan.days * 86400 * 1000);

    tx.set(paymentRef, {
      uid,
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId,
      plan: planKey,
      amount: payment.amount,
      currency: payment.currency,
      paymentStatus: payment.status,
      activatedAt: FieldValue.serverTimestamp(),
      subscriptionEndAt,
    });
    tx.set(userRef, {
      isPremium: true,
      premiumActivatedAt: FieldValue.serverTimestamp(),
      subscriptionEndAt,
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId,
      premiumPlan: planKey,
    }, { merge: true });

    return { ok: true as const, plan: planKey, alreadyProcessed: false, subscriptionEndAt };
  });
}
