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
import { CompoundClicker } from '@/components/games/CompoundClicker';
import { XPWallet } from '@/components/XPWallet';
import { 
  Gamepad2, 
  Zap, 
  Info, 
  ArrowRight,
  Landmark,
  BadgePercent,
  ShoppingBag,
  Brain,
  Puzzle,
  CreditCard,
  BarChart3,
  MousePointer2
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

        <div className="grid gap-8 lg:grid-cols-12">
          <div className={activeGame ? "lg:col-span-12" : "lg:col-span-8"}>
            {!activeGame ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('compound')}>
                  <div className="h-3 bg-pink-500" />
                  <CardHeader>
                    <MousePointer2 className="h-10 w-10 text-pink-500 mb-2 group-hover:scale-110 transition-transform" />
                    <CardTitle className="text-2xl font-black">Compound Clicker</CardTitle>
                    <CardDescription className="text-sm">Click to save, unlock vehicles, and witness the power of compounding time.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-pink-50 text-pink-700">Idle Engine</Badge>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('stock')}>
                  <div className="h-3 bg-indigo-600" />
                  <CardHeader>
                    <BarChart3 className="h-10 w-10 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                    <CardTitle className="text-2xl font-black">Stock Market Sim</CardTitle>
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
                    <CardTitle className="text-2xl font-black">Credit Builder</CardTitle>
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
                    <CardTitle className="text-2xl font-black">Budget Blitz</CardTitle>
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
                    <CardTitle className="text-2xl font-black">FinIQ Quiz</CardTitle>
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
                    <CardTitle className="text-2xl font-black">Money Maze</CardTitle>
                    <CardDescription className="text-sm">Logic puzzles for debt payoff and investment portfolio building.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-violet-50 text-violet-600">Strategy Engine</Badge>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-primary" onClick={() => { setActiveGame(null); }}>
                  <ArrowRight className="h-4 w-4 rotate-180" /> Exit to Games Hub
                </Button>

                {activeGame === 'compound' && <CompoundClicker onExit={() => setActiveGame(null)} />}
                {activeGame === 'stock' && <StockMarketSim onExit={() => setActiveGame(null)} />}
                {activeGame === 'credit' && <CreditScoreBuilder onExit={() => setActiveGame(null)} />}
                {activeGame === 'blitz' && <BudgetBlitz onExit={() => setActiveGame(null)} />}
                {activeGame === 'finIQ' && <FinIQQuiz onExit={() => setActiveGame(null)} />}
                {activeGame === 'maze' && <MoneyMaze onExit={() => setActiveGame(null)} />}
                {activeGame === 'dailyIQ' && <FinIQQuiz isDailyChallenge onExit={() => setActiveGame(null)} />}
              </div>
            )}
          </div>

          {!activeGame && (
            <div className="lg:col-span-4">
              <XPWallet />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
