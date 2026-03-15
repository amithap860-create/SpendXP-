'use client';

import React, { useState, useEffect } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { COMPOUND_VEHICLES, VehicleId } from '@/data/compoundVehicles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XPWallet } from '@/components/XPWallet';
import { Coins, TrendingUp, PartyPopper, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/store';

export function CompoundClicker({ onExit }: { onExit: () => void }) {
  const { ageGroup } = useAgeAdapt();
  const { completeTask } = useUser();
  const gameConfig = { gameName: 'compoundClicker' as const, totalRounds: 1, livesEnabled: false, xpPerWin: 250, xpPerCorrectAnswer: 0 };
  const { endGame } = useGameEngine(gameConfig);

  const [balance, setBalance] = useState<number>(() => {
    if (typeof window === 'undefined') return 10;
    try {
      const saved = localStorage.getItem('spendxp_clicker');
      return saved ? JSON.parse(saved).balance ?? 10 : 10;
    } catch { return 10; }
  });

  const [unlockedIds, setUnlockedIds] = useState<VehicleId[]>(() => {
    if (typeof window === 'undefined') return ['piggy'];
    try {
      const saved = localStorage.getItem('spendxp_clicker');
      return saved ? JSON.parse(saved).unlockedIds ?? ['piggy'] : ['piggy'];
    } catch { return ['piggy']; }
  });

  const [activeVehicleId, setActiveVehicleId] = useState<VehicleId>(() => {
    if (typeof window === 'undefined') return 'piggy';
    try {
      const saved = localStorage.getItem('spendxp_clicker');
      return saved ? JSON.parse(saved).activeVehicleId ?? 'piggy' : 'piggy';
    } catch { return 'piggy'; }
  });

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    localStorage.setItem('spendxp_clicker', JSON.stringify({ balance, unlockedIds, activeVehicleId }));
  }, [balance, unlockedIds, activeVehicleId]);

  const activeVehicle = COMPOUND_VEHICLES.find(v => v.id === activeVehicleId)!;

  const handleClick = () => {
    const baseAmount = ageGroup === 'junior' ? 1 : ageGroup === 'teen' ? 1 : 5;
    setBalance(prev => prev + baseAmount * activeVehicle.clickMultiplier);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const totalRate = unlockedIds.reduce((acc, id) => acc + (COMPOUND_VEHICLES.find(v => v.id === id)?.annualReturnRate ?? 0), 0);
      if (totalRate > 0) setBalance(prev => prev + (prev * (totalRate / 182.5)));
    }, 2000);
    return () => clearInterval(interval);
  }, [unlockedIds]);

  useEffect(() => {
    if (balance >= 10000 && !isCompleted) {
      setIsCompleted(true);
      endGame(500);
      completeTask('game-advisor');
    }
  }, [balance, isCompleted, endGame, completeTask]);

  if (isCompleted) return (
    <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-7">
        <Card className="border-none shadow-2xl bg-white overflow-hidden text-center"><div className="bg-emerald-500 p-8 md:p-12 text-white"><PartyPopper className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6" /><CardTitle className="text-4xl md:text-5xl font-black">10,000 SAVED!</CardTitle></div><CardContent className="p-8 md:p-10"><Button onClick={onExit} className="w-full h-14 md:h-16 text-lg md:text-xl font-black min-h-[44px]">Return to Hub</Button></CardContent></Card>
      </div>
      <div className="lg:col-span-5"><XPWallet /></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-6 md:gap-8">
      <div className="lg:col-span-7">
        <Card className={cn("p-8 md:p-12 text-center text-white min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center transition-colors duration-500 rounded-3xl", activeVehicle.colour)}>
          <div className="text-4xl md:text-6xl font-black mb-8 tracking-tight">${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <button 
            onClick={handleClick} 
            className="h-32 w-32 md:h-48 md:w-48 rounded-full bg-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer min-h-[80px] min-w-[80px] hover:scale-105"
          >
            <Coins className={cn("h-16 w-16 md:h-24 md:w-24", activeVehicle.colour.replace('bg-', 'text-'))} />
          </button>
          <p className="mt-8 text-xs font-black uppercase tracking-widest opacity-60">Tap to contribute manually</p>
        </Card>
      </div>
      <div className="lg:col-span-5 space-y-6">
        <XPWallet />
        <Card className="p-4 space-y-3 overflow-y-auto max-h-[350px] rounded-3xl border-none shadow-md">
          <div className="px-2 py-1 text-[9px] font-black uppercase text-slate-400 tracking-widest">Growth Vehicles</div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
            {COMPOUND_VEHICLES.map(v => (
              <div 
                key={v.id} 
                onClick={() => balance >= v.unlockCost && (setBalance(b => b - (unlockedIds.includes(v.id) ? 0 : v.unlockCost)), setUnlockedIds(ids => Array.from(new Set([...ids, v.id]))), setActiveVehicleId(v.id))} 
                className={cn(
                  "p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all min-h-[44px]", 
                  activeVehicleId === v.id ? "border-primary bg-primary/5 shadow-inner" : "border-slate-50 hover:border-slate-200"
                )}
              >
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0", unlockedIds.includes(v.id) ? v.colour : "bg-slate-300")}>
                  {unlockedIds.includes(v.id) ? <TrendingUp className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-slate-900 text-sm truncate">{v.name}</div>
                  <div className="text-[9px] uppercase font-bold text-slate-500">
                    {unlockedIds.includes(v.id) ? `${(v.annualReturnRate*100).toFixed(0)}% APR` : `Costs $${v.unlockCost}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}