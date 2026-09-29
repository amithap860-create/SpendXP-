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
    // FIX (2026-09): this said 'emergency-fund', but the real quest id in
    // src/data/quests.ts is 'emergency-expense'. checkAndAwardQuestBadges()
    // filters BADGES by exact questId match, so this badge could never
    // fire — the id it was waiting for didn't exist.
    questId: 'emergency-expense'
  },
  {
    id: 'debt_destroyer',
    name: 'Debt Destroyer',
    description: 'Completed the Phone EMI quest with 2+ optimal choices',
    xpReward: 75,
    // FIX (2026-09): same bug — this said 'buying-phone-emi', real quest id
    // is 'phone-emi'. Never fired for the same reason as above.
    questId: 'phone-emi'
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
    // NOTE (2026-09): was "Completed all 6 quests" — stale, quests.ts now
    // has 20. Description genericized so it doesn't need updating every
    // time a quest is added.
    description: 'Completed every quest in the app',
    xpReward: 200
  },
  {
    id: 'scholar',
    name: 'Finance Scholar',
    // NOTE (2026-09): was "Completed all 8 Academy lessons" — stale, same
    // issue as money_master above (lessons.ts now has 12 lessons).
    description: 'Completed every lesson in the Academy',
    xpReward: 150
  },
  {
    // FIX (2026-09): src/app/resources/page.tsx has been calling
    // awardBadge(uid, 'framework_master') for a while, but this id was never
    // added here — awardBadge() looks up `BADGES.find(b => b.id === badgeId)`
    // and silently returns false when it doesn't find a match, so every one
    // of those calls was a no-op. The badge could never actually be earned.
    id: 'framework_master',
    name: 'Framework Master',
    description: 'Explored every framework in the Resource Library',
    xpReward: 75
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

  const progressionRef = doc(db, 'users', uid, 'progression', 'stats');

  // FIX (2026-09-29): this used to check/write the badges array on the
  // TOP-LEVEL users/{uid} doc ('progression.badges' field there), but every
  // screen that displays badges (useProgression() hook, read by the Profile
  // page and everywhere else) reads from this SEPARATE subcollection doc
  // (users/{uid}/progression/stats). The XP reward below was already
  // correctly targeting this doc, which is why totalXP looked right — only
  // the badge ID itself was landing in a document nothing ever reads, so
  // badges stayed stuck at 0 no matter how many were actually earned.
  const progressionSnap = await getDoc(progressionRef);
  if (!progressionSnap.exists()) return false;

  const currentBadges = progressionSnap.data().badges || [];
  if (currentBadges.includes(badgeId)) return false;

  // Award badge and XP — both to the doc that's actually read.
  await safeUpdateDoc(progressionRef, {
    badges: arrayUnion(badgeId),
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
