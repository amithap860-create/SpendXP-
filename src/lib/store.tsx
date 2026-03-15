
"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  useUser as useFirebaseUser, 
  useFirestore, 
  useAuth,
  useDoc,
  useCollection,
  useMemoFirebase
} from '@/firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where,
  serverTimestamp,
  deleteDoc,
  type DocumentReference
} from 'firebase/firestore';
import { 
  signInAnonymously, 
  updateProfile as updateAuthProfile,
  signOut
} from 'firebase/auth';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export type AgeGroup = '8-11' | '11-15' | '16-20';

// Current approximate exchange rates (USD base)
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.94,
  GBP: 0.79,
  CAD: 1.37,
  AUD: 1.54,
  JPY: 154.20,
  INR: 83.50,
  BRL: 5.10,
  ZAR: 19.05
};

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: number[];
}

export interface PortfolioItem {
  id: string;
  symbol: string;
  shares: number;
  avgPrice: number;
  userId: string;
}

export interface AppTask {
  id: string;
  title: string;
  category: string;
  xpReward: number;
  completed: boolean;
  userId?: string;
  status?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  country: string;
  currency: string;
  balance: number;
  savingsGoal: number;
  savingsCurrent: number;
  liabilities: number;
  xp: number;
  level: number;
  createdAt: any;
}

const INITIAL_STOCKS: Stock[] = [
  { symbol: 'ECO', name: 'EcoGrow', price: 120.50, change: 2.5, history: [115, 118, 120, 119, 120.50] },
  { symbol: 'SOL', name: 'Solaris Tech', price: 245.10, change: -1.2, history: [250, 248, 246, 247, 245.10] },
  { symbol: 'AQUA', name: 'AquaLife', price: 56.75, change: 0.8, history: [55, 56, 55.5, 56.2, 56.75] },
  { symbol: 'CYBER', name: 'CyberNest', price: 89.20, change: 4.1, history: [82, 85, 87, 88, 89.20] },
  { symbol: 'BRIO', name: 'BrioFoods', price: 15.40, change: -0.5, history: [16, 15.8, 15.5, 15.6, 15.40] },
];

const DEFAULT_TASKS: AppTask[] = [
  { id: 'academy-income', title: 'Learn about Income', category: 'Academy', xpReward: 50, completed: false },
  { id: 'academy-outcome', title: 'Understand Expenses', category: 'Academy', xpReward: 50, completed: false },
  { id: 'academy-budget', title: 'Master the Budget', category: 'Academy', xpReward: 50, completed: false },
  { id: 'game-advisor', title: 'Complete Wealth Architect', category: 'Games', xpReward: 100, completed: false },
  { id: 'game-loan-sim', title: 'Loan Specialist', category: 'Games', xpReward: 100, completed: false },
  { id: 'game-pro-sim', title: 'Adulting Master', category: 'Games', xpReward: 200, completed: false },
  { id: 'market-trade', title: 'Make your first trade', category: 'Market', xpReward: 100, completed: false },
  { id: 'flashcards-set', title: 'Complete a Flashcard set', category: 'Study', xpReward: 75, completed: false },
];

