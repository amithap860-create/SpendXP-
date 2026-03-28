'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { requiresParentalConsent } from '@/lib/privacyGuard';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const db = useFirestore();
  
  const [retried, setRetried] = useState(false);

  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, 'users', user.uid) : null;
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user && !isProfileLoading) {
      if (profile) {
        setRetried(false);

        // 1. Consent Check (DPDP Compliance)
        if (profile.birthYear && requiresParentalConsent(profile.birthYear) && !profile.consentGiven && pathname !== '/consent') {
          router.push('/consent');
          return;
        }

        // 2. Onboarding/Setup Check
        if (profile.isParent && !profile.setupComplete && pathname !== '/parent/setup') {
          router.push('/parent/setup');
        } else if (!profile.isParent && !profile.onboardingComplete && !['/onboarding', '/consent'].includes(pathname)) {
          router.push('/onboarding');
        }

        // 3. Parent specific protection
        if (pathname.startsWith('/parent') && !profile.isParent) {
          router.push('/dashboard');
        }
      } else if (!retried) {
        const timeout = setTimeout(() => setRetried(true), 1500);
        return () => clearTimeout(timeout);
      } else {
        if (!['/onboarding', '/consent', '/login', '/signup'].includes(pathname)) {
          router.push('/onboarding');
        }
      }
    }
  }, [user, loading, isProfileLoading, profile, router, pathname, retried]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #E1F5EE',
          borderTop: '3px solid #0F6E56',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}/>
        <style>{`@keyframes spin {
        to { transform: rotate(360deg); }
      }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #E1F5EE',
          borderTop: '3px solid #0F6E56',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}/>
        <style>{`@keyframes spin {
        to { transform: rotate(360deg); }
      }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
