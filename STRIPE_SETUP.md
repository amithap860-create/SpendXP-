# SpendXP — Stripe Payments Setup

Complete this once to activate the Premium subscription flow.

---

## Step 1 — Create a Stripe product

1. Go to [stripe.com/dashboard](https://dashboard.stripe.com) → sign in (or create free account)
2. **Products** → **+ Add product**
   - Name: `SpendXP Premium`
   - Pricing model: **Recurring**
   - Price: **TBD — set your price here once confirmed** · Billing period: **Monthly**
3. Click **Save product**
4. Copy the **Price ID** — it starts with `price_` — you'll need it below

---

## Step 2 — Set up the webhook

1. Stripe Dashboard → **Developers** → **Webhooks** → **+ Add endpoint**
2. Endpoint URL: `https://YOUR-URL.vercel.app/api/webhooks/stripe`
3. Events to listen for (select all 4):
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Click **Add endpoint**
5. Copy the **Signing secret** (`whsec_...`) — you'll need it below

---

## Step 3 — Add env vars to Vercel

Go to Vercel Dashboard → your SpendXP project → **Settings** → **Environment Variables**

Add these:

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (from Stripe → API Keys → Secret key) |
| `STRIPE_PRICE_ID` | `price_...` (from Step 1) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from Step 2) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (from Stripe → API Keys) |
| `NEXT_PUBLIC_APP_URL` | `https://your-actual-url.vercel.app` |

> Use `sk_test_` and `pk_test_` keys while testing, switch to `sk_live_` when going live.

---

## Step 4 — Enable the Customer Portal

This lets Premium users cancel/update payment without you building that UI.

1. Stripe Dashboard → **Settings** → **Billing** → **Customer portal**
2. Click **Activate portal**
3. Configure what customers can do (recommended: allow cancellation, card updates)
4. Save

---

## Step 5 — Redeploy

After adding env vars, trigger a new Vercel deployment:
```
git commit --allow-empty -m "chore: trigger Stripe env var deployment"
git push
```

---

## Testing the flow

1. Use Stripe test keys (`sk_test_`, `pk_test_`)
2. Visit `/upgrade` → click **Subscribe**
3. Stripe test card: `4242 4242 4242 4242` · any future date · any CVC
4. After payment, you'll be redirected to `/upgrade/success`
5. Check Firestore → `users/{uid}` → `isPremium` should be `true`
6. Profile page → should show "Manage" button instead of upgrade CTA

---

## How the flow works end-to-end

```
User clicks "Subscribe"
  → /api/stripe/create-checkout  (creates Stripe Checkout Session)
  → Stripe-hosted payment page
  → Payment succeeds
  → Stripe sends webhook to /api/webhooks/stripe
  → Webhook sets users/{uid}.isPremium = true in Firestore
  → Stripe redirects to /upgrade/success
  → Success page polls /api/stripe/verify-session until isPremium = true
  → Shows confirmation + unlocked features list
```

Premium users can manage their subscription from **Profile → Manage** which opens the Stripe Customer Portal.
