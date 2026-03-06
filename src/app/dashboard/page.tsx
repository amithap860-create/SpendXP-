
"use client"

import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  TrendingUp, 
  PiggyBank, 
  Zap, 
  Star,
  ArrowUpRight,
  CircleCheckBig,
  Lock,
  LoaderCircle
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { 
    ageGroup, 
    balance, 
    getPortfolioValue, 
    savingsCurrent, 
    savingsGoal, 
    formatValue, 
    xp, 
    level, 
    tasks,
    isInitialLoading 
  } = useUser();

  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <main className="flex-1 flex items-center justify-center">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  // Ensure tasks is always an array before operating on it
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const savingsProgress = Math.min(100, (savingsCurrent / (savingsGoal || 1)) * 100);
  const portfolioValueUsd = typeof getPortfolioValue === 'function' ? getPortfolioValue() : 0;
  
  const xpInCurrentLevel = (xp || 0) % 500;
  const levelProgress = (xpInCurrentLevel / 500) * 100;
  
  const completedTasksCount = safeTasks.filter(t => t?.completed).length;
  const totalTasksCount = safeTasks.length;
  const taskProgress = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase">
                {ageGroup} MODE
              </span>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                LEVEL {level || 1}
              </Badge>
            </div>
            <h2 className="text-3xl font-bold text-primary">Welcome back, Strategist!</h2>
            <p className="text-muted-foreground">You've completed {completedTasksCount} of {totalTasksCount} starting missions.</p>
          </div>
          
          <div className="w-full md:w-64 space-y-2 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
              <span>Level {level || 1} Progress</span>
              <span>{xpInCurrentLevel}/500 XP</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>
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
              <div className="text-3xl font-bold">{formatValue(balance || 0)}</div>
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
                <span>Real-time Market Value</span>
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
                <div className="text-2xl font-bold">{formatValue(savingsCurrent || 0)}</div>
                <div className="text-[10px] text-muted-foreground">of {formatValue(savingsGoal || 0)} Target</div>
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
                Financial Missions
              </CardTitle>
              <CardDescription>Complete tasks to earn XP and level up your skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Overall Mission Progress</span>
                  <span>{Math.round(taskProgress)}%</span>
                </div>
                <Progress value={taskProgress} className="h-1.5" />
              </div>
              
              <div className="space-y-3">
                {safeTasks.map((task) => (
                  <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${task?.completed ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      {task?.completed ? (
                        <CircleCheckBig className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                      )}
                      <div>
                        <p className={`text-sm font-bold ${task?.completed ? 'text-emerald-900 line-through opacity-60' : 'text-slate-900'}`}>
                          {task?.title}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">{task?.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${task?.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-white'}`}>
                      +{task?.xpReward} XP
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" />
                Up Next
              </CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 space-y-4">
              <Link href="/market" className="block">
                <div className="p-4 rounded-xl bg-secondary border border-primary/10 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Virtual Market Simulation</h4>
                    <p className="text-xs text-muted-foreground">Try investing in fictional companies today!</p>
                  </div>
                </div>
              </Link>

              <Link href="/flashcards" className="block">
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/10 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Daily Flashcards</h4>
                    <p className="text-xs text-muted-foreground">Learn 5 new concepts tailored for your age.</p>
                  </div>
                </div>
              </Link>

              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-4 opacity-60 grayscale cursor-not-allowed">
                <div className="h-12 w-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold">Advanced Strategies</h4>
                  <p className="text-xs text-muted-foreground">Unlocks at Level 5</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
