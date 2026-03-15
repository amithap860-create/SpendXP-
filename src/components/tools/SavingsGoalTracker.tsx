'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { db, useCollection, useMemoFirebase, safeSetDoc, safeUpdateDoc } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, doc, increment, deleteDoc, Timestamp } from 'firebase/firestore';
import { useCurrency } from '@/hooks/useCurrency';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CheckCircle2, AlertTriangle, PartyPopper } from 'lucide-react';
import { validateDisplayName } from '@/firebase';
import { cn } from '@/lib/utils';

type GoalShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'pentagon' | 'star' | 'bolt';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  monthlyContribution: number;
  shape: GoalShape;
  color: string;
}

const PRESET_SHAPES: { shape: GoalShape; color: string; label: string }[] = [
  { shape: 'circle', color: 'bg-teal-500', label: 'Emergency' },
  { shape: 'square', color: 'bg-blue-500', label: 'Tech' },
  { shape: 'triangle', color: 'bg-amber-500', label: 'Travel' },
  { shape: 'diamond', color: 'bg-rose-500', label: 'Big Purchase' },
  { shape: 'hexagon', color: 'bg-indigo-500', label: 'Education' },
  { shape: 'pentagon', color: 'bg-purple-500', label: 'Gifts' },
  { shape: 'star', color: 'bg-yellow-500', label: 'Dream' },
  { shape: 'bolt', color: 'bg-emerald-500', label: 'Investment' },
];

export function SavingsGoalTracker() {
  const { user } = useAuthContext();
  const { formatINR } = useCurrency();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newShape, setNewShape] = useState<GoalShape>('circle');
  const [newColor, setNewColor] = useState('bg-teal-500');
  
  const [addingFundsTo, setAddingFundsTo] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');

  const goalsQuery = useMemoFirebase(() => {
    return user ? query(collection(db, 'users', user.uid, 'savingsGoals'), orderBy('createdAt', 'desc')) : null;
  }, [user]);
  const { data: goals, isLoading } = useCollection<SavingsGoal>(goalsQuery);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || goals!.length >= 5) return;

    const val = validateDisplayName(newName);
    if (!val.valid) return;

    const target = Number(newTarget);
    if (isNaN(target) || target <= 0) return;

    const goalId = crypto.randomUUID();
    const targetD = new Date(newDate);
    const today = new Date();
    const months = Math.max(1, (targetD.getFullYear() - today.getFullYear()) * 12 + (targetD.getMonth() - today.getMonth()));
    
    await safeSetDoc(doc(db, 'users', user.uid, 'savingsGoals', goalId), {
      id: goalId,
      name: newName,
      targetAmount: target,
      savedAmount: 0,
      targetDate: newDate,
      monthlyContribution: Math.round(target / months),
      shape: newShape,
      color: newColor,
      createdAt: serverTimestamp()
    });

    setIsAdding(false);
    setNewName('');
    setNewTarget('');
    setNewDate('');
  };

  const handleAddFunds = async (goalId: string) => {
    if (!user) return;
    const amount = Number(fundAmount);
    if (isNaN(amount) || amount <= 0) return;

    await safeUpdateDoc(doc(db, 'users', user.uid, 'savingsGoals', goalId), {
      savedAmount: increment(amount)
    });

    setAddingFundsTo(null);
    setFundAmount('');
  };

  const ShapeIcon = ({ shape, color, className }: { shape: GoalShape; color: string; className?: string }) => (
    <div className={cn("shrink-0", color, className, {
      "rounded-full": shape === 'circle',
      "rounded-lg": shape === 'square',
      "clip-path-triangle": shape === 'triangle',
      "clip-path-diamond": shape === 'diamond',
      "clip-path-hexagon": shape === 'hexagon',
    })} style={{
      clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                shape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
                shape === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                undefined
    }} />
  );

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black">My Active Goals ({goals?.length || 0}/5)</h3>
        {goals && goals.length < 5 && !isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2" suppressHydrationWarning>
            <Plus className="h-4 w-4" /> New Goal
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-6 border-2 border-dashed bg-slate-50">
          <form onSubmit={handleAddGoal} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>What are you saving for?</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New Laptop" required suppressHydrationWarning />
              </div>
              <div className="space-y-2">
                <Label>Target Amount (₹)</Label>
                <Input type="number" value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="50000" required suppressHydrationWarning />
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} suppressHydrationWarning />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Pick an Icon</Label>
              <div className="flex flex-wrap gap-3">
                {PRESET_SHAPES.map(p => (
                  <button 
                    key={p.label}
                    type="button"
                    onClick={() => { setNewShape(p.shape); setNewColor(p.color); }}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all",
                      newShape === p.shape ? "border-primary bg-white shadow-md scale-110" : "border-transparent bg-slate-100 grayscale opacity-50"
                    )}
                    suppressHydrationWarning
                  >
                    <ShapeIcon shape={p.shape} color={p.color} className="h-6 w-6" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setIsAdding(false)} suppressHydrationWarning>Cancel</Button>
              <Button type="submit" className="px-8 font-black" suppressHydrationWarning>Add Mission</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-6">
        {goals?.map(goal => {
          const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100);
          const isReached = goal.savedAmount >= goal.targetAmount;
          const isLate = new Date(goal.targetDate) < new Date() && !isReached;

          return (
            <Card key={goal.id} className="p-6 overflow-hidden relative border-none shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <ShapeIcon shape={goal.shape} color={goal.color} className="h-12 w-12" />
                  <div>
                    <h4 className="text-xl font-black text-slate-900">{goal.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target: {goal.targetDate}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500" onClick={() => deleteDoc(doc(db, 'users', user!.uid, 'savingsGoals', goal.id))} suppressHydrationWarning><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-black text-primary">{formatINR(goal.savedAmount)} <span className="text-sm font-medium text-slate-400">/ {formatINR(goal.targetAmount)}</span></div>
                  <div className={cn("text-lg font-black", isReached ? "text-emerald-500" : "text-primary")}>{progress}%</div>
                </div>
                <Progress value={progress} className="h-2" />
                
                <div className="flex items-center justify-between text-xs font-bold">
                  {isReached ? (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"><CheckCircle2 className="h-3 w-3" /> Mission Accomplished!</div>
                  ) : isLate ? (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full"><AlertTriangle className="h-3 w-3" /> Past target date</div>
                  ) : (
                    <div className="text-slate-500">Need {formatINR(goal.monthlyContribution)} / month</div>
                  )}
                  
                  {!isReached && (
                    <Button variant="link" onClick={() => setAddingFundsTo(goal.id)} className="h-auto p-0 font-black text-primary" suppressHydrationWarning>Add Savings →</Button>
                  )}
                </div>
              </div>

              {addingFundsTo === goal.id && (
                <div className="mt-6 pt-6 border-t animate-in slide-in-from-top-2 duration-300">
                  <div className="flex gap-2">
                    <Input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="₹ Amount" className="h-12" suppressHydrationWarning />
                    <Button onClick={() => handleAddFunds(goal.id)} className="h-12 font-black px-8" suppressHydrationWarning>Save</Button>
                    <Button variant="ghost" onClick={() => setAddingFundsTo(null)} className="h-12" suppressHydrationWarning>Cancel</Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {goals?.length === 0 && !isAdding && (
          <div className="py-20 text-center space-y-4">
            <Target className="h-16 w-16 text-slate-200 mx-auto" />
            <div>
              <p className="text-lg font-black text-slate-400 uppercase tracking-widest">No Active Missions</p>
              <p className="text-sm text-slate-400">Add a goal like a "New Phone" or "Bike" to start tracking.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
