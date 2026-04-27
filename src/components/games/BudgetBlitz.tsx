'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdaptProvider';
import { budgetBlitzItems, BudgetCategory } from '@/data/budgetBlitzItems';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Timer,
  TrendingUp,
  Wallet,
  ShoppingBag,
  PiggyBank,
  Trophy,
  RefreshCcw,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  FlaskConical,
  Pause,
  Play,
  Calculator,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { useUser } from '@/lib/store';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { XPWallet } from '@/components/XPWallet';

const TRIAL_MAX = 10;

// Key terms shown in the pause-screen glossary
const KEY_TERMS = [
  { term: 'NEED', emoji: '🛒', def: 'Something essential you cannot survive without — food, rent, medicine, transport.' },
  { term: 'WANT', emoji: '🎮', def: 'Something nice to have but not essential — games, snacks, streaming, fashion.' },
  { term: 'SAVE', emoji: '🐷', def: 'Money set aside for future goals, emergencies, or investments.' },
  { term: '50/30/20 Rule', emoji: '📊', def: '50% of income on Needs, 30% on Wants, 20% into Savings — a simple budgeting guide.' },
  { term: 'Budget', emoji: '📋', def: 'A plan that tells your money where to go before you spend it.' },
  { term: 'Discretionary Income', emoji: '💸', def: 'Money left over after paying for all necessities — what you can freely choose to spend or save.' },
];

