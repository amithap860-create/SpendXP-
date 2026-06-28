'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

/**
 * /upgrade/success
 *
 * Shown after Razorpay payment is verified on the upgrade page.
 * No polling needed — verification already completed before redirect.
 */
function SuccessContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1A1F2E] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-500">

        {/* Glow burst */}
        <div className="relative w-28 h-28 mx-auto">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
          <div className="relative w-28 h-28 bg-primary rounded-full flex items-center justify-center">
            <Sparkles className="h-14 w-14 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-amber-400 text-xs font-black uppercase tracking-widest">Agent Tier Activated</div>
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

        <p className="text-slate-600 text-xs">
          Questions? <Link href="/support" className="underline hover:text-slate-400">Contact support</Link>
        </p>
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
