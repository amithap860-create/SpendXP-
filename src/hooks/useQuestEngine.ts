'use client';

import { useState, useMemo, useCallback } from 'react';
import { Quest, QuestStep, QuestChoice } from '@/data/quests';
import { AgeGroup } from '@/lib/ageAdapt';
import { useAuthContext } from '@/context/AuthContext';
import { db, safeSetDoc } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { updateFinancialHealth, updateLeaderboardEntry } from '@/lib/progressionService';
import { checkAndAwardQuestBadges } from '@/lib/badgeService';

export type QuestState = {
  status: 'INTRO' | 'IN_PROGRESS' | 'COMPLETE';
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
};

export function useQuestEngine(quest: Quest, ageGroup: AgeGroup) {
  const { user } = useAuthContext();
  
  const filteredSteps = useMemo(() => 
    quest.steps.filter(step => step.ageGroups.includes(ageGroup)), 
    [quest.steps, ageGroup]
  );

  const [state, setState] = useState<QuestState>({
    status: 'INTRO',
    currentStepId: filteredSteps[0]?.id || '',
    choiceHistory: [],
    totalXPEarned: 0,
    totalHealthDelta: 0,
    totalWalletDelta: 0,
    optimalChoiceCount: 0
  });

  const currentStep = useMemo(() => 
    filteredSteps.find(s => s.id === state.currentStepId),
    [filteredSteps, state.currentStepId]
  );

  const progress = useMemo(() => {
    if (state.status === 'COMPLETE') return 100;
    if (state.status === 'INTRO') return 0;
    const idx = filteredSteps.findIndex(s => s.id === state.currentStepId);
    return Math.round(((idx + 1) / filteredSteps.length) * 100);
  }, [state.status, state.currentStepId, filteredSteps]);

  const startQuest = useCallback(() => {
    setState(prev => ({ ...prev, status: 'IN_PROGRESS' }));
  }, []);

  const resetQuest = useCallback(() => {
    setState({
      status: 'INTRO',
      currentStepId: filteredSteps[0]?.id || '',
      choiceHistory: [],
      totalXPEarned: 0,
      totalHealthDelta: 0,
      totalWalletDelta: 0,
      optimalChoiceCount: 0
    });
  }, [filteredSteps]);

  const makeChoice = useCallback(async (choiceId: string) => {
    if (!currentStep || state.status !== 'IN_PROGRESS') return;
    
    const choice = currentStep.choices.find(c => c.id === choiceId);
    if (!choice) return;

    const newHistory = [...state.choiceHistory, {
      stepId: currentStep.id,
      choiceId: choice.id,
      isOptimal: choice.isOptimal
    }];

    const nextState: QuestState = {
      ...state,
      choiceHistory: newHistory,
      totalXPEarned: state.totalXPEarned + choice.xpDelta,
      totalHealthDelta: state.totalHealthDelta + choice.healthDelta,
      totalWalletDelta: state.totalWalletDelta + choice.walletDelta,
      optimalChoiceCount: state.optimalChoiceCount + (choice.isOptimal ? 1 : 0),
      currentStepId: choice.nextStepId === 'end' ? state.currentStepId : choice.nextStepId,
      status: choice.nextStepId === 'end' ? 'COMPLETE' : 'IN_PROGRESS'
    };

    setState(nextState);

    if (choice.nextStepId === 'end' && user) {
      const xpToAward = Math.max(0, nextState.totalXPEarned + quest.xpReward);
      const optimalRate = nextState.optimalChoiceCount / filteredSteps.length;

      try {
        // Submit Score
        await fetch('/api/scores/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameName: `quest_${quest.id}`,
            score: Math.round(optimalRate * 100),
            xpEarned: xpToAward
          })
        });

        // Update Financial Health
        await updateFinancialHealth(user.uid, nextState.totalHealthDelta);

        // Record Progress
        const progressRef = doc(db, 'users', user.uid, 'questProgress', quest.id);
        await safeSetDoc(progressRef, {
          completedAt: serverTimestamp(),
          optimalChoiceRate: optimalRate,
          xpEarned: xpToAward,
          healthDelta: nextState.totalHealthDelta,
          choiceHistory: newHistory,
          endingBalance: quest.startingBalance + nextState.totalWalletDelta
        });

        // Award Badges
        await checkAndAwardQuestBadges(user.uid, quest.id, optimalRate);
        await updateLeaderboardEntry(user.uid, user.displayName || 'Strategist');
      } catch (err) {
        console.error('[SpendXP Quest] Award Error:', err);
      }
    }
  }, [currentStep, state, quest, filteredSteps, user]);

  return {
    state,
    currentStep,
    progress,
    startQuest,
    resetQuest,
    makeChoice
  };
}
