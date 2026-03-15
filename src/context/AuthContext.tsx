'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, setPersistence, browserLocalPersistence, browserSessionPersistence, onIdTokenChanged } from 'firebase/auth';
import { useAgeAdapt, getAgeGroup, AgeGroup } from '@/lib/ageAdapt';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { validateFingerprint, captureFingerprint } from '@/lib/sessionGuard';
import { useRouter } from 'next/navigation';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { safeUpdateDoc, safeSetDoc } from '@/lib/firestoreSafe';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  currentAgeGroup: AgeGroup;
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
  const firebaseAuth = useFirebaseAuth();
  const db = useFirestore();
  const router = useRouter();
  
  const [fingerprint, setFingerprint] = useState<any>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [currentAgeGroup, setCurrentAgeGroup] = useState<AgeGroup>('junior');

  useEffect(() => {
    if (!firebaseAuth) return;

    const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const isVerified = firebaseUser.emailVerified;
        setEmailVerified(isVerified);
        
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Logic 10: Heal race condition - ensure profile exists
        let snap = await getDoc(userRef);
        if (!snap.exists()) {
          await safeSetDoc(userRef, {
            id: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Strategist',
            email: firebaseUser.email?.toLowerCase(),
            emailVerified: isVerified,
            createdAt: serverTimestamp(),
            balance: 10000,
            xp: 0,
            level: 1,
            onboardingComplete: false
          }, { merge: true });
          snap = await getDoc(userRef);
        }

        const profileData = snap.data();
        
        // Logic 1: Live Age Group Recalculation
        const freshAgeGroup = profileData?.birthYear 
          ? getAgeGroup(profileData.birthYear) 
          : 'junior';
        
        setCurrentAgeGroup(freshAgeGroup);

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
  }, [firebaseAuth, db]);

  useEffect(() => {
    if (fingerprint && !validateFingerprint(fingerprint)) {
      console.warn('[SpendXP Security] Session hijack suspected. Terminating session.');
      auth.signOut();
      router.push('/login?reason=session_invalid');
    }
  }, [fingerprint, router, auth]);

  const value = {
    ...auth,
    emailVerified,
    currentAgeGroup,
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
