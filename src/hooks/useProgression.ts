'use client';

import { useState, useEffect } from 'react';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useAuthContext } from '@/context/AuthContext';
import { getProgressionRef, UserProgression, DEFAULT_PROGRESSION } from '@/lib/progressionService';
import { safeOnSnapshot, safeSetDoc } from '@/lib/firestoreSafe';

/**
 * Real-time progression hook that listens to the user's stats document.
 * Refactored to prevent assertion crashes during auth transitions.
 */
export function useProgression() {
  const db = useFirestore();
  const { user } = useAuthContext();
  const [data, setData] = useState<UserProgression>(DEFAULT_PROGRESSION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setData(DEFAULT_PROGRESSION);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const ref = getProgressionRef(db, user.uid);

    const unsubscribe = safeOnSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setData(snap.data() as UserProgression);
      } else {
        // Document doesn't exist yet — initialise with defaults safely
        safeSetDoc(ref, {
          ...DEFAULT_PROGRESSION,
          lastActivityAt: serverTimestamp(),
        }, { merge: true });
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
