'use client';

/**
 * useDailyQuestStatus
 *
 * Returns how many quests the user has completed today and whether the
 * daily limit has been reached (free users: 3/day, premium: unlimited).
 *
 * Fetches from /api/quests/complete (GET) on mount, then re-validates
 * every time the window gains focus (so the count updates if the user
 * completes a quest in another tab).
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { usePremium } from './usePremium';

export interface DailyQuestStatus {
  questsToday: number;
  limit: number;
  remaining: number;
  dailyLimitReached: boolean;
  isLoading: boolean;
}

const FREE_LIMIT = 3;

export function useDailyQuestStatus(): DailyQuestStatus {
  const { user } = useAuthContext();
  const { isPremium } = usePremium();

  const [questsToday, setQuestsToday] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/quests/complete', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setQuestsToday(data.questsToday ?? 0);
      }
    } catch {
      // Silently ignore — quest limit shown as 0/3 if fetch fails
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Re-fetch when tab regains focus
  useEffect(() => {
    const onFocus = () => fetchStatus();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchStatus]);

  const limit = isPremium ? Infinity : FREE_LIMIT;
  const remaining = isPremium ? Infinity : Math.max(0, FREE_LIMIT - questsToday);
  const dailyLimitReached = !isPremium && questsToday >= FREE_LIMIT;

  return { questsToday, limit, remaining, dailyLimitReached, isLoading };
}
