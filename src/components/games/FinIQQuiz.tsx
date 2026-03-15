'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { finIQQuestions, Question, Category } from '@/data/finIQQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Timer, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Calendar, 
  Zap, 
  ArrowRight,
  TrendingUp,
  BarChart2,
  Lightbulb,
  ChevronRight,
  RotateCcw
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
    streak,
    bestStreak,
    comboActive,
    countdown,
    startGame,
    correctAnswer,
    wrongAnswer,
    nextRound,
    endGame
  } = useGameEngine(gameConfig);

  // Seeded Randomizer for Daily Challenge
  const getDailySeededQuestions = useCallback((all: Question[]) => {
    const today = new Date().toISOString().split('T')[0];
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
      seed += today.charCodeAt(i);
    }
    
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const shuffled = [...all].sort(() => seededRandom() - 0.5);
    return shuffled.slice(0, 10);
  }, []);

  // Standard Randomizer for Practice
  const getRandomQuestions = useCallback((all: Question[]) => {
    return [...all].sort(() => Math.random() - 0.5).slice(0, 10);
  }, []);

  useEffect(() => {
    if (gameState === 'IDLE') {
      const filtered = finIQQuestions.filter(q => q.ageGroups.includes(ageGroup));
      const selection = isDailyChallenge 
        ? getDailySeededQuestions(filtered) 
        : getRandomQuestions(filtered);
      setRoundQuestions(selection);
    }
  }, [gameState, ageGroup, isDailyChallenge, getDailySeededQuestions, getRandomQuestions]);

  const currentQuestion = roundQuestions[currentRound - 1];

  const handleSelect = (idx: number) => {
    if (selectedOption !== null || gameState !== 'PLAYING') return;
    
    setSelectedOption(idx);
    const isCorrect = idx === currentQuestion.correctIndex;
    
    // Update local stats for the results screen
    setCategoryStats(prev => ({
      ...prev,
      [currentQuestion.category]: {
        correct: prev[currentQuestion.category].correct + (isCorrect ? 1 : 0),
        total: prev[currentQuestion.category].total + 1
      }
    }));

    if (isCorrect) {
      correctAnswer(currentQuestion.xpReward);
    } else {
      wrongAnswer();
    }
    
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentRound < 10) {
      nextRound();
    } else {
      endGame();
    }
  };

  // Timer auto-fail logic
  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft === 0 && selectedOption === null) {
      handleSelect(-1); // Auto-wrong
    }
  }, [timeLeft, gameState, selectedOption]);

  if (gameState === 'IDLE') {
    return (
      <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className="bg-primary p-10 text-white text-center relative">
          <div className="absolute top-4 right-4 opacity-10">
            <Brain className="h-32 w-32" />
          </div>
          <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="h-10 w-10 text-accent" />
          </div>
          <CardTitle className="text-4xl font-black mb-2 tracking-tight">FinIQ CHALLENGE</CardTitle>
          <CardDescription className="text-primary-foreground/80 text-lg">
            {isDailyChallenge ? "Today's Global Scenario Quiz" : "Practice Real-Life Financial Decisions"}
          </CardDescription>
        </div>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="text-sm font-bold">10 Scenarios</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Timer className="h-5 w-5 text-accent" />
              <div className="text-sm font-bold">15s per Question</div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" /> Pro Tip
            </h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              These aren't just facts. Think about what you would actually do in these situations. Accuracy and speed both matter!
            </p>
          </div>

          <Button onClick={startGame} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20">
            START QUIZ
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'COUNTDOWN') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-9xl font-black text-primary animate-pulse">{countdown}</div>
        <p className="mt-8 text-2xl font-bold text-slate-400 uppercase tracking-widest">Mastering your FinIQ...</p>
      </div>
    );
  }

  if (gameState === 'RESULTS') {
    const sortedCategories = (Object.entries(categoryStats) as [Category, {correct: number, total: number}][])
      .sort((a, b) => (a[1].correct / (a[1].total || 1)) - (b[1].correct / (b[1].total || 1)));
    
    const weakest = sortedCategories[0];
    const strongest = sortedCategories[sortedCategories.length - 1];

    const getTip = (cat: Category) => {
      switch(cat) {
        case 'BUDGETING': return "Try tracking every dollar for a week to see where it goes!";
        case 'INVESTING': return "Time is your best friend. Even small amounts grow over decades!";
        case 'CREDIT': return "Treat credit like a fire: useful if controlled, dangerous if ignored.";
        case 'TAXES': return "Always check your gross vs net pay. Taxes are part of adulting!";
        case 'SPENDING': return "The 24-hour rule helps stop impulse buys before they happen.";
      }
    };

    return (
      <Card className="max-w-3xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className="bg-emerald-500 p-10 text-white text-center">
          <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10" />
          </div>
          <CardTitle className="text-4xl font-black mb-2">Quiz Complete!</CardTitle>
          <p className="text-emerald-50 text-xl">You earned <span className="font-black text-white">{xpEarned} XP</span> today.</p>
        </div>
        
        <CardContent className="p-10 space-y-10">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border text-center">
               <div className="text-3xl font-black text-primary mb-1">{score}/10</div>
               <div className="text-[10px] font-bold uppercase text-muted-foreground">Score</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border text-center">
               <div className="text-3xl font-black text-accent mb-1">{bestStreak}</div>
               <div className="text-[10px] font-bold uppercase text-muted-foreground">Best Streak</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border text-center">
               <div className="text-3xl font-black text-emerald-600 mb-1">{Math.round((score/10)*100)}%</div>
               <div className="text-[10px] font-bold uppercase text-muted-foreground">Accuracy</div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-black text-2xl flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-primary" />
              Category Breakdown
            </h3>
            <div className="grid gap-4">
              {Object.entries(categoryStats).map(([cat, stat]) => (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
                    <span>{cat}</span>
                    <span className="text-muted-foreground">{stat.correct}/{stat.total}</span>
                  </div>
                  <Progress value={stat.total > 0 ? (stat.correct / stat.total) * 100 : 0} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-black text-primary mb-1">Personalised Goal</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                You're strongest in <strong>{strongest[0]}</strong>! Since <strong>{weakest[0]}</strong> was your toughest area, here is a pro tip: {getTip(weakest[0] as Category)}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={startGame} className="flex-1 gap-2 h-14 font-bold">
              <RotateCcw className="h-4 w-4" /> Try Again
            </Button>
            <Button onClick={onExit} className="flex-1 h-14 font-bold text-lg">Return to Hub</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Badge className="bg-primary px-4 py-1 text-sm font-black rounded-lg">
            Q {currentRound}/10
          </Badge>
          <div className="flex items-center gap-2 text-primary font-black">
            <TrendingUp className="h-4 w-4" />
            {score}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {comboActive && <Badge className="bg-accent animate-bounce font-black">+50 XP COMBO!</Badge>}
          <div className="flex gap-1">
             {[...Array(bestStreak)].map((_, i) => (
               <Zap key={i} className={cn("h-4 w-4", i < streak ? "text-accent fill-accent" : "text-slate-200")} />
             ))}
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground px-1">
          <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> Time Remaining</span>
          <span>{timeLeft}s</span>
        </div>
        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-1000",
              timeLeft > 7 ? "bg-emerald-500" : timeLeft > 3 ? "bg-amber-500" : "bg-rose-500"
            )}
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs font-bold uppercase tracking-widest text-primary border-primary/20">
              {currentQuestion.category}
            </Badge>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="grid gap-3">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = i === currentQuestion.correctIndex;
              const isWrong = isSelected && !isCorrect;
              
              return (
                <button
                  key={i}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelect(i)}
                  className={cn(
                    "w-full p-5 text-left rounded-xl border-2 transition-all flex items-center justify-between group",
                    selectedOption === null 
                      ? "hover:border-primary hover:bg-primary/5 border-slate-100" 
                      : isCorrect 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900" 
                        : isWrong 
                          ? "bg-rose-50 border-rose-500 text-rose-900"
                          : "opacity-40 border-slate-100 grayscale"
                  )}
                >
                  <span className="font-bold">{opt}</span>
                  {selectedOption !== null && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                  {selectedOption !== null && isWrong && <XCircle className="h-5 w-5 text-rose-600" />}
                  {selectedOption === null && <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation Footer */}
        {showExplanation && (
          <div className={cn(
            "p-8 animate-in slide-in-from-bottom-4 duration-500",
            selectedOption === currentQuestion.correctIndex ? "bg-emerald-50" : "bg-rose-50"
          )}>
            <div className="flex items-start gap-4 mb-6">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                selectedOption === currentQuestion.correctIndex ? "bg-emerald-200 text-emerald-700" : "bg-rose-200 text-rose-700"
              )}>
                {selectedOption === currentQuestion.correctIndex ? <Trophy className="h-5 w-5" /> : <Info className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="font-black text-slate-900 mb-1">
                  {selectedOption === currentQuestion.correctIndex ? "Excellent Work!" : "Learning Opportunity"}
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
            <Button onClick={handleNext} className="w-full h-12 gap-2 text-lg font-black group">
              {currentRound < 10 ? "Next Question" : "See Results"}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
