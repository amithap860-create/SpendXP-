'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Star } from 'lucide-react';

export default function UpgradeCancelPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">

        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
          <XCircle className="h-10 w-10 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-foreground">No worries!</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Your subscription wasn't started and you haven't been charged.
            You can upgrade any time from the Games page.
          </p>
        </div>

        {/* Mini pitch */}
        <div className="bg-card rounded-2xl shadow-md p-6 text-left space-y-4 border border-border">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <span className="font-black text-foreground text-sm">Reminder — Premium unlocks:</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              'Unlimited quests per day',
              'Stock Market Simulator & Credit Score Builder',
              'Streak Shield to protect your streak',
              'Group challenges with friends',
              'Exclusive avatars + deep analytics',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-primary font-black">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground text-center pt-1">
            From ₹149/mo · Cancel anytime · No contracts
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/upgrade">
            <Button className="w-full h-12 font-black">
              View Premium Plans
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-12 font-bold gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
