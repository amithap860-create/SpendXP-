'use client';

import { doc, collection, serverTimestamp, increment, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { safeUpdateDoc, safeAddDoc } from '@/lib/firestoreSafe';

export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  questId?: string;
  requiresOptimalRate?: number;
  requiresToolsUsed?: number;
};

export const BADGES: BadgeDefinition[] = [
  {
    id: 'emergency_fund_builder',
    name: 'Emergency Fund Builder',
    description: 'Made the right choices in the Emergency Expense quest',
    xpReward: 75,
    questId: 'emergency-fund'
  },
  {
    id: 'debt_destroyer',
    name: 'Debt Destroyer',
    description: 'Completed the Phone EMI quest with 2+ optimal choices',
    xpReward: 75,
    questId: 'buying-phone-emi'
  },
  {
    id: 'smart_investor',
    name: 'Smart Investor',
    description: 'Completed the First Paycheck quest and chose to invest',
    xpReward: 100,
    questId: 'first-paycheck'
  },
  {
    id: 'scam_spotter',
    name: 'Scam Spotter',
    description: 'Identified the bad financial choice in the Credit Card quest',
    xpReward: 100,
    questId: 'first-credit-card'
  },
  {
    id: 'budget_master',
    name: 'Budget Master',
    description: 'Achieved 100% optimal choices in the First Paycheck quest',
    xpReward: 150,
    questId: 'first-paycheck',
    requiresOptimalRate: 1.0
  },
  {
    id: 'tool_explorer',
    name: 'Tool Explorer',
    description: 'Used all 4 financial calculator tools',
    xpReward: 50,
    requiresToolsUsed: 4
  },
  {
    id: 'goal_getter',
    name: 'Goal Getter',
    description: 'Reached a savings goal in the Goal Tracker',
    xpReward: 75
  },
  {
    id: 'financially_stable',
    name: 'Financially Stable',
    description: 'Reached a Financial Health score of 75+',
    xpReward: 100
  },
  {
    id: 'money_master',
    name: 'Money Master',
    description: 'Completed all 6 quests',
    xpReward: 200
  },
  {
    id: 'scholar',
    name: 'Finance Scholar',
    description: 'Completed all 8 Academy lessons',
    xpReward: 150
  }
];

/**
 * Awards a badge to a user if they don't already have it.
 */
export async function awardBadge(uid: string | null | undefined, badgeId: string): Promise<boolean> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    return false;
  }
  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) return false;

  const userRef = doc(db, 'users', uid);
  const progressionRef = doc(db, 'users', uid, 'progression', 'stats');
  
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return false;

  const currentBadges = userSnap.data().progression?.badges || [];
  if (currentBadges.includes(badgeId)) return false;

  // Award badge and XP
  await safeUpdateDoc(userRef, {
    'progression.badges': arrayUnion(badgeId)
  });

  await safeUpdateDoc(progressionRef, {
    totalXP: increment(badge.xpReward),
    lastActivityAt: serverTimestamp()
  });

  // Log to activity
  await safeAddDoc(collection(db, 'users', uid, 'activityLog'), {
    type: 'badge',
    badgeId,
    xpEarned: badge.xpReward,
    playedAt: serverTimestamp(),
    gameName: badge.name,
    description: `Unlocked ${badge.name}!`
  });

  return true;
}

/**
 * Checks and awards badges relevant to quest performance.
 */
export async function checkAndAwardQuestBadges(
  uid: string,
  questId: string,
  optimalChoiceRate: number
): Promise<string[]> {
  const newlyAwarded: string[] = [];
  const relevantBadges = BADGES.filter(b => b.questId === questId);

  for (const badge of relevantBadges) {
    let qualifies = true;
    if (badge.requiresOptimalRate !== undefined && optimalChoiceRate < badge.requiresOptimalRate) {
      qualifies = false;
    }

    if (qualifies) {
      const success = await awardBadge(uid, badge.id);
      if (success) newlyAwarded.push(badge.id);
    }
  }

  return newlyAwarded;
}