interface UserContextType {
  name: string;
  email: string;
  age: number;
  ageGroup: AgeGroup;
  country: string;
  currency: string;
  balance: number;
  portfolio: PortfolioItem[];
  stocks: Stock[];
  savingsGoal: number;
  savingsCurrent: number;
  liabilities: number;
  xp: number;
  level: number;
  tasks: AppTask[];
  isLoggedIn: boolean;
  isInitialLoading: boolean;
  login: (email: string, age: number) => Promise<void>;
  logout: () => void;
  resetAccount: () => Promise<void>;
  updateProfile: (data: { name: string; email: string; age: number; country: string; currency: string }) => void;
  updateStocks: (newStocks: Stock[]) => void;
  buyStock: (symbol: string, shares: number, priceUsd: number) => void;
  sellStock: (symbol: string, shares: number, priceUsd: number) => void;
  updateSavings: (amountUsd: number) => void;
  setSavingsGoal: (amountUsd: number) => void;
  updateLiabilities: (amountUsd: number) => void;
  addXP: (amount: number) => void;
  completeTask: (taskId: string) => void;
  getPortfolioValue: () => number;
  formatValue: (usdAmount: number) => string;
  convertToCurrent: (usdAmount: number) => number;
  convertFromCurrent: (currentAmount: number) => number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isUserLoading } = useFirebaseUser();
  const db = useFirestore();
  const auth = useAuth();
  
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);

  // Firestore Sync: Profile
  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, 'users', user.uid) : null;
  }, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  // Firestore Sync: Portfolio
  const portfolioQuery = useMemoFirebase(() => {
    return user ? collection(db, 'users', user.uid, 'virtualInvestments') : null;
  }, [db, user]);
  const { data: portfolioData, isLoading: isPortfolioLoading } = useCollection<PortfolioItem>(portfolioQuery);
  const portfolio = useMemo(() => Array.isArray(portfolioData) ? portfolioData : [], [portfolioData]);

  // Firestore Sync: Tasks/Progress
  const tasksQuery = useMemoFirebase(() => {
    return user ? collection(db, 'users', user.uid, 'lessonProgress') : null;
  }, [db, user]);
  const { data: remoteTasksData, isLoading: isTasksLoading } = useCollection<AppTask>(tasksQuery);
  const remoteTasks = useMemo(() => Array.isArray(remoteTasksData) ? remoteTasksData : [], [remoteTasksData]);

  const isInitialLoading = isUserLoading || isProfileLoading || isPortfolioLoading || isTasksLoading;

  // Auto-initialize balance if it's a new or empty profile
  useEffect(() => {
    if (!isInitialLoading && user && profile && (profile.balance === undefined || profile.balance === null)) {
      updateDocumentNonBlocking(profileRef!, {
        balance: 1000,
        currency: 'USD',
        savingsGoal: 500,
        xp: 0,
        level: 1
      });
    }
  }, [isInitialLoading, user, profile, profileRef]);

  const age = profile?.age || 0;
  const ageGroup = useMemo((): AgeGroup => {
    if (age <= 11) return '8-11';
    if (age >= 16) return '16-20';
    return '11-15';
  }, [age]);

  const login = async (email: string, age: number) => {
    const result = await signInAnonymously(auth);
    const userId = result.user.uid;
    
    const userRef = doc(db, 'users', userId);
    setDocumentNonBlocking(userRef, {
      id: userId,
      email,
      name: email.split('@')[0],
      age,
      country: 'United States',
      currency: 'USD',
      balance: 1000,
      savingsGoal: 500,
      savingsCurrent: 0,
      liabilities: 0,
      xp: 0,
      level: 1,
      createdAt: serverTimestamp(),
    }, { merge: true });

    DEFAULT_TASKS.forEach((t) => {
      const taskRef = doc(db, 'users', userId, 'lessonProgress', t.id);
      setDocumentNonBlocking(taskRef, {
        ...t,
        userId,
        status: 'not_started',
        lastAccessedAt: new Date().toISOString()
      }, { merge: true });
    });
  };

  const logout = () => signOut(auth);

  const resetAccount = async () => {
    if (!user || !profileRef) return;
    
    // Reset core profile with $1000
    updateDocumentNonBlocking(profileRef, {
      balance: 1000,
      savingsCurrent: 0,
      liabilities: 0,
      xp: 0,
      level: 1,
      savingsGoal: 500
    });

    // Reset tasks
    remoteTasks.forEach(task => {
      const taskRef = doc(db, 'users', user.uid, 'lessonProgress', task.id);
      updateDocumentNonBlocking(taskRef, { completed: false, status: 'not_started' });
    });

    // Clear portfolio
    portfolio.forEach(item => {
      const invRef = doc(db, 'users', user.uid, 'virtualInvestments', item.id);
      deleteDocumentNonBlocking(invRef);
    });
  };

  const updateProfile = (data: any) => {
    if (!profileRef) return;
    updateDocumentNonBlocking(profileRef, { ...data });
  };

  const addXP = (amount: number) => {
    if (!profileRef || !profile) return;
    const newXP = (profile.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 500) + 1;
    updateDocumentNonBlocking(profileRef, { xp: newXP, level: newLevel });
  };

  const completeTask = (taskId: string) => {
    const task = remoteTasks.find(t => t.id === taskId);
    if (task && !task.completed && user) {
      const taskRef = doc(db, 'users', user.uid, 'lessonProgress', taskId);
      updateDocumentNonBlocking(taskRef, { completed: true, status: 'completed', completedAt: serverTimestamp() });
      addXP(task.xpReward);
    }
  };

  const buyStock = (symbol: string, shares: number, priceUsd: number) => {
    if (!user || !profile || (profile.balance || 0) < (shares * priceUsd)) return;
    
    const cost = shares * priceUsd;
    updateDocumentNonBlocking(profileRef!, { balance: (profile.balance || 0) - cost });
    
    const investmentId = `inv-${symbol}`;
    const invRef = doc(db, 'users', user.uid, 'virtualInvestments', investmentId);
    
    const existing = portfolio.find(p => p.symbol === symbol);
    if (existing) {
      const newShares = (existing.shares || 0) + shares;
      const newAvg = ((existing.shares || 0) * (existing.avgPrice || 0) + cost) / newShares;
      updateDocumentNonBlocking(invRef, { shares: newShares, avgPrice: newAvg, lastTransactionAt: new Date().toISOString() });
    } else {
      setDocumentNonBlocking(invRef, {
        id: investmentId,
        userId: user.uid,
        symbol,
        shares,
        avgPrice: priceUsd,
        totalInvestmentAmount: cost,
        lastTransactionAt: new Date().toISOString()
      }, { merge: true });
    }
    completeTask('market-trade'); 
  };

  const sellStock = (symbol: string, shares: number, priceUsd: number) => {
    if (!user || !profile) return;
    const existing = portfolio.find(p => p.symbol === symbol);
    if (!existing || (existing.shares || 0) < shares) return;

    const gain = shares * priceUsd;
    updateDocumentNonBlocking(profileRef!, { balance: (profile.balance || 0) + gain });
    
    const invRef = doc(db, 'users', user.uid, 'virtualInvestments', existing.id);
    if (existing.shares === shares) {
      updateDocumentNonBlocking(invRef, { shares: 0 });
    } else {
      updateDocumentNonBlocking(invRef, { shares: (existing.shares || 0) - shares });
    }
  };

  const updateSavings = (amountUsd: number) => {
    if (!profileRef || !profile) return;
    if (amountUsd > 0 && (profile.balance || 0) < amountUsd) return;
    if (amountUsd < 0 && (profile.savingsCurrent || 0) < Math.abs(amountUsd)) return;

    updateDocumentNonBlocking(profileRef, {
      balance: (profile.balance || 0) - amountUsd,
      savingsCurrent: (profile.savingsCurrent || 0) + amountUsd
    });
  };

  const setSavingsGoal = (amountUsd: number) => {
    if (!profileRef) return;
    updateDocumentNonBlocking(profileRef, { savingsGoal: amountUsd });
  };

  const updateLiabilities = (amountUsd: number) => {
    if (!profileRef || !profile) return;
    updateDocumentNonBlocking(profileRef, { liabilities: Math.max(0, (profile.liabilities || 0) + amountUsd) });
  };

  const convertToCurrent = (usdAmount: number) => {
    const rate = EXCHANGE_RATES[profile?.currency || 'USD'] || 1;
    return (usdAmount || 0) * rate;
  };

  const convertFromCurrent = (currentAmount: number) => {
    const rate = EXCHANGE_RATES[profile?.currency || 'USD'] || 1;
    return (currentAmount || 0) / rate;
  };

  const formatValue = (usdAmount: number) => {
    const converted = convertToCurrent(usdAmount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: profile?.currency || 'USD',
    }).format(converted);
  };

  const getPortfolioValue = () => {
    if (!Array.isArray(portfolio)) return 0;
    return portfolio.reduce((acc, item) => {
      if (!item) return acc;
      const stock = stocks.find(s => s.symbol === item.symbol);
      return acc + ((item.shares || 0) * (stock?.price || 0));
    }, 0);
  };

  const value: UserContextType = {
    name: profile?.name || '',
    email: profile?.email || '',
    age,
    ageGroup,
    country: profile?.country || 'United States',
    currency: profile?.currency || 'USD',
    balance: profile?.balance !== undefined ? profile.balance : 0,
    portfolio,
    stocks,
    savingsGoal: profile?.savingsGoal || 500,
    savingsCurrent: profile?.savingsCurrent || 0,
    liabilities: profile?.liabilities || 0,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    tasks: remoteTasks,
    isLoggedIn: !!user,
    isInitialLoading,
    login,
    logout,
    resetAccount,
    updateProfile,
    updateStocks: setStocks,
    buyStock,
    sellStock,
    updateSavings,
    setSavingsGoal,
    updateLiabilities,
    addXP,
    completeTask,
    getPortfolioValue,
    formatValue,
    convertToCurrent,
    convertFromCurrent
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
