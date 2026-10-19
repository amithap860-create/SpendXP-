'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/context/AuthContext';
import { useUser } from '@/lib/store';
import { getProgression } from '@/lib/progressionService';
import { lessons } from '@/data/lessons';
import { quests } from '@/data/quests';
import { RANKS, getRankForXP } from '@/config/narrative';
import { resolveCity, type ResolvedLevel } from '@/config/cityMap';

/**
 * Shared SpendCity progress (2026-10-19) — used by the /city map page and the
 * dashboard's map card so both always agree. Completion is derived from data
 * the app already has: lessons from the user's tasks (`lesson-<id>`), quests
 * from users/{uid}/questProgress. Pass `xp` if the caller already has it, to
 * skip the extra progression read.
 */
export function useCityProgress(opts?: { xp?: number }) {
  const { user, loading: authLoading } = useAuthContext();
  const { tasks, ageGroup } = useUser();
  const age = ((ageGroup as string) || 'junior') as 'junior' | 'teen' | 'senior';
  const [fetchedXp, setFetchedXp] = useState(0);
  const [doneQuests, setDoneQuests] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const xpGiven = opts?.xp !== undefined;

  useEffect(() => {
    if (!user?.uid) { if (!authLoading) setReady(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const [prog, snap] = await Promise.all([
          xpGiven ? Promise.resolve(null) : getProgression(user.uid),
          getDocs(collection(db, 'users', user.uid, 'questProgress')),
        ]);
        if (cancelled) return;
        if (prog) setFetchedXp(prog.totalXP ?? 0);
        setDoneQuests(snap.docs.map(d => d.id));
      } catch (e) {
        console.warn('[SpendXP] City progress: could not load', e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid, authLoading, xpGiven]);

  const xp = xpGiven ? (opts!.xp as number) : fetchedXp;
  const lessonDone = (id: string) => !!tasks.find(t => t.id === `lesson-${id}`)?.completed;
  const questDone = (id: string) => doneQuests.includes(id);

  const areas = useMemo(() => resolveCity(age, lessons as any, quests as any), [age]);
  const availableLessons = useMemo(() => lessons.filter(l => l.ageGroups.includes(age)), [age]);

  const rank = getRankForXP(xp);
  const rankIndex = RANKS.findIndex(r => r.id === rank.id);
  const hasPathfinder = rankIndex >= 1;
  const hasClearance = rankIndex >= 2;

  const levelDone = (lv: ResolvedLevel) => (!lv.lessonId || lessonDone(lv.lessonId)) && (!lv.questId || questDone(lv.questId));
  const cleared = areas.map(a => a.levels.every(levelDone));
  const areaOpen = (i: number) => i === 0 || cleared[i - 1] || (hasClearance && rankIndex >= areas[i].tier);
  const clearedCount = cleared.filter(Boolean).length;
  const nextAreaIdx = areas.findIndex((_, i) => !cleared[i] && areaOpen(i));
  const nextLevel = nextAreaIdx >= 0 ? areas[nextAreaIdx].levels.find(l => !levelDone(l)) : undefined;

  return {
    user, authLoading, ready, xp, rank, rankIndex, hasPathfinder, hasClearance,
    areas, availableLessons, cleared, clearedCount, nextAreaIdx, nextLevel,
    lessonDone, questDone, levelDone, areaOpen,
  };
}
