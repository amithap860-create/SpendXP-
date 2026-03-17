'use client';

import React, { useState } from 'react';
import type { Quest } from '@/data/quests';
import { useQuestEngine } from '@/hooks/useQuestEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ConceptBreakdown } from '@/components/ConceptBreakdown';
import { 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Zap, 
  Wallet, 
  Heart, 
  Home, 
  Plane, 
  Phone,
  Star,
  Info,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestViewerProps {
  quest: Quest;
  onComplete: () => void;
}

export default function QuestViewer({ quest, onComplete }: QuestViewerProps) {
  const { ageGroup } = useAgeAdapt();
  const { formatINR } = useCurrency();
  const { state, currentStep, progress, startQuest, resetQuest, makeChoice } = useQuestEngine(quest, ageGroup);
  
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const activeChoice = currentStep?.choices.find(c => c.id === selectedChoiceId);

  const handleChoiceSelect = (choiceId: string) => {
    if (selectedChoiceId) return;
    setSelectedChoiceId(choiceId);
  };

  const handleNext = () => {
    if (!selectedChoiceId) return;
    makeChoice(selectedChoiceId);
    setSelectedChoiceId(null);
  };

  const CategoryIcon = ({ category, className }: { category: Quest['category'], className?: string }) => {
    switch (category) {
      case 'housing': return <Home className={className} />;
      case 'debt': return <Phone className={className} />;
      case 'emergency': return <Heart className={className} />;
      case 'lifestyle': return <Plane className={className} />;
      default: return <Wallet className={className} />;
    }
  };

  const questToBreakdownMap: Record<string, string> = {
    'first-paycheck': 'first-job-salary',
    'renting-apartment': 'renting-housing',
    'buying-phone-emi': 'emi-and-debt',
    'emergency-fund': 'emergency-fund',
    'vacation-planning': 'vacation-planning',
    'first-credit-card': 'credit-cards'
  };

  if (showBreakdown) {
    return (
      <ConceptBreakdown
        breakdownId={questToBreakdownMap[quest.id] || 'budgeting-basics'}
        ageGroup={ageGroup}
        activityType="quest"
        activityTitle={quest.title}
        onContinue={() => setShowBreakdown(false)}
      />
    );
  }

  if (state.status === 'INTRO') {
    return (
      <div className="flex-1 flex flex-col p-4 md:p-8 animate-in fade-in zoom-in duration-500">
        <Card className="max-w-2xl w-full mx-auto border-none shadow-2xl overflow-hidden flex flex-col h-full md:h-auto">
          <div className="bg-primary p-8 md:p-10 text-white text-center relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
              <CategoryIcon category={quest.category} className="h-20 w-20 md:h-32 md:w-32" />
            </div>
            <div className="h-14 w-14 md:h-16 md:w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CategoryIcon category={quest.category} className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-black mb-2 leading-tight">{quest.title}</CardTitle>
            <p className="text-primary-foreground/80 text-sm md:text-lg">{quest.description}</p>
          </div>
          <CardContent className="p-6 md:p-10 space-y-8 flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="text-center p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Time</div>
                <div className="font-bold text-xs md:text-base">{quest.estimatedMinutes}m</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Level</div>
                <div className="font-bold text-xs md:text-base capitalize">{quest.difficulty}</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Reward</div>
                <div className="font-bold text-xs md:text-base text-teal-600">+{quest.xpReward} XP</div>
              </div>
            </div>
            
            <div className="p-5 md:p-6 bg-amber-50 rounded-2xl border-2 border-amber-100 flex items-start gap-4">
              <Info className="h-5 w-5 md:h-6 md:w-6 text-amber-600 mt-1 shrink-0" />
              <p className="text-xs md:text-sm font-medium text-amber-900 leading-relaxed">
                <strong>Heads up:</strong> Your choices here directly impact your <strong>Financial Health Score</strong>. Choose wisely!
              </p>
            </div>

            <div className="mt-auto md:mt-0 pt-4">
              <Button onClick={startQuest} className="w-full h-14 md:h-16 text-lg md:text-xl font-black rounded-2xl shadow-xl shadow-primary/20 gap-2 min-h-[44px]">
                Begin Quest <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.status === 'COMPLETE') {
    const starCount = state.optimalChoiceCount === filteredSteps.length ? 3 : state.optimalChoiceCount >= filteredSteps.length * 0.6 ? 2 : state.optimalChoiceCount >= filteredSteps.length * 0.3 ? 1 : 0;

    return (
      <div className="flex-1 flex flex-col p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="max-w-2xl w-full mx-auto border-none shadow-2xl overflow-hidden flex flex-col h-full md:h-auto">
          <div className="bg-emerald-500 p-8 md:p-12 text-white text-center shrink-0">
            <Trophy className="h-14 w-14 md:h-16 md:w-16 mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl md:text-4xl font-black mb-4">Quest Complete!</h2>
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map(i => (
                <Star key={i} className={cn("h-8 w-8 md:h-10 md:w-10 fill-current transition-all duration-1000 delay-300", i <= starCount ? "text-yellow-300" : "text-emerald-400")} />
              ))}
            </div>
          </div>
          <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 md:p-6 bg-slate-50 rounded-2xl border text-center space-y-1">
                <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400">Total XP</div>
                <div className="text-2xl md:text-3xl font-black text-primary">+{state.totalXPEarned + quest.xpReward}</div>
              </div>
              <div className="p-4 md:p-6 bg-slate-50 rounded-2xl border text-center space-y-1">
                <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400">Health Impact</div>
                <div className={cn("text-2xl md:text-3xl font-black", state.totalHealthDelta >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {state.totalHealthDelta > 0 ? '+' : ''}{state.totalHealthDelta}
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6 bg-primary/5 rounded-2xl border-2 border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                <span className="font-bold text-slate-700 text-sm md:text-base">Wallet Impact:</span>
              </div>
              <span className={cn("text-lg md:text-xl font-black", state.totalWalletDelta >= 0 ? "text-emerald-600" : "text-rose-600")}>
                {state.totalWalletDelta >= 0 ? '+' : '-'}{formatINR(Math.abs(state.totalWalletDelta))}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-4">
              <Button variant="outline" onClick={resetQuest} className="h-14 font-bold gap-2 order-2 md:order-1 min-h-[44px]" suppressHydrationWarning>
                <RotateCcw className="h-4 w-4" /> Replay
              </Button>
              <Button onClick={onComplete} className="flex-1 h-14 md:h-16 text-lg font-black order-1 md:order-2 min-h-[44px]" suppressHydrationWarning>
                Back to Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredSteps = quest.steps.filter(step => step.ageGroups.includes(ageGroup));

  if (!currentStep) return null;

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 md:gap-6 min-h-screen-safe overflow-y-auto" style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary px-3 py-1 text-[10px] md:text-sm font-black rounded-lg">{progress}% Complete</Badge>
          <div className="flex items-center gap-1 text-primary font-black text-xs md:text-base">
            <Zap className="h-3 w-3 md:h-4 md:w-4" /> {state.totalXPEarned}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400">Health</span>
          <div className="w-16 md:w-24 h-2 md:h-3 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-500", state.totalHealthDelta >= 0 ? "bg-emerald-500" : "bg-rose-500")}
              style={{ width: `${Math.min(100, Math.max(10, 50 + state.totalHealthDelta * 2))}%` }}
            />
          </div>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden flex flex-col flex-1">
        <div className="p-6 md:p-12 space-y-6 md:space-y-8 flex-1 flex flex-col">
          <div className="space-y-4 shrink-0">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">{currentStep.title}</h2>
            <div className="p-4 md:p-6 bg-slate-50 rounded-2xl border-l-4 border-primary italic text-base md:text-lg text-slate-700 leading-relaxed max-h-[35dvh] overflow-y-auto">
              "{currentStep.narrative}"
            </div>
            {currentStep.amount && (
              <div className="text-3xl md:text-4xl font-black text-primary text-center py-2">
                {formatINR(currentStep.amount)}
              </div>
            )}
          </div>

          <div className="grid gap-3 md:gap-4">
            {currentStep.choices.map((choice) => (
              <button
                key={choice.id}
                disabled={!!selectedChoiceId}
                onClick={() => handleChoiceSelect(choice.id)}
                suppressHydrationWarning
                className={cn(
                  "w-full min-h-[64px] p-4 md:p-6 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group",
                  !selectedChoiceId 
                    ? "hover:border-primary hover:bg-primary/5 border-slate-100" 
                    : choice.id === selectedChoiceId
                      ? choice.isOptimal 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 scale-[1.02] shadow-lg" 
                        : "bg-amber-50 border-amber-500 text-amber-900 scale-[1.02] shadow-lg"
                      : "opacity-40 grayscale"
                )}
              >
                <span className="text-sm md:text-lg font-bold pr-4">{choice.text}</span>
                {selectedChoiceId === choice.id && (
                  choice.isOptimal ? <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-emerald-600 shrink-0" /> : <XCircle className="h-5 w-5 text-amber-600 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {selectedChoiceId && activeChoice && (
            <div className="animate-in slide-in-from-top-4 duration-500 space-y-6 md:space-y-8 mt-4">
              <div className="space-y-4">
                <div className="p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Result</div>
                  <p className="font-bold text-slate-800 text-base md:text-xl">"{activeChoice.consequence}"</p>
                </div>
                
                <div className="p-4 md:p-6 bg-primary/5 rounded-2xl border-2 border-primary/10 space-y-2">
                  <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase text-primary tracking-widest">
                    <div className="h-3 w-3 md:h-4 md:w-4 bg-primary rounded-full flex items-center justify-center"><div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-white rounded-full" /></div>
                    Lesson
                  </div>
                  <p className="text-[11px] md:text-sm font-medium text-slate-600 leading-relaxed">
                    {activeChoice.explanation}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4 pb-2">
                <Button onClick={handleNext} className="w-full h-14 md:h-16 text-lg md:text-xl font-black rounded-2xl gap-2 group min-h-[44px]" suppressHydrationWarning>
                  {activeChoice.nextStepId === 'end' ? 'Complete Quest' : 'Continue'} 
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
