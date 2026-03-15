'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { COMPOUND_VEHICLES, Vehicle, VehicleId } from '@/data/compoundVehicles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/lib/store';
import { 
  Coins, 
  TrendingUp, 
  FastForward, 
  History, 
  Lock, 
  Zap, 
  Trophy, 
  Info, 
  CheckCircle2, 
  ArrowUpRight,
  MousePointer2,
  Wallet,
  Building2,
  BarChart3,
  PartyPopper
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'spendxp_compound_clicker_state';

interface FloatingText {
  id: number;
  val: string;
  x: number;
  y: number;
}

export function CompoundClicker({ onExit }: { onExit: () => void }) {
  const { ageGroup, difficultyConfig } = useAgeAdapt();
  const { formatValue, completeTask, user } = useUser();
  
  const gameConfig = {
    gameName: 'compoundClicker' as const,
    totalRounds: 1,
    livesEnabled: false,
    xpPerWin: 250,
    xpPerCorrectAnswer: 0
  };

  const { endGame } = useGameEngine(gameConfig);

  // --- STATE ---
  const [balance, setBalance] = useState(10);
  const [unlockedIds, setUnlockedIds] = useState<VehicleId[]>(['piggy']);
  const [activeVehicleId, setActiveVehicleId] = useState<VehicleId>('piggy');
  const [milestones, setMilestones] = useState<number[]>([]);
  const [shownTooltips, setShownTooltips] = useState<VehicleId[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isLapseOpen, setIsLapseOpen] = useState(false);
  const [isWaitOpen, setIsWaitOpen] = useState(false);
  const [lapseYears, setLapseYears] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  // Click Streak State
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);
  const [streakActive, setStreakActive] = useState(false);

  const activeVehicle = COMPOUND_VEHICLES.find(v => v.id === activeVehicleId)!;
  const nextVehicle = COMPOUND_VEHICLES.find(v => !unlockedIds.includes(v.id));

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setBalance(data.balance || 10);
        setUnlockedIds(data.unlockedIds || ['piggy']);
        setActiveVehicleId(data.activeVehicleId || 'piggy');
        setMilestones(data.milestones || []);
        setShownTooltips(data.shownTooltips || []);
      } catch (e) {
        console.error("Failed to load game state", e);
      }
    }
  }, []);

  useEffect(() => {
    const state = { balance, unlockedIds, activeVehicleId, milestones, shownTooltips };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [balance, unlockedIds, activeVehicleId, milestones, shownTooltips]);

  // --- GAME LOGIC ---
  const handleClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const baseAmount = ageGroup === 'junior' ? 1 : ageGroup === 'teen' ? 1 : 5;
    const multiplier = activeVehicle.clickMultiplier * (streakActive ? 2 : 1);
    const added = baseAmount * multiplier;

    setBalance(prev => prev + added);
    
    // Floating text
    const newText = { id: now, val: `+$${added.toFixed(2)}`, x: e.clientX, y: e.clientY };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 1000);

    // Streak logic
    const newTimestamps = [...clickTimestamps, now].slice(-5);
    setClickTimestamps(newTimestamps);
    if (newTimestamps.length === 5 && now - newTimestamps[0] <= 2000) {
      setStreakActive(true);
      setTimeout(() => setStreakActive(false), 3000); // 3 seconds of streak
    }
  };

  // Passive Income Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setBalance(prev => {
        const totalRate = unlockedIds.reduce((acc, id) => {
          const v = COMPOUND_VEHICLES.find(veh => veh.id === id)!;
          return acc + v.annualReturnRate;
        }, 0);
        
        if (totalRate === 0) return prev;
        return prev + (prev * (totalRate / 182.5));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [unlockedIds]);

  // Milestone Checks
  useEffect(() => {
    const targets = [
      { val: 100, xp: 30, msg: "Emergency fund start!" },
      { val: 500, xp: 50, msg: "A month of groceries saved!" },
      { val: 1000, xp: 75, msg: "Building real wealth!" },
      { val: 5000, xp: 100, msg: "A house deposit someday!" },
      { val: 10000, xp: 150, msg: "Master of compounding!" }
    ];

    targets.forEach(t => {
      if (balance >= t.val && !milestones.includes(t.val)) {
        setMilestones(prev => [...prev, t.val]);
        if (t.val === 10000 && !isCompleted) {
          handleCompletion();
        }
      }
    });
  }, [balance, milestones]);

  const handleCompletion = async () => {
    setIsCompleted(true);
    await endGame(500); 
    completeTask('game-advisor');
  };

  const handleUnlock = (v: Vehicle) => {
    if (balance >= v.unlockCost && !unlockedIds.includes(v.id)) {
      setBalance(prev => prev - v.unlockCost);
      setUnlockedIds(prev => [...prev, v.id]);
      setActiveVehicleId(v.id);
    } else if (unlockedIds.includes(v.id)) {
      setActiveVehicleId(v.id);
    }
  };

  const calculateProjection = (start: number, rate: number, years: number) => {
    return start * Math.pow(1 + rate, years);
  };

  const chartData = useMemo(() => {
    const years = ageGroup === 'junior' ? 10 : ageGroup === 'teen' ? 30 : 40;
    return Array.from({ length: years + 1 }, (_, i) => {
      const activeProj = calculateProjection(balance, activeVehicle.annualReturnRate, i);
      const piggyProj = calculateProjection(balance, 0, i);
      return { year: i, active: activeProj, piggy: piggyProj };
    });
  }, [balance, activeVehicle, ageGroup]);

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white overflow-hidden animate-in zoom-in duration-500">
        <div className="bg-emerald-500 p-12 text-white text-center">
          <PartyPopper className="h-20 w-20 mx-auto mb-6 animate-bounce" />
          <CardTitle className="text-5xl font-black mb-2">10,000 SAVED!</CardTitle>
          <p className="text-emerald-100 text-xl font-medium">You have mastered the art of compounding.</p>
        </div>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border text-center">
              <div className="text-3xl font-black text-primary">${balance.toFixed(0)}</div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Final Balance</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border text-center">
              <div className="text-3xl font-black text-accent">{unlockedIds.length}/6</div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Vehicles Unlocked</div>
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-primary/5 border-2 border-primary/10 relative overflow-hidden">
             <div className="relative z-10">
                <h4 className="font-black text-primary text-xl mb-2">Your Wealth Certificate</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  By starting your journey at age {difficultyConfig.moneyAmounts.small === 5 ? '8-12' : difficultyConfig.moneyAmounts.small === 50 ? '13-16' : '17-20'}, 
                  you've secured your future. Remember: Time is your greatest asset.
                </p>
             </div>
             <Trophy className="absolute -right-4 -bottom-4 h-32 w-32 text-primary/10 rotate-12" />
          </div>
          <Button onClick={onExit} className="w-full h-16 text-xl font-black">Return to Hub</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 relative">
      {floatingTexts.map(t => (
        <div 
          key={t.id} 
          className="fixed pointer-events-none z-[100] font-black text-primary animate-out fade-out slide-out-to-top-20 duration-1000"
          style={{ left: t.x, top: t.y }}
        >
          {t.val}
        </div>
      ))}

      <div className="lg:col-span-7 space-y-6">
        <Card className="border-none shadow-xl bg-white overflow-hidden flex flex-col h-[600px]">
          <div className={cn("p-8 text-white transition-colors duration-500", activeVehicle.colour)}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[10px] font-black uppercase text-white/60 tracking-widest">Net Worth</div>
                <div className="text-6xl font-black tracking-tight">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <Badge className="bg-white/20 text-white border-none px-4 py-1">
                {activeVehicle.name} Active
              </Badge>
            </div>
            {activeVehicle.annualReturnRate > 0 && (
              <div className="flex items-center gap-2 animate-pulse">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-bold">Compounding at {(activeVehicle.annualReturnRate * 100).toFixed(0)}% annually</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 relative">
            <button 
              onClick={handleClick}
              className={cn(
                "h-64 w-64 rounded-full bg-white shadow-2xl border-8 border-white flex flex-col items-center justify-center transition-all active:scale-90 hover:scale-105 group",
                streakActive ? "ring-8 ring-accent animate-pulse" : "ring-1 ring-slate-200"
              )}
            >
              <div className={cn("h-48 w-48 rounded-full flex items-center justify-center text-white mb-2 shadow-inner", activeVehicle.colour)}>
                <Coins className="h-24 w-24 group-hover:rotate-12 transition-transform" />
              </div>
              <div className="font-black text-slate-400 text-xs uppercase tracking-widest">Tap to Save</div>
            </button>

            {streakActive && (
              <div className="mt-8 bg-accent text-white px-6 py-2 rounded-full font-black text-lg animate-bounce shadow-xl">
                SAVING STREAK! 2X CLICKS
              </div>
            )}

            <div className="absolute bottom-8 flex gap-4">
              <Button onClick={() => setIsLapseOpen(true)} className="gap-2 bg-slate-900 rounded-xl h-12 shadow-lg">
                <FastForward className="h-4 w-4" /> Fast Forward
              </Button>
              <Button variant="outline" onClick={() => setIsWaitOpen(true)} className="gap-2 border-2 rounded-xl h-12">
                <History className="h-4 w-4" /> "What if I waited?"
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <Card className="border-none shadow-xl bg-white h-full flex flex-col">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Wealth Vehicles
            </CardTitle>
            <CardDescription>Unlock better ways to grow your money.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 overflow-auto max-h-[500px]">
            {COMPOUND_VEHICLES.map(v => {
              const isUnlocked = unlockedIds.includes(v.id);
              const isActive = activeVehicleId === v.id;
              const canAfford = balance >= v.unlockCost;

              return (
                <div 
                  key={v.id}
                  onClick={() => handleUnlock(v)}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 relative overflow-hidden",
                    isActive ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-100 hover:border-slate-300",
                    !isUnlocked && !canAfford && "opacity-60 bg-slate-50 grayscale",
                    !isUnlocked && canAfford && "border-accent bg-accent/5 animate-pulse"
                  )}
                >
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm", isUnlocked ? v.colour : "bg-slate-300")}>
                    {isUnlocked ? (
                      v.id === 'piggy' ? <Wallet className="h-6 w-6" /> :
                      v.id === 'savings' ? <CheckCircle2 className="h-6 w-6" /> :
                      v.id === 'deposit' ? <Lock className="h-6 w-6" /> :
                      v.id === 'index' ? <BarChart3 className="h-6 w-6" /> :
                      v.id === 'stocks' ? <TrendingUp className="h-6 w-6" /> :
                      <Building2 className="h-6 w-6" />
                    ) : <Lock className="h-6 w-6" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-black text-slate-900 leading-tight">{v.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      {isUnlocked ? `${(v.annualReturnRate * 100)}% ROI • ${v.clickMultiplier}x Multiplier` : `Costs $${v.unlockCost}`}
                    </div>
                  </div>

                  {isActive && <div className="h-2 w-2 rounded-full bg-primary animate-ping" />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {isLapseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <Card className="max-w-3xl w-full border-none shadow-2xl animate-in fade-in slide-in-from-bottom-8">
            <CardHeader className="bg-primary text-white">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-black">Future Projection</CardTitle>
                <Button variant="ghost" onClick={() => setIsLapseOpen(false)} className="text-white">Close</Button>
              </div>
              <CardDescription className="text-white/70">See what happens if you just let it sit...</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between font-black text-primary uppercase tracking-widest">
                  <span>Projection: {lapseYears} Years</span>
                  <span className="text-3xl">${calculateProjection(balance, activeVehicle.annualReturnRate, lapseYears).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <Slider 
                  value={[lapseYears]} 
                  max={ageGroup === 'junior' ? 10 : ageGroup === 'teen' ? 30 : 40} 
                  min={1} 
                  step={1} 
                  onValueChange={([val]) => setLapseYears(val)} 
                />
              </div>

              <div className="h-48 w-full bg-slate-50 rounded-2xl p-4 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <path 
                    d={`M 0,100 L 100,100`} 
                    fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4"
                  />
                  <path 
                    d={`M ${chartData.map((d, i) => {
                      const x = (i / (chartData.length - 1)) * 100;
                      const maxVal = Math.max(...chartData.map(cd => cd.active));
                      const y = 100 - (d.active / maxVal) * 90;
                      return `${x},${y}`;
                    }).join(' L ')}`}
                    fill="none" stroke="#2E72DB" strokeWidth="4" strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute bottom-2 left-4 text-[10px] font-bold text-slate-400">Year 0</div>
                <div className="absolute bottom-2 right-4 text-[10px] font-bold text-slate-400">Year {ageGroup === 'senior' ? 40 : 30}</div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-200 flex items-center justify-center shrink-0">
                    <Info className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h5 className="font-bold text-blue-900">Compound Wisdom</h5>
                    <p className="text-sm text-blue-800 leading-relaxed italic">
                      "Compounding is the 8th wonder of the world. He who understands it, earns it... he who doesn't, pays it." — Albert Einstein
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isWaitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <Card className="max-w-2xl w-full border-none shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-black">The Cost of Waiting</CardTitle>
              <CardDescription>What if you delayed starting by 10 years?</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center space-y-2">
                  <div className="text-[10px] font-black uppercase text-slate-400">Start Today</div>
                  <div className="text-4xl font-black text-emerald-600">${calculateProjection(balance, 0.07, 45).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div className="text-xs font-bold text-slate-500">Projected at age 65</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-[10px] font-black uppercase text-slate-400">Start in 10 Yrs</div>
                  <div className="text-4xl font-black text-slate-400">${calculateProjection(balance, 0.07, 35).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div className="text-xs font-bold text-slate-500">Projected at age 65</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm font-bold uppercase text-rose-500 mb-1">Waiting cost you</div>
                <div className="text-6xl font-black text-rose-600">
                  ${(calculateProjection(balance, 0.07, 45) - calculateProjection(balance, 0.07, 35)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <Button onClick={() => setIsWaitOpen(false)} className="w-full h-14">I'll Start Saving Now!</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
