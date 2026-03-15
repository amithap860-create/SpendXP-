'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { db, safeUpdateDoc, safeGetDoc } from '@/firebase';
import { doc, arrayUnion } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  Coins, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EMICalculator } from '@/components/tools/EMICalculator';
import { CompoundVisualiser } from '@/components/tools/CompoundVisualiser';
import { SavingsGoalTracker } from '@/components/tools/SavingsGoalTracker';
import { SIPCalculator } from '@/components/tools/SIPCalculator';
import { awardBadge } from '@/lib/badgeService';

type ToolId = 'emi' | 'compound' | 'savings' | 'sip';

export default function ToolsHub() {
  const { user } = useAuthContext();
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchToolsUsed = async () => {
      const snap = await safeGetDoc(doc(db, 'users', user.uid));
      if (snap?.toolsUsed) {
        setToolsUsed(snap.toolsUsed);
      }
    };
    fetchToolsUsed();
  }, [user]);

  const handleOpenTool = async (id: ToolId) => {
    setActiveTool(activeTool === id ? null : id);
    
    if (user && !toolsUsed.includes(id)) {
      const userRef = doc(db, 'users', user.uid);
      const newToolsUsed = [...toolsUsed, id];
      
      await safeUpdateDoc(userRef, {
        toolsUsed: arrayUnion(id)
      });

      // Award XP for first use of any tool
      await safeUpdateDoc(doc(db, 'users', user.uid, 'progression', 'stats'), {
        totalXP: arrayUnion(10)
      });
      
      setToolsUsed(newToolsUsed);

      // Check for explorer badge
      if (newToolsUsed.length === 4) {
        await awardBadge(user.uid, 'tool_explorer');
      }
    }
  };

  const tools = [
    {
      id: 'emi' as ToolId,
      name: 'EMI Calculator',
      description: 'Plan your loans and see the true cost of interest.',
      icon: Calculator,
      color: 'bg-blue-500',
      component: <EMICalculator />
    },
    {
      id: 'compound' as ToolId,
      name: 'Wealth Visualiser',
      description: 'See how small amounts grow into massive wealth over time.',
      icon: TrendingUp,
      color: 'bg-teal-500',
      component: <CompoundVisualiser />
    },
    {
      id: 'sip' as ToolId,
      name: 'SIP Calculator',
      description: 'Calculate returns for monthly mutual fund investments.',
      icon: Coins,
      color: 'bg-indigo-500',
      component: <SIPCalculator />
    },
    {
      id: 'savings' as ToolId,
      name: 'Goal Tracker',
      description: 'Set targets for what you want to buy and track your progress.',
      icon: Target,
      color: 'bg-amber-500',
      component: <SavingsGoalTracker />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase mb-2">
            <Wrench className="h-3 w-3" /> Financial Utilities
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Tools</h1>
          <p className="text-slate-500 text-lg font-medium">Real-world calculators to help you master your future money.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <Card 
              key={tool.id} 
              className={cn(
                "transition-all duration-300 border-none shadow-md overflow-hidden flex flex-col",
                activeTool === tool.id ? "ring-2 ring-primary shadow-xl md:col-span-2" : "hover:shadow-lg"
              )}
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg", tool.color)}>
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{tool.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">{tool.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleOpenTool(tool.id)}
                  className={cn(
                    "flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-xl border-2 transition-all",
                    activeTool === tool.id ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-primary text-white border-primary"
                  )}
                  suppressHydrationWarning
                >
                  {activeTool === tool.id ? (
                    <>Close <ChevronUp className="h-4 w-4" /></>
                  ) : (
                    <>Open Tool <ChevronDown className="h-4 w-4" /></>
                  )}
                </button>
              </div>

              {activeTool === tool.id && (
                <div className="border-t bg-white animate-in slide-in-from-top-4 duration-500">
                  {tool.component}
                </div>
              )}
            </Card>
          ))}
        </div>

        <section className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="h-32 w-32" />
          </div>
          <div className="relative z-10 space-y-4 max-w-2xl">
            <h3 className="text-2xl font-black">Why use these tools?</h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              Calculators help you see the mathematical truth behind money. Whether it is seeing how much a bank really charges you for a loan, or how much your ₹1,000 can become in 20 years, these tools give you the power to make data-backed decisions.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
