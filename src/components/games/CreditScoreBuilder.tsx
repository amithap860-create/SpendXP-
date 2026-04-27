'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdaptProvider';
import { CreditFactor, INITIAL_FACTORS, calculateScore, getScoreBand, getJuniorBand, applyEffect } from '@/lib/creditScoreEngine';
import { creditChoices, CreditChoice, CreditOption } from '@/data/creditChoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XPWallet } from '@/components/XPWallet';
import { ShieldCheck, Trophy, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConceptBreakdown } from '@/components/ConceptBreakdown';

export function CreditScoreBuilder({ onExit }: { onExit: () => void }) {
  const { ageGroup } = useAgeAdapt();
  const rounds = ageGroup === 'junior' ? 6 : ageGroup === 'teen' ? 10 : 12;
  const gameConfig = useMemo(() => ({ gameName: 'creditScoreBuilder' as const, totalRounds: rounds, livesEnabled: false, xpPerWin: 150, xpPerCorrectAnswer: 0 }), [rounds]);
  const { gameState, score: roundCount, currentRound, xpEarned, startGame, nextRound, endGame } = useGameEngine(gameConfig);

  const [factors, setFactors] = useState<CreditFactor[]>(INITIAL_FACTORS);
  const [currentScore, setCurrentScore] = useState(calculateScore(INITIAL_FACTORS));
  const [currentChoice, setCurrentChoice] = useState<CreditChoice | null>(null);
  const [selectedOption, setSelectedOption] = useState<CreditOption | null>(null);
  const [showBrief, setShowBrief] = useState(true);

  // Pre-built shuffled question sequence for the current session.
  // Using a ref avoids stale-closure issues inside the round-picker effect.
  const sessionQueueRef = useRef<CreditChoice[]>([]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    if (currentRound === 1) {
      // On the first round of every session, (re)build a fresh shuffled queue.
      // Factors and score are also reset here so "Try Again" starts clean.
      setFactors(INITIAL_FACTORS);
      setCurrentScore(calculateScore(INITIAL_FACTORS));

      const ageFiltered = creditChoices.filter(c => {
        if (ageGroup === 'junior') return c.id.startsWith('j') || c.options.length === 2;
        if (ageGroup === 'teen') return !c.id.startsWith('s');
        return true;
      });

      // Shuffle the full pool.
      // If the pool is smaller than rounds (only possible for junior), cycle once.
      const shuffled = [...ageFiltered].sort(() => Math.random() - 0.5);
      const queue: CreditChoice[] = [];
      while (queue.length < rounds) queue.push(...shuffled);
      sessionQueueRef.current = queue.slice(0, rounds);
    }

    // Always pick from the pre-built queue — guaranteed unique within a session.
    const pick = sessionQueueRef.current[currentRound - 1];
    if (pick) setCurrentChoice(pick);
  }, [gameState, currentRound, ageGroup, rounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (option: CreditOption) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const newFactors = applyEffect(factors, option.effect);
    setFactors(newFactors);
    setCurrentScore(calculateScore(newFactors));
  };

  const handleNext = () => {
    setSelectedOption(null);
    setCurrentChoice(null); // clear stale card while next question loads
    if (currentRound < rounds) nextRound();
    else endGame();
  };

  if (showBrief) return (
    <ConceptBreakdown
      breakdownId="credit-scores"
      ageGroup={ageGroup}
      activityType="game"
      activityTitle="Credit Score Builder"
      onContinue={() => setShowBrief(false)}
    />
  );

  if (gameState === 'IDLE') return (
    <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white text-center overflow-hidden">
      <div className="bg-primary p-8 md:p-10 text-white">
        <ShieldCheck className="h-12 w-12 mx-auto mb-6" />
        <CardTitle className="text-3xl md:text-4xl font-black mb-2">CREDIT BUILDER</CardTitle>
        <CardDescription className="text-primary-foreground/80">Master the lifecycle choices that build your score.</CardDescription>
      </div>
      <CardContent className="p-8 md:p-10">
        <Button onClick={startGame} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl">START SIMULATION</Button>
      </CardContent>
    </Card>
  );

  if (gameState === 'RESULTS') {
    const band = ageGroup === 'junior' ? getJuniorBand(currentScore) : getScoreBand(currentScore);
    const feedback = currentScore >= 750
      ? 'Excellent! You\'re in the top tier. Lenders will offer you the best rates.'
      : currentScore >= 650
      ? 'Good score! A few more months of on-time payments will push you into the excellent range.'
      : currentScore >= 550
      ? 'Fair — focus on paying on time and keeping utilisation below 30%.'
      : 'Needs work. Prioritise clearing outstanding balances and never miss a payment.';
    return (
      <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-7">
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <div className="bg-primary p-8 md:p-10 text-white text-center">
              <Trophy className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4" />
              <CardTitle className="text-3xl md:text-4xl font-black mb-2">Simulation Complete!</CardTitle>
              <p className="text-[#C8E8D8]">You earned {xpEarned} XP</p>
            </div>
            <CardContent className="p-8 md:p-10 space-y-6 text-center">
              <div className={cn("text-6xl md:text-7xl font-black", band.color)}>{currentScore}</div>
              <Badge className={cn("text-sm px-4 py-1 font-black border-none", band.bg, band.color)}>{band.label}</Badge>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 text-left">{feedback}</p>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <Button variant="outline" onClick={startGame} className="flex-1 h-14 font-bold text-sm md:text-base">Try Again</Button>
                <Button onClick={onExit} className="flex-1 h-14 font-bold text-sm md:text-lg">Return to Hub</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-5"><XPWallet /></div>
      </div>
    );
  }

  const band = ageGroup === 'junior' ? getJuniorBand(currentScore) : getScoreBand(currentScore);

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-6 md:gap-8">
      <div className="lg:col-span-4">
        <Card className="p-6 md:p-8 text-center flex flex-col items-center justify-center">
          <div className={cn("text-5xl md:text-6xl font-black", band.color)}>{currentScore}</div>
          <Badge className={cn("mt-2 border-none px-4 py-1 font-black", band.bg, band.color)}>{band.label}</Badge>
          <p className="mt-3 text-xs font-black uppercase text-slate-400 tracking-widest">Month {currentRound} / {rounds}</p>
          
          <div className="w-full mt-6 space-y-3">
            {factors.map(f => (
              <div key={f.id} className="space-y-1">
                <div className="flex justify-between text-[9px] font-black uppercase text-slate-400"><span>{f.name}</span><span>{f.currentValue}%</span></div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${f.currentValue}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <div className="lg:col-span-8">
        {currentChoice && (
          <Card className="p-6 md:p-8 flex flex-col min-h-[400px]">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-slate-900 leading-tight">{currentChoice.scenario}</h2>
            <div className="grid gap-3 md:gap-4">
              {currentChoice.options.map((opt, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  disabled={!!selectedOption} 
                  onClick={() => handleSelect(opt)} 
                  className={cn(
                    "h-auto p-4 md:p-6 flex justify-between items-center text-left whitespace-normal min-h-[60px]", 
                    selectedOption === opt && (opt.isOptimal ? "border-[#2E7D5A] bg-[#E8F5EE]" : "border-rose-500 bg-rose-50"),
                    selectedOption && selectedOption !== opt && "opacity-40"
                  )}
                >
                  <span className="font-bold text-sm md:text-base">{opt.text}</span>
                </Button>
              ))}
            </div>
            
            {selectedOption && (
              <div className="mt-auto pt-8 animate-in slide-in-from-top-4">
                <div className="p-4 md:p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm text-blue-900 font-medium leading-relaxed">{selectedOption.explanation}</p>
                </div>
                <Button onClick={handleNext} className="w-full h-14 md:h-16 mt-6 text-lg font-black rounded-2xl shadow-lg">Next Month</Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}