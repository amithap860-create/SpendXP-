import { doc, getDoc, setDoc, getDocs, collection, Firestore } from 'firebase/firestore';

export interface UserProgression {
  totalXP: number;
  totalGamesPlayed: number;
  walletBalance: number;
  level: number;
  badges: string[];
  lastActivityAt: any;
  gameHighScores: {
    budgetBlitz: number;
    finIQQuiz: number;
    moneyMaze: number;
    stockMarketSim: number;
    creditScoreBuilder: number;
    compoundClicker: number;
  };
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
  gameHighScores: {
    budgetBlitz: 0,
    finIQQuiz: 0,
    moneyMaze: 0,
    stockMarketSim: 0,
    creditScoreBuilder: 0,
    compoundClicker: 0
  }
};

/**
 * Returns the Firestore document reference for a user's progression stats.
 */
export function getProgressionRef(db: Firestore, uid: string) {
  return doc(db, 'users', uid, 'progression', 'stats');
}

/**
 * Fetches the user's aggregated progression document.
 */
export async function getProgression(db: Firestore, uid: string): Promise<UserProgression> {
  const progressionRef = getProgressionRef(db, uid);
  
  try {
    const snap = await getDoc(progressionRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...DEFAULT_PROGRESSION,
        ...data,
        gameHighScores: {
          ...DEFAULT_PROGRESSION.gameHighScores,
          ...(data.gameHighScores || {})
        }
      } as UserProgression;
    } else {
      await setDoc(progressionRef, DEFAULT_PROGRESSION);
      return DEFAULT_PROGRESSION;
    }
  } catch (error) {
    console.error("Error fetching progression:", error);
    return DEFAULT_PROGRESSION;
  }
}

/**
 * Reads all game score documents for a user.
 */
export async function getAllGameScores(db: Firestore, uid: string): Promise<GameScores> {
  const games = [
    'budgetBlitz', 
    'finIQ', 
    'moneyMaze', 
    'stockMarketSim', 
    'creditScoreBuilder', 
    'compoundClicker'
  ];

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

/**
 * Calculates financial concept strengths based on game performance and lesson completion.
 */
export async function getConceptStrengths(db: Firestore, uid: string): Promise<ConceptStrengths> {
  const scores = await getAllGameScores(db, uid);
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

  // 1. Base Accuracy from FinIQ Quiz
  const finIQ = scores.finIQQuiz;
  if (finIQ?.categoryAccuracy) {
    Object.entries(finIQ.categoryAccuracy).forEach(([cat, stat]) => {
      const key = cat.toLowerCase() as keyof ConceptStrengths;
      if (strengths[key] !== undefined && stat.total > 0) {
        strengths[key] = Math.round((stat.correct / stat.total) * 100);
      }
    });
  }

  // 2. Bonus from Lesson Completion (+20 per lesson)
  completedTasks.forEach(task => {
    const key = task.category.toLowerCase() as keyof ConceptStrengths;
    if (strengths[key] !== undefined) {
      strengths[key] += 20;
    }
  });

  // 3. Game-specific Milestone Bonuses
  if ((scores.budgetBlitz?.highScore || 0) > 500) {
    strengths.budgeting += 10;
    strengths.spending += 10;
  }
  
  if ((scores.creditScoreBuilder?.highScore || 0) > 700) {
    strengths.credit += 15;
  }

  if ((scores.stockMarketSim?.totalProfit || 0) > 0) {
    strengths.investing += 10;
  }

  if (scores.compoundClicker?.completed) {
    strengths.saving += 15;
    strengths.investing += 15;
  }

  // Cap all at 100
  Object.keys(strengths).forEach((key) => {
    const k = key as keyof ConceptStrengths;
    strengths[k] = Math.min(100, strengths[k]);
  });

  return strengths;
}
