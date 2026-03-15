"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  useUser as useFirebaseUser, 
  useFirestore, 
  useDoc,
  useCollection,
  useMemoFirebase
} from '@/firebase';
import { 
  doc, 
  collection, 
  serverTimestamp,
} from 'firebase/firestore';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useAuthContext } from '@/context/AuthContext';

export type AgeGroup = '8-11' | '11-15' | '16-20';

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

const INITIAL_STOCKS: Stock[] = [
  { symbol: 'ECO', name: 'EcoGrow', price: 12050, change: 2.5, history: [11500, 11800, 12000, 11900, 12050] },
  { symbol: 'SOL', name: 'Solaris Tech', price: 24510, change: -1.2, history: [25000, 24800, 24600, 24700, 24510] },
  { symbol: 'AQUA', name: 'AquaLife', price: 5675, change: 0.8, history: [5500, 5600, 5550, 5620, 5675] },
  { symbol: 'CYBER', name: 'CyberNest', price: 8920, change: 4.1, history: [8200, 8500, 8700, 8800, 8920] },
  { symbol: 'BRIO', name: 'BrioFoods', price: 1540, change: -0.5, history: [1600, 1580, 1550, 1560, 1540] },
];

const DEFAULT_TASKS: AppTask[] = [
  { id: 'academy-income', title: 'Learn about Income', category: 'Academy', xpReward: 50, completed: false },
  { id: 'academy-outcome', title: 'Understand Expenses', category: 'Academy', xpReward: 50, completed: false },
  { id: 'academy-budget', title: 'Master the Budget', category: 'Academy', xpReward: 50, completed: false },
  { id: 'market-trade', title: 'Make your first trade', category: 'Market', xpReward: 100, completed: false },
  { id: 'flashcards-set', title: 'Complete a Flashcard set', category: 'Study', xpReward: 75, completed: false },
];

interface UserContextType {
  name: string;
  balance: number;
  xp: number;
  level: number;
  tasks: AppTask[];
  stocks: Stock[];
  portfolio: PortfolioItem[];
  formatValue: (amount: number) => string;
  completeTask: (taskId: string) => void;
  isInitialLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const db = useFirestore();
  
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);

  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, 'users', user.uid) : null;
  }, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  const portfolioQuery = useMemoFirebase(() => {
    return user ? collection(db, 'users', user.uid, 'virtualInvestments') : null;
  }, [db, user]);
  const { data: portfolioData, isLoading: isPortfolioLoading } = useCollection<PortfolioItem>(portfolioQuery);
  const portfolio = useMemo(() => Array.isArray(portfolioData) ? portfolioData : [], [portfolioData]);

  const tasksQuery = useMemoFirebase(() => {
    return user ? collection(db, 'users', user.uid, 'lessonProgress') : null;
  }, [db, user]);
  const { data: remoteTasksData, isLoading: isTasksLoading } = useCollection<AppTask>(tasksQuery);
  const remoteTasks = useMemo(() => Array.isArray(remoteTasksData) ? remoteTasksData : [], [remoteTasksData]);

  const isInitialLoading = isProfileLoading || isPortfolioLoading || isTasksLoading;

  useEffect(() => {
    if (user && !isInitialLoading && remoteTasks.length === 0) {
      DEFAULT_TASKS.forEach((t) => {
        const taskRef = doc(db, 'users', user.uid, 'lessonProgress', t.id);
        setDocumentNonBlocking(taskRef, { ...t, userId: user.uid }, { merge: true });
      });
    }
  }, [user, isInitialLoading, remoteTasks.length, db]);

  const formatValue = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const completeTask = (taskId: string) => {
    if (!user) return;
    const task = remoteTasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      const taskRef = doc(db, 'users', user.uid, 'lessonProgress', taskId);
      updateDocumentNonBlocking(taskRef, { completed: true });
      
      const userRef = doc(db, 'users', user.uid);
      updateDocumentNonBlocking(userRef, { 
        xp: (profile?.xp || 0) + task.xpReward,
        level: Math.floor(((profile?.xp || 0) + task.xpReward) / 500) + 1
      });
    }
  };

  const value = {
    name: profile?.displayName || user?.displayName || '',
    balance: profile?.balance || 0,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    tasks: remoteTasks,
    stocks,
    portfolio,
    formatValue,
    completeTask,
    isInitialLoading
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
