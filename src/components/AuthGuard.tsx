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
  
  // Logic 10: Retry mechanism for profile race conditions
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
        // Reset retry if profile found
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
          router.push('/games');
        }
      } else if (!retried) {
        // Logic 10: Wait once for race condition
        const timeout = setTimeout(() => setRetried(true), 1500);
        return () => clearTimeout(timeout);
      } else {
        // Final fallback to onboarding if still no profile after retry
        if (!['/onboarding', '/consent', '/login', '/signup'].includes(pathname)) {
          router.push('/onboarding');
        }
      }
    }
  }, [user, loading, isProfileLoading, profile, router, pathname, retried]);

  if (loading || (isProfileLoading && !retried)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
