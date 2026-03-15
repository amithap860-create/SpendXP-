'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { 
  CreditFactor, 
  INITIAL_FACTORS, 
  calculateScore, 
  getScoreBand, 
  getJuniorBand,
  applyEffect 
} from '@/lib/creditScoreEngine';
import { creditChoices, CreditChoice, CreditOption } from '@/data/creditChoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  TrendingUp, 
  Calendar, 
  Star, 
  Info, 
  ArrowRight,
  RotateCcw,
  Trophy,
  AlertCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function CreditScoreBuilder({ onExit }: { onExit: () => void }) {
  const { ageGroup } = useAgeAdapt();
  
  // Game Configuration based on age
  const rounds = ageGroup === 'junior' ? 6 : ageGroup === 'teen' ? 10 : 12;
  const gameConfig = useMemo(() => ({
    gameName: 'creditScoreBuilder' as const,
    totalRounds: rounds,
    livesEnabled: false,
    xpPerWin: 150,
    xpPerCorrectAnswer: 0, // Handled manually per choice
  }), [rounds]);

  const {
    gameState,
    score: roundCount,
    xpEarned,
    startGame,
    nextRound,
    endGame
  } = useGameEngine(gameConfig);

  // Game State
  const [factors, setFactors] = useState<CreditFactor[]>(INITIAL_FACTORS);
  const [currentScore, setCurrentScore] = useState(calculateScore(INITIAL_FACTORS));
  const [scoreHistory, setScoreHistory] = useState<number[]>([calculateScore(INITIAL_FACTORS)]);
  const [selectedOption, setSelectedOption] = useState<CreditOption | null>(null);
  const [currentChoice, setCurrentChoice] = useState<CreditChoice | null>(null);
  const [optimalCount, setOptimalCount] = useState(0);

  // Initialize/New Round Logic
  useEffect(() => {
    if (gameState === 'PLAYING') {
      const available = creditChoices.filter(c => {
        if (ageGroup === 'junior') return c.options.length === 2;
        return true;
      });
      setCurrentChoice(available[Math.floor(Math.random() * available.length)]);
    }
  }, [gameState, roundCount, ageGroup]);

  const handleSelect = (option: CreditOption) => {
    if (selectedOption) return;
    setSelectedOption(option);
    
    if (option.isOptimal) setOptimalCount(prev => prev + 1);
    
    const newFactors = applyEffect(factors, option.effect);
    const newScore = calculateScore(newFactors);
    
    // Animate state updates
    setTimeout(() => {
      setFactors(newFactors);
      setCurrentScore(newScore);
      setScoreHistory(prev => [...prev, newScore]);
    }, 300);
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (roundCount < rounds) {
      nextRound();
    } else {
      endGame();
    }
  };

  if (gameState === 'IDLE') {
    return (
      <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className="bg-primary p-10 text-white text-center">
          <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="h-12 w-12" />
          </div>
          <CardTitle className="text-4xl font-black mb-2">CREDIT BUILDER</CardTitle>
          <CardDescription className="text-primary-foreground/80 text-lg">
            Start with a 580 score. Can you reach 750 in {rounds} months?
          </CardDescription>
        </div>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="text-sm font-bold">{rounds} Month Sim</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-accent" />
              <div className="text-sm font-bold">Real FICO Logic</div>
            </div>
          </div>
          <Button onClick={startGame} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl">
            START SIMULATION
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'RESULTS') {
    const band = ageGroup === 'junior' ? getJuniorBand(currentScore) : getScoreBand(currentScore);
    const stars = currentScore >= 750 ? 3 : currentScore >= 650 ? 2 : 1;
    const finalXp = 100 + (stars * 20) + (optimalCount * 5);

    return (
      <Card className="max-w-3xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className={cn("p-10 text-white text-center", band.bg.replace('bg-', 'bg-').replace('100', '500'))}>
          <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10" />
          </div>
          <CardTitle className="text-4xl font-black mb-2">Simulation Complete!</CardTitle>
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(3)].map((_, i) => (
              <Star key={i} className={cn("h-8 w-8", i < stars ? "fill-white" : "opacity-30")} />
            ))}
          </div>
        </div>
        
        <CardContent className="p-10 space-y-10">
          <div className="text-center">
            <div className="text-7xl font-black text-slate-900">{currentScore}</div>
            <Badge className={cn("mt-2 text-lg px-4 py-1 border-none", band.bg, band.color)}>
              {band.label} Score
            </Badge>
          </div>

          <div className="space-y-4">
            <h4 className="font-black text-xl">Your Score Journey</h4>
            <div className="h-40 w-full relative pt-4">
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <path 
                  d={`M ${scoreHistory.map((s, i) => {
                    const x = (i / (scoreHistory.length - 1)) * 100;
                    const y = 100 - ((s - 300) / 550) * 100;
                    return `${x},${y}`;
                  }).join(' L ')}`}
                  fill="none" stroke="#2E72DB" strokeWidth="3"
                />
              </svg>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                <span>Month 1</span>
                <span>Month {rounds}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-50 border text-center">
               <div className="text-2xl font-black text-primary">{Math.round((optimalCount/rounds)*100)}%</div>
               <div className="text-[10px] font-bold uppercase text-muted-foreground">Optimal Choice Rate</div>
            </div>
            <div className="p-6 rounded-2xl bg-emerald-50 border-emerald-100 text-center">
               <div className="text-2xl font-black text-emerald-600">+{finalXp}</div>
               <div className="text-[10px] font-bold uppercase text-emerald-600">XP Earned</div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => { setFactors(INITIAL_FACTORS); setCurrentScore(580); setOptimalCount(0); startGame(); }} className="flex-1 h-14 font-bold">
              <RotateCcw className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Button onClick={onExit} className="flex-1 h-14 font-bold text-lg">Return to Hub</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const band = ageGroup === 'junior' ? getJuniorBand(currentScore) : getScoreBand(currentScore);

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-8">
      {/* Left: Score & Factors */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-none shadow-xl bg-white overflow-hidden text-center p-8">
          <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Month {roundCount} of {rounds}</div>
          <div className={cn("text-6xl font-black transition-all duration-500", band.color)}>
            {currentScore}
          </div>
          <Badge className={cn("mt-2 border-none", band.bg, band.color)}>
            {band.label}
          </Badge>
          
          <div className="mt-8 space-y-4 text-left">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Credit Factors</h4>
            {factors.map(f => (
              <div key={f.id} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>{ageGroup === 'junior' ? (f.id === 'history' ? 'Paying on Time' : f.id === 'utilisation' ? 'How much you owe' : f.name) : f.name}</span>
                  <span className="text-slate-400">{f.currentValue}%</span>
                </div>
                <Progress value={f.currentValue} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right: Choices */}
      <div className="lg:col-span-8 space-y-6">
        {currentChoice && (
          <Card className="border-none shadow-2xl bg-white h-full flex flex-col">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center gap-2 text-primary mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Monthly Decision</span>
              </div>
              <CardTitle className="text-2xl font-bold leading-tight">
                {currentChoice.scenario}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex-1">
              <div className="grid gap-4">
                {currentChoice.options.map((opt, i) => (
                  <Button
                    key={i}
                    disabled={!!selectedOption}
                    variant="outline"
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "h-auto p-6 flex items-center justify-between text-left border-2 transition-all",
                      !selectedOption && "hover:border-primary hover:bg-primary/5",
                      selectedOption === opt && (opt.isOptimal ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50"),
                      selectedOption && selectedOption !== opt && "opacity-40 grayscale"
                    )}
                  >
                    <span className="font-bold text-lg">{opt.text}</span>
                    {selectedOption === opt && (
                      opt.isOptimal ? <ShieldCheck className="h-6 w-6 text-emerald-600" /> : <AlertCircle className="h-6 w-6 text-rose-600" />
                    )}
                  </Button>
                ))}
              </div>

              {selectedOption && (
                <div className="mt-8 p-6 rounded-2xl bg-blue-50 border border-blue-100 animate-in slide-in-from-bottom-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                      <Info className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h5 className="font-bold text-blue-900 mb-1">Financial Lesson</h5>
                      <p className="text-sm text-blue-800 leading-relaxed mb-4">{selectedOption.explanation}</p>
                      <Button onClick={handleNext} className="gap-2">
                        {roundCount < rounds ? "Next Month" : "Final Results"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            {/* Timeline footer */}
            <div className="p-6 bg-slate-50 border-t flex justify-center gap-2">
              {[...Array(rounds)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-3 w-3 rounded-full transition-all",
                    i + 1 < roundCount ? "bg-primary" : i + 1 === roundCount ? "bg-accent scale-125 shadow-lg" : "bg-slate-200"
                  )} 
                />
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
