# SpendXP — Environment Variables Setup Guide

Everything you need to activate all features. Add these in **Vercel → Project → Settings → Environment Variables**.

---

## 🔥 Firebase (already working)

These are already set — listed here for reference only.

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same as above |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same as above |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same as above |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same as above |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same as above |
| `FIREBASE_ADMIN_SDK_KEY` | Firebase Console → Project Settings → Service Accounts → Generate new private key → paste the entire JSON as one line |

---

## 💳 Razorpay — Premium Payments

Razorpay powers the ₹149/month and ₹349/3-month Premium upgrade flow.

| Variable | Value / Where to get it |
|---|---|
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys → Key ID (starts with `rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | Same page → Key Secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **Same value as `RAZORPAY_KEY_ID`** — this one is public (safe for frontend) |

> ⚠️ **Never** put `RAZORPAY_KEY_SECRET` in a `NEXT_PUBLIC_` variable. It must stay server-only.

**Step 1 — Create a Razorpay account**
1. Go to https://dashboard.razorpay.com → Sign up / Log in
2. Complete KYC (required to accept live payments)

**Step 2 — Get your API keys**
1. Razorpay Dashboard → Settings → API Keys
2. Click "Generate Test Key" for testing (or "Generate Live Key" for production)
3. Copy both `Key ID` and `Key Secret`

**Step 3 — Add to Vercel**
1. Vercel → SpendXP project → Settings → Environment Variables
2. Add all three variables above
3. Redeploy after saving

**Step 4 — Test the payment flow**
- Test card: `4111 1111 1111 1111` — any future expiry — any CVV
- UPI test: use any UPI ID in test mode (Razorpay accepts them all)
- After payment, check Razorpay Dashboard → Payments for the transaction
- Check Firebase Console → Firestore → users → your UID → `isPremium: true`

**Going live (production)**
1. Switch test keys to live keys in Vercel env vars
2. Redeploy once

---

## 📈 Market Simulation — AI News (activates AI-generated market news)

The market page uses Google Gemini to generate fictional news events.

| Variable | Where to get it |
|---|---|
| `GOOGLE_GENAI_API_KEY` | https://aistudio.google.com → Get API Key → Create API key (starts with `AIza...`) |

---

## 📧 Email — Consent + Parent Invites

| Variable | Value |
|---|---|
| `EMAIL_FROM` | `noreply@spendxp.com` (or your verified sender domain) |
| `RESEND_API_KEY` | resend.com → API Keys |

---

## ✅ Full Checklist

- [ ] `RAZORPAY_KEY_ID` — payments working
- [ ] `RAZORPAY_KEY_SECRET` — server-side order + signature verification
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` — checkout modal opens in browser
- [ ] `GOOGLE_GENAI_API_KEY` — market simulation AI news activated
- [ ] `FIREBASE_ADMIN_SDK_KEY` — Admin SDK (needed for isPremium writes)
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Redeploy on Vercel after adding all vars

---

## After adding env vars

Always **redeploy** after adding variables. Vercel doesn't hot-reload env changes.

Vercel → Deployments → ⋯ menu on latest deployment → Redeploy
