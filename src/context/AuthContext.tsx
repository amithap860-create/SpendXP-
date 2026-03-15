'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { validateFingerprint, captureFingerprint } from '@/lib/sessionGuard';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [fingerprint, setFingerprint] = useState<any>(null);

  // Security: Dynamic Persistence & Session Fingerprinting
  useEffect(() => {
    if (!firebaseAuth || !auth.user) {
      setFingerprint(null);
      return;
    }
    
    // Fingerprint capturing on login
    if (!fingerprint) {
      const fp = captureFingerprint();
      setFingerprint(fp);
    }

    const mode = ageGroup === 'junior' ? browserSessionPersistence : browserLocalPersistence;
    setPersistence(firebaseAuth, mode).catch(console.error);

    // Token Expiry Monitoring (Refresh every 10 minutes)
    const expiryCheck = setInterval(async () => {
      try {
        const tokenResult = await auth.user!.getIdTokenResult();
        const expiresAt = new Date(tokenResult.expirationTime).getTime();
        const minsLeft = (expiresAt - Date.now()) / 60000;

        if (minsLeft < 5) {
          console.log('[SpendXP Security] Silently refreshing token...');
          await auth.user!.getIdToken(true);
        }
      } catch (err) {
        console.error('[SpendXP Security] Token refresh failed:', err);
        auth.signOut();
      }
    }, 600000);

    return () => clearInterval(expiryCheck);
  }, [ageGroup, firebaseAuth, auth.user]);

  // Session Guard: Validate fingerprint on state changes
  useEffect(() => {
    if (fingerprint && !validateFingerprint(fingerprint)) {
      console.warn('[SpendXP Security] Session hijack suspected. Terminating session.');
      auth.signOut();
      router.push('/login?reason=session_invalid');
    }
  }, [fingerprint, router]);

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
