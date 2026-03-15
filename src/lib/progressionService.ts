import { doc, getDoc, setDoc, collection, getDocs, Firestore } from 'firebase/firestore';

export interface UserProgression {
  totalXP: number;
  totalGamesPlayed: number;
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
}

export type GameScores = Record<string, GameScoreData | null>;

const DEFAULT_PROGRESSION: UserProgression = {
  totalXP: 0,
  totalGamesPlayed: 0,
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
 * Fetches the user's aggregated progression document.
 * If it doesn't exist, it creates a default one.
 */
export async function getProgression(db: Firestore, uid: string): Promise<UserProgression> {
  const progressionRef = doc(db, 'users', uid, 'progression', 'stats');
  
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
      // Initialize if missing
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
      // Normalize internal key 'finIQ' to 'finIQQuiz' for the wallet if needed,
      // but here we return as saved in gameScores.
      const displayKey = gameKey === 'finIQ' ? 'finIQQuiz' : gameKey;
      scores[displayKey] = snap.exists() ? (snap.data() as GameScoreData) : null;
    });

    return scores;
  } catch (error) {
    console.error("Error fetching all game scores:", error);
    return scores;
  }
}
