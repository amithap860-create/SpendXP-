'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <ProfileSkeleton />;
  }

  // Show loading while redirecting authenticated users
  if (user) {
    return <ProfileSkeleton />;
  }

  // Unauthenticated state (should be handled by middleware, but fallback for safety)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-slate-600 mb-6">Please sign in to view your profile.</p>
        <Link href="/login" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium">
          Sign In
        </Link>
      </div>
    </div>
  );
}
