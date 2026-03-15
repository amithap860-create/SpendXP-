'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, 'users', user.uid) : null;
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !isProfileLoading) {
      if (profile && !profile.onboardingComplete) {
        router.push('/onboarding');
      }
    }
  }, [user, loading, isProfileLoading, profile, router]);

  if (loading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || (profile && !profile.onboardingComplete)) {
    return null;
  }

  return <>{children}</>;
}
