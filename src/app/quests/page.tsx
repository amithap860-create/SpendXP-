'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useProgression } from '@/hooks/useProgression';
import { quests, Quest } from '@/data/quests';
import { calculateHealthLabel } from '@/lib/financialHealth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  Target,
  Medal,
  Lock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import dynamic from 'next/dynamic';

const QuestViewer = dynamic(() => import('@/components/quests/QuestViewer').then(mod => mod.QuestViewer), {
  ssr: false,
  loading: () => <div className="min-h-screen-safe flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" /></div>
});

export default function QuestsHub() {
  const { user, currentAgeGroup } = useAuthContext();
  const { data: progression } = useProgression();
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
      <div className="min-h-screen-safe bg-slate-50 flex flex-col">
        <header className="p-4 bg-white border-b flex items-center gap-4">
          <button 
            onClick={() => setActiveQuest(null)}
            className="h-11 px-4 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center gap-2 bg-slate-50 rounded-xl"
          >
            ← Exit
          </button>
          <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 line-clamp-1">{activeQuest.title}</h2>
        </header>
        <QuestViewer quest={activeQuest} onComplete={() => setActiveQuest(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen-safe bg-slate-50 pb-24 md:pb-8">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* FINANCIAL HEALTH HERO */}
        <section className="bg-white rounded-3xl border-none shadow-xl overflow-hidden grid md:grid-cols-12 gap-0">
          <div className="md:col-span-7 p-6 md:p-12 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Financial Health</h1>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className={cn("text-xs md:text-sm font-black uppercase tracking-widest", {
                    "text-rose-500": health.color === 'red',
                    "text-amber-500": health.color === 'amber',
                    "text-teal-500": health.color === 'teal',
                    "text-emerald-500": health.color === 'green',
                  })}>{health.label}</span>
                  <div className="text-5xl md:text-6xl font-black text-slate-900">{progression?.financialHealth || 50}</div>
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
              <p className="text-xs md:text-sm text-slate-500 font-medium">{health.description}</p>
            </div>
          </div>
          
          <div className="md:col-span-5 bg-slate-900 p-6 md:p-12 flex flex-col justify-center space-y-6">
            <div className="space-y-1">
              <div className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest">Financial Wisdom</div>
              <div className="text-xl md:text-2xl font-black text-white">{getWisdomLevel((completedQuestIds.length / 6) * 100)}</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest">Quests Done</div>
                <div className="text-lg md:text-xl font-black text-white">{completedQuestIds.length} / 6</div>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest">Badges</div>
                <div className="text-lg md:text-xl font-black text-white">{progression?.badges.filter(b => b.includes('master')).length || 0}</div>
              </div>
            </div>
          </div>
        </section>

        {/* QUEST GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {quests.map((quest) => {
            const isCompleted = completedQuestIds.includes(quest.id);
            const isAvailableForAge = quest.ageGroups.includes(currentAgeGroup);
            const isLocked = quest.unlockRequirement?.completedQuestId && !completedQuestIds.includes(quest.unlockRequirement.completedQuestId);

            return (
              <Card 
                key={quest.id} 
                className={cn(
                  "group transition-all duration-300 border-none shadow-md hover:shadow-xl overflow-hidden flex flex-col p-4 md:p-6",
                  isCompleted && "ring-2 ring-emerald-500/20",
                  !isAvailableForAge && "opacity-60"
                )}
              >
                <div className={cn("h-1 md:h-2 mb-4 rounded-full", {
                  "bg-emerald-500": quest.category === 'income',
                  "bg-blue-500": quest.category === 'housing',
                  "bg-rose-500": quest.category === 'debt',
                  "bg-amber-500": quest.category === 'emergency',
                  "bg-indigo-500": quest.category === 'investing',
                  "bg-purple-500": quest.category === 'lifestyle',
                })} />
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[9px] md:text-[10px] font-black uppercase border-slate-200">
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
                <CardTitle className="text-lg md:text-xl font-black group-hover:text-primary transition-colors leading-tight mb-2">
                  {quest.title}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm line-clamp-2 min-h-[32px] md:min-h-[40px] mb-4">
                  {quest.description}
                </CardDescription>
                
                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-4 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {quest.estimatedMinutes}m</div>
                    <div className={cn("px-2 py-0.5 rounded-full text-white", {
                      "bg-emerald-400": quest.difficulty === 'beginner',
                      "bg-amber-400": quest.difficulty === 'intermediate',
                      "bg-rose-400": quest.difficulty === 'advanced',
                    })}>{quest.difficulty}</div>
                  </div>
                  
                  {!isAvailableForAge ? (
                    <div className="text-[9px] md:text-[10px] font-black text-amber-600 bg-amber-50 p-2 rounded-lg text-center uppercase">
                      Available at Senior Level
                    </div>
                  ) : isLocked ? (
                    <Button disabled className="w-full h-11 md:h-12 bg-slate-100 text-slate-400 border-none" suppressHydrationWarning>
                      Locked
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setActiveQuest(quest)}
                      className={cn("w-full h-11 md:h-12 gap-2 font-black rounded-xl group/btn", isCompleted ? "bg-slate-900" : "bg-primary")}
                      suppressHydrationWarning
                    >
                      {isCompleted ? 'Replay' : 'Start Quest'} 
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}