'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PREMIUM_UNLOCKS = [
  'Unlimited Case Files (Quests)',
  'Stock Market Simulator',
  'Credit Score Builder',
  'Group Play & Challenges',
  'Streak Shield — 1× per week',
  'Exclusive Avatars',
  'Deep Analytics',
  'Early Access to new games',
];

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const sessionId = searchParams.get('session_id');

  const [verifying, setVerifying] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [dots, setDots] = useState('.');

  // Animated dots while verifying
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 600);
    return () => clearInterval(t);
  }, []);

  // Poll Firestore via a light API route until isPremium = true
  // (the Stripe webhook sets it — usually within 2-5 seconds)
  useEffect(() => {
    if (!user || !sessionId) {
      setVerifying(false);
      return;
    }

    let attempts = 0;
    const MAX = 12; // 12 × 2.5s = 30s max wait

    const poll = async () => {
      attempts++;
      try {
        const token = await user.getIdToken(true); // force refresh to get latest claims
        const res = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.isPremium) {
            setIsPremium(true);
            setVerifying(false);
            return;
          }
        }
      } catch { /* ignore */ }

      if (attempts < MAX) {
        setTimeout(poll, 2500);
      } else {
        // Give up polling — show success anyway, webhook may just be slow
        setVerifying(false);
        setIsPremium(true);
      }
    };

    setTimeout(poll, 2000); // wait 2s before first poll to give webhook time
  }, [user, sessionId]);

  return (
    <div className="min-h-screen bg-[#1A1F2E] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">

        {verifying ? (
          /* ── Verifying state ─────────────────────────────────── */
          <div className="space-y-6">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">Activating Premium{dots}</h1>
              <p className="text-slate-400 text-sm">Confirming your payment with Stripe — just a moment.</p>
            </div>
          </div>
        ) : (
          /* ── Success state ───────────────────────────────────── */
          <div className="space-y-8 animate-in zoom-in duration-500">
            {/* Glow burst */}
            <div className="relative w-28 h-28 mx-auto">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
              <div className="relative w-28 h-28 bg-primary rounded-full flex items-center justify-center">
                <Sparkles className="h-14 w-14 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black text-white">
                Welcome to<br />
                <span style={{ color: '#4EA07A' }}>SpendXP Premium!</span>
              </h1>
              <p className="text-slate-300 text-base">
                Your account has been upgraded. Here's what you've unlocked:
              </p>
            </div>

            {/* Unlock list */}
            <div className="bg-white/5 rounded-2xl p-5 text-left space-y-3">
              {PREMIUM_UNLOCKS.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-white text-sm font-bold">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/games">
                <Button className="w-full h-14 text-xl font-black bg-primary hover:bg-primary/90">
                  Start Playing →
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full h-12 font-bold border-white/20 text-white hover:bg-white/10 hover:text-white">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1A1F2E] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
