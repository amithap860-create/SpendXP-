"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  useFirestore, 
  useDoc,
  useCollection,
  useMemoFirebase,
  safeUpdateDoc
} from '@/firebase';
import { 
  doc, 
  collection, 
  serverTimestamp,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useAuthContext } from '@/context/AuthContext';
import { auth, isFirebaseReady } from '@/lib/firebase';
import { safeSetDoc } from '@/lib/firestoreSafe';

export interface AppTask {
  id: string;
  title: string;
  category: string;
  xpReward: number;
  completed: boolean;
  userId?: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
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
  onboardingComplete: boolean;
}

interface UserContextType {
  name: string;
  balance: number;
  xp: number;
  level: number;
  age?: number;
  ageGroup?: string;
  user?: any; // Firebase user object
  savingsCurrent?: number;
  savingsGoal?: number;
  updateSavings?: (current: number, goal: number) => void;
  setSavingsGoal?: (goal: number) => void;
  stocks?: any[];
  updateStocks?: (stocks: any[]) => void;
  buyStock?: (symbol: string, quantity: number) => void;
  sellStock?: (symbol: string, quantity: number) => void;
  currency?: string;
  tasks: AppTask[];
  formatValue: (amount: number) => string;
  completeTask: (taskId: string) => void;
  isInitialLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, age: number) => Promise<void>;
  portfolio: any[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const db = useFirestore();
  const isLoggedIn = !!user;
  
  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, 'users', user.uid) : null;
  }, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  const portfolioQuery = useMemoFirebase(() => {
    return user ? collection(db, 'users', user.uid, 'virtualInvestments') : null;
  }, [db, user]);
  const { data: portfolioData, isLoading: isPortfolioLoading } = useCollection(portfolioQuery);
  const portfolio = useMemo(() => Array.isArray(portfolioData) ? portfolioData : [], [portfolioData]);

  const tasksQuery = useMemoFirebase(() => {
    return user ? collection(db, 'users', user.uid, 'lessonProgress') : null;
  }, [db, user]);
  const { data: remoteTasksData, isLoading: isTasksLoading } = useCollection<AppTask>(tasksQuery);
  const remoteTasks = useMemo(() => Array.isArray(remoteTasksData) ? remoteTasksData : [], [remoteTasksData]);

  const rawInitialLoading = isProfileLoading || isPortfolioLoading || isTasksLoading;
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  useEffect(() => {
    setIsInitialLoading(rawInitialLoading);
  }, [rawInitialLoading]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !isFirebaseReady()) {
        console.warn('[SpendXP] UserProvider: Firebase core is not ready');
      }
    } catch (e) {
      console.warn('Auth init error:', e);
    } finally {
      if (!rawInitialLoading) {
        setIsInitialLoading(false);
      }
    }
  }, [rawInitialLoading]);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!rawInitialLoading) {
      return;
    }
    const t = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);
    return () => clearTimeout(t);
  }, [rawInitialLoading]);

  const formatValue = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const login = async (email: string, age: number) => {
    if (!auth || !db) {
      throw new Error('Firebase is not ready');
    }
    const birthYear = new Date().getFullYear() - age;
    const credential = await signInAnonymously(auth);
    const uid = credential.user.uid;
    const userRef = doc(db, 'users', uid);
    const localPart = email.split('@')[0] ?? 'Student';
    const displayName = localPart.replace(/[._]+/g, ' ').trim() || 'Student';
    await safeSetDoc(
      userRef,
      {
        id: uid,
        email: email.toLowerCase(),
        birthYear,
        displayName,
        onboardingComplete: false,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const completeTask = (taskId: string) => {
    if (!user) return;
    const existing = remoteTasks.find(t => t.id === taskId);
    if (existing?.completed) return;

    const taskRef = doc(db, 'users', user.uid, 'lessonProgress', taskId);
    setDocumentNonBlocking(taskRef, { 
      id: taskId,
      completed: true, 
      completedAt: serverTimestamp(),
      userId: user.uid,
      category: 'Academy'
    }, { merge: true });
    
    const userRef = doc(db, 'users', user.uid);
    safeUpdateDoc(userRef, { 
      xp: (profile?.xp || 0) + 80, // Flat reward for lessons
      level: Math.floor(((profile?.xp || 0) + 80) / 500) + 1
    });
  };

  const updateSavings = (current: number, goal: number) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    safeUpdateDoc(userRef, { 
      savingsCurrent: current,
      savingsGoal: goal
    });
  };

  const setSavingsGoal = (goal: number) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    safeUpdateDoc(userRef, { 
      savingsGoal: goal
    });
  };

  // Market/Stock functions - minimal implementations
  const [stocks, setStocks] = useState<any[]>([]);
  const updateStocks = (newStocks: any[]) => setStocks(newStocks);
  const buyStock = (symbol: string, quantity: number) => {
    console.log('Buy stock:', symbol, quantity);
  };
  const sellStock = (symbol: string, quantity: number) => {
    console.log('Sell stock:', symbol, quantity);
  };

  const value = {
    name: profile?.displayName || user?.displayName || 'Strategist',
    balance: profile?.balance || 0,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    age: profile?.age,
    ageGroup: 'junior', // Default age group
    user,
    savingsCurrent: profile?.savingsCurrent,
    savingsGoal: profile?.savingsGoal,
    updateSavings,
    setSavingsGoal,
    stocks,
    updateStocks,
    buyStock,
    sellStock,
    currency: profile?.currency || 'USD',
    tasks: remoteTasks,
    formatValue,
    completeTask,
    isInitialLoading,
    isLoggedIn,
    login,
    portfolio
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
