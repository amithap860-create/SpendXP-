
'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { useAuth as useFirebaseAuth } from '@/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, isParent?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const firebaseAuth = useFirebaseAuth();
  const { ageGroup } = useAgeAdapt();

  // Security: Dynamic Persistence Hardening
  useEffect(() => {
    if (!firebaseAuth) return;
    
    // For users under 13 (junior), use session persistence (ends on browser close)
    // For others, use local persistence
    const mode = ageGroup === 'junior' ? browserSessionPersistence : browserLocalPersistence;
    
    setPersistence(firebaseAuth, mode).catch((err) => {
      console.error('[SpendXP Security] Persistence update failed:', err);
    });
  }, [ageGroup, firebaseAuth]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
