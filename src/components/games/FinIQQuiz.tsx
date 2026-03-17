'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { finIQQuestions, Question, Category } from '@/data/finIQQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { XPWallet } from '@/components/XPWallet';
import { ConceptBreakdown } from '@/components/ConceptBreakdown';
import { 
  Timer, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Calendar, 
  Zap, 
  ArrowRight,
  BarChart2,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinIQQuizProps {
  isDailyChallenge?: boolean;
  onExit: () => void;
}

export function FinIQQuiz({ isDailyChallenge = false, onExit }: FinIQQuizProps) {
  const { ageGroup } = useAgeAdapt();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [roundQuestions, setRoundQuestions] = useState<Question[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [categoryStats, setCategoryStats] = useState<Record<Category, { correct: number; total: number }>>({
    BUDGETING: { correct: 0, total: 0 },
    INVESTING: { correct: 0, total: 0 },
    CREDIT: { correct: 0, total: 0 },
    TAXES: { correct: 0, total: 0 },
    SPENDING: { correct: 0, total: 0 },
  });

  const gameConfig = useMemo(() => ({
    gameName: 'finIQ' as const,
    totalRounds: 10,
    timePerRound: 15,
    livesEnabled: false,
    xpPerWin: 100,
    xpPerCorrectAnswer: 10,
  }), []);

  const {
    gameState,
    score,
    xpEarned,
    currentRound,
    timeLeft,
    bestStreak,
    comboActive,
    countdown,
    startGame,
    correctAnswer,
    wrongAnswer,
    nextRound,
    endGame
  } = useGameEngine(gameConfig);

  const getDailySeededQuestions = useCallback((all: Question[]) => {
    const today = new Date().toISOString().split('T')[0];
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    const seededRandom = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    return [...all].sort(() => seededRandom() - 0.5).slice(0, 10);
  }, []);

  const getRandomQuestions = useCallback((all: Question[]) => [...all].sort(() => Math.random() - 0.5).slice(0, 10), []);

  useEffect(() => {
    if (gameState === 'IDLE') {
      const filtered = finIQQuestions.filter(q => q.ageGroups.includes(ageGroup));
      const selection = isDailyChallenge ? getDailySeededQuestions(filtered) : getRandomQuestions(filtered);
      setRoundQuestions(selection);
    }
  }, [gameState, ageGroup, isDailyChallenge, getDailySeededQuestions, getRandomQuestions]);

  const currentQuestion = roundQuestions[currentRound - 1];

  const handleSelect = (idx: number) => {
    if (selectedOption !== null || gameState !== 'PLAYING') return;
    setSelectedOption(idx);
    const isCorrect = idx === currentQuestion.correctIndex;
    setCategoryStats(prev => ({
      ...prev,
      [currentQuestion.category]: { correct: prev[currentQuestion.category].correct + (isCorrect ? 1 : 0), total: prev[currentQuestion.category].total + 1 }
    }));
    if (isCorrect) correctAnswer(currentQuestion.xpReward);
    else wrongAnswer();
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentRound < 10) nextRound();
    else endGame(0, { categoryAccuracy: categoryStats });
  };

  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft === 0 && selectedOption === null) handleSelect(-1);
  }, [timeLeft, gameState, selectedOption]);

  const breakdownIdMap: Record<string, string> = {
    BUDGETING: 'budgeting-basics',
    INVESTING: 'investing-basics',
    CREDIT: 'credit-scores',
    TAXES: 'taxes-india',
    SPENDING: 'spending-habits'
  };

  const currentBreakdownId = currentQuestion ? breakdownIdMap[currentQuestion.category] : 'budgeting-basics';

  if (showBreakdown) {
    return (
      <ConceptBreakdown
        breakdownId={currentBreakdownId}
        ageGroup={ageGroup}
        activityType={isDailyChallenge ? 'challenge' : 'quiz'}
        activityTitle={isDailyChallenge ? "Daily Blitz" : "FinIQ Scenario"}
        onContinue={() => {
          setShowBreakdown(false);
          if (gameState === 'IDLE') startGame();
        }}
      />
    );
  }

  if (gameState === 'IDLE') {
    return (
      <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className="bg-primary p-8 md:p-10 text-white text-center relative">
          <Zap className="h-10 w-10 text-accent mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">FinIQ CHALLENGE</h2>
          <p className="text-primary-foreground/80 text-base md:text-lg">{isDailyChallenge ? "Today's Global Scenario Quiz" : "Practice Real-Life Financial Decisions"}</p>
        </div>
        <CardContent className="p-6 md:p-10 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3"><Calendar className="h-5 w-5 text-primary" /><div className="text-xs md:text-sm font-bold">10 Scenarios</div></div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3"><Timer className="h-5 w-5 text-accent" /><div className="text-xs md:text-sm font-bold">15s Limit</div></div>
          </div>
          <Button onClick={startGame} className="w-full h-14 md:h-16 text-lg md:text-xl font-black rounded-2xl shadow-xl shadow-primary/20 min-h-[44px]">START QUIZ</Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'COUNTDOWN') {
    return (
      <div className="flex flex-col items-center justify-center h-[60dvh]">
        <div className="text-8xl md:text-9xl font-black text-primary animate-pulse">{countdown}</div>
      </div>
    );
  }

  if (gameState === 'RESULTS') {
    return (
      <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-7">
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <div className="bg-emerald-500 p-8 md:p-10 text-white text-center">
              <Trophy className="h-10 w-10 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-black mb-2">Quiz Complete!</h2>
              <p className="text-emerald-50 text-lg md:text-xl">You earned <span className="font-black text-white">{xpEarned} XP</span> today.</p>
            </div>
            <CardContent className="p-6 md:p-10 space-y-10">
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                <div className="p-4 md:p-6 rounded-2xl bg-slate-50 border text-center"><div className="text-xl md:text-3xl font-black text-primary mb-1">{score}/10</div><div className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground">Score</div></div>
                <div className="p-4 md:p-6 rounded-2xl bg-slate-50 border text-center"><div className="text-xl md:text-3xl font-black text-accent mb-1">{bestStreak}</div><div className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground">Streak</div></div>
                <div className="p-4 md:p-6 rounded-2xl bg-slate-50 border text-center"><div className="text-xl md:text-3xl font-black text-emerald-600 mb-1">{Math.round((score/10)*100)}%</div><div className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground">Acc.</div></div>
              </div>
              <div className="space-y-6">
                <h3 className="font-black text-xl md:text-2xl flex items-center gap-2"><BarChart2 className="h-6 w-6 text-primary" /> Category Breakdown</h3>
                <div className="grid gap-4">
                  {Object.entries(categoryStats).map(([cat, stat]) => (
                    <div key={cat} className="space-y-2">
                      <div className="flex justify-between text-[10px] md:text-sm font-bold uppercase tracking-wider"><span>{cat}</span><span className="text-muted-foreground">{stat.correct}/{stat.total}</span></div>
                      <Progress value={stat.total > 0 ? (stat.correct / stat.total) * 100 : 0} className="h-1.5 md:h-2" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 md:gap-4">
                <Button variant="outline" onClick={startGame} className="flex-1 gap-2 h-12 md:h-14 font-bold text-xs md:text-sm min-h-[44px]"><RotateCcw className="h-4 w-4" /> Try Again</Button>
                <Button onClick={onExit} className="flex-1 h-12 md:h-14 font-bold text-xs md:text-lg min-h-[44px]">Exit</Button>
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

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3 md:gap-4">
          <Badge className="bg-primary px-3 md:px-4 py-1 text-xs md:text-sm font-black rounded-lg">Q {currentRound}/10</Badge>
          <div className="flex items-center gap-2 text-primary font-black text-xs md:text-base"><TrendingUp className="h-3 w-3 md:h-4 md:w-4" />{score}</div>
        </div>
        {comboActive && <Badge className="bg-accent animate-bounce font-black text-[10px] md:text-xs">+50 XP COMBO!</Badge>}
      </div>
      
      <div className="sticky top-0 z-20 h-2 md:h-3 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", timeLeft > 7 ? "bg-emerald-500" : timeLeft > 3 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${(timeLeft / 15) * 100}%` }} />
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <div className="p-6 md:p-8 space-y-6 md:space-y-8">
          <Badge variant="outline" className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">{currentQuestion.category}</Badge>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed md:leading-tight">{currentQuestion.question}</h2>
          <div className="grid gap-3">
            {currentQuestion.options.map((opt, i) => (
              <button 
                key={i} 
                disabled={selectedOption !== null} 
                onClick={() => handleSelect(i)} 
                className={cn(
                  "w-full min-h-[56px] p-4 md:p-5 text-left rounded-xl border-2 transition-all flex items-center justify-between group", 
                  selectedOption === null 
                    ? "hover:border-primary hover:bg-primary/5 border-slate-100" 
                    : i === currentQuestion.correctIndex 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900" 
                      : selectedOption === i 
                        ? "bg-rose-50 border-rose-500 text-rose-900" 
                        : "opacity-40 grayscale"
                )}
              >
                <span className="font-bold text-[15px] md:text-base">{opt}</span>
                {selectedOption !== null && i === currentQuestion.correctIndex && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
                {selectedOption !== null && selectedOption === i && i !== currentQuestion.correctIndex && <XCircle className="h-5 w-5 text-rose-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
        {showExplanation && (
          <div className={cn("p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500", selectedOption === currentQuestion.correctIndex ? "bg-emerald-50" : "bg-rose-50")}>
            <div className="flex items-start gap-3 md:gap-4 mb-6">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm"><Info className="h-4 w-4 md:h-5 md:w-5 text-primary" /></div>
              <div><h4 className="font-black text-slate-900 mb-1 text-sm md:text-base">Learning Moment</h4><p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">{currentQuestion.explanation}</p></div>
            </div>
            <Button onClick={handleNext} className="w-full h-12 md:h-14 gap-2 text-base md:text-lg font-black group min-h-[44px]">{currentRound < 10 ? "Next Scenario" : "See Results"}<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Button>
          </div>
        )}
      </Card>
    </div>
  );
}
