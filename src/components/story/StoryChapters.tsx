'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Lock } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { getProgression } from '@/lib/progressionService';
import { RANKS, DISTRICTS, getRankForXP } from '@/config/narrative';
import { CHAPTERS, type Chapter } from '@/config/chapters';
import { ChapterReader } from '@/components/story/ChapterReader';

/**
 * Chapter list for the Story page (2026-10-19). A chapter unlocks with its
 * rank (XP-derived). Locked chapters show only the title and the XP needed —
 * no spoilers. "Read" state is stored per user on this device only.
 */
export function StoryChapters() {
  const { user } = useAuthContext();
  const [xp, setXp] = useState(0);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [open, setOpen] = useState<Chapter | null>(null);
  const storageKey = user?.uid ? `spendxp_chapters_read_${user.uid}` : null;

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    getProgression(user.uid).then(p => { if (!cancelled) setXp(p?.totalXP ?? 0); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user?.uid]);

  useEffect(() => {
    if (!storageKey) return;
    try { setReadIds(JSON.parse(localStorage.getItem(storageKey) || '[]')); } catch { setReadIds([]); }
  }, [storageKey]);

  const currentRank = useMemo(() => getRankForXP(xp), [xp]);
  const unlockedCount = RANKS.findIndex(r => r.id === currentRank.id) + 1;

  const markRead = (rankId: string) => {
    setReadIds(prev => {
      if (prev.includes(rankId)) return prev;
      const next = [...prev, rankId];
      if (storageKey) { try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* storage unavailable */ } }
      return next;
    });
  };

  return (
    <section id="chapters" className="max-w-3xl mx-auto px-5 pt-14">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Your story</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <p className="text-base text-muted-foreground mb-6">A new chapter unlocks with every rank. {unlockedCount} of {CHAPTERS.length} open.</p>

      <div className="space-y-3">
        {CHAPTERS.map((ch, i) => {
          const rank = RANKS[i];
          const unlocked = i < unlockedCount;
          const isNew = unlocked && !readIds.includes(ch.rankId);
          const district = DISTRICTS.find(d => d.id === ch.districtId);
          return (
            <button
              key={ch.rankId}
              type="button"
              disabled={!unlocked}
              onClick={() => setOpen(ch)}
              className="w-full text-left rounded-2xl border bg-card p-4 flex items-center gap-4 disabled:opacity-60 enabled:hover:border-primary transition-colors"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-2xl">
                {unlocked ? (district?.emoji ?? <BookOpen className="h-5 w-5" />) : <Lock className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Chapter {ch.number} · {rank.name}</p>
                <p className="text-lg font-black text-foreground leading-snug">{ch.title}</p>
                {!unlocked && <p className="text-sm text-muted-foreground">Reach {rank.name} ({rank.minXP.toLocaleString()} XP) to unlock</p>}
              </div>
              {isNew && <span className="rounded-full bg-gold text-gold-foreground px-2.5 py-1 text-xs font-black uppercase tracking-widest">New</span>}
              {unlocked && !isNew && <span className="text-sm font-black text-primary">Read again</span>}
            </button>
          );
        })}
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <ChapterReader
          chapter={open}
          onClose={(finished) => { if (finished) markRead(open.rankId); setOpen(null); }}
        />,
        document.body
      )}
    </section>
  );
}
