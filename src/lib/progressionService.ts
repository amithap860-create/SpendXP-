import { doc, getDoc, setDoc, getDocs, collection, Firestore, serverTimestamp, increment, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { safeGetDoc, safeSetDoc, safeUpdateDoc } from '@/lib/firestoreSafe';
import { getISTDateKey } from './dateHelpers';
import { clampHealth } from './financialHealth';
import { awardBadge } from './badgeService';
import { waitForAuth } from './waitForAuth';

export interface UserProgression {
  totalXP: number;
  totalGamesPlayed: number;
  walletBalance: number;
  level: number;
  badges: string[];
  lastActivityAt: any;
  financialHealth: number;
  healthHistory: Array<{ date: string; score: number }>;
  gameHighScores: {
    budgetBlitz: number;
    finIQQuiz: number;
    moneyMaze: number;
    stockMarketSim: number;
    creditScoreBuilder: number;
  };
  /** Current daily activity streak (days in a row with at least one quest/game). */
  currentStreak?: number;
  longestStreak?: number;
  questsCompleted?: number;
}

export interface GameScoreData {
  highScore: number;
  lastScore: number;
  xpEarned: number;
  gamesPlayed: number;
  lastPlayedAt: any;
  categoryAccuracy?: Record<string, { correct: number; total: number }>;
  totalProfit?: number;
  completed?: boolean;
}

export type GameScores = Record<string, GameScoreData | null>;

export type ConceptStrengths = {
  budgeting: number;
  saving: number;
  investing: number;
  credit: number;
  taxes: number;
  spending: number;
};

export const DEFAULT_PROGRESSION: UserProgression = {
  totalXP: 0,
  totalGamesPlayed: 0,
  walletBalance: 0,
  level: 1,
  badges: [],
  lastActivityAt: null,
  financialHealth: 50,
  healthHistory: [],
  gameHighScores: {
    budgetBlitz: 0,
    finIQQuiz: 0,
    moneyMaze: 0,
    stockMarketSim: 0,
    creditScoreBuilder: 0
  },
  currentStreak: 0,
  longestStreak: 0,
  questsCompleted: 0,
};

/**
 * Client-side leaderboard update workaround
 */
export async function updateLeaderboardEntry(uid: string | null | undefined, displayName: string) {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    return;
  }
  const user = await waitForAuth();
  if (!user) return;

  try {
    const progression = await getProgression(uid);
    const simpleRef = doc(db, 'leaderboard', uid);
    await safeSetDoc(simpleRef, {
      uid,
      displayName,
      totalXP: progression.totalXP,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Leaderboard update failed:", error);
  }
}

export function getProgressionRef(uid: string | null | undefined) {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    return null;
  }
  return doc(db, 'users', uid, 'progression', 'stats');
}

export async function getProgression(uid: string | null | undefined): Promise<UserProgression> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    return DEFAULT_PROGRESSION;
  }
  const user = await waitForAuth();
  if (!user) return DEFAULT_PROGRESSION;

  const progressionRef = getProgressionRef(uid);
  if (!progressionRef) return DEFAULT_PROGRESSION;
  
  try {
    const snap = await safeGetDoc(progressionRef);
    if (snap) {
      return {
        ...DEFAULT_PROGRESSION,
        ...snap,
        gameHighScores: {
          ...DEFAULT_PROGRESSION.gameHighScores,
          ...(snap.gameHighScores || {})
        }
      } as UserProgression;
    } else {
      return DEFAULT_PROGRESSION;
    }
  } catch (error) {
    console.error("Error fetching progression:", error);
    return DEFAULT_PROGRESSION;
  }
}

/**
 * Updates the user's Financial Health score and records history.
 */
export async function updateFinancialHealth(uid: string | null | undefined, delta: number) {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    return;
  }
  const user = await waitForAuth();
  if (!user) return;

  const ref = getProgressionRef(uid);
  if (!ref) return;
  const current = await getProgression(uid);
  const newScore = clampHealth(current.financialHealth + delta);
  const dateKey = getISTDateKey();

  // Manage history limit
  let history = [...(current.healthHistory || [])];
  if (history.length >= 30) history.shift();
  history.push({ date: dateKey, score: newScore });

  await safeUpdateDoc(ref, {
    financialHealth: newScore,
    healthHistory: history,
    lastActivityAt: serverTimestamp()
  });

  // Check for badges
  if (newScore >= 75) {
    await awardBadge(uid, 'financially_stable');
  }
}

export async function getAllGameScores(uid: string | null | undefined): Promise<GameScores> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    return {};
  }
  const authUser = await waitForAuth();
  if (!authUser) return {};

  const games = ['budgetBlitz', 'finIQ', 'moneyMaze', 'stockMarketSim', 'creditScoreBuilder'];
  const scores: GameScores = {};

  try {
    const results = await Promise.all(
      games.map(game => getDoc(doc(db, 'users', uid, 'gameScores', game)))
    );

    results.forEach((snap, index) => {
      const gameKey = games[index];
      const displayKey = gameKey === 'finIQ' ? 'finIQQuiz' : gameKey;
      scores[displayKey] = snap.exists() ? (snap.data() as GameScoreData) : null;
    });

    return scores;
  } catch (error) {
    console.error("Error fetching all game scores:", error);
    return scores;
  }
}

export async function getConceptStrengths(uid: string | null | undefined): Promise<ConceptStrengths> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    return { budgeting: 0, saving: 0, investing: 0, credit: 0, taxes: 0, spending: 0 };
  }
  const authUser = await waitForAuth();
  if (!authUser) return { budgeting: 0, saving: 0, investing: 0, credit: 0, taxes: 0, spending: 0 };

  const scores = await getAllGameScores(uid);
  const tasksSnap = await getDocs(collection(db, 'users', uid, 'lessonProgress'));
  const completedTasks = tasksSnap.docs.map(d => d.data()).filter(t => t.completed);

  const strengths: ConceptStrengths = {
    budgeting: 0,
    saving: 0,
    investing: 0,
    credit: 0,
    taxes: 0,
    spending: 0,
  };

  const finIQ = scores.finIQQuiz;
  if (finIQ?.categoryAccuracy) {
    Object.entries(finIQ.categoryAccuracy).forEach(([cat, stat]) => {
      const key = cat.toLowerCase() as keyof ConceptStrengths;
      if (strengths[key] !== undefined && stat.total > 0) {
        strengths[key] = Math.round((stat.correct / stat.total) * 100);
      }
    });
  }

  completedTasks.forEach(task => {
    const key = (task.category || 'Academy').toLowerCase() as keyof ConceptStrengths;
    if (strengths[key] !== undefined) strengths[key] += 20;
  });

  if ((scores.budgetBlitz?.highScore || 0) > 500) {
    strengths.budgeting += 10;
    strengths.spending += 10;
  }
  
  if ((scores.creditScoreBuilder?.highScore || 0) > 700) strengths.credit += 15;
  if ((scores.stockMarketSim?.totalProfit || 0) > 0) strengths.investing += 10;

  Object.keys(strengths).forEach((key) => {
    const k = key as keyof ConceptStrengths;
    strengths[k] = Math.min(100, strengths[k]);
  });

  return strengths;
}