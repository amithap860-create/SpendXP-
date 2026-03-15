"use client"

import { useState } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { BudgetBlitz } from '@/components/games/BudgetBlitz';
import { FinIQQuiz } from '@/components/games/FinIQQuiz';
import { MoneyMaze } from '@/components/games/MoneyMaze';
import { CreditScoreBuilder } from '@/components/games/CreditScoreBuilder';
import { StockMarketSim } from '@/components/games/StockMarketSim';
import { 
  Gamepad2, 
  Zap, 
  GraduationCap, 
  ShieldCheck,
  Calendar,
  Sparkles,
  Calculator,
  Info,
  Lock,
  ArrowRight,
  Landmark,
  BadgePercent,
  TrendingUp,
  FileText,
  HeartPulse,
  ShoppingBag,
  Brain,
  Trophy,
  Puzzle,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GamesHub() {
  const { formatValue, completeTask } = useUser();
  const { toast } = useToast();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  // Loan Sim State
  const [loanPrincipal, setLoanPrincipal] = useState(1000);
  const [loanRate, setLoanRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(12);

  const calculateMonthlyPayment = () => {
    const monthlyRate = loanRate / 100 / 12;
    if (monthlyRate === 0) return loanPrincipal / loanTerm;
    return (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1);
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalPaid = monthlyPayment * loanTerm;
  const totalInterest = totalPaid - loanPrincipal;

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Gamepad2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-primary">XP Games Hub</h2>
                <p className="text-muted-foreground">Master money through simulations and arcade challenges.</p>
              </div>
            </div>
            {!activeGame && (
              <Button onClick={() => setActiveGame('dailyIQ')} className="gap-2 bg-accent hover:bg-accent/90 h-12 px-6 rounded-xl shadow-lg shadow-accent/20">
                <Zap className="h-5 w-5" />
                Daily Challenge
              </Button>
            )}
          </div>
        </header>

        {!activeGame ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('stock')}>
              <div className="h-3 bg-indigo-600" />
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl">Stock Market Sim</CardTitle>
                <CardDescription className="text-sm">Trade 6 companies over 5 days. React to headlines and volatility.</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-indigo-50 text-indigo-700">Market Engine</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('credit')}>
              <div className="h-3 bg-blue-600" />
              <CardHeader>
                <CreditCard className="h-10 w-10 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl">Credit Builder</CardTitle>
                <CardDescription className="text-sm">FICO strategy sim. Can you reach a 750 score in 12 months?</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-blue-50 text-blue-700">Strategy Engine</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('blitz')}>
              <div className="h-3 bg-emerald-500" />
              <CardHeader>
                <ShoppingBag className="h-10 w-10 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl">Budget Blitz</CardTitle>
                <CardDescription className="text-sm">Arcade sorting game. Categorise needs, wants, and savings at lightning speed!</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-emerald-100 text-emerald-700">Arcade Action</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('finIQ')}>
              <div className="h-3 bg-primary" />
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl">FinIQ Quiz</CardTitle>
                <CardDescription className="text-sm">Practice real-life scenario questions tailored to your age and level.</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-primary/10 text-primary">Scenario Based</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('maze')}>
              <div className="h-3 bg-violet-500" />
              <CardHeader>
                <Puzzle className="h-10 w-10 text-violet-500 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl">Money Maze</CardTitle>
                <CardDescription className="text-sm">Logic puzzles for debt payoff and investment portfolio building.</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-violet-50 text-violet-600">Strategy Engine</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('loan')}>
              <div className="h-3 bg-accent" />
              <CardHeader>
                <Landmark className="h-10 w-10 text-accent mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl">The Loan Lab</CardTitle>
                <CardDescription className="text-sm">Simulate borrowing costs based on interest rates and terms.</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-accent/10 text-accent">Interest Sim</Badge>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-primary" onClick={() => { setActiveGame(null); }}>
              <ArrowRight className="h-4 w-4 rotate-180" /> Exit to Games Hub
            </Button>

            {activeGame === 'stock' && (
              <StockMarketSim onExit={() => setActiveGame(null)} />
            )}

            {activeGame === 'credit' && (
              <CreditScoreBuilder onExit={() => setActiveGame(null)} />
            )}

            {activeGame === 'blitz' && (
              <BudgetBlitz onExit={() => setActiveGame(null)} />
            )}

            {activeGame === 'finIQ' && (
              <FinIQQuiz onExit={() => setActiveGame(null)} />
            )}

            {activeGame === 'maze' && (
              <MoneyMaze onExit={() => setActiveGame(null)} />
            )}

            {activeGame === 'dailyIQ' && (
              <FinIQQuiz isDailyChallenge onExit={() => setActiveGame(null)} />
            )}

            {activeGame === 'loan' && (
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7 space-y-6">
                  <Card className="border-none shadow-xl bg-white overflow-hidden">
                    <div className="bg-accent p-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <BadgePercent className="h-5 w-5 text-white/80" />
                        <span className="text-xs font-bold uppercase tracking-wider">Loan Configurator</span>
                      </div>
                      <CardTitle className="text-2xl font-black">Interactive Loan Lab</CardTitle>
                    </div>
                    <CardContent className="p-8 space-y-8">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm font-bold">
                            <span>Loan Principal</span>
                            <span className="text-accent">{formatValue(loanPrincipal)}</span>
                          </div>
                          <Slider 
                            value={[loanPrincipal]} 
                            min={100} 
                            max={20000} 
                            step={100} 
                            onValueChange={([val]) => setLoanPrincipal(val)} 
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm font-bold">
                            <span>Interest Rate (APR)</span>
                            <span className="text-accent">{loanRate}%</span>
                          </div>
                          <Slider 
                            value={[loanRate]} 
                            min={0} 
                            max={30} 
                            step={0.5} 
                            onValueChange={([val]) => setLoanRate(val)} 
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm font-bold">
                            <span>Payback Term (Months)</span>
                            <span className="text-accent">{loanTerm} mo.</span>
                          </div>
                          <Slider 
                            value={[loanTerm]} 
                            min={1} 
                            max={60} 
                            step={1} 
                            onValueChange={([val]) => setLoanTerm(val)} 
                          />
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                         <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-accent mt-1" />
                            <p className="text-sm text-slate-600 leading-relaxed">
                               <strong>Advisor Note:</strong> A {loanTerm} month loan at {loanRate}% means you pay <strong>{formatValue(totalInterest)}</strong> extra just for the privilege of borrowing!
                            </p>
                         </div>
                      </div>

                      <Button className="w-full h-14 text-lg bg-accent hover:bg-accent/90" onClick={() => { completeTask('game-loan-sim'); toast({ title: "Analysis Complete!" }) }}>
                        Complete Analysis & Earn XP
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden">
                    <CardHeader className="bg-slate-800 border-b border-white/5">
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Monthly Projection</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                       <div className="text-center">
                          <div className="text-5xl font-black text-white mb-1">{formatValue(monthlyPayment)}</div>
                          <div className="text-xs font-bold text-slate-500 uppercase">Monthly Payment</div>
                       </div>
                       
                       <div className="space-y-4 pt-4 border-t border-white/10">
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-slate-400">Base Price</span>
                             <span className="font-bold">{formatValue(loanPrincipal)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-rose-400 font-bold">Total Interest</span>
                             <span className="font-bold text-rose-400">+{formatValue(totalInterest)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-white/10">
                             <span className="text-lg font-bold">Total Cost</span>
                             <span className="text-lg font-black text-accent">{formatValue(totalPaid)}</span>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
