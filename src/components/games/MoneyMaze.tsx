'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Puzzle, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldAlert, 
  HandCoins, 
  Landmark, 
  Building2, 
  Wallet,
  ArrowDownUp,
  Calculator,
  Trophy,
  RefreshCcw,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type GameMode = 'DEBT' | 'PORTFOLIO';

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

interface Allocation {
  cash: number;
  bonds: number;
  stocks: number;
  property: number;
}

export function MoneyMaze({ onExit }: { onExit: () => void }) {
  const { ageGroup, difficultyConfig } = useAgeAdapt();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  
  // Engine Setup
  const gameConfig = useMemo(() => ({
    gameName: 'moneyMaze' as const,
    totalRounds: 1,
    livesEnabled: false,
    xpPerWin: 250,
    xpPerCorrectAnswer: 50,
  }), []);

  const {
    gameState,
    score,
    xpEarned,
    startGame,
    endGame
  } = useGameEngine(gameConfig);

  // --- MODE 1: DEBT DOMINO STATE ---
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [debtResult, setDebtResult] = useState<{ method: 'AVALANCHE' | 'SNOWBALL' | 'NONE', saved: number } | null>(null);

  // --- MODE 2: PORTFOLIO BUILDER STATE ---
  const [allocation, setAllocation] = useState<Allocation>({ cash: 40, bonds: 30, stocks: 20, property: 10 });
  const [portfolioScore, setPortfolioScore] = useState<number | null>(null);

  // Initialize Debts based on age
  useEffect(() => {
    if (selectedMode === 'DEBT') {
      const initialDebts: DebtItem[] = ageGroup === 'junior' 
        ? [
            { id: '1', name: 'App Store Credits', balance: 15, rate: 0, minPayment: 5 },
            { id: '2', name: 'Subscription', balance: 10, rate: 0, minPayment: 10 },
            { id: '3', name: 'Borrowed from Friend', balance: 5, rate: 0, minPayment: 1 },
          ]
        : [
            { id: '1', name: 'Credit Card', balance: 1200, rate: 22, minPayment: 40 },
            { id: '2', name: 'Student Loan', balance: 15000, rate: 5.5, minPayment: 150 },
            { id: '3', name: 'Car Loan', balance: 8000, rate: 8, minPayment: 200 },
            { id: '4', name: 'Medical Bill', balance: 450, rate: 0, minPayment: 50 },
          ];
      setDebts(initialDebts.sort(() => Math.random() - 0.5));
    }
  }, [selectedMode, ageGroup]);

  // --- DEBT LOGIC ---
  const handleMove = (fromIdx: number, toIdx: number) => {
    const newDebts = [...debts];
    const [moved] = newDebts.splice(fromIdx, 1);
    newDebts.splice(toIdx, 0, moved);
    setDebts(newDebts);
  };

  const checkDebtStrategy = async () => {
    const isAvalanche = debts.every((d, i) => i === 0 || d.rate <= debts[i-1].rate);
    const isSnowball = debts.every((d, i) => i === 0 || d.balance >= debts[i-1].balance);
    
    let method: 'AVALANCHE' | 'SNOWBALL' | 'NONE' = 'NONE';
    let saved = 0;

    if (isAvalanche) {
      method = 'AVALANCHE';
      saved = ageGroup === 'junior' ? 5 : 1200; // Simplified interest savings
    } else if (isSnowball) {
      method = 'SNOWBALL';
      saved = ageGroup === 'junior' ? 2 : 450;
    }

    setDebtResult({ method, saved });
    await endGame();
  };

  // --- PORTFOLIO LOGIC ---
  const updateAllocation = (key: keyof Allocation, value: number) => {
    const others = (Object.keys(allocation) as (keyof Allocation)[]).filter(k => k !== key);
    const currentSumOfOthers = others.reduce((acc, k) => acc + allocation[k], 0);
    
    if (currentSumOfOthers === 0) {
      setAllocation(prev => ({ ...prev, [key]: value }));
      return;
    }

    // Distribute the change proportionally to others
    const diff = 100 - (value + currentSumOfOthers);
    const newAllocation = { ...allocation, [key]: value };
    
    others.forEach(k => {
      const share = allocation[k] / currentSumOfOthers;
      newAllocation[k] = Math.max(0, Math.round(allocation[k] + diff * share));
    });

    // Final normalization to ensure exact 100
    const finalSum = Object.values(newAllocation).reduce((a, b) => a + b, 0);
    if (finalSum !== 100) {
      newAllocation[others[0]] += (100 - finalSum);
    }

    setAllocation(newAllocation);
  };

  const projectedData = useMemo(() => {
    const rates = { cash: 0.02, bonds: 0.04, stocks: 0.08, property: 0.06 };
    const principal = ageGroup === 'junior' ? 100 : 1000;
    const years = 10;
    const combinedRate = (
      (allocation.cash * rates.cash) + 
      (allocation.bonds * rates.bonds) + 
      (allocation.stocks * rates.stocks) + 
      (allocation.property * rates.property)
    ) / 100;

    return Array.from({ length: years + 1 }, (_, i) => ({
      year: i,
      value: principal * Math.pow(1 + combinedRate, i)
    }));
  }, [allocation, ageGroup]);

  const riskLevel = useMemo(() => {
    const score = (allocation.stocks * 1.0) + (allocation.property * 0.6) + (allocation.bonds * 0.3);
    if (score < 25) return { label: 'Conservative', color: 'bg-emerald-500' };
    if (score < 50) return { label: 'Moderate', color: 'bg-amber-500' };
    return { label: 'Aggressive', color: 'bg-rose-500' };
  }, [allocation]);

  const checkPortfolio = async () => {
    const targets = {
      junior: { cash: 60, bonds: 20, stocks: 20, property: 0 },
      teen: { cash: 30, bonds: 30, stocks: 35, property: 5 },
      senior: { cash: 10, bonds: 20, stocks: 50, property: 20 }
    }[ageGroup];

    let totalDiff = 0;
    (Object.keys(targets) as (keyof Allocation)[]).forEach(k => {
      totalDiff += Math.abs(allocation[k] - targets[k]);
    });

    const finalScore = Math.max(0, 100 - totalDiff);
    setPortfolioScore(finalScore);
    await endGame();
  };

  // --- RENDER HELPERS ---
  if (gameState === 'IDLE' && !selectedMode) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <Puzzle className="h-8 w-8" />
          </div>
          <h2 className="text-4xl font-black text-primary mb-2">Money Maze</h2>
          <p className="text-muted-foreground text-lg">Choose a strategy puzzle to master your finances.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5"
            onClick={() => { setSelectedMode('DEBT'); startGame(); }}
          >
            <div className="h-3 bg-rose-500" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                  <ArrowDownUp className="h-6 w-6" />
                </div>
                <CardTitle>Debt Domino</CardTitle>
              </div>
              <CardDescription>Master the art of paying off debt. Priority is everything!</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-rose-50 text-rose-600 border-rose-100">Logic Puzzle</Badge>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5"
            onClick={() => { setSelectedMode('PORTFOLIO'); startGame(); }}
          >
            <div className="h-3 bg-emerald-500" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle>Portfolio Builder</CardTitle>
              </div>
              <CardDescription>Allocate your wealth across assets to balance risk and reward.</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">Strategy Sim</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'RESULTS') {
    return (
      <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className="bg-emerald-500 p-10 text-white text-center">
          <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10" />
          </div>
          <CardTitle className="text-4xl font-black mb-2">Mission Complete!</CardTitle>
          <p className="text-emerald-50 text-xl">You earned <span className="font-black text-white">{xpEarned} XP</span> strategy bonus.</p>
        </div>
        <CardContent className="p-10 space-y-8">
          {selectedMode === 'DEBT' && debtResult && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-50 border">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white", debtResult.method !== 'NONE' ? 'bg-emerald-500' : 'bg-rose-500')}>
                  {debtResult.method !== 'NONE' ? <CheckCircle2 className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                </div>
                <div>
                  <h4 className="font-black text-lg">
                    {debtResult.method === 'AVALANCHE' ? 'Avalanche Master!' : 
                     debtResult.method === 'SNOWBALL' ? 'Snowball Strategist!' : 'Random Payoff'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {debtResult.method === 'AVALANCHE' ? 'You prioritized high-interest rates, saving the maximum amount of money!' :
                     debtResult.method === 'SNOWBALL' ? 'You focused on small wins to build momentum. Good for morale!' : 'Try focusing on interest rates or balance sizes next time.'}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Projected Interest Saved</div>
                <div className="text-4xl font-black text-primary">${debtResult.saved}</div>
              </div>
            </div>
          )}

          {selectedMode === 'PORTFOLIO' && portfolioScore !== null && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Allocation Accuracy</div>
                <div className="text-6xl font-black text-primary">{portfolioScore}%</div>
              </div>
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <h4 className="font-black text-primary mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" /> Why this score?
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {ageGroup === 'junior' ? 'At your age, keeping most of your money in Cash is safe. You correctly added some Stocks for growth!' :
                   ageGroup === 'teen' ? 'A mix of Stocks and Bonds is perfect for teens. You balanced safety with future growth.' :
                   'As a young adult, you have time to weather market swings. High Stock allocation is usually the winner!'}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => { setSelectedMode(null); startGame(); }} className="flex-1 gap-2 h-14 font-bold">
              <RefreshCcw className="h-4 w-4" /> Try Another
            </Button>
            <Button onClick={onExit} className="flex-1 h-14 font-bold text-lg">Back to Hub</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6 gap-2 text-muted-foreground hover:text-primary" 
        onClick={() => { setSelectedMode(null); }}
      >
        <ArrowDownUp className="h-4 w-4 rotate-180" /> Change Puzzle
      </Button>

      {selectedMode === 'DEBT' && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <div className="bg-rose-600 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-white/80" />
                  <span className="text-xs font-bold uppercase tracking-wider">Strategy: Debt Domino</span>
                </div>
                <CardTitle className="text-2xl font-black">Prioritize Your Payoffs</CardTitle>
                <CardDescription className="text-rose-100">Drag items to change their priority. Put your #1 priority at the TOP.</CardDescription>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  {debts.map((debt, idx) => (
                    <div
                      key={debt.id}
                      draggable
                      onDragStart={() => setDraggedIdx(idx)}
                      onDragOver={(e) => { e.preventDefault(); handleMove(draggedIdx!, idx); setDraggedIdx(idx); }}
                      onDragEnd={() => setDraggedIdx(null)}
                      className={cn(
                        "p-4 rounded-xl border-2 border-slate-100 bg-white shadow-sm cursor-grab active:cursor-grabbing transition-all flex items-center gap-4",
                        draggedIdx === idx ? "opacity-50 border-primary border-dashed" : "hover:border-primary/20"
                      )}
                    >
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{debt.name}</div>
                        <div className="flex gap-3 mt-1">
                          <Badge variant="outline" className="text-[10px] font-bold">${debt.balance}</Badge>
                          {debt.rate > 0 && <Badge variant="secondary" className="text-[10px] font-bold bg-rose-50 text-rose-600 border-none">{debt.rate}% APR</Badge>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Min Pay</div>
                        <div className="font-black text-slate-900">${debt.minPayment}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-700 mt-4" onClick={checkDebtStrategy}>
                  Confirm Priority Order
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-sm bg-slate-900 text-white">
              <CardHeader className="border-b border-white/10 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Tactical Briefing</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <ShieldAlert className="h-4 w-4 text-rose-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm">The Interest Trap</h5>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">Debts with high interest rates (like Credit Cards) grow the fastest. Paying them first saves you the most money over time.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm">The Momentum Win</h5>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">Paying off small balances first gives you a mental win and simplifies your life. This is called the "Snowball Method".</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedMode === 'PORTFOLIO' && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <div className="bg-emerald-600 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-white/80" />
                  <span className="text-xs font-bold uppercase tracking-wider">Strategy: Portfolio Builder</span>
                </div>
                <CardTitle className="text-2xl font-black">The $1,000 Allocation</CardTitle>
                <CardDescription className="text-emerald-100">Distribute your wealth. Risk increases with Stock/Property exposure.</CardDescription>
              </div>
              <CardContent className="p-8 space-y-10">
                <div className="grid gap-8">
                  {(Object.keys(allocation) as (keyof Allocation)[]).map((key) => (
                    <div key={key} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {key === 'cash' && <Wallet className="h-4 w-4 text-slate-400" />}
                          {key === 'bonds' && <Landmark className="h-4 w-4 text-blue-400" />}
                          {key === 'stocks' && <TrendingUp className="h-4 w-4 text-emerald-400" />}
                          {key === 'property' && <Building2 className="h-4 w-4 text-amber-400" />}
                          <span className="font-bold capitalize">{key}</span>
                        </div>
                        <span className="font-black text-slate-900">{allocation[key]}%</span>
                      </div>
                      <Slider 
                        value={[allocation[key]]} 
                        max={100} 
                        step={1} 
                        onValueChange={([val]) => updateAllocation(key, val)}
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t">
                  <Button className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700" onClick={checkPortfolio}>
                    Review & Lock Allocation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
              <CardHeader className="bg-slate-800 border-b border-white/5">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">10-Year Growth Projection</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* SVG Line Chart */}
                <div className="h-48 w-full relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="100" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    
                    {/* Data Line */}
                    <path 
                      d={`M ${projectedData.map((d, i) => {
                        const x = (i / (projectedData.length - 1)) * 100;
                        const maxVal = projectedData[projectedData.length - 1].value;
                        const y = 100 - (d.value / maxVal) * 100;
                        return `${x},${y}`;
                      }).join(' L ')}`}
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute bottom-0 right-0 p-2 text-[10px] font-bold text-emerald-400">
                    Est. ${Math.round(projectedData[projectedData.length - 1].value)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>Risk Profile</span>
                    <Badge className={cn("border-none", riskLevel.color)}>{riskLevel.label}</Badge>
                  </div>
                  <Progress 
                    value={((allocation.stocks + allocation.property) / 100) * 100} 
                    className="h-2 bg-slate-800"
                  />
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 italic text-[10px] text-slate-400 leading-relaxed">
                  *Projections are based on historical averages (2% Cash, 4% Bonds, 8% Stocks, 6% Property). Past performance is not a guarantee of future results.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
