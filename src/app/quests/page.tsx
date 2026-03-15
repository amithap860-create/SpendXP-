'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useProgression } from '@/hooks/useProgression';
import { quests, Quest } from '@/data/quests';
import { calculateHealthLabel } from '@/lib/financialHealth';
import { QuestViewer } from '@/components/quests/QuestViewer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  TrendingUp, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Zap,
  Target,
  Medal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDoc, useMemoFirebase, db } from '@/firebase';
import { doc, collection, getDocs } from 'firebase/firestore';

export default function QuestsHub() {
  const { user, currentAgeGroup } = useAuthContext();
  const { data: progression, isLoading: progLoading } = useProgression();
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProgress = async () => {
      const snap = await getDocs(collection(db, 'users', user.uid, 'questProgress'));
      setCompletedQuestIds(snap.docs.map(d => d.id));
      setIsLoading(false);
    };
    fetchProgress();
  }, [user, activeQuest]);

  const health = calculateHealthLabel(progression?.financialHealth || 50);

  const getHealthHistoryPoints = () => {
    const history = progression?.healthHistory || [];
    if (history.length < 2) return '';
    const width = 200;
    const height = 40;
    return history.map((h, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - (h.score / 100) * height;
      return `${x},${y}`;
    }).join(' ');
  };

  const getWisdomLevel = (rate: number) => {
    if (rate >= 90) return 'Master';
    if (rate >= 70) return 'Expert';
    if (rate >= 50) return 'Practitioner';
    if (rate >= 30) return 'Apprentice';
    return 'Novice';
  };

  if (activeQuest) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <button 
          onClick={() => setActiveQuest(null)}
          className="mb-8 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center gap-2"
          suppressHydrationWarning
        >
          ← Exit Mission
        </button>
        <QuestViewer quest={activeQuest} onComplete={() => setActiveQuest(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* FINANCIAL HEALTH HERO */}
        <section className="bg-white rounded-3xl border-none shadow-xl overflow-hidden grid md:grid-cols-12 gap-0">
          <div className="md:col-span-7 p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Health</h1>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className={cn("text-sm font-black uppercase tracking-widest", {
                    "text-rose-500": health.color === 'red',
                    "text-amber-500": health.color === 'amber',
                    "text-teal-500": health.color === 'teal',
                    "text-emerald-500": health.color === 'green',
                  })}>{health.label}</span>
                  <div className="text-6xl font-black text-slate-900">{progression?.financialHealth || 50}</div>
                </div>
                <div className="w-48 h-12 hidden md:block">
                  <svg viewBox="0 0 200 40" className="w-full h-full overflow-visible">
                    <path
                      d={`M ${getHealthHistoryPoints()}`}
                      fill="none"
                      stroke={health.color === 'green' ? '#10b981' : '#3b82f6'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <Progress 
                value={progression?.financialHealth || 50} 
                className={cn("h-3", {
                  "bg-rose-100": health.color === 'red',
                  "bg-amber-100": health.color === 'amber',
                  "bg-teal-100": health.color === 'teal',
                  "bg-emerald-100": health.color === 'green',
                })}
              />
              <p className="text-slate-500 font-medium">{health.description}</p>
            </div>
          </div>
          
          <div className="md:col-span-5 bg-slate-900 p-8 md:p-12 flex flex-col justify-center space-y-6">
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Financial Wisdom</div>
              <div className="text-2xl font-black text-white">{getWisdomLevel((completedQuestIds.length / 6) * 100)}</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Quests Done</div>
                <div className="text-xl font-black text-white">{completedQuestIds.length} / 6</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Badges</div>
                <div className="text-xl font-black text-white">{progression?.badges.filter(b => b.includes('master')).length || 0}</div>
              </div>
            </div>
          </div>
        </section>

        {/* QUEST GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quests.map((quest) => {
            const isCompleted = completedQuestIds.includes(quest.id);
            const isAvailableForAge = quest.ageGroups.includes(currentAgeGroup);
            const isLocked = quest.unlockRequirement?.completedQuestId && !completedQuestIds.includes(quest.unlockRequirement.completedQuestId);

            return (
              <Card 
                key={quest.id} 
                className={cn(
                  "group transition-all duration-300 border-none shadow-md hover:shadow-xl overflow-hidden flex flex-col",
                  isCompleted && "ring-2 ring-emerald-500/20",
                  !isAvailableForAge && "opacity-60"
                )}
              >
                <div className={cn("h-2", {
                  "bg-emerald-500": quest.category === 'income',
                  "bg-blue-500": quest.category === 'housing',
                  "bg-rose-500": quest.category === 'debt',
                  "bg-amber-500": quest.category === 'emergency',
                  "bg-indigo-500": quest.category === 'investing',
                  "bg-purple-500": quest.category === 'lifestyle',
                })} />
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] font-black uppercase border-slate-200">
                      {quest.category}
                    </Badge>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : isLocked ? (
                      <Lock className="h-4 w-4 text-slate-300" />
                    ) : (
                      <div className="text-[10px] font-black text-primary">+{quest.xpReward} XP</div>
                    )}
                  </div>
                  <CardTitle className="text-xl font-black group-hover:text-primary transition-colors leading-tight">
                    {quest.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px]">
                    {quest.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {quest.estimatedMinutes}m</div>
                    <div className={cn("px-2 py-0.5 rounded-full text-white", {
                      "bg-emerald-400": quest.difficulty === 'beginner',
                      "bg-amber-400": quest.difficulty === 'intermediate',
                      "bg-rose-400": quest.difficulty === 'advanced',
                    })}>{quest.difficulty}</div>
                  </div>
                  
                  {!isAvailableForAge ? (
                    <div className="text-[10px] font-black text-amber-600 bg-amber-50 p-2 rounded-lg text-center uppercase">
                      Available at Senior Level
                    </div>
                  ) : isLocked ? (
                    <Button disabled className="w-full h-12 bg-slate-100 text-slate-400 border-none" suppressHydrationWarning>
                      Locked
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setActiveQuest(quest)}
                      className={cn("w-full h-12 gap-2 font-black rounded-xl group/btn", isCompleted ? "bg-slate-900" : "bg-primary")}
                      suppressHydrationWarning
                    >
                      {isCompleted ? 'Replay Mission' : 'Start Quest'} 
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* PROGRESS SUMMARY */}
        <section className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary border border-white/5">
              <Medal className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-black">Strategic Mastery</h3>
              <p className="text-slate-400 text-sm">You have mastered {completedQuestIds.length} of 6 real-world scenarios.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-[10px] font-black uppercase text-slate-500 mb-1">Optimal Choices</div>
              <div className="text-2xl font-black">{progression?.gameHighScores?.budgetBlitz || 0}%</div>
            </div>
            <div className="text-center px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-[10px] font-black uppercase text-slate-500 mb-1">Wisdom Rank</div>
              <div className="text-2xl font-black text-primary">{getWisdomLevel((completedQuestIds.length / 6) * 100)}</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
