/**
 * @fileOverview Unified Firestore Schema for SpendXP.
 * This file documents the data structure found across game components and the user store.
 * 
 * FIRESTORE PATH TREE:
 * /users/{userId} (Document: UserProfile)
 *    /gameScores/{gameName} (Collection of GameScore documents)
 *    /virtualInvestments/{symbol} (Collection of PortfolioItem documents)
 *    /lessonProgress/{taskId} (Collection of AppTask documents)
 */

export interface GameScore {
  gameName: 'budgetBlitz' | 'finIQ' | 'moneyMaze' | 'stockMarketSim' | 'creditScoreBuilder';
  lastScore: number;
  highScore: number;
  lastXpEarned: number;
  totalXpEarnedInGame: number;
  lastPlayedAt: string; // ISO Timestamp
  // Game-specific analytics
  budgetSplit?: {
    need: number; // percentage
    want: number;
    save: number;
  };
}

export interface UserGameData {
  // Root Profile Fields (from src/lib/store.tsx)
  id: string;
  email: string;
  name: string;
  age: number;
  birthYear: number;
  country: string;
  currency: string;
  balance: number;
  savingsGoal: number;
  savingsCurrent: number;
  liabilities: number;
  xp: number;
  level: number;
  createdAt: any; // ServerTimestamp

  // Sub-collections (Logical representation)
  gameScores: Record<string, GameScore>;
  
  virtualInvestments: Array<{
    id: string;
    symbol: string;
    shares: number;
    avgPrice: number;
    userId: string;
    lastTransactionAt?: string;
  }>;

  lessonProgress: Array<{
    id: string;
    title: string;
    category: string;
    xpReward: number;
    completed: boolean;
    userId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    lastAccessedAt: string;
    completedAt?: any; // ServerTimestamp
  }>;
}
