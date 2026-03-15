"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  useUser as useFirebaseUser, 
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
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useAuthContext } from '@/context/AuthContext';

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

interface UserContextType {
  name: string;
  balance: number;
  xp: number;
  level: number;
  tasks: AppTask[];
  formatValue: (amount: number) => string;
  completeTask: (taskId: string) => void;
  isInitialLoading: boolean;
  portfolio: any[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const db = useFirestore();
  
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

  const isInitialLoading = isProfileLoading || isPortfolioLoading || isTasksLoading;

  const formatValue = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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

  const value = {
    name: profile?.displayName || user?.displayName || 'Strategist',
    balance: profile?.balance || 0,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    tasks: remoteTasks,
    formatValue,
    completeTask,
    isInitialLoading,
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
