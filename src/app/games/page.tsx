"use client"

import { useState, useEffect } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BudgetBlitz } from '@/components/games/BudgetBlitz';
import { FinIQQuiz } from '@/components/games/FinIQQuiz';
import { MoneyMaze } from '@/components/games/MoneyMaze';
import { CreditScoreBuilder } from '@/components/games/CreditScoreBuilder';
import { StockMarketSim } from '@/components/games/StockMarketSim';
import { CompoundClicker } from '@/components/games/CompoundClicker';
import { XPWallet } from '@/components/XPWallet';
import { toggleSound } from '@/lib/sounds';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuthContext } from '@/context/AuthContext';
import { safeOnSnapshot } from '@/lib/firestoreSafe';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import { 
  Gamepad2, 
  Zap, 
  Trophy, 
  Flame, 
  ShoppingBag,
  Brain,
  Puzzle,
  CreditCard,
  BarChart3,
  MousePointer2,
  Volume2,
  VolumeX,
  ChevronRight,
  GraduationCap,
  Timer
} from 'lucide-react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { cn } from '@/lib/utils';
import { lessons } from '@/data/lessons';
import { LessonViewer } from '@/components/learn/LessonViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getISTDateKey, getNextISTMidnight } from '@/lib/dateHelpers';

export default function GamesHub() {
  const { name, tasks } = useUser();
  const { ageGroup } = useAgeAdapt();
  const db = useFirestore();
  const { user } = useAuthContext();
  
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gatedGame, setGatedGame] = useState<{ id: string, lessonId: string } | null>(null);
  const [showLessonViewer, setShowLessonViewer] = useState(false);
  const [timeToReset, setTimeToReset] = useState('');

  // Logic 4: Sync Daily Challenge to IST
  const dateKey = getISTDateKey();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = getNextISTMidnight();
      const diff = nextMidnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      setTimeToReset(`${hours}h ${mins}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSoundEnabled(localStorage.getItem('spendxp_sound') !== 'false');
    }
  }, []);

  useEffect(() => {
    if (!db || !user) return;
    const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
    const unsubscribe = safeOnSnapshot(q, (snap) => {
      setLeaderboard(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [db, user]);

  const handleGameSelect = (gameId: string) => {
    const lesson = lessons.find(l => l.relatedGame === gameId);
    const isLessonDone = lesson ? tasks.find(t => t.id === `lesson-${lesson.id}`)?.completed : true;

    if (lesson && !isLessonDone) {
      setGatedGame({ id: gameId, lessonId: lesson.id });
    } else {
      setActiveGame(gameId);
    }
  };

  const games = [
    { id: 'blitz', title: 'Budget Blitz', desc: 'Sort needs, wants, and savings at speed!', icon: ShoppingBag, color: 'bg-emerald-500', minXP: 0 },
    { id: 'finIQ', title: 'FinIQ Quiz', desc: 'Master real-life financial scenarios.', icon: Brain, color: 'bg-primary', minXP: 0 },
    { id: 'compound', title: 'Compound Clicker', desc: 'Experience decades of growth in seconds.', icon: MousePointer2, color: 'bg-pink-500', minXP: 0 },
    { id: 'stock', title: 'Stock Market Sim', desc: 'Trade fictional stocks in a live market.', icon: BarChart3, color: 'bg-indigo-600', minXP: 250 },
    { id: 'maze', title: 'Money Maze', desc: 'Logic puzzles for debt and portfolios.', icon: Puzzle, color: 'bg-violet-500', minXP: 500 },
    { id: 'credit', title: 'Credit Builder', desc: 'Master your FICO score over 12 months.', icon: CreditCard, color: 'bg-blue-600', minXP: 750 }
  ];

  if (activeGame) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-background">
          <MainNav />
          <main className="flex-1 p-4 md:p-8">
            <Button variant="ghost" className="mb-6 gap-2 font-black text-slate-400 hover:text-primary" onClick={() => setActiveGame(null)}>
              <ChevronRight className="h-4 w-4 rotate-180" /> Back to Arcade
            </Button>
            {activeGame === 'blitz' && <BudgetBlitz onExit={() => setActiveGame(null)} />}
            {activeGame === 'finIQ' && <FinIQQuiz onExit={() => setActiveGame(null)} isDailyChallenge={true} />}
            {activeGame === 'compound' && <CompoundClicker onExit={() => setActiveGame(null)} />}
            {activeGame === 'stock' && <StockMarketSim onExit={() => setActiveGame(null)} />}
            {activeGame === 'maze' && <MoneyMaze onExit={() => setActiveGame(null)} />}
            {activeGame === 'credit' && <CreditScoreBuilder onExit={() => setActiveGame(null)} />}
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <main className="flex-1 flex flex-col max-w-7xl mx-auto">
          <EmailVerificationBanner />
          
          <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-8">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center border-2 border-primary/5">
                  <Gamepad2 className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">The Arcade</h2>
                    <button onClick={() => setSoundEnabled(toggleSound())} className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors" suppressHydrationWarning>
                      {soundEnabled ? <Volume2 className="h-5 w-5 text-slate-600" /> : <VolumeX className="h-5 w-5 text-slate-400" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Ready, {name}</span>
                    <Badge variant="outline" className="text-[10px] gap-1 ml-2 border-orange-200 text-orange-600"><Flame className="h-3 w-3 fill-current" /> 3 DAY STREAK</Badge>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto min-w-[350px]">
                <XPWallet />
              </div>
            </header>

            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-8">
                <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-r from-primary to-accent text-white">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Zap className="h-48 w-48" /></div>
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/20 text-white border-none gap-1.5 px-3 py-1 font-black">DAILY CHALLENGE</Badge>
                          <span className="text-[10px] font-black flex items-center gap-1 uppercase opacity-80"><Timer className="h-3 w-3" /> Resets in {timeToReset}</span>
                        </div>
                        <h3 className="text-3xl font-black tracking-tight leading-tight">FinIQ Daily Blitz</h3>
                        <p className="text-primary-foreground/80 max-w-md font-medium">Compare your financial IQ with players across India. Anchored to IST midnight.</p>
                      </div>
                      <Button onClick={() => handleGameSelect('finIQ')} className="bg-white text-primary hover:bg-white/90 h-16 px-10 rounded-2xl text-xl font-black shadow-xl" suppressHydrationWarning>PLAY NOW</Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  {games.map((game) => {
                    const lesson = lessons.find(l => l.relatedGame === game.id);
                    const isLessonDone = lesson ? tasks.find(t => t.id === `lesson-${lesson.id}`)?.completed : true;
                    
                    return (
                      <Card 
                        key={game.id} 
                        className="group hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden"
                        onClick={() => handleGameSelect(game.id)}
                      >
                        <div className={cn("h-2", game.color)} />
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg", game.color)}>
                              <game.icon className="h-6 w-6" />
                            </div>
                            {!isLessonDone && (
                              <Badge className="bg-amber-100 text-amber-700 border-none font-black gap-1">
                                <GraduationCap className="h-3 w-3" /> LEARN FIRST
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors">{game.title}</CardTitle>
                          <CardDescription className="font-medium">{game.desc}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{ageGroup} Mode</span>
                            <div className="flex items-center gap-1 text-primary font-black text-sm">
                              Play <ChevronRight className="h-4 w-4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-4">
                <Card className="border-none shadow-xl bg-white h-full overflow-hidden flex flex-col">
                  <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl font-black">
                      <Trophy className="h-5 w-5 text-amber-500" /> Global Ranks
                    </CardTitle>
                  </CardHeader>
                  <div className="divide-y flex-1">
                    {leaderboard.length < 3 && (
                      <div className="p-12 text-center text-slate-400 italic font-medium">
                        Be one of the first on the leaderboard!
                      </div>
                    )}
                    {leaderboard.map((u, i) => (
                      <div key={u.id} className={cn("p-4 flex items-center justify-between", u.id === user?.uid && "bg-primary/5 border-l-4 border-primary")}>
                        <div className="flex items-center gap-4">
                          <span className="w-4 text-xs font-black text-slate-300">{i + 1}</span>
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 uppercase">{u.displayName?.[0]}</div>
                          <div>
                            <div className="font-black text-sm text-slate-900">{u.displayName}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Level {u.level || 1}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-primary">{u.xp?.toLocaleString()}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">XP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Dialog open={!!gatedGame} onOpenChange={() => setGatedGame(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                <GraduationCap className="h-8 w-8" />
              </div>
              <DialogTitle className="text-2xl font-black">Learn Before You Play?</DialogTitle>
              <DialogDescription className="text-lg">
                Completing the {lessons.find(l => l.id === gatedGame?.lessonId)?.topic} lesson will help you score higher and earn bonus XP!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-3 sm:flex-col">
              <Button onClick={() => setShowLessonViewer(true)} className="w-full h-14 text-xl font-black rounded-xl" suppressHydrationWarning>Learn Now (+80 XP)</Button>
              <Button variant="ghost" onClick={() => { setActiveGame(gatedGame?.id || null); setGatedGame(null); }} className="w-full h-12 text-slate-400 font-bold" suppressHydrationWarning>I'll play anyway</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {showLessonViewer && gatedGame && (
          <LessonViewer 
            lesson={lessons.find(l => l.id === gatedGame.lessonId)!} 
            onClose={() => { setShowLessonViewer(false); setGatedGame(null); }} 
          />
        )}
      </div>
    </AuthGuard>
  );
}
