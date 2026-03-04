"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AgeGroup = '8-11' | '11-15' | '16-20';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: number[];
}

export interface PortfolioItem {
  symbol: string;
  shares: number;
  avgPrice: number;
}

interface UserContextType {
  email: string;
  age: number;
  ageGroup: AgeGroup;
  balance: number;
  portfolio: PortfolioItem[];
  savingsGoal: number;
  savingsCurrent: number;
  isLoggedIn: boolean;
  login: (email: string, age: number) => void;
  logout: () => void;
  buyStock: (symbol: string, shares: number, price: number) => void;
  sellStock: (symbol: string, shares: number, price: number) => void;
  updateSavings: (amount: number) => void;
  setSavingsGoal: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('11-15');
  const [balance, setBalance] = useState(1000);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [savingsGoal, setSavingsGoalValue] = useState(500);
  const [savingsCurrent, setSavingsCurrent] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('spendxp_user');
    if (saved) {
      const data = JSON.parse(saved);
      setEmail(data.email);
      setAge(data.age);
      setAgeGroup(data.ageGroup);
      setBalance(data.balance ?? 1000);
      setPortfolio(data.portfolio ?? []);
      setSavingsGoalValue(data.savingsGoal ?? 500);
      setSavingsCurrent(data.savingsCurrent ?? 0);
      setIsLoggedIn(true);
    }
  }, []);

  const saveState = (updates: any) => {
    const currentState = {
      email, age, ageGroup, balance, portfolio, savingsGoal, savingsCurrent,
      ...updates
    };
    localStorage.setItem('spendxp_user', JSON.stringify(currentState));
  };

  const login = (newEmail: string, newAge: number) => {
    let group: AgeGroup = '11-15';
    if (newAge <= 11) group = '8-11';
    else if (newAge >= 16) group = '16-20';
    
    setEmail(newEmail);
    setAge(newAge);
    setAgeGroup(group);
    setIsLoggedIn(true);
    saveState({ email: newEmail, age: newAge, ageGroup: group });
  };

  const logout = () => {
    setEmail('');
    setAge(0);
    setIsLoggedIn(false);
    localStorage.removeItem('spendxp_user');
  };

  const buyStock = (symbol: string, shares: number, price: number) => {
    const totalCost = shares * price;
    if (balance < totalCost) return;

    setBalance(prev => prev - totalCost);
    setPortfolio(prev => {
      const existing = prev.find(i => i.symbol === symbol);
      if (existing) {
        const newShares = existing.shares + shares;
        const newAvg = (existing.shares * existing.avgPrice + totalCost) / newShares;
        const updated = prev.map(i => i.symbol === symbol ? { ...i, shares: newShares, avgPrice: newAvg } : i);
        saveState({ portfolio: updated, balance: balance - totalCost });
        return updated;
      }
      const newItem = { symbol, shares, avgPrice: price };
      const updated = [...prev, newItem];
      saveState({ portfolio: updated, balance: balance - totalCost });
      return updated;
    });
  };

  const sellStock = (symbol: string, shares: number, price: number) => {
    const existing = portfolio.find(i => i.symbol === symbol);
    if (!existing || existing.shares < shares) return;

    const totalGain = shares * price;
    setBalance(prev => prev + totalGain);
    setPortfolio(prev => {
      const updated = prev.map(i => i.symbol === symbol ? { ...i, shares: i.shares - shares } : i).filter(i => i.shares > 0);
      saveState({ portfolio: updated, balance: balance + totalGain });
      return updated;
    });
  };

  const updateSavings = (amount: number) => {
    setSavingsCurrent(prev => Math.max(0, prev + amount));
    saveState({ savingsCurrent: savingsCurrent + amount });
  };

  const setSavingsGoal = (amount: number) => {
    setSavingsGoalValue(amount);
    saveState({ savingsGoal: amount });
  };

  return (
    <UserContext.Provider value={{ 
      email, age, ageGroup, balance, portfolio, savingsGoal, savingsCurrent, isLoggedIn,
      login, logout, buyStock, sellStock, updateSavings, setSavingsGoal
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};