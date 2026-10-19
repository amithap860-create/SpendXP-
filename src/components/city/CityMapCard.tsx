'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Check, ArrowRight } from 'lucide-react';
import { useCityProgress } from '@/hooks/useCityProgress';
import { lessons } from '@/data/lessons';
import { quests } from '@/data/quests';
import { getFogEnemy } from '@/config/narrative';

/**
 * Dashboard map card (2026-10-19): the first thing under the greeting. A row of
 * the city's areas (cleared / open / locked), what to do next, one button into
 * the full map. Shares all logic with /city via useCityProgress.
 */
export function CityMapCard({ xp }: { xp: number }) {
  const { ready, areas, cleared, clearedCount, areaOpen, nextAreaIdx, nextLevel } = useCityProgress({ xp });
  if (!ready || areas.length === 0) return null;

  const nextArea = nextAreaIdx >= 0 ? areas[nextAreaIdx] : null;
  const lesson = nextLevel?.lessonId ? lessons.find(l => l.id === nextLevel.lessonId) : undefined;
  const quest = nextLevel?.questId ? quests.find(q => q.id === nextLevel.questId) : undefined;
  const fog = nextArea ? getFogEnemy(nextArea.fogId) : null;
  const allClear = clearedCount === areas.length;

  return (
    <section id="tour-citymap" className="rounded-3xl border-2 border-gold/60 bg-card shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gold">SpendCity</p>
          <h2 className="text-xl font-black text-foreground leading-tight">{allClear ? 'The city is crime-free' : 'Clear the city, one area at a time'}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-gold/15 text-foreground px-3 py-1 text-sm font-black">{clearedCount}/{areas.length}</span>
      </div>

      <div className="px-5 pb-2 overflow-x-auto">
        <div className="flex items-start gap-3 min-w-max py-2">
          {areas.map((a, i) => {
            const isCleared = cleared[i];
            const open = areaOpen(i);
            const isNext = i === nextAreaIdx;
            return (
              <Link key={a.id} href="/city" aria-label={`${a.name}: ${isCleared ? 'crime-free' : open ? 'open' : 'locked'}`} className="flex flex-col items-center gap-1 w-[76px]">
                <span className={`relative h-14 w-14 rounded-full flex items-center justify-center text-2xl bg-background border-4 ${isCleared ? 'border-gold' : open ? (isNext ? 'border-primary' : 'border-primary/40') : 'border-dashed border-border opacity-60'}`}>
                  <span className={open ? '' : 'opacity-40'}>{a.emoji}</span>
                  {!open && <Lock className="absolute h-4 w-4 text-muted-foreground bottom-0 right-0" />}
                  {isCleared && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gold text-gold-foreground flex items-center justify-center"><Check className="h-3.5 w-3.5" /></span>}
                </span>
                <span className="text-xs font-bold text-foreground text-center leading-tight">{a.name.replace('The ', '')}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-5 pt-1 space-y-3">
        {nextArea && nextLevel ? (
          <div className="rounded-2xl bg-secondary p-4 space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Next mission · {nextArea.emoji} {nextArea.name} · {fog?.emoji} {fog?.name}</p>
            <p className="text-lg font-black text-foreground leading-snug">{nextLevel.title}</p>
            <p className="text-sm text-muted-foreground">
              {lesson ? `Lesson: ${lesson.title}` : ''}{lesson && quest ? ' · ' : ''}{quest ? `Case file: ${quest.title}` : ''}
            </p>
          </div>
        ) : (
          <p className="text-base text-muted-foreground">Every area is clear. New threats appear every season — keep your skills sharp.</p>
        )}
        <Link href="/city" className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gold text-gold-foreground text-base font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
          {allClear ? 'Open the map' : 'Continue your mission'} <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
