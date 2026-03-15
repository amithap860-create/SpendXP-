'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * Defines the age groups for SpendXP users.
 */
export type AgeGroup = 'junior' | 'teen' | 'senior';

/**
 * Configuration for difficulty levels across the app.
 */
export type DifficultyConfig = {
  moneyAmounts: {
    small: number;
    medium: number;
    large: number;
  };
  timePerQuestion: number; // in seconds
  vocabularyLevel: 'simple' | 'standard' | 'advanced';
  showPercentages: boolean;
  showInterestRates: boolean;
  showTaxCalculations: boolean;
};

/**
 * Calculates the age group based on birth year.
 * @param birthYear Year of birth
 * @returns AgeGroup
 */
export function getAgeGroup(birthYear: number): AgeGroup {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  if (age <= 12) return 'junior';
  if (age <= 16) return 'teen';
  return 'senior';
}

/**
 * Returns age-appropriate difficulty configuration.
 * @param group Age group
 * @returns DifficultyConfig
 */
export function getDifficultyConfig(group: AgeGroup): DifficultyConfig {
  switch (group) {
    case 'junior':
      return {
        moneyAmounts: { small: 5, medium: 20, large: 100 },
        timePerQuestion: 60,
        vocabularyLevel: 'simple',
        showPercentages: false,
        showInterestRates: false,
        showTaxCalculations: false,
      };
    case 'teen':
      return {
        moneyAmounts: { small: 50, medium: 200, large: 1000 },
        timePerQuestion: 45,
        vocabularyLevel: 'standard',
        showPercentages: true,
        showInterestRates: true,
        showTaxCalculations: false,
      };
    case 'senior':
      return {
        moneyAmounts: { small: 500, medium: 2000, large: 10000 },
        timePerQuestion: 30,
        vocabularyLevel: 'advanced',
        showPercentages: true,
        showInterestRates: true,
        showTaxCalculations: true,
      };
    default:
      return getDifficultyConfig('junior');
  }
}

interface AgeGroupContextValue {
  ageGroup: AgeGroup;
  difficultyConfig: DifficultyConfig;
  isLoading: boolean;
}

const AgeGroupContext = createContext<AgeGroupContextValue | undefined>(undefined);

/**
 * Provider that synchronizes age group settings with user profile in Firestore.
 */
export const AgeGroupProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('junior');
  const [config, setConfig] = useState<DifficultyConfig>(getDifficultyConfig('junior'));

  // Memoize document reference for profile
  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, 'users', user.uid) : null;
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (profile?.birthYear) {
      const group = getAgeGroup(profile.birthYear);
      setAgeGroup(group);
      setConfig(getDifficultyConfig(group));
    } else if (profile?.age) {
        // Fallback for existing data using age
        const currentYear = new Date().getFullYear();
        const group = getAgeGroup(currentYear - profile.age);
        setAgeGroup(group);
        setConfig(getDifficultyConfig(group));
    }
  }, [profile]);

  const value: AgeGroupContextValue = {
    ageGroup,
    difficultyConfig: config,
    isLoading: isUserLoading || isProfileLoading,
  };

  return (
    <AgeGroupContext.Provider value={value}>
      {children}
    </AgeGroupContext.Provider>
  );
};

/**
 * Hook to access age group and difficulty settings.
 */
export const useAgeAdapt = () => {
  const context = useContext(AgeGroupContext);
  if (context === undefined) {
    throw new Error('useAgeAdapt must be used within an AgeGroupProvider');
  }
  return context;
};
