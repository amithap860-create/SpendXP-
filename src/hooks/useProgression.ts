'use client';

import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { getProgressionRef, UserProgression, DEFAULT_PROGRESSION } from '@/lib/progressionService';

/**
 * Real-time progression hook that listens to the user's stats document.
 */
export function useProgression() {
  const db = useFirestore();
  const { user } = useUser();
  const [data, setData] = useState<UserProgression>(DEFAULT_PROGRESSION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setIsLoading(false);
      return;
    }

    const ref = getProgressionRef(db, user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setData(snap.data() as UserProgression);
      } else {
        setData(DEFAULT_PROGRESSION);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Progression listener error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  return { data, isLoading };
}
