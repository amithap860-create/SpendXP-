'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdaptProvider';
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
  TrendingUp,
  Pause,
  Play,
  BookOpen,
  Calculator,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinIQQuizProps {
  isDailyChallenge?: boolean;
  onExit: () => void;
}

// Per-question shuffled options tracked alongside the question list
interface ShuffledQuestion extends Question {
  shuffledOptions: string[];
  shuffledCorrectIndex: number;
}

/** Shuffle a question's options and return new correct index */
function shuffleOptions(q: Question): ShuffledQuestion {
  const indexed = q.options.map((opt, i) => ({ opt, original: i }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return {
    ...q,
    shuffledOptions: indexed.map(x => x.opt),
    shuffledCorrectIndex: indexed.findIndex(x => x.original === q.correctIndex),
  };
}

// Key terms shown per category in the info popover and pause screen
const CATEGORY_TERMS: Record<string, { term: string; def: string }[]> = {
  BUDGETING: [
    { term: 'Budget', def: 'A plan that assigns every rupee a job before you spend it.' },
    { term: '50/30/20 Rule', def: '50% on Needs, 30% on Wants, 20% into Savings — a simple guide for any income.' },
    { term: 'Discretionary income', def: 'Money left after all essential expenses — what you can freely spend or save.' },
    { term: 'Emergency fund', def: '3–6 months of expenses kept liquid for unexpected crises.' },
  ],
  INVESTING: [
    { term: 'SIP', def: 'Systematic Investment Plan — investing a fixed amount every month regardless of market conditions.' },
    { term: 'Compound interest', def: 'Interest earned on your interest — money growing itself over time.' },
    { term: 'Diversification', def: 'Spreading investments across different assets so one bad bet doesn\'t ruin everything.' },
    { term: 'Index fund', def: 'Tracks a market index like Nifty 50; beats 80% of managed funds over the long term.' },
  ],
  CREDIT: [
    { term: 'CIBIL score', def: 'India\'s credit score (300–900). Above 750 gets you the best loan interest rates.' },
    { term: 'Credit utilisation', def: '% of your credit limit in use. Keep it below 30% for a healthy score.' },
    { term: 'Payment history', def: '35% of your CIBIL score — the single most important factor. Never miss a payment.' },
    { term: 'Hard inquiry', def: 'When a lender checks your credit before approving. Temporarily lowers score by 5–10 pts.' },
  ],
  TAXES: [
    { term: 'TDS', def: 'Tax Deducted at Source — employer pays your income tax before salary reaches you.' },
    { term: 'Section 80C', def: 'Deduct up to ₹1.5 lakh from taxable income via PF, ELSS, PPF, or LIC.' },
    { term: 'ITR', def: 'Income Tax Return — annual tax filing. File even if you don\'t owe any tax.' },
    { term: 'GST', def: 'Goods and Services Tax — added to products at 0%, 5%, 12%, 18%, or 28%.' },
  ],
  SPENDING: [
    { term: 'Impulse buy', def: 'An unplanned purchase driven by emotion, boredom, or FOMO rather than genuine need.' },
    { term: 'Lifestyle inflation', def: 'Spending more as income rises, leaving net savings unchanged.' },
    { term: 'Sinking fund', def: 'Saving a small amount monthly toward a known future expense (holiday, gadget, etc.).' },
    { term: '24-hour rule', def: 'Wait a full day before any unplanned purchase — eliminates most impulse buys.' },
  ],
};

// Returns true when the question likely involves a numeric calculation
function isCalcQuestion(question: string): boolean {
  return /interest|APR|EMI|percent|%|rate|return|save|invest|double|weeks|months|pay/i.test(question);
}

// Minimal inline calculator (basic + simple-interest mode)
function InlineCalculator({ question }: { question: string }) {
  const [mode, setMode] = useState<'basic' | 'si'>('basic');
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState('');
  const [op, setOp] = useState('');
  const [waitNext, setWaitNext] = useState(false);
  // Simple interest fields
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [siResult, setSiResult] = useState<string | null>(null);

  const pressKey = (val: string) => {
    if (val === 'C') { setDisplay('0'); setPrev(''); setOp(''); setWaitNext(false); return; }
    if (val === '⌫') { setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0'); return; }
    if (['+', '-', '×', '÷'].includes(val)) { setPrev(display); setOp(val); setWaitNext(true); return; }
    if (val === '=') {
      if (!op || !prev) return;
      const a = parseFloat(prev), b = parseFloat(display);
      const res = op === '+' ? a + b : op === '-' ? a - b : op === '×' ? a * b : b !== 0 ? a / b : 0;
      setDisplay(String(parseFloat(res.toFixed(4))));
      setPrev(''); setOp(''); setWaitNext(false);
      return;
    }
    if (val === '.' && display.includes('.') && !waitNext) return;
    setDisplay(d => waitNext ? (setWaitNext(false), val === '.' ? '0.' : val) : d === '0' && val !== '.' ? val : d + val);
  };

  const calcSI = () => {
    const p = parseFloat(principal), r = parseFloat(rate), t = parseFloat(time);
    if (isNaN(p) || isNaN(r) || isNaN(t)) { setSiResult('Enter all three values'); return; }
    const si = (p * r * t) / 100;
    setSiResult(`Interest = ₹${si.toFixed(2)}  |  Total = ₹${(p + si).toFixed(2)}`);
  };

  const basicKeys = ['7','8','9','÷','4','5','6','×','1','2','3','-','C','0','=','+'];
  const showSITab = isCalcQuestion(question);

  return (
    <div className="space-y-3">
      {showSITab && (
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          {(['basic', 'si'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={cn('flex-1 py-2 text-xs font-black uppercase transition-colors',
                mode === m ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100')}
              suppressHydrationWarning>
              {m === 'basic' ? 'Calculator' : '% Interest'}
            </button>
          ))}
        </div>
      )}

      {mode === 'basic' ? (
        <div className="bg-slate-900 rounded-2xl p-3">
          <div className="text-right text-white font-mono text-xl font-bold px-2 py-1 mb-2 bg-slate-800 rounded-lg min-h-[36px]">{display}</div>
          <div className="grid grid-cols-4 gap-1.5">
            {basicKeys.map(k => (
              <button key={k} onClick={() => pressKey(k)}
                className={cn('h-10 rounded-xl font-bold text-sm transition-colors',
                  k === '=' ? 'bg-primary text-white' :
                  ['+','-','×','÷'].includes(k) ? 'bg-primary text-white' :
                  k === 'C' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600')}
                suppressHydrationWarning>{k}</button>
            ))}
            <button onClick={() => pressKey('⌫')} className="col-span-4 h-8 mt-1 bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-600" suppressHydrationWarning>⌫ Backspace</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 bg-slate-50 rounded-2xl p-4 border">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Simple Interest = (P × R × T) ÷ 100</p>
          {[
            { label: 'Principal (P) ₹', val: principal, set: setPrincipal, placeholder: '10000' },
            { label: 'Rate (R) % per year', val: rate, set: setRate, placeholder: '12' },
            { label: 'Time (T) in years', val: time, set: setTime, placeholder: '2' },
          ].map(({ label, val, set, placeholder }) => (
            <div key={label}>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{label}</label>
              <input type="number" value={val} onChange={e => { set(e.target.value); setSiResult(null); }}
                placeholder={placeholder}
                className="w-full border rounded-lg px-3 py-2 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ))}
          <button onClick={calcSI} className="w-full h-10 bg-primary text-white rounded-xl font-black text-sm mt-1" suppressHydrationWarning>Calculate</button>
          {siResult && <div className="text-sm font-black text-primary bg-[#E8F5EE] border border-[#A8D5BC] rounded-xl p-3 text-center">{siResult}</div>}
        </div>
      )}
    </div>
  );
}

/** Adaptive timer: juniors get more time, hard questions need more thought */
function getTimerForQuestion(ageGroup: string, difficulty: string): number {
  const base = ageGroup === 'junior' ? 22 : ageGroup === 'senior' ? 12 : 15;
  if (difficulty === 'easy') return base + 5;
  if (difficulty === 'hard') return Math.max(base - 3, 8);
  return base;
}

export function FinIQQuiz({ isDailyChallenge = false, onExit }: FinIQQuizProps) {
  const { ageGroup } = useAgeAdapt();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [roundQuestions, setRoundQuestions] = useState<ShuffledQuestion[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [pauseTab, setPauseTab] = useState<'glossary' | 'calculator'>('glossary');
  const [showQuestionInfo, setShowQuestionInfo] = useState(false);
  const [categoryStats, setCategoryStats] = useState<Record<Category, { correct: number; total: number }>>({
    BUDGETING: { correct: 0, total: 0 },
    INVESTING: { correct: 0, total: 0 },
    CREDIT: { correct: 0, total: 0 },
    TAXES: { correct: 0, total: 0 },
    SPENDING: { correct: 0, total: 0 },
  });

  // Adaptive timer — recalculated per question in the PLAYING render
  const currentTimerSeconds = useMemo(() => {
    const q = roundQuestions[0]; // fallback seed
    if (!q) return 15;
    return getTimerForQuestion(ageGroup, q.difficulty);
  }, [ageGroup, roundQuestions]);

  const gameConfig = useMemo(() => ({
    gameName: 'finIQ' as const,
    totalRounds: 10,
    timePerRound: currentTimerSeconds,
    livesEnabled: false,
    xpPerWin: 100,
    xpPerCorrectAnswer: 10,
  }), [currentTimerSeconds]);

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
    pauseGame,
    resumeGame,
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
      const raw = isDailyChallenge ? getDailySeededQuestions(filtered) : getRandomQuestions(filtered);
      // Shuffle each question's options independently for variety on every load
      setRoundQuestions(raw.map(shuffleOptions));
    }
  }, [gameState, ageGroup, isDailyChallenge, getDailySeededQuestions, getRandomQuestions]);

  const currentQuestion = roundQuestions[currentRound - 1];

  // Per-question adaptive timer — changes as questions change
  const questionTimerSeconds = currentQuestion
    ? getTimerForQuestion(ageGroup, currentQuestion.difficulty)
    : 15;

  const handleSelect = (idx: number) => {
    if (selectedOption !== null || (gameState !== 'PLAYING' && gameState !== 'PAUSED')) return;
    if (gameState === 'PAUSED') return;
    setSelectedOption(idx);
    const isCorrect = idx === currentQuestion.shuffledCorrectIndex;
    setCategoryStats(prev => ({
      ...prev,
      [currentQuestion.category]: {
        correct: prev[currentQuestion.category].correct + (isCorrect ? 1 : 0),
        total: prev[currentQuestion.category].total + 1
      }
    }));
    if (isCorrect) correctAnswer(currentQuestion.xpReward);
    else wrongAnswer();
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentRound < 10) nextRound();
    else endGame(0);
  };

  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft === 0 && selectedOption === null) handleSelect(-1);
  }, [timeLeft, gameState, selectedOption]);

  const breakdownIdMap: Record<string, string> = {
    BUDGETING: 'budgeting-basics',
    INVESTING: 'investing-basics',
    CREDIT: 'credit-scores',
    TAXES: 'taxes-global',
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
          <Button onClick={startGame} className="w-full h-14 md:h-16 text-lg md:text-xl font-black rounded-2xl shadow-xl shadow-primary/20 min-h-[44px]" suppressHydrationWarning>START QUIZ</Button>
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
            <div className="bg-primary p-8 md:p-10 text-white text-center">
              <Trophy className="h-10 w-10 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-black mb-2">Quiz Complete!</h2>
              <p className="text-[#E8F5EE] text-lg md:text-xl">You earned <span className="font-black text-white">{xpEarned} XP</span> today.</p>
            </div>
            <CardContent className="p-6 md:p-10 space-y-10">
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                <div className="p-4 md:p-6 rounded-2xl bg-slate-50 border text-center"><div className="text-xl md:text-3xl font-black text-primary mb-1">{score}/10</div><div className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground">Score</div></div>
                <div className="p-4 md:p-6 rounded-2xl bg-slate-50 border text-center"><div className="text-xl md:text-3xl font-black text-accent mb-1">{bestStreak}</div><div className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground">Streak</div></div>
                <div className="p-4 md:p-6 rounded-2xl bg-slate-50 border text-center"><div className="text-xl md:text-3xl font-black text-primary mb-1">{Math.round((score/10)*100)}%</div><div className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground">Acc.</div></div>
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
                <Button variant="outline" onClick={startGame} className="flex-1 gap-2 h-12 md:h-14 font-bold text-xs md:text-sm min-h-[44px]" suppressHydrationWarning><RotateCcw className="h-4 w-4" /> Try Again</Button>
                <Button onClick={onExit} className="flex-1 h-12 md:h-14 font-bold text-xs md:text-lg min-h-[44px]" suppressHydrationWarning>Exit</Button>
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

  const isInvestingQ = currentQuestion.category === 'INVESTING';
  const gotItRight = selectedOption === currentQuestion.shuffledCorrectIndex;
  const categoryTerms = CATEGORY_TERMS[currentQuestion.category] ?? [];

  return (
    <div className="relative max-w-3xl mx-auto">

      {/* ── Pause overlay ── */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-50 bg-slate-900/97 rounded-2xl flex flex-col overflow-hidden min-h-[500px]">
          <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
            <h2 className="text-white font-black text-lg">Paused</h2>
            <button onClick={resumeGame} className="h-9 w-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center" suppressHydrationWarning>
              <Play className="h-4 w-4 text-white" />
            </button>
          </div>
          <div className="flex border-b border-white/10 shrink-0">
            {(['glossary', 'calculator'] as const).map(tab => (
              <button key={tab} onClick={() => setPauseTab(tab)}
                className={cn('flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors',
                  pauseTab === tab ? 'text-white border-b-2 border-primary' : 'text-white/40 hover:text-white/60')}
                suppressHydrationWarning>
                {tab === 'glossary' ? <><BookOpen className="h-3.5 w-3.5" />Key Terms</> : <><Calculator className="h-3.5 w-3.5" />Calculator</>}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {pauseTab === 'glossary' ? (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{currentQuestion.category} — Key Terms</p>
                {categoryTerms.map(({ term, def }) => (
                  <div key={term} className="bg-white/5 rounded-xl p-3">
                    <div className="text-white font-black text-sm mb-0.5">{term}</div>
                    <div className="text-white/60 text-xs leading-relaxed">{def}</div>
                  </div>
                ))}
              </div>
            ) : (
              <InlineCalculator question={currentQuestion.question} />
            )}
          </div>
          <div className="p-4 border-t border-white/10 shrink-0">
            <Button onClick={resumeGame} className="w-full min-h-[44px] font-black" suppressHydrationWarning>
              <Play className="h-4 w-4 mr-2" /> Resume Quiz
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4 md:space-y-6">
        {/* HUD row */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 md:gap-4">
            <Badge className="bg-primary px-3 md:px-4 py-1 text-xs md:text-sm font-black rounded-lg">Q {currentRound}/10</Badge>
            <div className="flex items-center gap-2 text-primary font-black text-xs md:text-base"><TrendingUp className="h-3 w-3 md:h-4 md:w-4" />{score}</div>
          </div>
          <div className="flex items-center gap-2">
            {comboActive && <Badge className="bg-accent animate-bounce font-black text-[10px] md:text-xs">+50 XP COMBO!</Badge>}
            <span className="text-[10px] text-slate-400 font-mono">{questionTimerSeconds}s</span>
            <button onClick={() => { pauseGame(); setPauseTab('glossary'); }}
              className="h-8 w-8 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors"
              suppressHydrationWarning>
              <Pause className="h-3.5 w-3.5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Timer bar */}
        <div className="sticky top-0 z-20 h-2 md:h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-1000", timeLeft > questionTimerSeconds * 0.5 ? "bg-primary" : timeLeft > questionTimerSeconds * 0.25 ? "bg-amber-400" : "bg-rose-500")}
            style={{ width: `${(timeLeft / questionTimerSeconds) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="p-6 md:p-8 space-y-5 md:space-y-6">

            {/* Category + difficulty + ① info button */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">{currentQuestion.category}</Badge>
              <Badge variant="outline" className="text-[10px] md:text-xs font-bold capitalize text-slate-400">{currentQuestion.difficulty}</Badge>
              <button
                onClick={() => setShowQuestionInfo(v => !v)}
                className="ml-auto h-7 w-7 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="Key terms for this question"
                suppressHydrationWarning
              >
                <span className="text-primary font-black text-xs">①</span>
              </button>
            </div>

            {/* Per-question key terms popover */}
            {showQuestionInfo && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{currentQuestion.category} — Key Terms</span>
                  <button onClick={() => setShowQuestionInfo(false)} className="text-slate-400 hover:text-slate-600" suppressHydrationWarning>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {categoryTerms.map(({ term, def }) => (
                  <div key={term} className="flex items-start gap-2">
                    <span className="text-primary font-black text-xs mt-0.5 shrink-0">•</span>
                    <div className="text-xs text-slate-700"><span className="font-black">{term}:</span> {def}</div>
                  </div>
                ))}
              </div>
            )}

            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed md:leading-tight">{currentQuestion.question}</h2>

            <div className="grid gap-3">
              {currentQuestion.shuffledOptions.map((opt, i) => (
                <button
                  key={i}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelect(i)}
                  className={cn(
                    "w-full min-h-[56px] p-4 md:p-5 text-left rounded-xl border-2 transition-all flex items-center justify-between group",
                    selectedOption === null
                      ? "hover:border-primary hover:bg-primary/5 border-slate-100"
                      : i === currentQuestion.shuffledCorrectIndex
                        ? "bg-[#E8F5EE] border-primary text-[#1A1F2E]"
                        : selectedOption === i
                          ? "bg-rose-50 border-rose-500 text-rose-900"
                          : "opacity-40 grayscale"
                  )}
                >
                  <span className="font-bold text-[15px] md:text-base">{opt}</span>
                  {selectedOption !== null && i === currentQuestion.shuffledCorrectIndex && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                  {selectedOption !== null && selectedOption === i && i !== currentQuestion.shuffledCorrectIndex && <XCircle className="h-5 w-5 text-rose-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {showExplanation && (
            <div className={cn("p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500", gotItRight ? "bg-[#E8F5EE]" : "bg-rose-50")}>
              {isInvestingQ && gotItRight && (
                <div className="flex items-center gap-2 mb-4 bg-primary text-white text-xs font-black px-3 py-2 rounded-lg w-fit">
                  <TrendingUp className="h-4 w-4" /> SMART MOVE: BUY KNOWLEDGE!
                </div>
              )}
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm">
                  <Info className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-1 text-sm md:text-base">Learning Moment</h4>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">{currentQuestion.explanation}</p>
                </div>
              </div>

              {/* Inline calculator for calculation questions, shown after answering */}
              {isCalcQuestion(currentQuestion.question) && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Check the maths yourself</span>
                  </div>
                  <InlineCalculator question={currentQuestion.question} />
                </div>
              )}

              <Button onClick={handleNext} className="w-full h-12 md:h-14 gap-2 text-base md:text-lg font-black group min-h-[44px]" suppressHydrationWarning>
                {currentRound < 10 ? 'Next Scenario' : 'See Results'}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
