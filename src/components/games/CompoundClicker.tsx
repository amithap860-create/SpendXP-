'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { COMPOUND_VEHICLES, Vehicle, VehicleId } from '@/data/compoundVehicles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { XPWallet } from '@/components/XPWallet';
import { Coins, TrendingUp, Zap, Trophy, PartyPopper, CheckCircle2, Building2, BarChart3, Wallet, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CompoundClicker({ onExit }: { onExit: () => void }) {
  const { ageGroup, difficultyConfig } = useAgeAdapt();
  const { formatValue, completeTask } = useUser();
  const gameConfig = { gameName: 'compoundClicker' as const, totalRounds: 1, livesEnabled: false, xpPerWin: 250, xpPerCorrectAnswer: 0 };
  const { endGame } = useGameEngine(gameConfig);

  const [balance, setBalance] = useState(10);
  const [unlockedIds, setUnlockedIds] = useState<VehicleId[]>(['piggy']);
  const [activeVehicleId, setActiveVehicleId] = useState<VehicleId>('piggy');
  const [isCompleted, setIsCompleted] = useState(false);

  const activeVehicle = COMPOUND_VEHICLES.find(v => v.id === activeVehicleId)!;

  const handleClick = () => {
    const baseAmount = ageGroup === 'junior' ? 1 : ageGroup === 'teen' ? 1 : 5;
    setBalance(prev => prev + baseAmount * activeVehicle.clickMultiplier);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const totalRate = unlockedIds.reduce((acc, id) => acc + COMPOUND_VEHICLES.find(v => v.id === id)!.annualReturnRate, 0);
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
        <Card className="border-none shadow-2xl bg-white overflow-hidden text-center"><div className="bg-emerald-500 p-12 text-white"><PartyPopper className="h-20 w-20 mx-auto mb-6" /><CardTitle className="text-5xl font-black">10,000 SAVED!</CardTitle></div><CardContent className="p-10"><Button onClick={onExit} className="w-full h-16 text-xl font-black">Return to Hub</Button></CardContent></Card>
      </div>
      <div className="lg:col-span-5"><XPWallet /></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7">
        <Card className={cn("p-12 text-center text-white h-[500px] flex flex-col items-center justify-center", activeVehicle.colour)}>
          <div className="text-6xl font-black mb-8">${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <button onClick={handleClick} className="h-48 w-48 rounded-full bg-white shadow-2xl flex items-center justify-center active:scale-95 transition-transform"><Coins className={cn("h-24 w-24", activeVehicle.colour.replace('bg-', 'text-'))} /></button>
        </Card>
      </div>
      <div className="lg:col-span-5 space-y-6">
        <XPWallet />
        <Card className="p-4 space-y-3 overflow-auto max-h-[300px]">
          {COMPOUND_VEHICLES.map(v => (
            <div key={v.id} onClick={() => balance >= v.unlockCost && (setBalance(b => b - (unlockedIds.includes(v.id) ? 0 : v.unlockCost)), setUnlockedIds(ids => Array.from(new Set([...ids, v.id]))), setActiveVehicleId(v.id))} className={cn("p-4 rounded-xl border-2 cursor-pointer flex items-center gap-4", activeVehicleId === v.id ? "border-primary bg-primary/5" : "border-slate-100")}>
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-white", unlockedIds.includes(v.id) ? v.colour : "bg-slate-300")}>{unlockedIds.includes(v.id) ? <TrendingUp className="h-5 w-5" /> : <Lock className="h-5 w-5" />}</div>
              <div className="flex-1"><div className="font-black text-slate-900">{v.name}</div><div className="text-[10px] uppercase font-bold text-slate-500">{unlockedIds.includes(v.id) ? `${v.annualReturnRate*100}% APR` : `Costs $${v.unlockCost}`}</div></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
