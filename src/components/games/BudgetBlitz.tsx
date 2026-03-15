'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { budgetBlitzItems, BudgetItem, BudgetCategory } from '@/data/budgetBlitzItems';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XPWallet } from '@/components/XPWallet';
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
  Sparkles
} from 'lucide-react';
import { useUser } from '@/lib/store';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

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
  const [stats, setStats] = useState({ NEED: 0, WANT: 0, SAVE: 0, total: 0 });
  const [speedTier, setSpeedTier] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const elapsed = 90 - timeLeft;
    if (elapsed > 60) setSpeedTier(3);
    else if (elapsed > 30) setSpeedTier(2);
    else setSpeedTier(1);
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const spawnRate = speedTier === 1 ? 2000 : speedTier === 2 ? 1500 : 1000;
    const spawnInterval = setInterval(() => {
      const randomItem = budgetBlitzItems[Math.floor(Math.random() * budgetBlitzItems.length)];
      const xPos = Math.random() * 80 + 10;
      const newCard = {
        id: Math.random().toString(36).substring(7),
        item: randomItem,
        x: xPos,
        y: -10
      };
      setCards(prev => [...prev, newCard]);
    }, spawnRate);

    return () => clearInterval(spawnInterval);
  }, [gameState, speedTier]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

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
  }, [gameState, speedTier, wrongAnswer]);

  useEffect(() => {
    if (gameState === 'PLAYING' && (timeLeft <= 0)) {
      handleFinish();
    }
    if (gameState === 'GAME_OVER') {
      handleFinish();
    }
  }, [gameState, timeLeft]);

  const handleFinish = async () => {
    const { isHighScore } = await endGame();
    if (isHighScore) {
      import('https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js' as any).then((module: any) => {
        module.default({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
      });
    }
    if (user && db) {
      const budgetSplit = stats.total > 0 ? {
        need: Math.round((stats.NEED / stats.total) * 100),
        want: Math.round((stats.WANT / stats.total) * 100),
        save: Math.round((stats.SAVE / stats.total) * 100)
      } : { need: 0, want: 0, save: 0 };

      const gameRef = doc(db, 'users', user.uid, 'gameScores', 'budgetBlitz');
      setDoc(gameRef, { budgetSplit }, { merge: true });
    }
  };

  const handleSort = useCallback((cardId: string, category: BudgetCategory) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    if (card.item.category === category) {
      correctAnswer();
      setStats(prev => ({ ...prev, [category]: prev[category] + 1, total: prev.total + 1 }));
    } else {
      wrongAnswer();
    }
    setCards(prev => prev.filter(c => c.id !== cardId));
  }, [cards, correctAnswer, wrongAnswer]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent, cardId: string) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) handleSort(cardId, 'NEED');
      else handleSort(cardId, 'SAVE');
    } else if (deltaY > 50) {
      handleSort(cardId, 'WANT');
    }
    touchStartRef.current = null;
  };

  if (gameState === 'IDLE') {
    return (
      <Card className="max-w-xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className="bg-primary p-8 text-white text-center">
          <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Gamepad2 className="h-12 w-12" />
          </div>
          <CardTitle className="text-4xl font-black mb-2">BUDGET BLITZ</CardTitle>
          <CardDescription className="text-primary-foreground/80 text-lg">Sort the expenses into the right buckets!</CardDescription>
        </div>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <ShoppingBag className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-emerald-900 uppercase">Need</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <Wallet className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-amber-900 uppercase">Want</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <PiggyBank className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-blue-900 uppercase">Save</div>
            </div>
          </div>
          <Button onClick={startGame} className="w-full h-16 text-2xl font-black rounded-2xl shadow-xl">START ARCADE</Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'COUNTDOWN') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-9xl font-black text-primary animate-ping">{countdown}</div>
      </div>
    );
  }

  if (gameState === 'RESULTS' || gameState === 'GAME_OVER') {
    const needPct = stats.total > 0 ? Math.round((stats.NEED / stats.total) * 100) : 0;
    const wantPct = stats.total > 0 ? Math.round((stats.WANT / stats.total) * 100) : 0;
    const savePct = stats.total > 0 ? Math.round((stats.SAVE / stats.total) * 100) : 0;

    return (
      <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-7">
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <div className="bg-emerald-500 p-8 text-white text-center">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10" />
              </div>
              <CardTitle className="text-4xl font-black mb-2">Game Over!</CardTitle>
              <p className="text-emerald-100">You earned <span className="font-black text-white">{xpEarned} XP</span> and scored <span className="font-black text-white">{score}</span> points.</p>
            </div>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative flex justify-center">
                  <svg viewBox="0 0 32 32" className="w-48 h-48 rotate-[-90deg]">
                    <circle r="16" cx="16" cy="16" fill="#e2e8f0" />
                    <circle r="16" cx="16" cy="16" fill="transparent" stroke="#10b981" strokeWidth="32" strokeDasharray={`${needPct} 100`} />
                    <circle r="16" cx="16" cy="16" fill="transparent" stroke="#f59e0b" strokeWidth="32" strokeDasharray={`${wantPct} 100`} strokeDashoffset={`-${needPct}`} />
                    <circle r="16" cx="16" cy="16" fill="transparent" stroke="#3b82f6" strokeWidth="32" strokeDasharray={`${savePct} 100`} strokeDashoffset={`-${needPct + wantPct}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-2xl font-black text-slate-900">{stats.total}</div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Total Items</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black text-xl text-slate-900 mb-4">Your Budget Report</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-emerald-500" /><span>Needs</span></div><span className="text-sm font-black text-emerald-600">{needPct}%</span></div>
                    <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-amber-500" /><span>Wants</span></div><span className="text-sm font-black text-amber-600">{wantPct}%</span></div>
                    <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-500" /><span>Savings</span></div><span className="text-sm font-black text-blue-600">{savePct}%</span></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={startGame} className="flex-1 gap-2 h-12"><RefreshCcw className="h-4 w-4" /> Play Again</Button>
                <Button onClick={onExit} className="flex-1 h-12">Return to Hub</Button>
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
    <div className="relative w-full h-[80vh] bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-inner flex flex-col" ref={containerRef}>
      <div className="p-4 bg-white/80 backdrop-blur-sm border-b flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full text-primary font-black"><TrendingUp className="h-4 w-4" />{score}</div>
          <div className="flex items-center gap-1 text-rose-500 font-bold">
            <Heart className={`h-4 w-4 fill-current ${lives < 3 ? 'opacity-30' : ''}`} />
            <Heart className={`h-4 w-4 fill-current ${lives < 2 ? 'opacity-30' : ''}`} />
            <Heart className={`h-4 w-4 fill-current ${lives < 1 ? 'opacity-30' : ''}`} />
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1 bg-slate-900 text-white rounded-full font-mono font-bold"><Timer className="h-4 w-4 text-accent" />{timeLeft}s</div>
        <Badge variant="outline" className="border-primary text-primary">TIER {speedTier}</Badge>
      </div>

      <div className="flex-1 relative">
        {cards.map(card => (
          <div
            key={card.id}
            className="absolute p-3 bg-white rounded-xl shadow-lg border-2 border-slate-200 select-none cursor-grab active:cursor-grabbing w-32 md:w-40 text-center animate-in fade-in zoom-in duration-300"
            style={{ left: `${card.x}%`, top: `${card.y}%`, transform: 'translateX(-50%)', touchAction: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, card.id)}
          >
            <div className="font-bold text-slate-800 leading-tight mb-1 truncate">{card.item.name}</div>
            <div className="text-sm font-black text-primary">{formatValue(difficultyConfig.moneyAmounts[card.item.basePrice])}</div>
          </div>
        ))}
      </div>

      <div className="p-4 grid grid-cols-3 gap-4 z-10 bg-white/80 backdrop-blur-sm border-t">
        <Button className="h-20 flex-col gap-1 bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-lg" onClick={() => cards.length > 0 && handleSort([...cards].sort((a,b)=>b.y-a.y)[0].id, 'NEED')}>
          <ChevronLeft className="h-4 w-4 text-white/50" /><ShoppingBag className="h-6 w-6" /><span className="text-[10px] font-black uppercase">NEED</span>
        </Button>
        <Button className="h-20 flex-col gap-1 bg-amber-500 hover:bg-amber-600 rounded-2xl shadow-lg" onClick={() => cards.length > 0 && handleSort([...cards].sort((a,b)=>b.y-a.y)[0].id, 'WANT')}>
          <Wallet className="h-6 w-6" /><span className="text-[10px] font-black uppercase">WANT</span>
        </Button>
        <Button className="h-20 flex-col gap-1 bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-lg" onClick={() => cards.length > 0 && handleSort([...cards].sort((a,b)=>b.y-a.y)[0].id, 'SAVE')}>
          <ChevronRight className="h-4 w-4 text-white/50" /><PiggyBank className="h-6 w-6" /><span className="text-[10px] font-black uppercase">SAVE</span>
        </Button>
      </div>
    </div>
  );
}
