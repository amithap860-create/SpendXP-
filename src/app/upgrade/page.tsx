'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PREMIUM_FEATURES } from '@/config/premium';
import { useAuthContext } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const FEATURE_ROWS: Array<{
  label: string;
  free: string | boolean;
  premium: string | boolean;
}> = [
  { label: 'Case Files (Quests)',        free: '3 per day',     premium: 'Unlimited' },
  { label: 'Budget Blitz',               free: true,            premium: true },
  { label: 'FinIQ Quiz',                 free: true,            premium: true },
  { label: 'Money Maze',                 free: true,            premium: true },
  { label: 'Stock Market Simulator',     free: false,           premium: true },
  { label: 'Credit Score Builder',       free: false,           premium: true },
  { label: 'Group Play & Challenges',    free: false,           premium: true },
  { label: 'Streak Shield',             free: false,           premium: '1× per week' },
  { label: 'Exclusive Avatars',          free: false,           premium: true },
  { label: 'Deep Analytics',            free: false,           premium: true },
  { label: 'Shareable Rank Card',        free: false,           premium: true },
  { label: 'Early Access',              free: false,           premium: true },
];

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === false) {
    return (
      <span className="flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-300">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5.5 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </span>
    );
  }
  if (value === true) {
    return (
      <span className="flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" fill="#2E7D5A" opacity="0.15"/>
          <path d="M5 8l2.2 2.2L11 5.5" stroke="#2E7D5A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }
  return <span className="text-xs font-bold text-primary">{value}</span>;
}

/**
 * UpgradePage
 *
 * HOW TO WIRE STRIPE CHECKOUT (when you're ready to go live):
 *
 *  1. Add your Stripe publishable key to .env.local:
 *       NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
 *
 *  2. Create a Stripe Checkout Session endpoint:
 *       src/app/api/stripe/create-checkout/route.ts
 *     It should create a session with:
 *       - price: your price ID (set in Stripe Dashboard)
 *       - metadata: { firebaseUid: uid }
 *       - success_url: https://spendxp.vercel.app/upgrade?success=true
 *       - cancel_url:  https://spendxp.vercel.app/upgrade
 *
 *  3. The STRIPE_WEBHOOK_SECRET webhook at /api/webhooks/stripe will then
 *     automatically set isPremium=true in Firestore when checkout completes.
 *
 *  4. Replace the waitlist form below with:
 *       <button onClick={handleStripeCheckout}>Subscribe to Premium</button>
 *     where handleStripeCheckout calls your create-checkout endpoint and redirects.
 */

export default function UpgradePage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // ── Waitlist (pre-Stripe) ────────────────────────────────────────────────────
  async function handleJoinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'waitlist'), {
        email: email.trim().toLowerCase(),
        uid: user?.uid ?? null,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('[Waitlist] Firestore write failed:', err);
      // Still show success — don't block user on a network hiccup
    } finally {
      setSubmitting(false);
      setEmailSent(true);
    }
  }

  // ── Stripe Checkout (activate this when Stripe is wired up) ─────────────────
  async function handleStripeCheckout() {
    if (!user) { router.push('/login'); return; }
    setCheckoutLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Checkout session creation failed');
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error('[Upgrade] Stripe checkout error:', err);
      alert('Could not start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  // ── Stripe is "live" when the env var is set ─────────────────────────────────
  const stripeLive = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Hero */}
      <div className="bg-[#1A1F2E] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-14 pb-12 text-center">
          {/* Back link */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-black uppercase tracking-widest mb-8 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go Back
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-amber-400 text-xs font-black uppercase tracking-widest">SpendXP Agent Tier</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            Level Up Your<br />
            <span style={{ color: '#4EA07A' }}>Financial Power</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md mx-auto mb-8">
            The Order's most powerful agents unlock every tool. Go from Apprentice to Legend faster with the full arsenal.
          </p>

          {/* Price badge */}
          <div className="inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-8 py-5">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-white">₹149</span>
              <span className="text-slate-400 text-base font-bold">/month</span>
            </div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">or ₹349 / 3 months · save 22%</div>
            <div className="flex flex-wrap gap-2 justify-center text-xs text-slate-500 font-medium">
              <span>🇺🇸 $2.99/mo</span>
              <span>·</span>
              <span>🇬🇧 £1.99/mo</span>
              <span>·</span>
              <span>🇪🇺 €1.99/mo</span>
              <span>·</span>
              <span>🇦🇺 A$3.99/mo</span>
            </div>
            <div className="mt-3 text-xs text-slate-600">Cancel anytime · No contracts · Priced locally</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">

        {/* Premium features grid */}
        <div className="mt-10 mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">What You Unlock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(PREMIUM_FEATURES).map(([key, feat]) => (
              <div key={key} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-100">
                <div className="text-2xl flex-shrink-0">{feat.icon}</div>
                <div>
                  <div className="text-sm font-black text-slate-900">{feat.label}</div>
                  <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{feat.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="mb-10">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Free vs Agent</h2>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px] text-center bg-slate-50 border-b border-slate-100">
              <div className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">Feature</div>
              <div className="py-3 text-xs font-black uppercase tracking-widest text-slate-500">Explorer</div>
              <div className="py-3 text-xs font-black uppercase tracking-widest" style={{ color: '#2E7D5A' }}>Agent</div>
            </div>
            {/* Rows */}
            {FEATURE_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  'grid grid-cols-[1fr_80px_80px] items-center text-center',
                  i !== FEATURE_ROWS.length - 1 && 'border-b border-slate-50'
                )}
              >
                <div className="px-4 py-3 text-left text-xs font-bold text-slate-700">{row.label}</div>
                <div className="py-3 flex items-center justify-center">
                  <FeatureCell value={row.free} />
                </div>
                <div className="py-3 flex items-center justify-center">
                  <FeatureCell value={row.premium} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA — Stripe checkout (if live) or Waitlist */}
        <div className="bg-[#1A1F2E] rounded-2xl p-8 text-center mb-6">
          {stripeLive ? (
            /* ── Stripe is wired: show Subscribe button ── */
            <div className="space-y-4">
              <div className="text-amber-400 text-xs font-black uppercase tracking-widest mb-1">SpendXP Agent</div>
              <h3 className="text-xl font-black text-white">SpendXP Premium</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Unlock all games, unlimited quests, streak shields, and more.
              </p>
              <button
                onClick={handleStripeCheckout}
                disabled={checkoutLoading}
                className="w-full mt-2 h-12 rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all"
                style={{ background: checkoutLoading ? '#1a3d2b' : '#2E7D5A' }}
              >
                {checkoutLoading ? 'Loading...' : 'Subscribe to Premium'}
              </button>
              <p className="text-slate-600 text-[10px]">Powered by Stripe · Cancel anytime · No contracts</p>
            </div>
          ) : emailSent ? (
            /* ── Waitlist confirmed ── */
            <div className="space-y-3">
              <div className="text-4xl">🎖️</div>
              <h3 className="text-xl font-black text-white">You're on the list!</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                We'll notify you the moment Agent tier launches. Your spot is reserved.
              </p>
              <Link
                href="/games"
                className="inline-block mt-4 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white/10 transition-colors"
              >
                Back to Arcade →
              </Link>
            </div>
          ) : (
            /* ── Waitlist form ── */
            <>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 mb-4">
                <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Launching Soon</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2">Join the Agent Waitlist</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                Premium is coming soon. Drop your email to be first in line — and get a free Streak Shield on launch day.
              </p>
              <form onSubmit={handleJoinWaitlist} className="flex gap-2 max-w-sm mx-auto">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all"
                  style={{ background: submitting ? '#1a3d2b' : '#2E7D5A' }}
                >
                  {submitting ? '...' : 'Join'}
                </button>
              </form>
              <p className="text-slate-600 text-[10px] mt-3">No spam. Unsubscribe anytime.</p>
            </>
          )}
        </div>

        {/* Reassurance */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '🔒', label: 'Secure Payments', sub: 'Stripe encrypted' },
            { icon: '↩', label: 'Cancel Anytime', sub: 'No contracts' },
            { icon: '🛡', label: 'Data Private', sub: 'Never sold' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl p-4 border border-slate-100">
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-[11px] font-black text-slate-800">{item.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
