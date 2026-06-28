'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useProgression } from '@/hooks/useProgression';
import { quests, Quest } from '@/data/quests';
import { calculateHealthLabel } from '@/lib/financialHealth';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Shield,
  Zap,
  AlertTriangle,
  MapPin,
  Award,
  Activity,
  TrendingUp,
  Flame,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { getRankForXP, getRankProgress, getNextRank, getFogEnemy, getCaseFileId, getCurrentSaga } from '@/config/narrative';
import { useDailyQuestStatus } from '@/hooks/useDailyQuestStatus';
import { trackQuestStarted } from '@/lib/analytics';

const QuestViewer = dynamic(() => import('@/components/quests/QuestViewer'), {
  ssr: false,
  loading: () => <div className="min-h-screen-safe flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" /></div>
});

// ── Case File dossier intro ───────────────────────────────────────────────────
function CaseFileBriefing({ quest, index, fogEnemy, onAccept, onDecline }: {
  quest: Quest;
  index: number;
  fogEnemy: ReturnType<typeof getFogEnemy>;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const caseId = getCaseFileId(index);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
        <button onClick={onDecline} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
          ← Back to HQ
        </button>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Order of the Golden Ledger · Intelligence Division
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 space-y-6">

        {/* Dossier stamp */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Case File</div>
            <div className="text-3xl font-black text-primary tracking-tight font-mono">{caseId}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Classification</div>
            <div className={cn(
              'text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full',
              quest.difficulty === 'beginner' ? 'bg-primary/10 text-primary' :
              quest.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-600'
            )}>{quest.difficulty}</div>
          </div>
        </div>

        {/* Divider */}
        <div className="border border-dashed border-slate-300" />

        {/* Case title */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Investigation</div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{quest.title}</h1>
        </div>

        {/* Situation report */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Situation Report</div>
          <p className="text-slate-700 text-sm leading-relaxed">{quest.description}</p>
        </div>

        {/* Fog enemy intel */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div className="text-[10px] font-black uppercase tracking-widest text-red-600">Active Threat</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{fogEnemy.emoji}</span>
            <div>
              <p className="font-black text-red-700 text-sm">{fogEnemy.name}</p>
              <p className="text-red-500 text-xs mt-1 leading-relaxed">{fogEnemy.description}</p>
            </div>
          </div>
          <div className="border-t border-red-200 pt-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Weakness</div>
            <p className="text-slate-600 text-xs leading-relaxed">{fogEnemy.weakness}</p>
          </div>
        </div>

        {/* Mission stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <Clock className="h-4 w-4 text-slate-400 mx-auto mb-1" />
            <div className="text-lg font-black text-slate-900">{quest.estimatedMinutes}m</div>
            <div className="text-[9px] font-black uppercase text-slate-500">Duration</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <Zap className="h-4 w-4 text-primary mx-auto mb-1" />
            <div className="text-lg font-black text-primary">+{quest.xpReward}</div>
            <div className="text-[9px] font-black uppercase text-slate-500">Ledger Points</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <Shield className="h-4 w-4 text-primary mx-auto mb-1" />
            <div className="text-lg font-black text-slate-900">{quest.steps.length}</div>
            <div className="text-[9px] font-black uppercase text-slate-500">Decisions</div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pb-8">
          <Button
            onClick={onAccept}
            className="w-full h-14 text-lg font-black rounded-2xl gap-2 bg-primary hover:bg-primary/90 text-white"
            suppressHydrationWarning
          >
            Accept Case File <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Your choices will affect SpendCity's stability
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuestsHub() {
  const { user } = useAuthContext();
  const { data: progression } = useProgression();
  const dailyStatus = useDailyQuestStatus();
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [briefingQuest, setBriefingQuest] = useState<{ quest: Quest; index: number } | null>(null);
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalXP = progression?.totalXP ?? 0;
  const rank = getRankForXP(totalXP);
  const rankProgress = getRankProgress(totalXP);
  const nextRank = getNextRank(totalXP);
  const fogEnemy = getFogEnemy(rank.activeFog.toLowerCase().replace(/ /g, '_'));
  const activeSaga = getCurrentSaga();
  const health = calculateHealthLabel(progression?.financialHealth || 50);

  useEffect(() => {
    document.title = 'Case Files | SpendXP';
  }, []);

  useEffect(() => {
    if (!user) {
      // User is either loading or not signed in — stop the skeleton
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const fetchProgress = async () => {
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'questProgress'));
        setCompletedQuestIds(snap.docs.map(d => d.id));
      } catch (e) {
        console.warn('[SpendXP] Could not load quest progress:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [user, activeQuest]);

  // Quest viewer — full screen
  if (activeQuest) {
    return (
      <div className="min-h-screen-safe bg-slate-950 flex flex-col">
        <header className="px-6 py-4 border-b border-slate-800 flex items-center gap-4">
          <button
            onClick={() => setActiveQuest(null)}
            className="text-xs font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
          >
            ← Exit Case
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#4EA07A] font-mono">
              {getCaseFileId(quests.findIndex(q => q.id === activeQuest.id))}
            </span>
            <span className="text-xs font-black uppercase tracking-tight text-white line-clamp-1">
              {activeQuest.title}
            </span>
          </div>
        </header>
        <QuestViewer quest={activeQuest} onComplete={() => setActiveQuest(null)} />
      </div>
    );
  }

  // Briefing screen
  if (briefingQuest) {
    return (
      <CaseFileBriefing
        quest={briefingQuest.quest}
        index={briefingQuest.index}
        fogEnemy={fogEnemy}
        onAccept={() => {
          trackQuestStarted({
            questId: briefingQuest.quest.id,
            questTitle: briefingQuest.quest.title,
            difficulty: briefingQuest.quest.difficulty,
          });
          setActiveQuest(briefingQuest.quest);
          setBriefingQuest(null);
        }}
        onDecline={() => setBriefingQuest(null)}
      />
    );
  }

  return (
    <div className="min-h-screen-safe bg-slate-50 pb-24 md:pb-8">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── ORDER HQ HERO ─────────────────────────────────────── */}
        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-12 gap-0">

            {/* Left — Rank & Status */}
            <div className="md:col-span-7 p-6 md:p-10 space-y-6">

              {/* Order badge */}
              <div className="inline-flex items-center gap-2 bg-[#E8F5EE] border border-[#A8D5BC] rounded-full px-4 py-1.5">
                <Scale className="h-3.5 w-3.5 text-[#2E7D5A]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2E7D5A]">
                  Order of the Golden Ledger
                </span>
              </div>

              {/* Rank */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Rank</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F5EE] flex items-center justify-center shrink-0">
                    <Award className="h-5 w-5 text-[#2E7D5A]" />
                  </div>
                  <span className="text-3xl font-black text-slate-900">{rank.name}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{rank.storyLine}</p>
              </div>

              {/* XP bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Ledger Points</span>
                  <span className="text-[#2E7D5A]">{totalXP.toLocaleString()} XP</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2E7D5A] to-[#4EA07A] rounded-full transition-all duration-1000"
                    style={{ width: `${rankProgress * 100}%` }}
                  />
                </div>
                {nextRank && (
                  <p className="text-[10px] text-slate-400 font-bold">
                    {(nextRank.minXP - totalXP).toLocaleString()} XP to {nextRank.name}
                  </p>
                )}
              </div>

              {/* District */}
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <MapPin className="h-4 w-4 text-[#4EA07A]" />
                Defending: <span className="text-slate-800">{rank.district}</span>
              </div>
            </div>

            {/* Right — Active Threat + City Stability */}
            <div className="md:col-span-5 bg-[#F6FBF8] border-t md:border-t-0 md:border-l border-slate-100 p-6 md:p-10 space-y-5">

              {/* Threat header */}
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-amber-500" /> Active Threat
              </div>

              {/* Threat card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-base leading-tight">{fogEnemy.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gray Fog</div>
                  </div>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">{fogEnemy.description}</p>
              </div>

              {/* City Stability */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Activity className="h-3 w-3" /> City Stability
                  </div>
                  <span className={cn(
                    'font-black',
                    health.color === 'green' || health.color === 'teal' ? 'text-[#2E7D5A]' :
                    health.color === 'amber' ? 'text-amber-600' : 'text-rose-500'
                  )}>{progression?.financialHealth || 50}/100</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-1000',
                      health.color === 'green' || health.color === 'teal' ? 'bg-[#4EA07A]' :
                      health.color === 'amber' ? 'bg-amber-400' : 'bg-rose-500'
                    )}
                    style={{ width: `${progression?.financialHealth || 50}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{health.description}</p>
              </div>

              {/* Seasonal saga */}
              {activeSaga && (
                <div className="bg-white border border-[#A8D5BC] rounded-xl px-4 py-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-[#2E7D5A]" />
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#2E7D5A]">Active Saga</div>
                  </div>
                  <div className="text-sm font-black text-slate-800">{activeSaga.name}</div>
                  <p className="text-[10px] text-slate-400">{activeSaga.tagline}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── CASE FILES ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Open Case Files</div>
            <div className="flex-1 h-px bg-slate-200" />
            {/* Daily quest counter for free users */}
            {!dailyStatus.isLoading && (
              <div className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                dailyStatus.dailyLimitReached
                  ? "bg-amber-100 text-amber-700"
                  : "text-slate-400"
              )}>
                {dailyStatus.dailyLimitReached
                  ? "Daily limit reached · Upgrade"
                  : `${dailyStatus.questsToday}/${dailyStatus.limit === Infinity ? '∞' : dailyStatus.limit} today`
                }
              </div>
            )}
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {completedQuestIds.length}/{quests.length} Closed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quests.map((quest, i) => {
              const isCompleted = completedQuestIds.includes(quest.id);
              // All quests are accessible to all ages — age groups adapt narrative only
              const isLocked = quest.unlockRequirement?.completedQuestId &&
                !completedQuestIds.includes(quest.unlockRequirement.completedQuestId);
              const caseId = getCaseFileId(i);

              return (
                <Card
                  key={quest.id}
                  className={cn(
                    "group transition-all duration-300 border border-slate-200 bg-white shadow-sm hover:shadow-xl overflow-hidden flex flex-col",
                    isCompleted && "border-[#A8D5BC] bg-[#E8F5EE]/30",
                    isLocked && "opacity-60"
                  )}
                >
                  {/* Top accent bar */}
                  <div className={cn("h-1 w-full", {
                    "bg-[#2E7D5A]": quest.category === 'income',
                    "bg-[#4A556B]": quest.category === 'housing',
                    "bg-rose-500": quest.category === 'debt',
                    "bg-slate-500": quest.category === 'emergency',
                    "bg-[#3A9068]": quest.category === 'investing',
                    "bg-[#4EA07A]": quest.category === 'lifestyle',
                  })} />

                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    {/* Case ID + status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-slate-400 tracking-widest font-mono">{caseId}</span>
                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Closed
                        </div>
                      ) : isLocked ? (
                        <Lock className="h-4 w-4 text-slate-300" />
                      ) : (
                        <div className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", {
                          "bg-[#C8E8D8] text-primary": quest.difficulty === 'beginner',
                          "bg-[#C8E8D8] text-[#2E7D5A]": quest.difficulty === 'intermediate',
                          "bg-rose-100 text-rose-700": quest.difficulty === 'advanced',
                        })}>
                          {quest.difficulty}
                        </div>
                      )}
                    </div>

                    <CardTitle className="text-lg font-black group-hover:text-primary transition-colors leading-tight mb-2">
                      {quest.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mb-4 leading-relaxed">
                      {quest.description}
                    </CardDescription>

                    <div className="mt-auto space-y-3">
                      {/* Meta row */}
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{quest.estimatedMinutes}m</span>
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-[#2E7D5A]" />+{quest.xpReward} XP</span>
                        <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-primary" />{quest.steps.length} decisions</span>
                      </div>

                      {isLocked ? (
                        <Button disabled className="w-full h-11 bg-slate-100 text-slate-400 border-none font-black" suppressHydrationWarning>
                          Complete prerequisite first
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setBriefingQuest({ quest, index: i })}
                          className={cn(
                            "w-full h-11 gap-2 font-black rounded-xl group/btn transition-all",
                            isCompleted
                              ? "bg-slate-900 hover:bg-slate-800 text-white"
                              : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                          )}
                          suppressHydrationWarning
                        >
                          {isCompleted ? 'Reopen Case' : 'Open Case File'}
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── INFINITE FOOTER ────────────────────────────────────── */}
        <div className="bg-slate-900 rounded-2xl p-6 text-center space-y-2">
          <div className="text-2xl">♾️</div>
          <p className="text-slate-400 text-sm font-medium">
            New case files are added every season. The Gray Fog never stops — and neither does the Order.
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            There is no end. There is only the next case file.
          </p>
        </div>

      </main>
    </div>
  );
}
