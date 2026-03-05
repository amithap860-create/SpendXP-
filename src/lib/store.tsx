"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type AgeGroup = '8-11' | '11-15' | '16-20';

export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.35,
  AUD: 1.52,
  JPY: 150.12,
  INR: 82.95,
  BRL: 4.97,
  ZAR: 19.10
};

export interface Stock {
  symbol: string;
  name: string;
  price: number; // Stored in USD
  change: number;
  history: number[];
}

export interface PortfolioItem {
  symbol: string;
  shares: number;
  avgPrice: number; // Stored in USD
}

interface UserContextType {
  name: string;
  email: string;
  age: number;
  ageGroup: AgeGroup;
  country: string;
  currency: string;
  balance: number; // Stored in USD
  portfolio: PortfolioItem[];
  savingsGoal: number; // Stored in USD
  savingsCurrent: number; // Stored in USD
  isLoggedIn: boolean;
  login: (email: string, age: number) => void;
  logout: () => void;
  updateProfile: (data: { name: string; email: string; age: number; country: string; currency: string }) => void;
  buyStock: (symbol: string, shares: number, priceUsd: number) => void;
  sellStock: (symbol: string, shares: number, priceUsd: number) => void;
  updateSavings: (amountUsd: number) => void;
  setSavingsGoal: (amountUsd: number) => void;
  // Helpers
  formatValue: (usdAmount: number) => string;
  convertToCurrent: (usdAmount: number) => number;
  convertFromCurrent: (currentAmount: number) => number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('11-15');
  const [country, setCountry] = useState('United States');
  const [currency, setCurrency] = useState('USD');
  const [balance, setBalance] = useState(1000); // Internal USD
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [savingsGoal, setSavingsGoalValue] = useState(500); // Internal USD
  const [savingsCurrent, setSavingsCurrent] = useState(0); // Internal USD
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('spendxp_user');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setName(data.name || '');
        setEmail(data.email || '');
        setAge(data.age || 0);
        setAgeGroup(data.ageGroup || '11-15');
        setCountry(data.country || 'United States');
        setCurrency(data.currency || 'USD');
        setBalance(data.balance ?? 1000);
        setPortfolio(data.portfolio ?? []);
        setSavingsGoalValue(data.savingsGoal ?? 500);
        setSavingsCurrent(data.savingsCurrent ?? 0);
        setIsLoggedIn(!!data.email);
      } catch (e) {
        console.error("Failed to parse saved user state", e);
      }
    }
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (isInitialized.current && isLoggedIn) {
      const state = {
        name, email, age, ageGroup, country, currency, balance, portfolio, savingsGoal, savingsCurrent
      };
      localStorage.setItem('spendxp_user', JSON.stringify(state));
    }
  }, [name, email, age, ageGroup, country, currency, balance, portfolio, savingsGoal, savingsCurrent, isLoggedIn]);

  const login = (newEmail: string, newAge: number) => {
    let group: AgeGroup = '11-15';
    if (newAge <= 11) group = '8-11';
    else if (newAge >= 16) group = '16-20';
    
    setEmail(newEmail);
    setAge(newAge);
    setAgeGroup(group);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setName('');
    setEmail('');
    setAge(0);
    setAgeGroup('11-15');
    setCountry('United States');
    setCurrency('USD');
    setBalance(1000);
    setPortfolio([]);
    setSavingsGoalValue(500);
    setSavingsCurrent(0);
    setIsLoggedIn(false);
    localStorage.removeItem('spendxp_user');
  };

  const updateProfile = (data: { name: string; email: string; age: number; country: string; currency: string }) => {
    setName(data.name);
    setEmail(data.email);
    setAge(data.age);
    setCountry(data.country);
    setCurrency(data.currency);
    
    let group: AgeGroup = '11-15';
    if (data.age <= 11) group = '8-11';
    else if (data.age >= 16) group = '16-20';
    setAgeGroup(group);
  };

  const convertToCurrent = (usdAmount: number) => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return usdAmount * rate;
  };

  const convertFromCurrent = (currentAmount: number) => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return currentAmount / rate;
  };

  const formatValue = (usdAmount: number) => {
    const converted = convertToCurrent(usdAmount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(converted);
  };

  const buyStock = (symbol: string, shares: number, priceUsd: number) => {
    const totalCost = shares * priceUsd;
    if (balance < totalCost) return;

    setBalance(prev => prev - totalCost);
    setPortfolio(prev => {
      const existing = prev.find(i => i.symbol === symbol);
      if (existing) {
        const newShares = existing.shares + shares;
        const newAvg = (existing.shares * existing.avgPrice + totalCost) / newShares;
        return prev.map(i => i.symbol === symbol ? { ...i, shares: newShares, avgPrice: newAvg } : i);
      }
      return [...prev, { symbol, shares, avgPrice: priceUsd }];
    });
  };

  const sellStock = (symbol: string, shares: number, priceUsd: number) => {
    const existing = portfolio.find(i => i.symbol === symbol);
    if (!existing || existing.shares < shares) return;

    const totalGain = shares * priceUsd;
    setBalance(prev => prev + totalGain);
    setPortfolio(prev => {
      return prev.map(i => i.symbol === symbol ? { ...i, shares: i.shares - shares } : i).filter(i => i.shares > 0);
    });
  };

  const updateSavings = (amountUsd: number) => {
    const potentialNewSavings = savingsCurrent + amountUsd;
    if (amountUsd > 0 && balance < amountUsd) return;

    if (amountUsd > 0) {
      setBalance(prev => prev - amountUsd);
    } else {
      setBalance(prev => prev + Math.abs(amountUsd));
    }
    
    setSavingsCurrent(Math.max(0, potentialNewSavings));
  };

  const setSavingsGoal = (amountUsd: number) => {
    setSavingsGoalValue(amountUsd);
  };

  return (
    <UserContext.Provider value={{ 
      name, email, age, ageGroup, country, currency, balance, portfolio, savingsGoal, savingsCurrent, isLoggedIn,
      login, logout, updateProfile, buyStock, sellStock, updateSavings, setSavingsGoal,
      formatValue, convertToCurrent, convertFromCurrent
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
