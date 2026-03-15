'use client';

import { useState, useEffect } from 'react';
import { doc, serverTimestamp } from 'firebase/firestore';
import { db, safeOnSnapshot, safeSetDoc } from '@/firebase';
import { useAuthContext } from '@/context/AuthContext';
import { getProgressionRef, UserProgression, DEFAULT_PROGRESSION } from '@/lib/progressionService';

export function useProgression() {
  const { user } = useAuthContext();
  const [data, setData] = useState<UserProgression>(DEFAULT_PROGRESSION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData(DEFAULT_PROGRESSION);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const ref = getProgressionRef(user.uid);

    const unsubscribe = safeOnSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setData(snap.data() as UserProgression);
      } else {
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
  }, [user]);

  return { data, isLoading };
}
