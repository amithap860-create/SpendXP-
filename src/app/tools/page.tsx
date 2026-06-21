'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { db, safeUpdateDoc, safeGetDoc } from '@/firebase';
import { doc, arrayUnion, increment } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calculator,
  TrendingUp,
  Target,
  Coins,
  Sparkles,
  Wrench,
  ArrowRight,
  Info,
  MinusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { awardBadge } from '@/lib/badgeService';

const EMICalculator = dynamic(() => import('@/components/tools/EMICalculator').then(mod => mod.EMICalculator), { ssr: false });
const CompoundVisualiser = dynamic(() => import('@/components/tools/CompoundVisualiser').then(mod => mod.CompoundVisualiser), { ssr: false });
const SavingsGoalTracker = dynamic(() => import('@/components/tools/SavingsGoalTracker').then(mod => mod.SavingsGoalTracker), { ssr: false });
const SIPCalculator = dynamic(() => import('@/components/tools/SIPCalculator').then(mod => mod.SIPCalculator), { ssr: false });
const SWPCalculator = dynamic(() => import('@/components/tools/SWPCalculator').then(mod => mod.SWPCalculator), { ssr: false });

type ToolId = 'emi' | 'compound' | 'savings' | 'sip' | 'swp';

const TOOL_BADGE_THRESHOLD = 5;

export default function ToolsHub() {
  const { user } = useAuthContext();
  const [openTool, setOpenTool] = useState<ToolId | null>(null);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [infoTool, setInfoTool] = useState<ToolId | null>(null);

  useEffect(() => {
    document.title = 'Tools | SpendXP';
  }, []);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    if (!uid || uid.trim() === '') return;
    safeGetDoc(doc(db, 'users', uid)).then(snap => {
      if (snap?.toolsUsed) setToolsUsed(snap.toolsUsed);
    });
  }, [user]);

  const handleOpenTool = useCallback(async (id: ToolId) => {
    setOpenTool(id);

    if (user && !toolsUsed.includes(id)) {
      const uid = user.uid;
      if (!uid || uid.trim() === '') return;
      const newToolsUsed = [...toolsUsed, id];

      await safeUpdateDoc(doc(db, 'users', uid), { toolsUsed: arrayUnion(id) });
      await safeUpdateDoc(doc(db, 'users', uid, 'progression', 'stats'), { totalXP: increment(10) });

      setToolsUsed(newToolsUsed);
      if (newToolsUsed.length >= TOOL_BADGE_THRESHOLD) await awardBadge(uid, 'tool_explorer');
    }
  }, [user, toolsUsed]);

  const tools = [
    {
      id: 'emi' as ToolId,
      name: 'EMI Calculator',
      description: 'Plan your loans and see the true cost of interest.',
      info: "Use this to calculate your monthly EMI (Equated Monthly Instalment) for any loan — home, car, personal, or education. Enter the principal, interest rate, and duration to see exactly what you'll pay every month and the total interest cost.",
      icon: Calculator,
      color: 'bg-blue-500',
      component: <EMICalculator />,
    },
    {
      id: 'compound' as ToolId,
      name: 'Wealth Visualiser',
      description: 'See how small amounts grow into massive wealth.',
      info: 'Visualise the magic of compound interest. Enter any starting amount and watch how it multiplies over time. This shows you why starting to invest even small amounts early makes a huge difference by the time you retire.',
      icon: TrendingUp,
      color: 'bg-[#1A4A3A]',
      component: <CompoundVisualiser />,
    },
    {
      id: 'sip' as ToolId,
      name: 'SIP Calculator',
      description: 'Calculate returns for monthly mutual fund investments.',
      info: "A SIP (Systematic Investment Plan) means putting a fixed amount into a mutual fund every month. This calculator shows how much your SIP corpus will be worth after any number of years, including the optional annual step-up feature as your income grows.",
      icon: Coins,
      color: 'bg-primary',
      component: <SIPCalculator />,
    },
    {
      id: 'swp' as ToolId,
      name: 'SWP Calculator',
      description: 'Plan how long your investments can fund a monthly income.',
      info: "A SWP (Systematic Withdrawal Plan) is the reverse of a SIP — instead of depositing, you withdraw a fixed monthly amount from your corpus. This tool shows how long your retirement fund or investment corpus will last, and whether it can sustain your planned withdrawals forever.",
      icon: MinusCircle,
      color: 'bg-primary',
      component: <SWPCalculator />,
    },
    {
      id: 'savings' as ToolId,
      name: 'Goal Tracker',
      description: 'Set targets for big purchases and track your progress.',
      info: 'Set a savings goal — a phone, laptop, trip, or anything else — and track your progress. It calculates how much you need to save per month to hit your target on time, and shows you a visual progress bar as you go.',
      icon: Target,
      color: 'bg-secondary',
      component: <SavingsGoalTracker />,
    },
  ];

  const activeTool = tools.find(t => t.id === openTool);
  const activeInfoTool = tools.find(t => t.id === infoTool);

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

        {/* Tool cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className="border-none shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
              onClick={() => handleOpenTool(tool.id)}
            >
              <div className={cn('h-2', tool.color)} />
              <div className="flex items-center justify-between p-5 md:p-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={cn('h-11 w-11 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0', tool.color)}>
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{tool.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{tool.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setInfoTool(tool.id); }}
                    className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500 hover:text-primary"
                    aria-label={`Info about ${tool.name}`}
                    suppressHydrationWarning
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0', tool.color)}>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Card>
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

      {/* Tool info dialog */}
      <Dialog open={!!infoTool} onOpenChange={(open) => { if (!open) setInfoTool(null); }}>
        <DialogContent className="max-w-md">
          {activeInfoTool && (
            <>
              <DialogHeader>
                <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center text-white mb-3', activeInfoTool.color)}>
                  <activeInfoTool.icon className="h-6 w-6" />
                </div>
                <DialogTitle className="text-xl font-black">{activeInfoTool.name}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-600 leading-relaxed">{activeInfoTool.info}</p>
              <Button
                onClick={() => { setInfoTool(null); handleOpenTool(activeInfoTool.id); }}
                className="w-full mt-2"
                suppressHydrationWarning
              >
                Open {activeInfoTool.name}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Full-screen modal for active tool */}
      <Dialog open={!!openTool} onOpenChange={(open) => { if (!open) setOpenTool(null); }}>
        <DialogContent className="max-w-4xl w-full max-h-[90dvh] overflow-y-auto p-0 rounded-2xl">
          {activeTool && (
            <>
              <DialogHeader className={cn('px-6 py-4 text-white sticky top-0 z-10 rounded-t-2xl', activeTool.color)}>
                <DialogTitle className="flex items-center gap-3 text-xl font-black">
                  <activeTool.icon className="h-5 w-5" />
                  {activeTool.name}
                </DialogTitle>
                <p className="text-white/80 text-xs font-medium">{activeTool.description}</p>
              </DialogHeader>
              <div className="bg-white rounded-b-2xl">
                {activeTool.component}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
