'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useFirestore, useDoc, useMemoFirebase, FirebaseContext } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AgeGroup, DifficultyConfig, getAgeGroup, getDifficultyConfig } from './ageAdapt';

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
  const db = useFirestore();
  
  // Safe access to context to avoid "services not available" error during SSR
  const firebaseContext = useContext(FirebaseContext);
  const user = firebaseContext?.areServicesAvailable ? firebaseContext.user : null;
  const isUserLoading = firebaseContext?.isUserLoading ?? true;
  const uid = user?.uid ?? null;

  const [ageGroup, setAgeGroup] = useState<AgeGroup>('teen');
  const [config, setConfig] = useState<DifficultyConfig>(getDifficultyConfig('teen'));

  // Memoize document reference for profile
  const profileRef = useMemoFirebase(() => {
    if (!uid || typeof uid !== 'string' || uid.trim() === '' || uid.length < 5) return null;
    return doc(db, 'users', uid);
  }, [db, uid]);

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
