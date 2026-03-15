'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { CreditFactor, INITIAL_FACTORS, calculateScore, getScoreBand, getJuniorBand, applyEffect } from '@/lib/creditScoreEngine';
import { creditChoices, CreditChoice, CreditOption } from '@/data/creditChoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { XPWallet } from '@/components/XPWallet';
import { ShieldCheck, Star, Trophy, RotateCcw, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CreditScoreBuilder({ onExit }: { onExit: () => void }) {
  const { ageGroup } = useAgeAdapt();
  const rounds = ageGroup === 'junior' ? 6 : ageGroup === 'teen' ? 10 : 12;
  const gameConfig = useMemo(() => ({ gameName: 'creditScoreBuilder' as const, totalRounds: rounds, livesEnabled: false, xpPerWin: 150, xpPerCorrectAnswer: 0 }), [rounds]);
  const { gameState, score: roundCount, xpEarned, startGame, nextRound, endGame } = useGameEngine(gameConfig);

  const [factors, setFactors] = useState<CreditFactor[]>(INITIAL_FACTORS);
  const [currentScore, setCurrentScore] = useState(calculateScore(INITIAL_FACTORS));
  const [currentChoice, setCurrentChoice] = useState<CreditChoice | null>(null);
  const [selectedOption, setSelectedOption] = useState<CreditOption | null>(null);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      const available = creditChoices.filter(c => ageGroup === 'junior' ? c.options.length === 2 : true);
      setCurrentChoice(available[Math.floor(Math.random() * available.length)]);
    }
  }, [gameState, roundCount, ageGroup]);

  const handleSelect = (option: CreditOption) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const newFactors = applyEffect(factors, option.effect);
    setFactors(newFactors);
    setCurrentScore(calculateScore(newFactors));
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (roundCount < rounds) nextRound();
    else endGame();
  };

  if (gameState === 'IDLE') return (
    <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white text-center"><div className="bg-primary p-10 text-white"><ShieldCheck className="h-12 w-12 mx-auto mb-6" /><CardTitle className="text-4xl font-black mb-2">CREDIT BUILDER</CardTitle></div><CardContent className="p-10"><Button onClick={startGame} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl">START SIMULATION</Button></CardContent></Card>
  );

  if (gameState === 'RESULTS') return (
    <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-7">
        <Card className="border-none shadow-2xl bg-white overflow-hidden">
          <div className="bg-emerald-500 p-10 text-white text-center"><Trophy className="h-16 w-16 mx-auto mb-4" /><CardTitle className="text-4xl font-black mb-2">Simulation Complete!</CardTitle></div>
          <CardContent className="p-10 space-y-8 text-center"><div className="text-7xl font-black text-slate-900">{currentScore}</div><div className="flex gap-4"><Button variant="outline" onClick={startGame} className="flex-1 h-14 font-bold">Try Again</Button><Button onClick={onExit} className="flex-1 h-14 font-bold text-lg">Return to Hub</Button></div></CardContent>
        </Card>
      </div>
      <div className="lg:col-span-5"><XPWallet /></div>
    </div>
  );

  const band = ageGroup === 'junior' ? getJuniorBand(currentScore) : getScoreBand(currentScore);

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4"><Card className="p-8 text-center"><div className={cn("text-6xl font-black", band.color)}>{currentScore}</div><Badge className={cn("mt-2 border-none", band.bg, band.color)}>{band.label}</Badge></Card></div>
      <div className="lg:col-span-8">{currentChoice && <Card className="p-8"><h2 className="text-2xl font-bold mb-6">{currentChoice.scenario}</h2><div className="grid gap-4">{currentChoice.options.map((opt, i) => <Button key={i} variant="outline" disabled={!!selectedOption} onClick={() => handleSelect(opt)} className={cn("h-auto p-6 flex justify-between", selectedOption === opt && (opt.isOptimal ? "border-emerald-500" : "border-rose-500"))}><span className="font-bold">{opt.text}</span></Button>)}</div>{selectedOption && <div className="mt-8 p-6 bg-blue-50 rounded-xl"><p className="text-sm">{selectedOption.explanation}</p><Button onClick={handleNext} className="mt-4">Next Month</Button></div>}</Card>}</div>
    </div>
  );
}
