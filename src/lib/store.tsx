"use client"

import React, { createContext, useContext, useReducer, useMemo, useState, useEffect } from 'react';
import { doc, collection, query, where, orderBy, limit, getDocs, getDoc, onSnapshot, DocumentReference, DocumentData, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useAuthContext } from '@/context/AuthContext';
import { auth, isFirebaseReady } from '@/lib/firebase';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useFirebase, useUser as useFirebaseUser } from '@/firebase';
import { safeSetDoc, safeUpdateDoc } from '@/lib/firestoreSafe';
import { SecurityQuestion, UserProfile } from '@/types/user';

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

const DEFAULT_USER_CONTEXT: UserContextType = {
  name: 'Strategist',
  balance: 0,
  xp: 0,
  level: 1,
  tasks: [],
  formatValue: (amount: number) => amount.toString(),
  completeTask: () => {},
  isInitialLoading: true,
  isLoggedIn: false,
  login: async () => {},
  portfolio: [],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Returns true only when the uid is a valid Firebase Auth uid.
 * Firebase Auth uids are 28 characters long. We use a minimum of 5 to
 * also reject stub uids like '1' that come from the legacy localStorage
 * auth system in AuthContext.tsx during page reloads.
 */
function isValidUid(uid: string | null | undefined): uid is string {
  return typeof uid === 'string' && uid.length >= 5;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const firebaseUser = useFirebaseUser();
  const db = useFirestore();
  const isLoggedIn = !!firebaseUser.user;

  // uid must come from the real Firebase Auth user, not from the
  // localStorage-based AuthContext which may contain a stub uid of '1'.
  const uid = isValidUid(firebaseUser.user?.uid) ? firebaseUser.user!.uid : null;

  const profileRef = useMemoFirebase(() => {
    if (!uid) return null;
    return doc(db, 'users', uid);
  }, [db, uid]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  const portfolioQuery = useMemoFirebase(() => {
    if (!uid) return null;
    return collection(db, 'users', uid, 'virtualInvestments');
  }, [db, uid]);
  const { data: portfolioData, isLoading: isPortfolioLoading } = useCollection(portfolioQuery);
  const portfolio = useMemo(() => Array.isArray(portfolioData) ? portfolioData : [], [portfolioData]);

  const tasksQuery = useMemoFirebase(() => {
    if (!uid) return null;
    return collection(db, 'users', uid, 'lessonProgress');
  }, [db, uid]);
  const { data: remoteTasksData, isLoading: isTasksLoading } = useCollection<AppTask>(tasksQuery);
  const remoteTasks = useMemo(() => Array.isArray(remoteTasksData) ? remoteTasksData : [], [remoteTasksData]);

  const rawInitialLoading = uid ? (isProfileLoading || isPortfolioLoading || isTasksLoading) : false;
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [stocks, setStocks] = useState<any[]>([]);

  useEffect(() => {
    setIsInitialLoading(rawInitialLoading);
  }, [rawInitialLoading]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  // Guard: do not render live data into context while Firebase Auth is still
  // resolving. Children see default values and a loading spinner instead of
  // stale / incorrectly-permissioned Firestore data.
  if (firebaseUser.isUserLoading || !uid) {
    return (
      <UserContext.Provider value={DEFAULT_USER_CONTEXT}>
        {children}
      </UserContext.Provider>
    );
  }

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
    const anonUid = credential.user.uid;
    const userRef = doc(db, 'users', anonUid);
    const localPart = email.split('@')[0] ?? 'Student';
    const displayName = localPart.replace(/[._]+/g, ' ').trim() || 'Student';
    await safeSetDoc(
      userRef,
      {
        id: anonUid,
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
    // Use uid from Firebase Auth, not from the localStorage AuthContext
    if (!uid) return;
    const existing = remoteTasks.find(t => t.id === taskId);
    if (existing?.completed) return;

    const taskRef = doc(db, 'users', uid, 'lessonProgress', taskId);
    setDocumentNonBlocking(taskRef, {
      id: taskId,
      completed: true,
      completedAt: serverTimestamp(),
      userId: uid,
      category: 'Academy'
    }, { merge: true });

    const userRef = doc(db, 'users', uid);
    safeUpdateDoc(userRef, {
      xp: (profile?.xp || 0) + 80,
      level: Math.floor(((profile?.xp || 0) + 80) / 500) + 1
    });
  };

  const updateSavings = (current: number, goal: number) => {
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    safeUpdateDoc(userRef, {
      savingsCurrent: current,
      savingsGoal: goal
    });
  };

  const setSavingsGoal = (goal: number) => {
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    safeUpdateDoc(userRef, {
      savingsGoal: goal
    });
  };

  const updateStocks = (newStocks: any[]) => setStocks(newStocks);

  const buyStock = (symbol: string, quantity: number) => {
    if (!uid) return;
    const stock = stocks.find((s: any) => s.symbol === symbol);
    if (!stock) return;

    const totalCost = stock.price * quantity;
    const currentBalance = profile?.balance || 0;
    if (currentBalance < totalCost) return;

    // Deduct balance
    const userRef = doc(db, 'users', uid);
    safeUpdateDoc(userRef, { balance: currentBalance - totalCost });

    // Upsert portfolio entry
    const investmentRef = doc(db, 'users', uid, 'virtualInvestments', symbol);
    const existing = portfolio.find((p: any) => p.symbol === symbol);
    if (existing && existing.shares > 0) {
      const newShares = existing.shares + quantity;
      const prevAvg = existing.avgPrice || existing.currentPrice || stock.price;
      const newAvgPrice = (prevAvg * existing.shares + totalCost) / newShares;
      safeSetDoc(investmentRef, {
        symbol,
        name: stock.name,
        shares: newShares,
        avgPrice: newAvgPrice,
        currentPrice: stock.price,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      safeSetDoc(investmentRef, {
        symbol,
        name: stock.name,
        shares: quantity,
        avgPrice: stock.price,
        currentPrice: stock.price,
        purchasedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };

  const sellStock = (symbol: string, quantity: number) => {
    if (!uid) return;
    const stock = stocks.find((s: any) => s.symbol === symbol);
    if (!stock) return;

    const existing = portfolio.find((p: any) => p.symbol === symbol);
    if (!existing || existing.shares < quantity) return;

    const proceeds = stock.price * quantity;
    const currentBalance = profile?.balance || 0;

    // Add proceeds to balance
    const userRef = doc(db, 'users', uid);
    safeUpdateDoc(userRef, { balance: currentBalance + proceeds });

    // Update portfolio
    const investmentRef = doc(db, 'users', uid, 'virtualInvestments', symbol);
    const remainingShares = existing.shares - quantity;
    safeSetDoc(investmentRef, {
      symbol,
      name: stock.name,
      shares: remainingShares,
      currentPrice: stock.price,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  };

  const value: UserContextType = {
    name: profile?.displayName || user?.displayName || 'Strategist',
    balance: profile?.balance || 0,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    age: profile?.age,
    ageGroup: 'junior',
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
