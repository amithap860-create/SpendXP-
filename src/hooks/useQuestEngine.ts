'use client';

import { useState, useMemo, useCallback } from 'react';
import { Quest } from '@/data/quests';
import { AgeGroup } from '@/lib/ageAdapt';
import { useAuthContext } from '@/context/AuthContext';
import { updateLeaderboardEntry } from '@/lib/progressionService';
import { checkAndAwardQuestBadges } from '@/lib/badgeService';
import { cancelStreakReminder } from '@/lib/native';
import { trackQuestCompleted } from '@/lib/analytics';

export type QuestState = {
  status: 'INTRO' | 'IN_PROGRESS' | 'COMPLETE' | 'LIMIT_REACHED';
  currentStepId: string;
  choiceHistory: Array<{
    stepId: string;
    choiceId: string;
    isOptimal: boolean;
  }>;
  totalXPEarned: number;
  totalHealthDelta: number;
  totalWalletDelta: number;
  optimalChoiceCount: number;
  /** Populated after completion — from the server response */
  serverResult?: {
    xpAwarded: number;
    streak: number;
    questsToday: number;
    dailyLimitReached: boolean;
    alreadyCompleted: boolean;
  };
};

export function useQuestEngine(quest: Quest, ageGroup: AgeGroup) {
  const { user } = useAuthContext();

  // Use ALL quest steps — age-group filtering already happens at the quest LIST level.
  // Filtering steps here causes a critical bug: when choice.nextStepId points to a step
  // whose ageGroups doesn't include the user's group, currentStep becomes undefined
  // and QuestViewer renders the empty string literal `""`.
  const filteredSteps = useMemo(
    () => quest.steps,
    [quest.steps]
  );

  const [state, setState] = useState<QuestState>({
    status: 'INTRO',
    currentStepId: filteredSteps[0]?.id || '',
    choiceHistory: [],
    totalXPEarned: 0,
    totalHealthDelta: 0,
    totalWalletDelta: 0,
    optimalChoiceCount: 0,
  });

  const currentStep = useMemo(
    () => filteredSteps.find((s) => s.id === state.currentStepId),
    [filteredSteps, state.currentStepId]
  );

  const progress = useMemo(() => {
    if (state.status === 'COMPLETE' || state.status === 'LIMIT_REACHED') return 100;
    if (state.status === 'INTRO') return 0;
    const idx = filteredSteps.findIndex((s) => s.id === state.currentStepId);
    return Math.round(((idx + 1) / filteredSteps.length) * 100);
  }, [state.status, state.currentStepId, filteredSteps]);

  const startQuest = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'IN_PROGRESS' }));
  }, []);

  const resetQuest = useCallback(() => {
    setState({
      status: 'INTRO',
      currentStepId: filteredSteps[0]?.id || '',
      choiceHistory: [],
      totalXPEarned: 0,
      totalHealthDelta: 0,
      totalWalletDelta: 0,
      optimalChoiceCount: 0,
    });
  }, [filteredSteps]);

  const makeChoice = useCallback(
    async (choiceId: string) => {
      if (!currentStep || state.status !== 'IN_PROGRESS') return;

      const choice = currentStep.choices.find((c) => c.id === choiceId);
      if (!choice) return;

      const newHistory = [
        ...state.choiceHistory,
        {
          stepId: currentStep.id,
          choiceId: choice.id,
          isOptimal: choice.isOptimal,
        },
      ];

      const isEnd = choice.nextStepId === 'end';

      const nextState: QuestState = {
        ...state,
        choiceHistory: newHistory,
        totalXPEarned: state.totalXPEarned + choice.xpDelta,
        totalHealthDelta: state.totalHealthDelta + choice.healthDelta,
        totalWalletDelta: state.totalWalletDelta + choice.walletDelta,
        optimalChoiceCount: state.optimalChoiceCount + (choice.isOptimal ? 1 : 0),
        currentStepId: isEnd ? state.currentStepId : choice.nextStepId,
        status: isEnd ? 'COMPLETE' : 'IN_PROGRESS',
      };

      setState(nextState);

      if (isEnd && user) {
        const uid = user.uid;
        if (!uid || uid.trim() === '') return;

        const xpToAward = Math.max(0, nextState.totalXPEarned + quest.xpReward);
        const optimalRate = nextState.optimalChoiceCount / Math.max(1, filteredSteps.length);

        try {
          // Get a fresh Firebase ID token for server verification
          const token = await user.getIdToken();

          const res = await fetch('/api/quests/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              questId: quest.id,
              xpEarned: xpToAward,
              optimalRate,
              healthDelta: nextState.totalHealthDelta,
            }),
          });

          if (res.status === 403) {
            // Daily limit reached — server didn't save (user is free tier)
            const data = await res.json();
            setState((prev) => ({
              ...prev,
              status: 'LIMIT_REACHED',
              serverResult: {
                xpAwarded: 0,
                streak: 0,
                questsToday: data.questsToday ?? 3,
                dailyLimitReached: true,
                alreadyCompleted: false,
              },
            }));
            return;
          }

          if (res.ok) {
            const data = await res.json();
            setState((prev) => ({ ...prev, serverResult: data }));

            // User has completed activity today — dismiss the streak reminder
            cancelStreakReminder().catch(() => {});

            // Analytics
            trackQuestCompleted({
              questId: quest.id,
              questTitle: quest.title,
              xpEarned: xpToAward,
            });

            // Award badges (client-side — non-critical)
            await checkAndAwardQuestBadges(uid, quest.id, optimalRate).catch(
              () => {}
            );
            await updateLeaderboardEntry(uid, user.displayName || 'Strategist').catch(
              () => {}
            );
          }
        } catch (err) {
          console.error('[SpendXP Quest] Completion error:', err);
        }
      }
    },
    [currentStep, state, quest, filteredSteps, user]
  );

  return {
    state,
    currentStep,
    progress,
    startQuest,
    resetQuest,
    makeChoice,
  };
}
