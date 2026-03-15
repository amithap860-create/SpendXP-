'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { XPWallet } from '@/components/XPWallet';
import { 
  Puzzle, 
  TrendingUp, 
  ShieldAlert, 
  Landmark, 
  Building2, 
  Wallet,
  ArrowDownUp,
  Calculator,
  Trophy,
  RefreshCcw,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowUpRight
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
  const { ageGroup } = useAgeAdapt();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  
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

  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [debtResult, setDebtResult] = useState<{ method: 'AVALANCHE' | 'SNOWBALL' | 'NONE', saved: number } | null>(null);
  const [allocation, setAllocation] = useState<Allocation>({ cash: 40, bonds: 30, stocks: 20, property: 10 });
  const [portfolioScore, setPortfolioScore] = useState<number | null>(null);

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

  const handleMove = (fromIdx: number, toIdx: number) => {
    const newDebts = [...debts];
    const [moved] = newDebts.splice(fromIdx, 1);
    newDebts.splice(toIdx, 0, moved);
    setDebts(newDebts);
  };

  const checkDebtStrategy = async () => {
    const isAvalanche = debts.every((d, i) => i === 0 || d.rate <= debts[i-1].rate);
    const isSnowball = debts.every((d, i) => i === 0 || d.balance >= debts[i-1].balance);
    let method: 'AVALANCHE' | 'SNOWBALL' | 'NONE' = isAvalanche ? 'AVALANCHE' : isSnowball ? 'SNOWBALL' : 'NONE';
    let saved = method === 'AVALANCHE' ? (ageGroup === 'junior' ? 5 : 1200) : method === 'SNOWBALL' ? (ageGroup === 'junior' ? 2 : 450) : 0;
    setDebtResult({ method, saved });
    await endGame();
  };

  const updateAllocation = (key: keyof Allocation, value: number) => {
    const others = (Object.keys(allocation) as (keyof Allocation)[]).filter(k => k !== key);
    const currentSumOfOthers = others.reduce((acc, k) => acc + allocation[k], 0);
    const diff = 100 - (value + currentSumOfOthers);
    const newAllocation = { ...allocation, [key]: value };
    others.forEach(k => {
      const share = allocation[k] / currentSumOfOthers;
      newAllocation[k] = Math.max(0, Math.round(allocation[k] + diff * share));
    });
    setAllocation(newAllocation);
  };

  const checkPortfolio = async () => {
    const targets = { junior: { cash: 60, bonds: 20, stocks: 20, property: 0 }, teen: { cash: 30, bonds: 30, stocks: 35, property: 5 }, senior: { cash: 10, bonds: 20, stocks: 50, property: 20 } }[ageGroup];
    let totalDiff = 0;
    (Object.keys(targets) as (keyof Allocation)[]).forEach(k => { totalDiff += Math.abs(allocation[k] - targets[k]); });
    setPortfolioScore(Math.max(0, 100 - totalDiff));
    await endGame();
  };

  if (gameState === 'IDLE' && !selectedMode) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <Puzzle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-4xl font-black text-primary mb-2">Money Maze</h2>
          <p className="text-muted-foreground text-lg">Choose a strategy puzzle to master your finances.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-2xl cursor-pointer border-none" onClick={() => { setSelectedMode('DEBT'); startGame(); }}><div className="h-3 bg-rose-500" /><CardHeader><CardTitle>Debt Domino</CardTitle><CardDescription>Master the art of paying off debt.</CardDescription></CardHeader></Card>
          <Card className="hover:shadow-2xl cursor-pointer border-none" onClick={() => { setSelectedMode('PORTFOLIO'); startGame(); }}><div className="h-3 bg-emerald-500" /><CardHeader><CardTitle>Portfolio Builder</CardTitle><CardDescription>Allocate your wealth across assets.</CardDescription></CardHeader></Card>
        </div>
      </div>
    );
  }

  if (gameState === 'RESULTS') {
    return (
      <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-7">
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <div className="bg-emerald-500 p-10 text-white text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4" />
              <CardTitle className="text-4xl font-black mb-2">Mission Complete!</CardTitle>
              <p className="text-emerald-50 text-xl">You earned <span className="font-black text-white">{xpEarned} XP</span>.</p>
            </div>
            <CardContent className="p-10 space-y-8">
              {selectedMode === 'DEBT' && debtResult && (
                <div className="text-center">
                  <div className="text-4xl font-black text-primary">${debtResult.saved} Saved</div>
                  <p className="text-slate-500 mt-2">{debtResult.method} Strategy identified.</p>
                </div>
              )}
              {selectedMode === 'PORTFOLIO' && portfolioScore !== null && (
                <div className="text-center">
                  <div className="text-6xl font-black text-primary">{portfolioScore}% Accuracy</div>
                </div>
              )}
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => { setSelectedMode(null); startGame(); }} className="flex-1 h-14 font-bold">Try Another</Button>
                <Button onClick={onExit} className="flex-1 h-14 font-bold text-lg">Back to Hub</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-5">
          <XPWallet />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {selectedMode === 'DEBT' ? (
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="bg-rose-600 p-6 text-white"><CardTitle className="text-2xl font-black">Prioritize Your Payoffs</CardTitle></div>
          <CardContent className="p-6 space-y-4">
            {debts.map((debt, idx) => (
              <div key={debt.id} draggable onDragStart={() => setDraggedIdx(idx)} onDragOver={(e) => { e.preventDefault(); handleMove(draggedIdx!, idx); setDraggedIdx(idx); }} className="p-4 rounded-xl border-2 border-slate-100 flex items-center gap-4 bg-white shadow-sm">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs">{idx + 1}</div>
                <div className="flex-1 font-bold">{debt.name}</div>
                <div className="text-rose-600 font-black">{debt.rate}% APR</div>
              </div>
            ))}
            <Button className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-700" onClick={checkDebtStrategy}>Confirm Priority Order</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="bg-emerald-600 p-6 text-white"><CardTitle className="text-2xl font-black">Portfolio Allocation</CardTitle></div>
          <CardContent className="p-8 space-y-10">
            {Object.keys(allocation).map((key) => (
              <div key={key} className="space-y-4">
                <div className="flex justify-between items-center"><span className="font-bold capitalize">{key}</span><span className="font-black">{allocation[key as keyof Allocation]}%</span></div>
                <Slider value={[allocation[key as keyof Allocation]]} max={100} onValueChange={([val]) => updateAllocation(key as keyof Allocation, val)} />
              </div>
            ))}
            <Button className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700" onClick={checkPortfolio}>Review & Lock Allocation</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
