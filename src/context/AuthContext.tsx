'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, setPersistence, browserLocalPersistence, browserSessionPersistence, onIdTokenChanged } from 'firebase/auth';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { validateFingerprint, captureFingerprint } from '@/lib/sessionGuard';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { safeUpdateDoc } from '@/lib/firestoreSafe';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
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
  const { ageGroup } = useAgeAdapt();
  const router = useRouter();
  
  const [fingerprint, setFingerprint] = useState<any>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    if (!firebaseAuth) return;

    const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const isVerified = firebaseUser.emailVerified;
        setEmailVerified(isVerified);
        
        // Sync verification status to Firestore if it just changed
        if (isVerified) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          safeUpdateDoc(userRef, { emailVerified: true });
        }

        // Fingerprint capturing on login
        if (!fingerprint) {
          setFingerprint(captureFingerprint());
        }

        // Dynamic persistence based on age
        const mode = ageGroup === 'junior' ? browserSessionPersistence : browserLocalPersistence;
        setPersistence(firebaseAuth, mode).catch(console.error);
      } else {
        setEmailVerified(false);
        setFingerprint(null);
      }
    });

    return () => unsubscribe();
  }, [firebaseAuth, ageGroup, db]);

  // Session Guard: Validate fingerprint
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
    throw new Error('useAuthContext must be used within an AgeGroupProvider (reordered layout)');
  }
  return context;
}
