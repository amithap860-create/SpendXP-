'use client';

import React, { useState, useEffect } from 'react';
import type { Quest } from '@/data/quests';
import { useQuestEngine } from '@/hooks/useQuestEngine';
import { useAgeAdapt } from '@/lib/ageAdaptProvider';
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
  Target,
  Star,
  Info,
  RotateCcw,
  ArrowUpRight,
  Lightbulb,
  History,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fireConfettiQuestComplete } from '@/lib/confetti';

interface QuestViewerProps {
  quest: Quest;
  onComplete: () => void;
}

export default function QuestViewer({ quest, onComplete }: QuestViewerProps) {
  const { ageGroup } = useAgeAdapt();
  const { formatValue } = useCurrency();
  const { state, currentStep, progress, startQuest, resetQuest, makeChoice } = useQuestEngine(quest, ageGroup);
  
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const activeChoice = currentStep?.choices.find(c => c.id === selectedChoiceId);
  const currentBalance = quest.startingBalance + state.totalWalletDelta;

  useEffect(() => {
    if (state.status === 'COMPLETE') {
      fireConfettiQuestComplete();
    }
  }, [state.status]);

  const handleChoiceSelect = (choiceId: string) => {
    if (selectedChoiceId) return;
    setSelectedChoiceId(choiceId);
  };

  const handleNext = () => {
    if (!selectedChoiceId) return;
    makeChoice(selectedChoiceId);
    setSelectedChoiceId(null);
  };

  const getBalanceColor = () => {
    const ratio = currentBalance / quest.startingBalance;
    if (currentBalance > quest.startingBalance) return 'text-emerald-600';
    if (currentBalance === quest.startingBalance) return 'text-slate-600';
    if (ratio > 0.5) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getHealthLabel = (score: number) => {
    if (score < 25) return 'At Risk';
    if (score < 50) return 'Developing';
    if (score < 75) return 'Stable';
    return 'Thriving';
  };

  if (showBreakdown) {
    return (
      <ConceptBreakdown
        breakdownId={quest.id === 'calculations-quest' ? 'investing-basics' : quest.id}
        ageGroup={ageGroup}
        activityType="quest"
        activityTitle={quest.title}
        onContinue={() => setShowBreakdown(false)}
      />
    );
  }

  if (state.status === 'INTRO') {
    return (
      <div className="flex-1 flex flex-col p-4 md:p-8 animate-in fade-in zoom-in duration-500 bg-slate-50 min-h-screen-safe">
        <Card className="max-w-2xl w-full mx-auto border-none shadow-2xl overflow-hidden">
          <div className="bg-primary p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
              <History className="h-32 w-32" />
            </div>
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-4">MISSION START</Badge>
            <CardTitle className="text-3xl md:text-5xl font-black mb-4 leading-tight">{quest.title}</CardTitle>
            <p className="text-primary-foreground/90 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">{quest.description}</p>
          </div>
          <CardContent className="p-8 md:p-12 space-y-10">
            <div className="grid grid-cols-3 gap-4">
              <StatPill label="Starting" val={formatValue(quest.startingBalance)} />
              <StatPill label="Difficulty" val={quest.difficulty} />
              <StatPill label="XP Reward" val={`+${quest.xpReward}`} />
            </div>
            
            <div className="p-6 md:p-8 bg-amber-50 rounded-3xl border-2 border-amber-100 flex items-start gap-5">
              <Info className="h-8 w-8 text-amber-600 shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="font-black text-amber-900">Mission Intel</h4>
                <p className="text-sm font-medium text-amber-800 leading-relaxed">
                  Every decision impacts your <strong>Real-Time Balance</strong>. Depleting your cash too early will lock out optimal choices in the final stages.
                </p>
              </div>
            </div>

            <Button onClick={startQuest} className="w-full h-16 md:h-20 text-xl md:text-2xl font-black rounded-3xl shadow-2xl shadow-primary/20 gap-3 group" suppressHydrationWarning>
              Accept Mission <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.status === 'COMPLETE') {
    const starCount = state.optimalChoiceCount >= quest.steps.length * 0.8 ? 3 : state.optimalChoiceCount >= quest.steps.length * 0.5 ? 2 : 1;

    return (
      <div className="flex-1 flex flex-col p-4 md:p-8 animate-in slide-in-from-bottom-8 duration-700 bg-slate-50 min-h-screen-safe overflow-y-auto">
        <Card className="max-w-4xl w-full mx-auto border-none shadow-2xl overflow-hidden mb-8">
          <div className="bg-emerald-500 p-8 md:p-12 text-white text-center">
            <Trophy className="h-16 w-16 mx-auto mb-6 animate-bounce" />
            <h2 className="text-4xl md:text-6xl font-black mb-6">Mission Success</h2>
            <div className="flex justify-center gap-3">
              {[1, 2, 3].map(i => (
                <Star key={i} className={cn("h-10 w-10 md:h-14 md:w-14 fill-current", i <= starCount ? "text-yellow-300" : "text-emerald-400")} />
              ))}
            </div>
          </div>
          
          <CardContent className="p-8 md:p-12 space-y-12">
            <div className="grid md:grid-cols-3 gap-6">
              <ResultCard label="Starting Cash" val={formatValue(quest.startingBalance)} />
              <ResultCard label="Ending Cash" val={formatValue(currentBalance)} color={getBalanceColor()} icon={ArrowUpRight} />
              <ResultCard label="XP Gained" val={`+${state.totalXPEarned + quest.xpReward}`} color="text-primary" />
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <History className="h-7 w-7 text-primary" /> Decision Replay
              </h3>
              <div className="space-y-4">
                {state.choiceHistory.map((entry, i) => {
                  const step = quest.steps.find(s => s.id === entry.stepId);
                  const choice = step?.choices.find(c => c.id === entry.choiceId);
                  const optimal = step?.choices.find(c => c.isOptimal);
                  
                  return (entry && step && choice && optimal) ? (
                    <div key={i} className="p-6 rounded-3xl border-2 border-slate-100 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="font-bold text-slate-900 leading-tight">Step {i+1}: {step.title}</div>
                        <Badge className={choice.isOptimal ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                          {choice.isOptimal ? 'Optimal' : 'Sub-optimal'}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-1">
                          <p className="text-slate-400 font-bold uppercase text-[10px]">Your Choice</p>
                          <p className="font-medium text-slate-700">{choice.text}</p>
                        </div>
                        {!choice.isOptimal && (
                          <div className="space-y-1">
                            <p className="text-emerald-500 font-bold uppercase text-[10px]">Better Move</p>
                            <p className="font-medium text-emerald-700">{optimal.text}</p>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl text-[13px] font-medium text-slate-600 border border-slate-100">
                        {choice.explanation}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="bg-slate-900 p-8 md:p-10 rounded-[2.5rem] text-white space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10"><Lightbulb className="h-40 w-40" /></div>
              <div className="space-y-2 relative z-10">
                <Badge className="bg-primary text-white border-none">STRATEGY INTELLIGENCE</Badge>
                <h3 className="text-3xl font-black">Apply this in real life</h3>
              </div>
              <div className="grid gap-6 relative z-10">
                {state.choiceHistory.filter(e => !e.isOptimal).slice(0, 3).map((e, i) => {
                  const choice = quest.steps.find(s => s.id === e.stepId)?.choices.find(c => c.id === e.choiceId);
                  return choice?.realLifeTip ? (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-black text-primary">{i+1}</div>
                      <p className="text-slate-300 font-medium leading-relaxed">{choice.realLifeTip}</p>
                    </div>
                  ) : null;
                })}
                {state.optimalChoiceCount === quest.steps.length && (
                  <p className="text-emerald-400 font-black text-xl italic">Flawless performance! You are ready to manage crores. Continue building your portfolio.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Button variant="outline" onClick={resetQuest} className="h-16 px-10 rounded-2xl font-black text-slate-500 border-2" suppressHydrationWarning>
                <RotateCcw className="h-5 w-5 mr-2" /> Replay Simulation
              </Button>
              <Button onClick={onComplete} className="flex-1 h-16 text-xl font-black rounded-2xl shadow-xl" suppressHydrationWarning>
                Return to Arcade Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 gap-6 md:gap-8 bg-slate-50 min-h-screen-safe overflow-y-auto">
      <div className="sticky top-4 z-50 animate-in slide-in-from-top-4 duration-500">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl border-2 border-slate-100 shadow-xl p-4 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-slate-400">Balance</span>
            <span className={cn("text-lg md:text-xl font-black transition-colors duration-500", getBalanceColor())}>
              {formatValue(currentBalance)}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-slate-400">Mission XP</span>
            <span className="text-lg md:text-xl font-black text-primary">+{state.totalXPEarned}</span>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-slate-400">Health</span>
            <span className="text-lg md:text-xl font-black text-slate-900">{getHealthLabel(50 + state.totalHealthDelta)}</span>
          </div>
        </div>
      </div>

      <Card className="max-w-3xl w-full mx-auto border-none shadow-2xl overflow-hidden flex flex-col flex-1">
        <div className="p-8 md:p-12 space-y-8 flex-1 flex flex-col">
          <div className="space-y-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{currentStep?.title}</h2>
            </div>
            <div className="p-6 md:p-8 bg-slate-50 rounded-[2rem] border-l-8 border-primary italic text-lg md:text-2xl text-slate-700 leading-relaxed font-medium">
              "{currentStep?.narrative}"
            </div>
          </div>

          <div className="grid gap-4">
            {currentStep?.choices.map((choice) => (
              <button
                key={choice.id}
                disabled={!!selectedChoiceId}
                onClick={() => handleChoiceSelect(choice.id)}
                className={cn(
                  "w-full min-h-[80px] p-6 md:p-8 text-left rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group",
                  !selectedChoiceId 
                    ? "hover:border-primary hover:bg-primary/5 border-slate-100" 
                    : choice.id === selectedChoiceId
                      ? choice.isOptimal 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 scale-[1.02] shadow-xl" 
                        : "bg-amber-50 border-amber-500 text-amber-900 scale-[1.02] shadow-xl"
                      : "opacity-40 grayscale"
                )}
              >
                <span className="text-lg md:text-xl font-bold pr-6">{choice.text}</span>
                {selectedChoiceId === choice.id && (
                  choice.isOptimal ? <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" /> : <XCircle className="h-8 w-8 text-amber-600 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {selectedChoiceId && activeChoice && (
            <div className="animate-in slide-in-from-top-4 duration-500 space-y-8 mt-6">
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="font-bold text-slate-800 text-lg md:text-xl leading-relaxed">"{activeChoice.consequence}"</p>
                </div>
                
                <div className="p-8 bg-primary/5 rounded-[2rem] border-2 border-primary/10 space-y-3">
                  <div className="flex items-center gap-3 text-xs font-black uppercase text-primary tracking-widest">
                    <TrendingUp className="h-5 w-5" /> Intelligence Report
                  </div>
                  <p className="text-base md:text-lg font-medium text-slate-600 leading-relaxed italic">
                    {activeChoice.explanation}
                  </p>
                </div>
              </div>

              <Button onClick={handleNext} className="w-full h-16 md:h-20 text-xl font-black rounded-3xl gap-3 group" suppressHydrationWarning>
                {activeChoice.nextStepId === 'end' ? 'Complete Mission' : 'Continue Simulation'} 
                <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatPill({ label, val }: { label: string; val: string }) {
  return (
    <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
      <div className="text-[10px] font-black uppercase text-white/60 mb-1">{label}</div>
      <div className="font-bold text-sm md:text-base">{val}</div>
    </div>
  );
}

function ResultCard({ label, val, color = 'text-slate-900', icon: Icon }: { label: string; val: string; color?: string; icon?: any }) {
  return (
    <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 flex flex-col items-center justify-center text-center">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</div>
      <div className={cn("text-2xl md:text-3xl font-black flex items-center gap-2", color)}>
        {Icon && <Icon className="h-6 w-6" />} {val}
      </div>
    </div>
  );
}
