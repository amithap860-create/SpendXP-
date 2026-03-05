"use client"

import { useState } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  PiggyBank, 
  Target, 
  Trophy, 
  Plus, 
  PartyPopper,
  Coins
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SavingsTracker() {
  const { savingsCurrent, savingsGoal, updateSavings, setSavingsGoal, balance, formatValue, convertToCurrent, convertFromCurrent } = useUser();
  const { toast } = useToast();
  const [addAmount, setAddAmount] = useState('10');
  const [newGoal, setNewGoal] = useState(convertToCurrent(savingsGoal).toFixed(0));

  const progress = Math.min(100, (savingsCurrent / savingsGoal) * 100);
  const isComplete = progress >= 100;

  const handleAddSavings = () => {
    const amountCurrent = parseFloat(addAmount);
    if (isNaN(amountCurrent) || amountCurrent <= 0) return;
    const amountUsd = convertFromCurrent(amountCurrent);
    if (balance < amountUsd) {
      toast({ title: "Oops!", description: "You don't have enough in your virtual wallet.", variant: "destructive" });
      return;
    }
    updateSavings(amountUsd);
    toast({ title: "Savings Boosted!", description: `Added ${formatValue(amountUsd)} to your piggy bank.` });
    if (savingsCurrent + amountUsd >= savingsGoal) {
      toast({ title: "GOAL REACHED! 🏆", description: "You've crushed your savings goal!" });
    }
  };

  const handleUpdateGoal = () => {
    const goalCurrent = parseFloat(newGoal);
    if (isNaN(goalCurrent) || goalCurrent <= 0) return;
    const goalUsd = convertFromCurrent(goalCurrent);
    setSavingsGoal(goalUsd);
    toast({ title: "Goal Updated", description: `Your new target is ${formatValue(goalUsd)}.` });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-primary">Savings Lab</h2>
          <p className="text-muted-foreground">Every dollar saved is a step towards your dreams.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <div className="bg-accent p-8 flex flex-col items-center text-white relative overflow-hidden">
               <div className="absolute -right-8 -bottom-8 opacity-20">
                <PiggyBank className="h-48 w-48 rotate-12" />
               </div>
               
               {isComplete && (
                 <div className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in duration-500">
                    <PartyPopper className="h-16 w-16 mb-4 animate-bounce" />
                    <h3 className="text-3xl font-extrabold mb-2">MISSION ACCOMPLISHED!</h3>
                    <p className="text-lg opacity-80 mb-6">You've saved enough for your goal.</p>
                    <Button onClick={() => setSavingsGoal(savingsGoal + 500)} variant="secondary" className="font-bold">Set Next Challenge</Button>
                 </div>
               )}

               <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center mb-6">
                <PiggyBank className="h-12 w-12" />
               </div>
               <h3 className="text-xl font-bold mb-2">Current Piggy Bank</h3>
               <div className="text-4xl font-black mb-4">{formatValue(savingsCurrent)}</div>
               <div className="text-sm font-medium opacity-80">of {formatValue(savingsGoal)} Target</div>
            </div>
            
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-primary uppercase">Savings Progress</span>
                  <span className="text-3xl font-black text-accent">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-4 bg-secondary" />
              </div>

              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Transfer from Wallet</label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={addAmount} 
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="h-12 rounded-xl border-2 focus:border-accent"
                      suppressHydrationWarning
                    />
                    <Button onClick={handleAddSavings} className="h-12 px-6 rounded-xl font-bold gap-2">
                      <Plus className="h-4 w-4" /> Save Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Define Your Mission
                </CardTitle>
                <CardDescription>What are you saving for? Set your target amount below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={newGoal} 
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="h-12"
                    suppressHydrationWarning
                  />
                  <Button onClick={handleUpdateGoal} variant="outline" className="h-12">Update Goal</Button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {[
                    { label: 'Video Game', amountUsd: 60 },
                    { label: 'New Shoes', amountUsd: 120 },
                    { label: 'Tablet', amountUsd: 450 },
                    { label: 'College Fund', amountUsd: 10000 }
                  ].map(preset => (
                    <Button 
                      key={preset.label} 
                      variant="ghost" 
                      className="justify-start h-auto p-4 border border-secondary hover:bg-secondary rounded-xl flex flex-col items-start gap-1"
                      onClick={() => {
                        const currentVal = convertToCurrent(preset.amountUsd);
                        setNewGoal(currentVal.toFixed(0));
                      }}
                    >
                      <span className="text-xs text-muted-foreground font-bold uppercase">{preset.label}</span>
                      <span className="text-lg font-bold">{formatValue(preset.amountUsd)}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-secondary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Savings Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-4 gap-4">
                {[
                  { icon: Coins, name: 'Starter', active: true },
                  { icon: Target, name: 'Focused', active: progress >= 25 },
                  { icon: PiggyBank, name: 'Stoic', active: progress >= 50 },
                  { icon: Trophy, name: 'Master', active: progress >= 100 },
                ].map((badge, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${badge.active ? 'bg-white border-accent text-accent' : 'bg-white/50 border-dashed border-slate-300 text-slate-300'}`}>
                      <badge.icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${badge.active ? 'text-primary' : 'text-slate-400'}`}>{badge.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
