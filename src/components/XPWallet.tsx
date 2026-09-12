'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useProgression } from '@/hooks/useProgression';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy,
  Wallet,
  ShieldCheck, 
  TrendingUp, 
  Calculator, 
  Calendar, 
  Zap, 
  Star, 
  Lock,
  Coins,
  ArrowUpRight,
  PartyPopper,
  Crown,
  Landmark,
  Briefcase,
  User,
  PiggyBank,
  Wrench,
  Target,
  Heart,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import { fireConfettiBadgeUnlock } from '@/lib/confetti';
import { getRankForXP, getNextRank, getRankProgress } from '@/config/narrative';

// Lucide icon mapped to each narrative rank (Apprentice → Legend)
const RANK_ICONS: Record<string, React.ElementType> = {
  apprentice: User,
  scout:      PiggyBank,
  agent:      Briefcase,
  inspector:  TrendingUp,
  detective:  Landmark,
  grandmaster: Crown,
  legend:     Trophy,
};

// NOTE (2026-09): this used to also list 9 badges with hyphenated ids
// ('first-win', 'streak-5', 'budget-master', 'debt-slayer', 'stock-picker',
// 'tax-whiz', 'daily-challenger', 'speed-demon', 'perfect-round') that
// nothing in the codebase ever awards — no awardBadge() call anywhere uses
// those ids, only the underscore ids below (which come from BADGES in
// badgeService.ts). Those 9 were permanently-locked dead tiles by
// construction, not a bug a user could ever fix by playing more. Removed
// until real trigger conditions are designed and built for them.
// Also: 'budget-master' (hyphen, fake) and 'budget_master' (underscore,
// real — the actual earnable one) were BOTH present with different titles
// ("Budget Master" on the fake one, "Strategic Saver" on the real one) —
// consolidated onto the real id with the clearer title.
const BADGE_MAP = [
  { id: 'emergency_fund_builder', title: 'Safety First', icon: ShieldCheck, color: 'text-primary' },
  { id: 'debt_destroyer', title: 'Debt Destroyer', icon: Zap, color: 'text-rose-500' },
  { id: 'smart_investor', title: 'Smart Investor', icon: TrendingUp, color: 'text-blue-500' },
  { id: 'scam_spotter', title: 'Scam Spotter', icon: AlertTriangle, color: 'text-[#2E7D5A]' },
  { id: 'budget_master', title: 'Budget Master', icon: Wallet, color: 'text-primary' },
  { id: 'tool_explorer', title: 'Tool Explorer', icon: Wrench, color: 'text-slate-600' },
  { id: 'goal_getter', title: 'Goal Getter', icon: Target, color: 'text-primary' },
  { id: 'financially_stable', title: 'Financially Stable', icon: Heart, color: 'text-rose-400' },
  { id: 'money_master', title: 'Money Master', icon: Trophy, color: 'text-[#2E7D5A]' },
  { id: 'scholar', title: 'Finance Scholar', icon: Star, color: 'text-primary' },
  { id: 'framework_master', title: 'Framework Master', icon: Calculator, color: 'text-rose-500' },
];

