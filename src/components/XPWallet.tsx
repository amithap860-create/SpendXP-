'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useProgression } from '@/hooks/useProgression';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Flame, 
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
  PiggyBank
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LEVELS = [
  { level: 1, title: 'Starter', minXP: 0, icon: User },
  { level: 2, title: 'Saver', minXP: 500, icon: PiggyBank },
  { level: 3, title: 'Investor', minXP: 1500, icon: TrendingUp },
  { level: 4, title: 'Banker', minXP: 3500, icon: Landmark },
  { level: 5, title: 'Finance Pro', minXP: 7500, icon: Briefcase },
  { level: 6, title: 'Money Master', minXP: 15000, icon: Crown },
];

const BADGE_MAP = [
  { id: 'first-win', title: 'First Win', icon: Trophy, color: 'text-amber-500' },
  { id: 'streak-5', title: '5-Game Streak', icon: Flame, color: 'text-orange-500' },
  { id: 'budget-master', title: 'Budget Master', icon: Wallet, color: 'text-emerald-500' },
  { id: 'debt-slayer', title: 'Debt Slayer', icon: ShieldCheck, color: 'text-blue-500' },
  { id: 'stock-picker', title: 'Stock Picker', icon: TrendingUp, color: 'text-indigo-500' },
  { id: 'tax-whiz', title: 'Tax Whiz', icon: Calculator, color: 'text-rose-500' },
  { id: 'daily-challenger', title: 'Daily Challenger', icon: Calendar, color: 'text-purple-500' },
  { id: 'speed-demon', title: 'Speed Demon', icon: Zap, color: 'text-yellow-500' },
  { id: 'perfect-round', title: 'Perfect Round', icon: Star, color: 'text-cyan-500' },
];

export function XPWallet() {
  const { data, isLoading } = useProgression();
  const [unlockedBadge, setUnlockedBadge] = useState<(typeof BADGE_MAP)[0] | null>(null);
  const [prevBadges, setPrevBadges] = useState<string[]>([]);

  // Watch for new badges
  useEffect(() => {
    if (data.badges.length > prevBadges.length) {
      const newlyAdded = data.badges.find(b => !prevBadges.includes(b));
      const badgeInfo = BADGE_MAP.find(b => b.id === newlyAdded);
      if (badgeInfo) setUnlockedBadge(badgeInfo);
    }
    setPrevBadges(data.badges);
  }, [data.badges, prevBadges]);

  const levelInfo = useMemo(() => {
    const current = [...LEVELS].reverse().find(l => data.totalXP >= l.minXP) || LEVELS[0];
    const nextIdx = LEVELS.indexOf(current) + 1;
    const next = LEVELS[nextIdx] || null;
    
    const progressInLevel = next ? ((data.totalXP - current.minXP) / (next.minXP - current.minXP)) * 100 : 100;
    
    return { current, next, progress: progressInLevel };
  }, [data.totalXP]);

  const walletMilestone = useMemo(() => {
    if (data.walletBalance >= 1000) return "That's a month's rent for many people!";
    if (data.walletBalance >= 500) return "You've got an emergency fund!";
    if (data.walletBalance >= 100) return "You could buy groceries for a week!";
    return "Starting your journey to $1,000!";
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
                <levelInfo.current.icon className="h-7 w-7" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Rank {levelInfo.current.level}</div>
                <div className="text-2xl font-black">{levelInfo.current.title}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black">{data.totalXP}</div>
              <div className="text-[10px] font-bold uppercase text-white/60">Total XP</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase">
              <span>{levelInfo.current.title}</span>
              <span>{levelInfo.next ? `${levelInfo.next.minXP - data.totalXP} XP to ${levelInfo.next.title}` : 'MAX LEVEL'}</span>
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
            <div className="text-2xl font-black text-accent">${data.walletBalance.toLocaleString()} saved</div>
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
            <div className="bg-emerald-500 p-12 text-white relative">
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
