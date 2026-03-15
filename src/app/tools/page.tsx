'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { db, safeUpdateDoc, safeGetDoc } from '@/firebase';
import { doc, arrayUnion } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
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
import dynamic from 'next/dynamic';
import { awardBadge } from '@/lib/badgeService';

const EMICalculator = dynamic(() => import('@/components/tools/EMICalculator').then(mod => mod.EMICalculator), { ssr: false });
const CompoundVisualiser = dynamic(() => import('@/components/tools/CompoundVisualiser').then(mod => mod.CompoundVisualiser), { ssr: false });
const SavingsGoalTracker = dynamic(() => import('@/components/tools/SavingsGoalTracker').then(mod => mod.SavingsGoalTracker), { ssr: false });
const SIPCalculator = dynamic(() => import('@/components/tools/SIPCalculator').then(mod => mod.SIPCalculator), { ssr: false });

type ToolId = 'emi' | 'compound' | 'savings' | 'sip';

export default function ToolsHub() {
  const { user } = useAuthContext();
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    const isOpening = activeTool !== id;
    setActiveTool(isOpening ? id : null);
    
    if (isOpening) {
      setTimeout(() => {
        scrollRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }

    if (user && isOpening && !toolsUsed.includes(id)) {
      const userRef = doc(db, 'users', user.uid);
      const newToolsUsed = [...toolsUsed, id];
      
      await safeUpdateDoc(userRef, {
        toolsUsed: arrayUnion(id)
      });

      await safeUpdateDoc(doc(db, 'users', user.uid, 'progression', 'stats'), {
        totalXP: arrayUnion(10)
      });
      
      setToolsUsed(newToolsUsed);

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
      description: 'See how small amounts grow into massive wealth.',
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
      description: 'Set targets for big purchases and track your progress.',
      icon: Target,
      color: 'bg-amber-500',
      component: <SavingsGoalTracker />
    }
  ];

  return (
    <div className="min-h-screen-safe bg-slate-50 pb-24 md:pb-8">
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase mb-2">
            <Wrench className="h-3 w-3" /> Financial Utilities
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Financial Tools</h1>
          <p className="text-slate-500 text-sm md:text-lg font-medium">Real-world calculators to help you master your future money.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              ref={el => scrollRefs.current[tool.id] = el}
              className="scroll-mt-4"
            >
              <Card 
                className={cn(
                  "transition-all duration-300 border-none shadow-md overflow-hidden flex flex-col",
                  activeTool === tool.id ? "ring-2 ring-primary shadow-xl md:col-span-2" : "hover:shadow-lg"
                )}
              >
                <div className="flex items-center justify-between p-4 md:p-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0", tool.color)}>
                      <tool.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">{tool.name}</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-medium line-clamp-1">{tool.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleOpenTool(tool.id)}
                    className={cn(
                      "flex items-center gap-2 font-black uppercase text-[9px] md:text-[10px] tracking-widest px-4 md:px-6 h-11 rounded-xl border-2 transition-all shrink-0",
                      activeTool === tool.id ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-primary text-white border-primary"
                    )}
                    suppressHydrationWarning
                  >
                    {activeTool === tool.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {activeTool === tool.id && (
                  <div className="border-t bg-white animate-in slide-in-from-top-4 duration-500">
                    {tool.component}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>

        <section className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="h-24 w-24 md:h-32 md:w-32" />
          </div>
          <div className="relative z-10 space-y-4 max-w-2xl">
            <h3 className="text-xl md:text-2xl font-black">Why use these tools?</h3>
            <p className="text-xs md:text-base text-slate-400 leading-relaxed font-medium">
              Calculators help you see the mathematical truth behind money. Whether it is seeing how much a bank really charges you for a loan, or how much your money can become in 20 years, these tools give you the power to make data-backed decisions.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}