"use client"

import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  TrendingUp, 
  PiggyBank, 
  Zap, 
  Star,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { ageGroup, balance, portfolio, savingsCurrent, savingsGoal, formatValue } = useUser();

  const savingsProgress = Math.min(100, (savingsCurrent / savingsGoal) * 100);
  const portfolioValueUsd = portfolio.reduce((acc, item) => acc + (item.shares * 150), 0); // Simulated current price in USD
  
  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase">
              {ageGroup} MODE
            </span>
          </div>
          <h2 className="text-3xl font-bold text-primary">Welcome back, Strategist!</h2>
          <p className="text-muted-foreground">You're making great progress on your financial goals.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-primary text-white overflow-hidden relative border-none">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="h-24 w-24" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">Virtual Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatValue(balance)}</div>
              <p className="text-xs text-primary-foreground/60 mt-1">Available for investing</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Portfolio Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatValue(portfolioValueUsd)}</div>
              <div className="flex items-center gap-1 text-emerald-500 text-xs mt-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>+12.4% all time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
              <PiggyBank className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">{formatValue(savingsCurrent)}</div>
                <div className="text-[10px] text-muted-foreground">of {formatValue(savingsGoal)}</div>
              </div>
              <Progress value={savingsProgress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Skills Mastery
              </CardTitle>
              <CardDescription>Your learning path based on your age group.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: 'Income Basics', progress: 100 },
                { name: 'Smart Spending', progress: 75 },
                { name: 'Stock Market 101', progress: 30 },
                { name: 'Index Fund Strategy', progress: 0 }
              ].map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.progress}%</span>
                  </div>
                  <Progress value={skill.progress} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" />
                Recommended Activity
              </CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 space-y-4">
              <div className="p-4 rounded-xl bg-secondary border border-primary/10 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold">Virtual Market Simulation</h4>
                  <p className="text-xs text-muted-foreground">Try investing in fictional companies today!</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border border-accent/10 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold">Daily Flashcards</h4>
                  <p className="text-xs text-muted-foreground">Learn 5 new concepts tailored for your age.</p>
                </div>
              </div>

              <Link href="/market" className="block text-center text-primary font-bold text-sm mt-4 hover:underline">
                View all activities
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
