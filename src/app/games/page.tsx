"use client"

import { useState, useEffect } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Coins, 
  Brain, 
  Zap, 
  GraduationCap, 
  CircleAlert, 
  TrendingUp,
  Heart,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GamesHub() {
  const { age, balance, formatValue, ageGroup } = useUser();
  const { toast } = useToast();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  // Game 1: Denomination Dash (Ages 8-10)
  const [dashTarget, setDashTarget] = useState(0);
  const [dashCurrent, setDashCurrent] = useState(0);

  // Game 2: Life Choice (Ages 8-18)
  const [health, setHealth] = useState(100);
  const [savings, setSavings] = useState(50);
  const [round, setRound] = useState(1);

  useEffect(() => {
    if (activeGame === 'dash') {
      setDashTarget(Math.floor(Math.random() * 10) + 1);
      setDashCurrent(0);
    }
  }, [activeGame]);

  const handleDashClick = (val: number) => {
    const next = parseFloat((dashCurrent + val).toFixed(2));
    if (next === dashTarget) {
      toast({ title: "Perfect Change! 🌟", description: "+50 XP earned." });
      setDashTarget(Math.floor(Math.random() * 15) + 1);
      setDashCurrent(0);
      setScore(s => s + 50);
    } else if (next > dashTarget) {
      toast({ title: "Too much!", variant: "destructive" });
      setDashCurrent(0);
    } else {
      setDashCurrent(next);
    }
  };

  const handleLifeChoice = (cost: number, healthImpact: number, desc: string) => {
    if (savings < cost) {
      toast({ title: "Not enough savings!", variant: "destructive" });
      return;
    }
    setSavings(s => s - cost);
    setHealth(h => Math.min(100, h + healthImpact));
    setRound(r => r + 1);
    toast({ title: "Choice Made", description: desc });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-primary">XP Games Hub</h2>
          </div>
          <p className="text-muted-foreground">Play your way to financial freedom. Games unlock based on your age.</p>
        </header>

        {!activeGame ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Age 8-10 Games */}
            {age <= 12 && (
              <>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-none bg-white overflow-hidden group" onClick={() => setActiveGame('dash')}>
                  <div className="h-2 bg-emerald-400" />
                  <CardHeader>
                    <Coins className="h-8 w-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                    <CardTitle>Denomination Dash</CardTitle>
                    <CardDescription>Match the coins to the target! Perfect for learning addition and money values.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Ages 8-10</Badge>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all cursor-pointer border-none bg-white overflow-hidden group" onClick={() => toast({ title: "Math Quest Loading..." })}>
                  <div className="h-2 bg-sky-400" />
                  <CardHeader>
                    <Brain className="h-8 w-8 text-sky-500 mb-2 group-hover:scale-110 transition-transform" />
                    <CardTitle>Math Money Quest</CardTitle>
                    <CardDescription>Solve shopping puzzles! Calculate change and total costs against the clock.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Ages 8-12</Badge>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Age 8-18 Games */}
            <Card className="hover:shadow-lg transition-all cursor-pointer border-none bg-white overflow-hidden group" onClick={() => setActiveGame('life')}>
              <div className="h-2 bg-amber-400" />
              <CardHeader>
                <Zap className="h-8 w-8 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Life Choice Show</CardTitle>
                <CardDescription>How do your daily choices affect your future? Manage your energy and savings!</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Ages 8-18</Badge>
              </CardContent>
            </Card>

            {/* Age 14+ Games */}
            {age >= 14 && (
              <>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-none bg-white overflow-hidden group" onClick={() => toast({ title: "University Simulator coming soon!" })}>
                  <div className="h-2 bg-indigo-400" />
                  <CardHeader>
                    <GraduationCap className="h-8 w-8 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                    <CardTitle>Uni-Survival</CardTitle>
                    <CardDescription>Manage student loans, rent, and groceries. Can you make it to graduation?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Ages 14+</Badge>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all cursor-pointer border-none bg-white overflow-hidden group" onClick={() => toast({ title: "Paycheck survival mode loading..." })}>
                  <div className="h-2 bg-rose-400" />
                  <CardHeader>
                    <CircleAlert className="h-8 w-8 text-rose-500 mb-2 group-hover:scale-110 transition-transform" />
                    <CardTitle>Paycheck to Paycheck</CardTitle>
                    <CardDescription>Tough choices! One unexpected bill can change everything. Manage the stress.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Teens+</Badge>
                  </CardContent>
                </Card>
              </>
            )}

            <Card className="hover:shadow-lg transition-all cursor-pointer border-none bg-white overflow-hidden group" onClick={() => window.location.href='/market'}>
              <div className="h-2 bg-slate-400" />
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-slate-500 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Volatility Pro</CardTitle>
                <CardDescription>Master the virtual market. Experience real-time stock simulation and risk.</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Teens</Badge>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" className="mb-4" onClick={() => setActiveGame(null)}>
              ← Back to Hub
            </Button>

            {activeGame === 'dash' && (
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-emerald-50 text-center">
                  <CardTitle className="text-3xl text-emerald-700">Denomination Dash</CardTitle>
                  <CardDescription>Target: ${dashTarget}.00</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-5xl font-black text-primary">${dashCurrent.toFixed(2)}</div>
                    <Progress value={(dashCurrent / dashTarget) * 100} className="w-full h-4" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[0.01, 0.05, 0.10, 0.25, 1, 5].map(coin => (
                      <Button 
                        key={coin} 
                        onClick={() => handleDashClick(coin)}
                        variant="outline"
                        className="h-20 text-lg font-bold flex flex-col gap-1 border-2 hover:border-emerald-500 hover:bg-emerald-50"
                      >
                        <Coins className="h-5 w-5 text-emerald-500" />
                        {coin < 1 ? `${coin * 100}¢` : `$${coin}`}
                      </Button>
                    ))}
                  </div>
                  <Button variant="secondary" className="w-full" onClick={() => setDashCurrent(0)}>Reset Current</Button>
                </CardContent>
              </Card>
            )}

            {activeGame === 'life' && (
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-amber-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl text-amber-700 font-black">Choice Challenge</CardTitle>
                      <CardDescription>Round {round} / 10</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold uppercase text-muted-foreground">Current Savings</div>
                      <div className="text-xl font-black text-amber-600">${savings}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="flex items-center gap-1"><Heart className="h-4 w-4 text-rose-500 fill-rose-500" /> Happiness/Energy</span>
                      <span>{health}%</span>
                    </div>
                    <Progress value={health} className="h-2 bg-slate-100" />
                  </div>

                  <div className="grid gap-4">
                    <Button 
                      className="h-auto p-4 flex justify-between items-center bg-white border-2 hover:bg-emerald-50 text-slate-800" 
                      onClick={() => handleLifeChoice(0, 5, "Cooked at home! Saved money and gained health.")}
                    >
                      <div className="text-left">
                        <div className="font-bold">Stay home & Cook</div>
                        <div className="text-xs text-muted-foreground">Free | +5 Energy</div>
                      </div>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      className="h-auto p-4 flex justify-between items-center bg-white border-2 hover:bg-rose-50 text-slate-800"
                      onClick={() => handleLifeChoice(15, 10, "Ate out! High cost, but very tasty.")}
                    >
                      <div className="text-left">
                        <div className="font-bold">Fast Food with Friends</div>
                        <div className="text-xs text-muted-foreground">$15 | +10 Energy</div>
                      </div>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      className="h-auto p-4 flex justify-between items-center bg-white border-2 hover:bg-amber-50 text-slate-800"
                      onClick={() => handleLifeChoice(40, 20, "New game! Big cost, big fun.")}
                    >
                      <div className="text-left">
                        <div className="font-bold">New Video Game</div>
                        <div className="text-xs text-muted-foreground">$40 | +20 Energy</div>
                      </div>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {round > 10 && (
                    <div className="mt-8 p-6 bg-primary/5 rounded-2xl border-2 border-primary/20 text-center">
                      <h4 className="text-xl font-black text-primary mb-2">Simulation Over!</h4>
                      <p className="text-sm mb-4 text-slate-600">You finished with ${savings} in savings and {health}% happiness.</p>
                      <Button onClick={() => { setRound(1); setSavings(50); setHealth(100); }}>Play Again</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
