'use client';

import React, { useState } from 'react';
import { Quest, QuestChoice } from '@/data/quests';
import { useQuestEngine } from '@/hooks/useQuestEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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

export function QuestViewer({ quest, onComplete }: QuestViewerProps) {
  const { ageGroup } = useAgeAdapt();
  const { formatINR } = useCurrency();
  const { state, currentStep, progress, startQuest, resetQuest, makeChoice } = useQuestEngine(quest, ageGroup);
  
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

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

  const CategoryIcon = ({ category }: { category: Quest['category'] }) => {
    switch (category) {
      case 'housing': return <Home className="h-6 w-6" />;
      case 'debt': return <Phone className="h-6 w-6" />;
      case 'emergency': return <Heart className="h-6 w-6" />;
      case 'lifestyle': return <Plane className="h-6 w-6" />;
      default: return <Wallet className="h-6 w-6" />;
    }
  };

  if (state.status === 'INTRO') {
    return (
      <Card className="max-w-2xl mx-auto border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-primary p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <CategoryIcon category={quest.category} />
          </div>
          <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CategoryIcon category={quest.category} />
          </div>
          <CardTitle className="text-4xl font-black mb-2">{quest.title}</CardTitle>
          <p className="text-primary-foreground/80 text-lg">{quest.description}</p>
        </div>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Time</div>
              <div className="font-bold">{quest.estimatedMinutes}m</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Difficulty</div>
              <div className="font-bold capitalize">{quest.difficulty}</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Reward</div>
              <div className="font-bold text-teal-600">+{quest.xpReward} XP</div>
            </div>
          </div>
          
          <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-100 flex items-start gap-4">
            <Info className="h-6 w-6 text-amber-600 mt-1 shrink-0" />
            <p className="text-sm font-medium text-amber-900 leading-relaxed">
              <strong>Heads up:</strong> Your choices in this quest will directly impact your <strong>Financial Health Score</strong>. Choose wisely!
            </p>
          </div>

          <Button onClick={startQuest} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 gap-2">
            Begin Quest <ArrowRight className="h-6 w-6" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state.status === 'COMPLETE') {
    const starCount = state.optimalChoiceCount === quest.steps.length ? 3 : state.optimalChoiceCount >= quest.steps.length * 0.6 ? 2 : state.optimalChoiceCount >= quest.steps.length * 0.3 ? 1 : 0;

    return (
      <Card className="max-w-2xl mx-auto border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-emerald-500 p-12 text-white text-center">
          <Trophy className="h-16 w-16 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-black mb-4">Quest Complete!</h2>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <Star key={i} className={cn("h-10 w-10 fill-current transition-all duration-1000 delay-300", i <= starCount ? "text-yellow-300" : "text-emerald-400")} />
            ))}
          </div>
        </div>
        <CardContent className="p-10 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border text-center space-y-1">
              <div className="text-[10px] font-black uppercase text-slate-400">Total XP Earned</div>
              <div className="text-3xl font-black text-primary">+{state.totalXPEarned + quest.xpReward}</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border text-center space-y-1">
              <div className="text-[10px] font-black uppercase text-slate-400">Health Impact</div>
              <div className={cn("text-3xl font-black", state.totalHealthDelta >= 0 ? "text-emerald-600" : "text-rose-600")}>
                {state.totalHealthDelta > 0 ? '+' : ''}{state.totalHealthDelta}
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="font-bold text-slate-700">Net Wallet Impact:</span>
            </div>
            <span className={cn("text-xl font-black", state.totalWalletDelta >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {state.totalWalletDelta >= 0 ? '+' : '-'}{formatINR(Math.abs(state.totalWalletDelta))}
            </span>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={resetQuest} className="flex-1 h-14 font-bold gap-2" suppressHydrationWarning>
              <RotateCcw className="h-4 w-4" /> Play Again
            </Button>
            <Button onClick={onComplete} className="flex-1 h-14 text-lg font-black" suppressHydrationWarning>
              Finish Quest
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentStep) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Badge className="bg-primary px-4 py-1 text-sm font-black rounded-lg">Step {progress}%</Badge>
          <div className="flex items-center gap-2 text-primary font-black">
            <Zap className="h-4 w-4" /> {state.totalXPEarned} XP
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-slate-400">Quest Health</span>
          <div className="w-24 h-3 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-500", state.totalHealthDelta >= 0 ? "bg-emerald-500" : "bg-rose-500")}
              style={{ width: `${Math.min(100, Math.max(10, 50 + state.totalHealthDelta * 2))}%` }}
            />
          </div>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden">
        <div className="p-8 md:p-12 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{currentStep.title}</h2>
            <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-primary italic text-lg text-slate-700 leading-relaxed">
              "{currentStep.narrative}"
            </div>
            {currentStep.amount && (
              <div className="text-4xl font-black text-primary text-center py-4">
                {formatINR(currentStep.amount)}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {currentStep.choices.map((choice) => (
              <button
                key={choice.id}
                disabled={!!selectedChoiceId}
                onClick={() => handleChoiceSelect(choice.id)}
                suppressHydrationWarning
                className={cn(
                  "w-full p-6 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group",
                  !selectedChoiceId 
                    ? "hover:border-primary hover:bg-primary/5 border-slate-100" 
                    : choice.id === selectedChoiceId
                      ? choice.isOptimal 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 scale-[1.02] shadow-lg" 
                        : "bg-amber-50 border-amber-500 text-amber-900 scale-[1.02] shadow-lg"
                      : "opacity-40 grayscale"
                )}
              >
                <span className="text-lg font-bold">{choice.text}</span>
                {selectedChoiceId === choice.id && (
                  choice.isOptimal ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <XCircle className="h-6 w-6 text-amber-600" />
                )}
              </button>
            ))}
          </div>

          {selectedChoiceId && activeChoice && (
            <div className="animate-in slide-in-from-top-4 duration-500 space-y-8">
              <div className="space-y-4">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-2">Consequence</div>
                  <p className="font-bold text-slate-800 text-xl">"{activeChoice.consequence}"</p>
                </div>
                
                <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/10 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest">
                    <Info className="h-4 w-4" /> The Lesson
                  </div>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    {activeChoice.explanation}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">XP</span>
                    <span className="font-black text-primary">+{activeChoice.xpDelta}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Health</span>
                    <span className={cn("font-black", activeChoice.healthDelta >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {activeChoice.healthDelta > 0 ? '+' : ''}{activeChoice.healthDelta}
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={handleNext} className="w-full h-16 text-2xl font-black rounded-2xl gap-2 group" suppressHydrationWarning>
                {activeChoice.nextStepId === 'end' ? 'Complete Quest' : 'Continue'} 
                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
