'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PREMIUM_FEATURES } from '@/config/premium';
import { useAuthContext } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ── Razorpay type declaration (loaded via CDN script) ────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}
interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open(): void;
  on(event: string, handler: () => void): void;
}

// ── Feature comparison table ─────────────────────────────────────────────────
const FEATURE_ROWS: Array<{
  label: string;
  free: string | boolean;
  premium: string | boolean;
}> = [
  { label: 'Case Files (Quests)',       free: '3 per day',    premium: 'Unlimited' },
  { label: 'Budget Blitz',              free: true,           premium: true },
  { label: 'FinIQ Quiz',                free: true,           premium: true },
  { label: 'Money Maze',                free: true,           premium: true },
  { label: 'Stock Market Simulator',    free: false,          premium: true },
  { label: 'Credit Score Builder',      free: false,          premium: true },
  { label: 'Group Play & Challenges',   free: false,          premium: true },
  { label: 'Streak Shield',             free: false,          premium: '1× per week' },
  { label: 'Exclusive Avatars',         free: false,          premium: true },
  { label: 'Deep Analytics',            free: false,          premium: true },
  { label: 'Shareable Rank Card',       free: false,          premium: true },
  { label: 'Early Access',              free: false,          premium: true },
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

// ── Load Razorpay checkout.js once ──────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function UpgradePage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const isConfigured  = Boolean(razorpayKeyId);

  async function handlePayment() {
    if (!user) { router.push('/login'); return; }
    if (!razorpayKeyId) {
      toast({ title: 'Payments not configured', description: 'Razorpay env vars are missing.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: 'Could not load payment module', description: 'Check your internet connection and try again.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // 2. Create order on backend
      const token = await user.getIdToken();
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        toast({ title: 'Order creation failed', description: err.error || 'Please try again.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const { orderId, amount, currency } = await orderRes.json();

      // 3. Open Razorpay modal
      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount,
        currency,
        name: 'SpendXP',
        description: selectedPlan === 'quarterly'
          ? 'SpendXP Premium — 3 Months'
          : 'SpendXP Premium — 1 Month',
        image: '/icons/icon-192.png',
        order_id: orderId,

        handler: async (response: RazorpayPaymentResponse) => {
          // 4. Verify payment signature on backend
          try {
            const freshToken = await user.getIdToken(true);
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${freshToken}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_signature:  response.razorpay_signature,
                plan: selectedPlan,
              }),
            });

            const result = await verifyRes.json();

            if (verifyRes.ok && result.success) {
              setPaid(true);
              // Redirect to success page after a brief celebration moment
              setTimeout(() => router.push('/upgrade/success?via=razorpay'), 1500);
            } else {
              toast({
                title: 'Verification failed',
                description: result.error || 'Payment could not be verified. Contact support with your payment ID.',
                variant: 'destructive',
              });
            }
          } catch {
            toast({
              title: 'Network error during verification',
              description: `Please contact support with Payment ID: ${response.razorpay_payment_id}`,
              variant: 'destructive',
            });
          }
        },

        prefill: {
          name:  user.displayName || '',
          email: user.email || '',
        },
        theme: { color: '#2E7D5A' },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });

      rzp.open();
      // loading spinner stays until modal is dismissed or payment completes
    } catch (err) {
      console.error('[Upgrade] Payment error:', err);
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' });
      setLoading(false);
    }
  }

  // ── Success state (brief, then redirects) ──────────────────────────────────
  if (paid) {
    return (
      <div className="min-h-screen bg-[#1A1F2E] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">🎖️</div>
          <h1 className="text-2xl font-black text-white">Payment Successful!</h1>
          <p className="text-slate-400 text-sm">Activating your Premium access…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Hero */}
      <div className="bg-[#1A1F2E] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-14 pb-12 text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-black uppercase tracking-widest mb-8 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go Back
          </button>

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

          {/* Plan selector */}
          <div className="inline-flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1 mb-4">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={cn(
                'px-6 py-3 rounded-xl text-sm font-black transition-all',
                selectedPlan === 'monthly'
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Monthly<br />
              <span className="text-xs font-bold opacity-80">₹149</span>
            </button>
            <button
              onClick={() => setSelectedPlan('quarterly')}
              className={cn(
                'px-6 py-3 rounded-xl text-sm font-black transition-all relative',
                selectedPlan === 'quarterly'
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              3 Months<br />
              <span className="text-xs font-bold opacity-80">₹349</span>
              <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">SAVE 22%</span>
            </button>
          </div>

          <div className="text-slate-500 text-xs mt-2">
            {selectedPlan === 'quarterly' ? '₹116/month · billed ₹349 every 3 months' : 'Billed monthly · Cancel anytime'}
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
            <div className="grid grid-cols-[1fr_80px_80px] text-center bg-slate-50 border-b border-slate-100">
              <div className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">Feature</div>
              <div className="py-3 text-xs font-black uppercase tracking-widest text-slate-500">Explorer</div>
              <div className="py-3 text-xs font-black uppercase tracking-widest" style={{ color: '#2E7D5A' }}>Agent</div>
            </div>
            {FEATURE_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  'grid grid-cols-[1fr_80px_80px] items-center text-center',
                  i !== FEATURE_ROWS.length - 1 && 'border-b border-slate-50'
                )}
              >
                <div className="px-4 py-3 text-left text-xs font-bold text-slate-700">{row.label}</div>
                <div className="py-3 flex items-center justify-center"><FeatureCell value={row.free} /></div>
                <div className="py-3 flex items-center justify-center"><FeatureCell value={row.premium} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#1A1F2E] rounded-2xl p-8 text-center mb-6">
          {isConfigured ? (
            <div className="space-y-4">
              <div className="text-amber-400 text-xs font-black uppercase tracking-widest mb-1">SpendXP Agent</div>
              <h3 className="text-xl font-black text-white">
                {selectedPlan === 'quarterly' ? '3 Months for ₹349' : '₹149 / month'}
              </h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Unlock all games, unlimited quests, streak shields, and more.
              </p>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-2 h-12 rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
                style={{ background: loading ? '#1a3d2b' : '#2E7D5A' }}
              >
                {loading ? 'Opening payment…' : `Pay ₹${selectedPlan === 'quarterly' ? '349' : '149'} with Razorpay`}
              </button>
              <p className="text-slate-600 text-[10px]">
                UPI · Cards · Netbanking · Wallets · Cancel anytime
              </p>
            </div>
          ) : (
            /* Payments not yet configured */
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 mb-2">
                <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Launching Soon</span>
              </div>
              <h3 className="text-xl font-black text-white">Agent Tier Coming Soon</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Premium is almost here. Keep playing to earn your spot at the top.
              </p>
              <Link
                href="/games"
                className="inline-block mt-4 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white/10 transition-colors"
              >
                Back to Arcade →
              </Link>
            </div>
          )}
        </div>

        {/* Reassurance */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '🔒', label: 'Secure Payments', sub: 'Razorpay encrypted' },
            { icon: '↩', label: 'Cancel Anytime',  sub: 'No contracts' },
            { icon: '🛡', label: 'Data Private',    sub: 'Never sold' },
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
