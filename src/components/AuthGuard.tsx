'use client';

import { useEffect } from 'react';
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

  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, 'users', user.uid) : null;
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !isProfileLoading) {
      if (profile) {
        // 1. Consent Check (DPDP Compliance)
        if (profile.birthYear && requiresParentalConsent(profile.birthYear) && !profile.consentGiven && pathname !== '/consent') {
          router.push('/consent');
          return;
        }

        // 2. Onboarding/Setup Check
        if (profile.isParent && !profile.setupComplete && pathname !== '/parent/setup') {
          router.push('/parent/setup');
        } else if (!profile.isParent && !profile.onboardingComplete && pathname !== '/onboarding' && pathname !== '/consent') {
          router.push('/onboarding');
        }

        // 3. Parent specific protection
        if (pathname.startsWith('/parent') && !profile.isParent) {
          router.push('/games');
        }
      }
    }
  }, [user, loading, isProfileLoading, profile, router, pathname]);

  if (loading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
