'use client';

import { useState, useEffect } from 'react';
import { doc, serverTimestamp } from 'firebase/firestore';
import { db, safeOnSnapshotDoc, safeSetDoc } from '@/firebase';
import { useAuthContext } from '@/context/AuthContext';
import { getProgressionRef, UserProgression, DEFAULT_PROGRESSION } from '@/lib/progressionService';

export function useProgression() {
  const { user } = useAuthContext();
  const [data, setData] = useState<UserProgression>(DEFAULT_PROGRESSION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const uid = user?.uid;
    // uid.length < 5 rejects stub uids such as '1' that come from the
    // localStorage-based AuthContext during page reload before Firebase
    // Auth has confirmed the real user. Real Firebase uids are 28 chars.
    if (!user || !uid || typeof uid !== 'string' || uid.length < 5) {
      setData(DEFAULT_PROGRESSION);
      setIsLoading(false);
      return;
    }
    
    const ref = getProgressionRef(uid);
    if (!ref) {
      setData(DEFAULT_PROGRESSION);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = safeOnSnapshotDoc(ref, (snap) => {
      if (snap.exists()) {
        setData(snap.data() as UserProgression);
      } else {
        safeSetDoc(ref, {
          totalXP: 0,
          totalGamesPlayed: 0,
          lastActivityAt: serverTimestamp(),
          gameHighScores: {
            budgetBlitz: 0,
            finIQQuiz: 0,
            moneyMaze: 0,
            stockMarketSim: 0,
            creditScoreBuilder: 0,
            compoundClicker: 0,
          },
          badges: [],
          level: 'Saver',
          walletBalance: 0,
          financialHealth: 50,
          healthHistory: [],
        }, { merge: true });
        setData(DEFAULT_PROGRESSION);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('[SpendXP] useProgression error:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { data, isLoading };
}
