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
  const { formatINR, activeCurrency } = useCurrency();
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
    if (currentBalance > quest.startingBalance) return 'text-primary';
    if (currentBalance === quest.startingBalance) return 'text-slate-600';
    if (ratio > 0.5) return 'text-[#2E7D5A]';
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
      <div className="flex-1 flex flex-col p-4 md:p-6 animate-in fade-in zoom-in duration-500 bg-slate-50 min-h-screen-safe">
        <Card className="max-w-xl w-full mx-auto border-none shadow-xl overflow-hidden">
          <div className="bg-primary p-6 md:p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
              <History className="h-24 w-24" />
            </div>
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-3 text-[10px]">MISSION START</Badge>
            <CardTitle className="text-2xl md:text-3xl font-black mb-3 leading-tight">{quest.title}</CardTitle>
            <p className="text-primary-foreground/90 text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed">{quest.description}</p>
          </div>
          <CardContent className="p-5 md:p-7 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <StatPill label="Starting" val={formatINR(quest.startingBalance)} />
              <StatPill label="Difficulty" val={quest.difficulty} />
              <StatPill label="XP Reward" val={`+${quest.xpReward}`} />
            </div>

            <div className="p-4 bg-[#E8F5EE] rounded-2xl border border-[#A8D5BC] flex items-start gap-4">
              <Info className="h-5 w-5 text-[#2E7D5A] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="font-black text-[#1A1F2E] text-sm">Mission Intel</h4>
                <p className="text-xs font-medium text-[#1A4035] leading-relaxed">
                  Every decision impacts your <strong>Real-Time Balance</strong>. Depleting your cash too early will lock out optimal choices in the final stages.
                </p>
              </div>
            </div>

            <Button onClick={startQuest} className="w-full h-12 md:h-14 text-base md:text-lg font-black rounded-2xl shadow-lg shadow-primary/20 gap-2 group" suppressHydrationWarning>
              Accept Mission <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Daily limit reached — free user used 3 quests today ─────────────────────
  if (state.status === 'LIMIT_REACHED') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-screen-safe bg-slate-50">
        <div className="max-w-md w-full space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Daily Quest Limit Reached</h2>
            <p className="text-slate-500 font-medium">
              You've completed 3 quests today — great work, Strategist!
              Come back tomorrow for more missions, or upgrade to Premium for unlimited quests.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="/upgrade"
              className="h-12 px-6 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-sm flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              Unlock Premium
            </a>
            <button
              onClick={onComplete}
              className="h-12 px-6 rounded-xl border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-colors"
            >
              Back to Case Files
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'COMPLETE') {
    const starCount = state.optimalChoiceCount >= quest.steps.length * 0.8 ? 3 : state.optimalChoiceCount >= quest.steps.length * 0.5 ? 2 : 1;
    // Server tells us if this quest was already completed before this replay
    const isReplay = state.serverResult?.alreadyCompleted === true;
    // Use server-confirmed XP (most accurate); fall back to local estimate while response loads
    const xpDisplay = isReplay
      ? 0
      : (state.serverResult?.xpAwarded ?? state.totalXPEarned + quest.xpReward);

    return (
      <div className="flex-1 flex flex-col p-4 md:p-6 animate-in slide-in-from-bottom-8 duration-700 bg-slate-50 min-h-screen-safe overflow-y-auto">
        <Card className="max-w-3xl w-full mx-auto border-none shadow-xl overflow-hidden mb-6">
          <div className={cn("p-6 md:p-8 text-white text-center", isReplay ? "bg-slate-700" : "bg-primary")}>
            <Trophy className="h-10 w-10 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              {isReplay ? 'Replay Complete' : 'Mission Success'}
            </h2>
            {isReplay ? (
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold">
                ✓ XP already earned on first completion — replays are practice only
              </div>
            ) : (
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map(i => (
                  <Star key={i} className={cn("h-8 w-8 md:h-10 md:w-10 fill-current", i <= starCount ? "text-[#C8E8D8]" : "text-[#4EA07A]")} />
                ))}
              </div>
            )}
          </div>

          <CardContent className="p-5 md:p-7 space-y-7">
            <div className="grid md:grid-cols-3 gap-4">
              <ResultCard label="Starting Cash" val={formatINR(quest.startingBalance)} />
              <ResultCard label="Ending Cash" val={formatINR(currentBalance)} color={getBalanceColor()} icon={ArrowUpRight} />
              <ResultCard
                label={isReplay ? 'XP (Replay)' : 'XP Gained'}
                val={isReplay ? 'No XP' : `+${xpDisplay}`}
                color={isReplay ? 'text-slate-400' : 'text-primary'}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <History className="h-5 w-5 text-primary" /> Decision Replay
              </h3>
              <div className="space-y-3">
                {state.choiceHistory.map((entry, i) => {
                  const step = quest.steps.find(s => s.id === entry.stepId);
                  const choice = step?.choices.find(c => c.id === entry.choiceId);
                  const optimal = step?.choices.find(c => c.isOptimal);

                  return (entry && step && choice && optimal) ? (
                    <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-white space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="font-bold text-slate-900 text-sm leading-tight">Step {i+1}: {step.title}</div>
                        <Badge className={choice.isOptimal ? "bg-[#C8E8D8] text-primary text-[10px]" : "bg-amber-100 text-amber-700 text-[10px]"}>
                          {choice.isOptimal ? 'Optimal' : 'Sub-optimal'}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <p className="text-slate-400 font-bold uppercase text-[9px]">Your Choice</p>
                          <p className="font-medium text-slate-700">{choice.text}</p>
                        </div>
                        {!choice.isOptimal && (
                          <div className="space-y-1">
                            <p className="text-primary font-bold uppercase text-[9px]">Better Move</p>
                            <p className="font-medium text-primary">{optimal.text}</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-600 border border-slate-100">
                        {choice.explanation}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="bg-slate-900 p-5 md:p-7 rounded-3xl text-white space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><Lightbulb className="h-28 w-28" /></div>
              <div className="space-y-1.5 relative z-10">
                <Badge className="bg-primary text-white border-none text-[10px]">STRATEGY INTELLIGENCE</Badge>
                <h3 className="text-xl font-black">Apply this in real life</h3>
              </div>
              <div className="grid gap-4 relative z-10">
                {state.choiceHistory.filter(e => !e.isOptimal).slice(0, 3).map((e, i) => {
                  const choice = quest.steps.find(s => s.id === e.stepId)?.choices.find(c => c.id === e.choiceId);
                  return choice?.realLifeTip ? (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-black text-sm text-primary">{i+1}</div>
                      <p className="text-slate-300 text-sm font-medium leading-relaxed">{choice.realLifeTip}</p>
                    </div>
                  ) : null;
                })}
                {state.optimalChoiceCount === quest.steps.length && (
                  <p className="text-[#4EA07A] font-black text-base italic">Flawless performance! You are ready to manage crores. Continue building your portfolio.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <Button variant="outline" onClick={resetQuest} className="h-12 px-8 rounded-xl font-black text-slate-500 border-2 text-sm" suppressHydrationWarning>
                <RotateCcw className="h-4 w-4 mr-2" /> Replay Simulation
              </Button>
              <Button onClick={onComplete} className="flex-1 h-12 text-base font-black rounded-xl shadow-lg" suppressHydrationWarning>
                Return to Arcade Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safety net: if currentStep is undefined (e.g. bad nextStepId in quest data),
  // show a graceful error instead of rendering the literal string `""`.
  if (!currentStep && state.status === 'IN_PROGRESS') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-screen-safe bg-slate-50">
        <div className="max-w-md w-full space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
            <Target className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-black text-slate-700">Quest step not found</h2>
          <p className="text-slate-400 text-sm">This step could not be loaded. Please restart the quest.</p>
          <button
            onClick={resetQuest}
            className="h-11 px-6 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors"
          >
            Restart Quest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 gap-6 md:gap-8 bg-slate-50 min-h-screen-safe overflow-y-auto">
      <div className="sticky top-4 z-50 animate-in slide-in-from-top-4 duration-500 space-y-1.5">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl border-2 border-slate-100 shadow-xl p-4 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-slate-400">Balance ({activeCurrency.code})</span>
            <span className={cn("text-lg md:text-xl font-black transition-colors duration-500", getBalanceColor())}>
              {formatINR(currentBalance)}
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
        {activeCurrency.code !== 'INR' && (
          <p className="max-w-3xl mx-auto text-center text-[10px] font-bold text-slate-400 px-2">
            Story amounts are in ₹ (INR) for context · Your balance tracker above is in {activeCurrency.code}
          </p>
        )}
      </div>

      <Card className="max-w-3xl w-full mx-auto border-none shadow-xl overflow-hidden flex flex-col flex-1">
        <div className="p-5 md:p-7 space-y-5 flex-1 flex flex-col">
          <div className="space-y-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Target className="h-4 w-4" />
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{currentStep?.title}</h2>
            </div>
            <div className="p-4 md:p-5 bg-slate-50 rounded-2xl border-l-4 border-primary italic text-sm md:text-base text-slate-700 leading-relaxed font-medium">
              &ldquo;{currentStep?.narrative}&rdquo;
            </div>
          </div>

          <div className="grid gap-3">
            {currentStep?.choices.map((choice) => (
              <button
                key={choice.id}
                disabled={!!selectedChoiceId}
                onClick={() => handleChoiceSelect(choice.id)}
                className={cn(
                  "w-full min-h-[60px] p-4 md:p-5 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group",
                  !selectedChoiceId
                    ? "hover:border-primary hover:bg-primary/5 border-slate-100"
                    : choice.id === selectedChoiceId
                      ? choice.isOptimal
                        ? "bg-[#E8F5EE] border-[#2E7D5A] text-[#1A1F2E] scale-[1.01] shadow-lg"
                        : "bg-[#E8F5EE] border-[#4A556B] text-[#1A1F2E] scale-[1.01] shadow-lg"
                      : "opacity-40 grayscale"
                )}
              >
                <span className="text-sm md:text-base font-bold pr-4">{choice.text}</span>
                {selectedChoiceId === choice.id && (
                  choice.isOptimal ? <CheckCircle2 className="h-6 w-6 text-primary shrink-0" /> : <XCircle className="h-6 w-6 text-[#2E7D5A] shrink-0" />
                )}
              </button>
            ))}
          </div>

          {selectedChoiceId && activeChoice && (
            <div className="animate-in slide-in-from-top-4 duration-500 space-y-5 mt-4">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="font-bold text-slate-800 text-sm md:text-base leading-relaxed">&ldquo;{activeChoice.consequence}&rdquo;</p>
                </div>

                <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest">
                    <TrendingUp className="h-4 w-4" /> Intelligence Report
                  </div>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                    {activeChoice.explanation}
                  </p>
                </div>
              </div>

              <Button onClick={handleNext} className="w-full h-12 md:h-14 text-base font-black rounded-2xl gap-2 group" suppressHydrationWarning>
                {activeChoice.nextStepId === 'end' ? 'Complete Mission' : 'Continue Simulation'}
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className={cn("text-lg md:text-xl font-black flex items-center gap-1.5", color)}>
        {Icon && <Icon className="h-4 w-4" />} {val}
      </div>
    </div>
  );
}
