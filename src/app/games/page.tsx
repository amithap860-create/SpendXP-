"use client"

import { useState, useEffect, useMemo } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { useProgression } from '@/hooks/useProgression';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BudgetBlitz } from '@/components/games/BudgetBlitz';
import { FinIQQuiz } from '@/components/games/FinIQQuiz';
import { MoneyMaze } from '@/components/games/MoneyMaze';
import { CreditScoreBuilder } from '@/components/games/CreditScoreBuilder';
import { StockMarketSim } from '@/components/games/StockMarketSim';
import { CompoundClicker } from '@/components/games/CompoundClicker';
import { XPWallet } from '@/components/XPWallet';
import { Skeleton } from '@/components/ui/skeleton';
import { toggleSound } from '@/lib/sounds';
import { 
  Gamepad2, 
  Zap, 
  Trophy, 
  Flame, 
  Lock, 
  ArrowRight,
  ShoppingBag,
  Brain,
  Puzzle,
  CreditCard,
  BarChart3,
  MousePointer2,
  Users,
  Timer,
  Lightbulb,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { cn } from '@/lib/utils';

export default function GamesHub() {
  const { name, balance, formatValue, user } = useUser();
  const { data: progression, isLoading: isProgLoading } = useProgression();
  const { ageGroup, difficultyConfig } = useAgeAdapt();
  const db = useFirestore();
  
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [challengeStats, setChallengeStats] = useState({ players: 0, timeRemaining: '' });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [birthYearInput, setBirthYearInput] = useState('2010');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSoundEnabled(localStorage.getItem('spendxp_sound') !== 'false');
    }
  }, []);

  useEffect(() => {
    if (!isProgLoading && !progression.lastActivityAt) {
      setShowOnboarding(true);
    }
  }, [isProgLoading, progression]);

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
  };

  const completeOnboarding = async () => {
    if (!user || !db) return;
    const year = parseInt(birthYearInput);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) return;

    await updateDoc(doc(db, 'users', user.uid), {
      birthYear: year,
      onboardingCompleted: true
    });
    setShowOnboarding(false);
  };

  // Leaderboard Subscription
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snap) => {
      const topUsers = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaderboard(topUsers);
    });
    return () => unsubscribe();
  }, [db]);

  // Daily Reset Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setChallengeStats(prev => ({ ...prev, timeRemaining: `${hours}h ${mins}m` }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const FINANCE_TIPS = {
    junior: [
      "Find a shiny coin? Put it in your piggy bank! Small savings add up to big toys.",
      "Needs are things like food and school shoes. Wants are toys and treats!",
      "Ask an adult about how a savings account works. It's like a safe for your money."
    ],
    teen: [
      "The 50/30/20 rule: 50% for needs, 30% for wants, and 20% for your future self.",
      "Starting to save at 15 is much easier than starting at 25. Let time do the work!",
      "A credit score is your financial reputation. Pay your phone bill on time to build it."
    ],
    senior: [
      "Compound interest is the 8th wonder of the world. He who understands it, earns it.",
      "Diversification isn't just a buzzword; it's your primary defense against market crashes.",
      "Understand your tax brackets. It's not about how much you make, but how much you keep."
    ]
  };

  const currentTip = useMemo(() => {
    const tips = FINANCE_TIPS[ageGroup as keyof typeof FINANCE_TIPS] || FINANCE_TIPS.teen;
    const day = new Date().getDate();
    return tips[day % tips.length];
  }, [ageGroup]);

  const games = [
    {
      id: 'compound',
      title: 'Compound Clicker',
      desc: 'Watch your wealth grow exponentially over decades in seconds.',
      icon: MousePointer2,
      color: 'bg-pink-500',
      minXP: 0,
      badge: 'Idle Sim',
      highScore: progression.gameHighScores?.compoundClicker || 0
    },
    {
      id: 'blitz',
      title: 'Budget Blitz',
      desc: 'Arcade sorting. Categorise needs, wants, and savings at speed!',
      icon: ShoppingBag,
      color: 'bg-emerald-500',
      minXP: 0,
      badge: 'Action',
      highScore: progression.gameHighScores?.budgetBlitz || 0
    },
    {
      id: 'finIQ',
      title: 'FinIQ Quiz',
      desc: 'Master real-life scenarios tailored to your level.',
      icon: Brain,
      color: 'bg-primary',
      minXP: 0,
      badge: 'Strategy',
      highScore: progression.gameHighScores?.finIQQuiz || 0
    },
    {
      id: 'stock',
      title: 'Stock Market Sim',
      desc: 'Trade fictional stocks and react to real-time market news.',
      icon: BarChart3,
      color: 'bg-indigo-600',
      minXP: 250,
      badge: 'Market Sim',
      highScore: progression.gameHighScores?.stockMarketSim || 0
    },
    {
      id: 'maze',
      title: 'Money Maze',
      desc: 'Solve logic puzzles for debt payoff and portfolio builds.',
      icon: Puzzle,
      color: 'bg-violet-500',
      minXP: 500,
      badge: 'Logic',
      highScore: progression.gameHighScores?.moneyMaze || 0
    },
    {
      id: 'credit',
      title: 'Credit Builder',
      desc: 'A 12-month strategy sim to master your FICO score.',
      icon: CreditCard,
      color: 'bg-blue-600',
      minXP: 750,
      badge: 'Advanced',
      highScore: progression.gameHighScores?.creditScoreBuilder || 0
    }
  ];

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="bg-primary p-8 text-white text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-black">Welcome to SpendXP!</h2>
          </div>
          <CardContent className="p-8">
            {onboardingStep === 1 && (
              <div className="space-y-6 text-center">
                <p className="text-slate-600 font-medium leading-relaxed">
                  Earn XP and level up your virtual wallet by making smart financial decisions in our arcade.
                </p>
                <Button onClick={() => setOnboardingStep(2)} className="w-full h-12 text-lg font-bold">Get Started</Button>
              </div>
            )}
            {onboardingStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <label className="text-sm font-black uppercase text-slate-400">What is your birth year?</label>
                  <input 
                    type="number" 
                    value={birthYearInput}
                    onChange={(e) => setBirthYearInput(e.target.value)}
                    className="w-full text-center text-4xl font-black text-primary bg-slate-50 border-none rounded-xl mt-2 h-20"
                  />
                  <p className="text-xs text-muted-foreground mt-2">We use this to customize the games for your age group.</p>
                </div>
                <Button onClick={() => setOnboardingStep(3)} className="w-full h-12 text-lg font-bold">Continue</Button>
              </div>
            )}
            {onboardingStep === 3 && (
              <div className="space-y-6 text-center">
                <Badge className="bg-accent text-white border-none px-4 py-1 text-lg mb-2">
                  {difficultyConfig.vocabularyLevel.toUpperCase()} MODE
                </Badge>
                <p className="text-slate-600 font-medium">
                  We've tailored your experience to <span className="font-bold text-primary">{ageGroup}</span> level. 
                  Expect {difficultyConfig.vocabularyLevel} vocabulary and age-appropriate financial goals.
                </p>
                <Button onClick={completeOnboarding} className="w-full h-12 text-lg font-bold">Start Playing</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeGame) {
    return (
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <main className="flex-1 p-4 md:p-8">
          <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-primary" onClick={() => setActiveGame(null)}>
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Games Hub
          </Button>
          {activeGame === 'compound' && <CompoundClicker onExit={() => setActiveGame(null)} />}
          {activeGame === 'blitz' && <BudgetBlitz onExit={() => setActiveGame(null)} />}
          {activeGame === 'finIQ' && <FinIQQuiz onExit={() => setActiveGame(null)} />}
          {activeGame === 'daily' && <FinIQQuiz isDailyChallenge onExit={() => setActiveGame(null)} />}
          {activeGame === 'maze' && <MoneyMaze onExit={() => setActiveGame(null)} />}
          {activeGame === 'stock' && <StockMarketSim onExit={() => setActiveGame(null)} />}
          {activeGame === 'credit' && <CreditScoreBuilder onExit={() => setActiveGame(null)} />}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
        {/* Top Header */}
        <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center border-2 border-primary/5">
              <Gamepad2 className="h-10 w-10 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-primary tracking-tight">Financial Arcade</h2>
                <button 
                  onClick={handleToggleSound}
                  className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-slate-600" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Welcome back, {name}</span>
                <Badge variant="outline" className="text-[10px] gap-1 ml-2">
                  <Flame className="h-3 w-3 text-orange-500 fill-current" /> 3 DAY STREAK
                </Badge>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto min-w-[300px]">
            <XPWallet />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-8">
            {/* Daily Challenge Banner */}
            <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-r from-primary to-accent text-white">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Zap className="h-48 w-48" />
              </div>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none gap-1.5 px-3 py-1">
                      <Users className="h-3 w-3" /> 1,420 PLAYERS TODAY
                    </Badge>
                    <h3 className="text-3xl font-black tracking-tight">FinIQ Daily Challenge</h3>
                    <p className="text-primary-foreground/80 max-w-md">
                      Everyone gets the same 10 scenarios today. Can you reach the top of the global leaderboard?
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2 text-xs font-bold bg-black/10 px-3 py-1.5 rounded-lg">
                        <Timer className="h-4 w-4" /> RESET IN {challengeStats.timeRemaining}
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setActiveGame('daily')}
                    className="bg-white text-primary hover:bg-white/90 h-16 px-8 rounded-2xl text-xl font-black shadow-xl"
                  >
                    PLAY CHALLENGE
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Games Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {isProgLoading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
              ) : (
                games.map((game) => {
                  const isLocked = progression.totalXP < game.minXP;
                  return (
                    <Card 
                      key={game.id} 
                      className={cn(
                        "group hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden relative",
                        isLocked && "grayscale opacity-75 cursor-not-allowed"
                      )}
                      onClick={() => !isLocked && setActiveGame(game.id)}
                    >
                      <div className={cn("h-3", game.color)} />
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg", game.color)}>
                            <game.icon className="h-6 w-6" />
                          </div>
                          <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none font-bold">
                            {game.badge}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">
                          {game.title}
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium leading-snug">
                          {game.desc}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Best: <span className="text-slate-900">{game.highScore}</span>
                          </div>
                          <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span className="text-xs font-bold text-primary">Play Now</span>
                            <ChevronRight className="h-3 w-3 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                      {isLocked && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6">
                          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2 border-2 border-dashed border-slate-300">
                            <Lock className="h-6 w-6" />
                          </div>
                          <h4 className="font-black text-slate-900">Rank Locked</h4>
                          <p className="text-xs font-bold text-slate-500">Unlocks at {game.minXP} XP</p>
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>

            {/* Tip of the Day */}
            <Card className="border-none bg-emerald-50 border-2 border-emerald-100/50 shadow-sm overflow-hidden">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Tip of the Day ({ageGroup})</div>
                  <p className="text-emerald-900 font-bold leading-relaxed">
                    "{currentTip}"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Leaderboard */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl bg-white h-full flex flex-col">
              <CardHeader className="border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl font-black">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Top Strategists
                  </CardTitle>
                  <Badge className="bg-primary/10 text-primary border-none">Global</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {isProgLoading ? (
                  <div className="p-6 space-y-4">
                    {Array(8).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y">
                    {leaderboard.map((user, idx) => (
                      <div 
                        key={user.id} 
                        className={cn(
                          "flex items-center justify-between p-4 transition-colors hover:bg-slate-50",
                          user.id === progression.id && "border-l-4 border-primary bg-primary/5"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-6 text-center text-sm font-black text-slate-400">
                            {idx + 1}
                          </div>
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border-2 border-white shadow-sm">
                            {user.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{user.name || 'Anonymous'}</div>
                            <div className="text-[10px] font-black uppercase text-slate-400">LVL {Math.floor((user.xp || 0) / 500) + 1}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-primary text-sm">{user.xp?.toLocaleString() || 0}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">TOTAL XP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t bg-slate-50/50">
                <Button variant="outline" className="w-full h-10 font-bold text-xs" disabled>
                  SEE FULL LEADERBOARD
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
