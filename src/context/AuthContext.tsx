'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, setPersistence, browserLocalPersistence, browserSessionPersistence, onIdTokenChanged } from 'firebase/auth';
import { getAgeGroup, AgeGroup } from '@/lib/ageAdapt';
import { auth as firebaseAuth, db } from '@/firebase';
import { validateFingerprint, captureFingerprint } from '@/lib/sessionGuard';
import { useRouter } from 'next/navigation';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { safeUpdateDoc, safeSetDoc } from '@/lib/firestoreSafe';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  currentAgeGroup: AgeGroup;
  currencyCode: string;
  linkedProviders: string[];
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, name: string, isParent?: boolean) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  
  const [fingerprint, setFingerprint] = useState<any>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [currentAgeGroup, setCurrentAgeGroup] = useState<AgeGroup>('junior');
  const [currencyCode, setCurrencyCode] = useState<string>('INR');

  useEffect(() => {
    if (!firebaseAuth) return;

    const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const isVerified = firebaseUser.emailVerified;
        setEmailVerified(isVerified);
        
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        let snap = await getDoc(userRef);
        if (!snap.exists()) {
          await safeSetDoc(userRef, {
            id: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Strategist',
            email: firebaseUser.email?.toLowerCase(),
            emailVerified: isVerified,
            createdAt: serverTimestamp(),
            balance: 10000,
            currencyCode: 'INR',
            xp: 0,
            level: 1,
            onboardingComplete: false
          }, { merge: true });
          snap = await getDoc(userRef);
        }

        const profileData = snap.data();
        
        // Age group calc
        const freshAgeGroup = profileData?.birthYear 
          ? getAgeGroup(profileData.birthYear) 
          : 'junior';
        
        setCurrentAgeGroup(freshAgeGroup);
        setCurrencyCode(profileData?.currencyCode || 'INR');

        if (freshAgeGroup !== profileData?.ageGroup) {
          safeUpdateDoc(userRef, { ageGroup: freshAgeGroup });
        }

        if (isVerified && !profileData?.emailVerified) {
          safeUpdateDoc(userRef, { emailVerified: true });
        }

        if (!fingerprint) {
          setFingerprint(captureFingerprint());
        }

        const mode = freshAgeGroup === 'junior' ? browserSessionPersistence : browserLocalPersistence;
        setPersistence(firebaseAuth, mode).catch(console.error);
      } else {
        setEmailVerified(false);
        setFingerprint(null);
      }
    });

    return () => unsubscribe();
  }, [fingerprint]);

  useEffect(() => {
    if (fingerprint && !validateFingerprint(fingerprint)) {
      auth.signOut();
      router.push('/login?reason=session_invalid');
    }
  }, [fingerprint, router, auth]);

  const value = {
    ...auth,
    emailVerified,
    currentAgeGroup,
    currencyCode,
  };

  return (
    <AuthContext.Provider value={value as AuthContextType}>
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