export function XPWallet() {
  const { data, isLoading } = useProgression();
  const { formatValue, activeCurrency } = useCurrency();
  const [unlockedBadge, setUnlockedBadge] = useState<(typeof BADGE_MAP)[0] | null>(null);
  const [prevBadges, setPrevBadges] = useState<string[]>([]);

  useEffect(() => {
    if (data.badges.length > prevBadges.length) {
      const newlyAdded = data.badges.find(b => !prevBadges.includes(b));
      const badgeInfo = BADGE_MAP.find(b => b.id === newlyAdded);
      if (badgeInfo) {
        setUnlockedBadge(badgeInfo);
        fireConfettiBadgeUnlock();
      }
    }
    setPrevBadges(data.badges);
  }, [data.badges, prevBadges]);

  const levelInfo = useMemo(() => {
    const totalXP = data.totalXP;
    const current = getRankForXP(totalXP);
    const next = getNextRank(totalXP);
    const progress = getRankProgress(totalXP) * 100;
    const RankIcon = RANK_ICONS[current.id] ?? User;
    const xpToNext = next ? next.minXP - totalXP : 0;
    return { current, next, progress, RankIcon, xpToNext };
  }, [data.totalXP]);

  const walletMilestone = useMemo(() => {
    if (data.walletBalance >= 1000) return "That's a major milestone for your piggy bank!";
    if (data.walletBalance >= 500) return "You've got a solid safety net forming!";
    if (data.walletBalance >= 100) return "You're building real momentum!";
    return "Starting your journey to mastery!";
  }, [data.walletBalance]);

  if (isLoading) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* XP & Level Section */}
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <div className="bg-primary p-6 text-white">
          <div className="flex justify-between items-end mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <levelInfo.RankIcon className="h-7 w-7" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Order of the Golden Ledger</div>
                <div className="text-2xl font-black">{levelInfo.current.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black">{data.totalXP.toLocaleString()}</div>
              <div className="text-[10px] font-bold uppercase text-white/60">Total XP</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase">
              <span>{levelInfo.current.name}</span>
              <span>{levelInfo.next ? `${levelInfo.xpToNext.toLocaleString()} XP to ${levelInfo.next.name}` : 'MAX RANK'}</span>
            </div>
            <Progress value={levelInfo.progress} className="h-2 bg-white/20" />
          </div>
        </div>
      </Card>

      {/* Virtual Wallet Section */}
      <Card className="border-none shadow-lg bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Coins className="h-5 w-5" />
              </div>
              <span className="font-black text-slate-900 tracking-tight text-lg">XP Game Wallet</span>
            </div>
            <div className="text-2xl font-black text-accent">{formatValue(data.walletBalance)} saved</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-start gap-3">
            <ArrowUpRight className="h-5 w-5 text-accent mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-slate-600 leading-tight">
              <strong>Milestone:</strong> {walletMilestone}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Badges Grid */}
      <Card className="border-none shadow-lg bg-white overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b">
          <div className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
            <Trophy className="h-3 w-3" /> Achievements
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {BADGE_MAP.map(badge => {
              const isEarned = data.badges.includes(badge.id);
              return (
                <div key={badge.id} className="flex flex-col items-center gap-2 group">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                    isEarned 
                      ? `bg-white border-slate-100 shadow-md ${badge.color}` 
                      : "bg-slate-50 border-dashed border-slate-200 text-slate-300"
                  )}>
                    {isEarned ? <badge.icon className="h-7 w-7" /> : <Lock className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-tight text-center leading-none",
                    isEarned ? "text-slate-900" : "text-slate-400"
                  )}>
                    {badge.title}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* New Badge Overlay */}
      {unlockedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <Card className="max-w-sm w-full border-none shadow-2xl bg-white text-center overflow-hidden">
            <div className="bg-primary p-12 text-white relative">
              <PartyPopper className="h-20 w-20 mx-auto mb-6 animate-bounce" />
              <div className="absolute inset-0 opacity-10 flex items-center justify-center overflow-hidden pointer-events-none">
                <unlockedBadge.icon className="h-64 w-64 rotate-12" />
              </div>
              <h2 className="text-4xl font-black tracking-tight">NEW BADGE!</h2>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <div className={cn("h-24 w-24 rounded-3xl mx-auto flex items-center justify-center border-4 border-slate-50 shadow-xl bg-white mb-4", unlockedBadge.color)}>
                  <unlockedBadge.icon className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">{unlockedBadge.title}</h3>
                <p className="text-slate-500 font-medium italic">"You're mastering your financial destiny!"</p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 h-14 text-lg font-black" onClick={() => setUnlockedBadge(null)}>Continue</Button>
                <Button variant="outline" className="h-14 gap-2 font-bold px-6">Share</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