// Simple inline calculator component used in pause screen
function InlineCalculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState('');
  const [op, setOp] = useState('');
  const [waitNext, setWaitNext] = useState(false);

  const press = (val: string) => {
    if (val === 'C') { setDisplay('0'); setPrev(''); setOp(''); setWaitNext(false); return; }
    if (val === '⌫') { setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0'); return; }
    if (['+', '-', '×', '÷'].includes(val)) {
      setPrev(display); setOp(val); setWaitNext(true); return;
    }
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

  const keys = ['7','8','9','÷','4','5','6','×','1','2','3','-','C','0','=','+'];
  return (
    <div className="bg-slate-900 rounded-2xl p-3 w-full max-w-[240px] mx-auto">
      <div className="text-right text-white font-mono text-xl font-bold px-2 py-1 mb-2 bg-slate-800 rounded-lg min-h-[36px] overflow-hidden">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {keys.map(k => (
          <button
            key={k}
            onClick={() => press(k)}
            className={cn(
              'h-10 rounded-xl font-bold text-sm transition-colors',
              k === '=' ? 'bg-primary text-white hover:bg-primary/90' :
              ['+','-','×','÷'].includes(k) ? 'bg-[#2E7D5A] text-white hover:bg-[#3A9068]' :
              k === 'C' ? 'bg-rose-500 text-white hover:bg-rose-600' :
              'bg-slate-700 text-white hover:bg-slate-600'
            )}
          >
            {k}
          </button>
        ))}
        <button onClick={() => press('⌫')} className="col-span-4 h-8 mt-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold">⌫ Backspace</button>
      </div>
    </div>
  );
}

export function BudgetBlitz({ onExit }: { onExit: () => void }) {
  const { difficultyConfig } = useAgeAdapt();
  const { formatValue, user } = useUser();
  const db = useFirestore();

  const gameConfig = {
    gameName: 'budgetBlitz' as const,
    totalRounds: 1,
    timePerRound: 90,
    livesEnabled: true,
    xpPerWin: 200,
    xpPerCorrectAnswer: 10
  };

  const {
    gameState,
    score,
    xpEarned,
    lives,
    timeLeft,
    countdown,
    startGame,
    correctAnswer,
    wrongAnswer,
    endGame
  } = useGameEngine(gameConfig);

  const [cards, setCards] = useState<any[]>([]);
  const [stats, setStats] = useState({ NEED: 0, WANT: 0, SAVE: 0, total: 0, correct: 0 });
  const [speedTier, setSpeedTier] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Pause state
  const [paused, setPaused] = useState(false);
  const [pauseTab, setPauseTab] = useState<'glossary' | 'calculator'>('glossary');

  // Trial mode state
  const [trialMode, setTrialMode] = useState(false);
  const [trialSorted, setTrialSorted] = useState(0);
  const [trialCorrect, setTrialCorrect] = useState(0);
  const [trialStats, setTrialStats] = useState({ NEED: 0, WANT: 0, SAVE: 0 });
  const [trialDone, setTrialDone] = useState(false);

  // Info shown by default on first load
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const elapsed = 90 - timeLeft;
    if (elapsed > 60) setSpeedTier(3);
    else if (elapsed > 30) setSpeedTier(2);
    else setSpeedTier(1);
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || paused) return;
    const spawnRate = speedTier === 1 ? 2000 : speedTier === 2 ? 1500 : 1000;
    const spawnInterval = setInterval(() => {
      const randomItem = budgetBlitzItems[Math.floor(Math.random() * budgetBlitzItems.length)];
      const xPos = Math.random() * 75 + 10;
      setCards(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        item: randomItem,
        x: xPos,
        y: -10
      }]);
    }, spawnRate);
    return () => clearInterval(spawnInterval);
  }, [gameState, speedTier, paused]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || paused) return;
    const fallSpeed = speedTier === 1 ? 0.8 : speedTier === 2 ? 1.2 : 1.8;
    const loop = setInterval(() => {
      setCards(prev => {
        const next = prev.map(c => ({ ...c, y: c.y + fallSpeed }));
        const lost = next.find(c => c.y >= 90);
        if (lost) {
          wrongAnswer();
          return next.filter(c => c.id !== lost.id);
        }
        return next;
      });
    }, 16);
    return () => clearInterval(loop);
  }, [gameState, speedTier, paused, wrongAnswer]);

  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft <= 0) handleFinish();
    if (gameState === 'GAME_OVER') handleFinish();
  }, [gameState, timeLeft]);

  const handleFinish = async () => {
    await endGame();
    if (user && db) {
      const uid = user.uid;
      if (!uid || uid.trim() === '') return;
      const budgetSplit = stats.total > 0 ? {
        need: Math.round((stats.NEED / stats.total) * 100),
        want: Math.round((stats.WANT / stats.total) * 100),
        save: Math.round((stats.SAVE / stats.total) * 100)
      } : { need: 0, want: 0, save: 0 };
      const gameRef = doc(db, 'users', uid, 'gameScores', 'budgetBlitz');
      try { setDoc(gameRef, { budgetSplit }, { merge: true }); } catch { /* non-fatal */ }
    }
  };

  const handleSort = useCallback((cardId: string, category: BudgetCategory) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const isCorrect = card.item.category === category;
    if (trialMode) {
      const nextSorted = trialSorted + 1;
      setTrialSorted(nextSorted);
      if (isCorrect) {
        setTrialCorrect(prev => prev + 1);
        setTrialStats(prev => ({ ...prev, [category]: prev[category] + 1 }));
      }
      if (nextSorted >= TRIAL_MAX) setTrialDone(true);
    } else {
      if (isCorrect) {
        correctAnswer();
        setStats(prev => ({ ...prev, [category]: prev[category] + 1, total: prev.total + 1, correct: prev.correct + 1 }));
      } else {
        wrongAnswer();
        setStats(prev => ({ ...prev, total: prev.total + 1 }));
      }
    }
    setCards(prev => prev.filter(c => c.id !== cardId));
  }, [cards, correctAnswer, wrongAnswer, trialMode, trialSorted]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || cards.length === 0) return;
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      const sortedCards = [...cards].sort((a, b) => b.y - a.y);
      const targetCard = sortedCards[0];
      if (Math.abs(deltaX) > 50) {
        if (deltaX < 0) handleSort(targetCard.id, 'NEED');
        else handleSort(targetCard.id, 'SAVE');
      } else if (deltaY > 50) {
        handleSort(targetCard.id, 'WANT');
      }
      touchStartRef.current = null;
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [cards, handleSort]);

  // ── IDLE ─────────────────────────────────────────────────────────────────────
  if (gameState === 'IDLE') {
    return (
      <Card className="max-w-xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className="bg-primary p-8 text-white text-center relative">
          <div className="h-16 w-16 md:h-20 md:w-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Gamepad2 className="h-10 w-10 md:h-12 md:w-12" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-black mb-2">BUDGET BLITZ</CardTitle>
          <CardDescription className="text-primary-foreground/80 text-base md:text-lg">Sort items into the right buckets at speed!</CardDescription>
        </div>

        {/* Rules panel — shown by default */}
        <div className="bg-slate-50 border-b px-5 py-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="font-black text-slate-800 flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> How to play</div>
            <button onClick={() => setShowInfo(v => !v)} className="text-xs text-slate-400 font-bold" suppressHydrationWarning>
              {showInfo ? 'Hide' : 'Show'}
            </button>
          </div>
          {showInfo && (
            <>
              <p className="text-slate-600">Cards fall from the top. Tap a bucket button before each card hits the bottom. Miss a card = lose a life. 3 lives per game. Speed increases every 30 seconds.</p>
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                {[
                  { icon: ShoppingBag, label: 'NEED', desc: 'Must-haves: food, rent, medicine', color: 'bg-[#E8F5EE] border-[#A8D5BC] text-primary' },
                  { icon: Wallet, label: 'WANT', desc: 'Nice-to-haves: games, snacks, movies', color: 'bg-[#E8F5EE] border-[#A8D5BC] text-[#2E7D5A]' },
                  { icon: PiggyBank, label: 'SAVE', desc: 'Money set aside for future goals', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                ].map(({ icon: Icon, label, desc, color }) => (
                  <div key={label} className={cn('border rounded-lg p-2', color)}>
                    <Icon className="h-4 w-4 mx-auto mb-1" />
                    <div className="font-bold">{label}</div>
                    <div className="text-[10px] leading-tight">{desc}</div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs">On mobile: swipe ← = NEED, → = SAVE, ↓ = WANT. Your Budget Report at the end shows your spending split.</p>
            </>
          )}
        </div>

        <CardContent className="p-6 md:p-8 space-y-4">
          <Button onClick={startGame} className="w-full h-14 md:h-16 text-xl md:text-2xl font-black rounded-2xl shadow-xl min-h-[44px]">START ARCADE</Button>
          <Button
            variant="outline"
            onClick={() => {
              setTrialMode(true);
              setTrialSorted(0);
              setTrialCorrect(0);
              setTrialStats({ NEED: 0, WANT: 0, SAVE: 0 });
              setTrialDone(false);
              startGame();
            }}
            className="w-full h-12 gap-2 font-bold border-2 min-h-[44px]"
          >
            <FlaskConical className="h-4 w-4" /> Trial Run (10 items · no XP)
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'COUNTDOWN') {
    return (
      <div className="flex flex-col items-center justify-center h-[60dvh]">
        <div className="text-8xl md:text-9xl font-black text-primary animate-ping">{countdown}</div>
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────────
  if (gameState === 'RESULTS' || gameState === 'GAME_OVER') {
    const needPct = stats.total > 0 ? Math.round((stats.NEED / stats.total) * 100) : 0;
    const wantPct = stats.total > 0 ? Math.round((stats.WANT / stats.total) * 100) : 0;
    const savePct = stats.total > 0 ? Math.round((stats.SAVE / stats.total) * 100) : 0;
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    const budgetFeedback = () => {
      if (savePct >= 20 && needPct <= 60) return { msg: 'Excellent budget split! You followed the 50/30/20 rule.', color: 'text-primary', bg: 'bg-[#E8F5EE] border-[#A8D5BC]' };
      if (savePct < 10) return { msg: 'Try to save more! Aim for at least 20% of your income in savings.', color: 'text-[#2E7D5A]', bg: 'bg-[#E8F5EE] border-[#A8D5BC]' };
      if (wantPct > 50) return { msg: 'Too many wants! Keeping wants under 30% leaves more for savings.', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };
      return { msg: 'Good start! Keep practising to master the 50/30/20 split.', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
    };
    const fb = budgetFeedback();

    return (
      <div className="grid lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <div className="bg-primary p-6 md:p-8 text-white text-center">
              <Trophy className="h-10 w-10 mx-auto mb-3 opacity-90" />
              <CardTitle className="text-3xl md:text-4xl font-black mb-2">Game Over!</CardTitle>
              <p className="text-[#C8E8D8] text-sm">You earned <span className="font-black text-white">{xpEarned} XP</span> · Score: <span className="font-black text-white">{score}</span> · Accuracy: <span className="font-black text-white">{accuracy}%</span></p>
            </div>
            <CardContent className="p-5 md:p-8 space-y-6">
              {/* Pie chart + split */}
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="relative flex justify-center">
                  <svg viewBox="0 0 32 32" className="w-36 h-36 rotate-[-90deg]">
                    <circle r="16" cx="16" cy="16" fill="#e2e8f0" />
                    <circle r="16" cx="16" cy="16" fill="transparent" stroke="#10b981" strokeWidth="32" strokeDasharray={`${needPct} 100`} />
                    <circle r="16" cx="16" cy="16" fill="transparent" stroke="#f59e0b" strokeWidth="32" strokeDasharray={`${wantPct} 100`} strokeDashoffset={`-${needPct}`} />
                    <circle r="16" cx="16" cy="16" fill="transparent" stroke="#3b82f6" strokeWidth="32" strokeDasharray={`${savePct} 100`} strokeDashoffset={`-${needPct + wantPct}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-xl font-black text-slate-900">{stats.total}</div>
                    <div className="text-[9px] font-bold uppercase text-slate-400">items</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-black text-lg text-slate-900">Your Budget Report</h4>
                  {[
                    { label: 'Needs', pct: needPct, count: stats.NEED, color: 'bg-primary', text: 'text-primary' },
                    { label: 'Wants', pct: wantPct, count: stats.WANT, color: 'bg-[#E8F5EE]0', text: 'text-[#2E7D5A]' },
                    { label: 'Savings', pct: savePct, count: stats.SAVE, color: 'bg-blue-500', text: 'text-blue-600' },
                  ].map(({ label, pct, count, color, text }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="flex items-center gap-1.5"><span className={cn('h-2 w-2 rounded-full', color)} />{label}</span>
                        <span className={text}>{pct}% ({count} items)</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget feedback */}
              <div className={cn('rounded-xl border p-3 text-sm font-medium flex items-start gap-2', fb.bg, fb.color)}>
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                {fb.msg}
              </div>

              {/* Tip about 50/30/20 */}
              <div className="bg-slate-50 rounded-xl p-3 border text-xs text-slate-600 space-y-1">
                <div className="font-black text-slate-800 text-sm mb-1">50 / 30 / 20 Rule</div>
                <div>Ideal: <span className="font-bold text-primary">50% Needs</span> · <span className="font-bold text-[#2E7D5A]">30% Wants</span> · <span className="font-bold text-blue-600">20% Savings</span></div>
                <div>Your split: <span className="font-bold">{needPct}% / {wantPct}% / {savePct}%</span></div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setStats({ NEED: 0, WANT: 0, SAVE: 0, total: 0, correct: 0 }); startGame(); }} className="flex-1 gap-2 h-12 min-h-[44px] text-sm">
                  <RefreshCcw className="h-4 w-4" /> Replay
                </Button>
                <Button onClick={onExit} className="flex-1 h-12 min-h-[44px] text-sm">Hub</Button>
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

  // ── TRIAL DONE ───────────────────────────────────────────────────────────────
  if (trialMode && trialDone) {
    const accuracy = TRIAL_MAX > 0 ? Math.round((trialCorrect / TRIAL_MAX) * 100) : 0;
    return (
      <Card className="max-w-xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className="bg-primary/50 p-6 text-white text-center">
          <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-90" />
          <CardTitle className="text-2xl font-black mb-1">Trial Complete!</CardTitle>
          <p className="text-white/80 text-sm">Practice run — no XP awarded</p>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <div className="text-5xl font-black text-primary">{accuracy}%</div>
            <div className="text-slate-500 text-sm mt-1">accuracy ({trialCorrect} of {TRIAL_MAX} correct)</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#E8F5EE] rounded-lg p-2"><div className="font-black text-primary">{trialStats.NEED}</div><div className="text-primary">Need</div></div>
            <div className="bg-[#E8F5EE] rounded-lg p-2"><div className="font-black text-[#2E7D5A]">{trialStats.WANT}</div><div className="text-[#2E7D5A]">Want</div></div>
            <div className="bg-blue-50 rounded-lg p-2"><div className="font-black text-blue-700">{trialStats.SAVE}</div><div className="text-blue-600">Save</div></div>
          </div>
          {accuracy < 70 && (
            <p className="text-xs text-slate-500 bg-[#E8F5EE] border border-[#A8D5BC] rounded-lg p-3">
              Tip: If you&apos;re unsure, think — &quot;Would I stop surviving without this?&quot; If yes, it&apos;s a NEED. If it&apos;s just nice to have, it&apos;s a WANT.
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setTrialMode(false); setTrialDone(false); }} className="flex-1 min-h-[44px]">Back</Button>
            <Button onClick={() => { setTrialSorted(0); setTrialCorrect(0); setTrialStats({ NEED: 0, WANT: 0, SAVE: 0 }); setTrialDone(false); startGame(); }} className="flex-1 gap-2 min-h-[44px]">
              <RefreshCcw className="h-4 w-4" /> Try again
            </Button>
          </div>
          <Button onClick={() => { setTrialMode(false); setStats({ NEED: 0, WANT: 0, SAVE: 0, total: 0, correct: 0 }); startGame(); }} className="w-full bg-primary min-h-[44px]">
            Play for real (earn XP)
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── PLAYING ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Pause overlay */}
      {paused && (
        <div className="absolute inset-0 z-50 bg-slate-900/95 rounded-3xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-white font-black text-lg">Game Paused</h2>
            <button onClick={() => setPaused(false)} className="h-9 w-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" suppressHydrationWarning>
              <Play className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Tab nav */}
          <div className="flex border-b border-white/10">
            {(['glossary', 'calculator'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setPauseTab(tab)}
                className={cn(
                  'flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors',
                  pauseTab === tab ? 'text-white border-b-2 border-primary' : 'text-white/40 hover:text-white/70'
                )}
                suppressHydrationWarning
              >
                {tab === 'glossary' ? <><BookOpen className="h-3.5 w-3.5" />Key Terms</> : <><Calculator className="h-3.5 w-3.5" />Calculator</>}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {pauseTab === 'glossary' ? (
              <div className="space-y-3">
                {KEY_TERMS.map(({ term, emoji, def }) => (
                  <div key={term} className="bg-white/5 rounded-xl p-3 flex items-start gap-3">
                    <span className="text-2xl shrink-0">{emoji}</span>
                    <div>
                      <div className="text-white font-black text-sm">{term}</div>
                      <div className="text-white/60 text-xs mt-0.5 leading-relaxed">{def}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <InlineCalculator />
            )}
          </div>

          <div className="p-4 border-t border-white/10">
            <Button onClick={() => setPaused(false)} className="w-full min-h-[44px] bg-primary font-black" suppressHydrationWarning>
              <Play className="h-4 w-4 mr-2" /> Resume Game
            </Button>
          </div>
        </div>
      )}

      {/* Game area */}
      <div className="relative w-full h-[70dvh] md:h-[80dvh] bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-inner flex flex-col">
        {/* HUD */}
        <div className="p-3 md:p-4 bg-white/80 backdrop-blur-sm border-b flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {trialMode
              ? <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-primary font-black text-xs"><FlaskConical className="h-3 w-3" />{trialSorted}/{TRIAL_MAX}</div>
              : <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-primary font-black text-xs"><TrendingUp className="h-3 w-3" />{score}</div>
            }
            {!trialMode && (
              <div className="flex items-center gap-0.5 text-rose-500 font-bold">
                {[3, 2, 1].map(i => <Heart key={i} className={cn('h-3.5 w-3.5 fill-current', lives < i ? 'opacity-25' : '')} />)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded-full font-mono font-bold text-xs"><Timer className="h-3 w-3 text-accent" />{timeLeft}s</div>
            {trialMode
              ? <Badge className="bg-primary/10 text-primary text-[9px] border-0">TRIAL</Badge>
              : <Badge variant="outline" className="border-primary text-primary text-[9px]">T{speedTier}</Badge>
            }
            <button
              onClick={() => setPaused(true)}
              className="h-8 w-8 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors"
              suppressHydrationWarning
            >
              <Pause className="h-3.5 w-3.5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Falling cards */}
        <div className="flex-1 relative overflow-hidden">
          {cards.map(card => (
            <div
              key={card.id}
              className="absolute p-2 md:p-3 bg-white rounded-xl shadow-lg border-2 border-slate-200 select-none w-28 md:w-40 text-center animate-in fade-in zoom-in duration-300 min-h-[70px]"
              style={{ left: `${card.x}%`, top: `${card.y}%`, transform: 'translateX(-50%)', touchAction: 'none' }}
            >
              <div className="font-bold text-slate-800 text-[10px] md:text-sm leading-tight mb-1 truncate">{card.item.name}</div>
              <div className="text-xs md:text-base font-black text-primary">{formatValue(difficultyConfig.moneyAmounts[card.item.basePrice as keyof typeof difficultyConfig.moneyAmounts])}</div>
            </div>
          ))}
        </div>

        {/* Bucket buttons */}
        <div className="p-3 md:p-4 grid grid-cols-3 gap-3 z-10 bg-white/80 backdrop-blur-sm border-t">
          <Button className="h-16 md:h-20 min-h-[44px] flex-col gap-1 bg-primary hover:bg-primary rounded-2xl shadow-lg w-full"
            onClick={() => cards.length > 0 && handleSort([...cards].sort((a, b) => b.y - a.y)[0].id, 'NEED')}>
            <ChevronLeft className="h-3 w-3 text-white/50" /><ShoppingBag className="h-5 w-5" /><span className="text-[8px] font-black uppercase">NEED</span>
          </Button>
          <Button className="h-16 md:h-20 min-h-[44px] flex-col gap-1 bg-primary hover:bg-[#3A9068] rounded-2xl shadow-lg w-full"
            onClick={() => cards.length > 0 && handleSort([...cards].sort((a, b) => b.y - a.y)[0].id, 'WANT')}>
            <Wallet className="h-5 w-5" /><span className="text-[8px] font-black uppercase">WANT</span>
          </Button>
          <Button className="h-16 md:h-20 min-h-[44px] flex-col gap-1 bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-lg w-full"
            onClick={() => cards.length > 0 && handleSort([...cards].sort((a, b) => b.y - a.y)[0].id, 'SAVE')}>
            <ChevronRight className="h-3 w-3 text-white/50" /><PiggyBank className="h-5 w-5" /><span className="text-[8px] font-black uppercase">SAVE</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
