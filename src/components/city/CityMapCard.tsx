'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCityProgress } from '@/hooks/useCityProgress';
import { lessons } from '@/data/lessons';
import { quests } from '@/data/quests';
import { getFogEnemy } from '@/config/narrative';
import { CityTerrainMap } from '@/components/city/CityTerrainMap';

/**
 * Dashboard map card (2026-10-19): the first thing under the greeting. A row of
 * the city's areas (cleared / open / locked), what to do next, one button into
 * the full map. Shares all logic with /city via useCityProgress.
 */
export function CityMapCard({ xp }: { xp: number }) {
  const { ready, areas, cleared, clearedCount, areaOpen, nextAreaIdx, nextLevel, levelDone, hasPathfinder } = useCityProgress({ xp });
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

      <Link href="/city" aria-label="Open the SpendCity map" className="block px-3 pb-2">
        <CityTerrainMap
          areas={areas} cleared={cleared} areaOpen={areaOpen} nextAreaIdx={nextAreaIdx} showNext={hasPathfinder}
          progress={i => cleared[i] ? 'Crime-free' : `${areas[i].levels.filter(levelDone).length}/${areas[i].levels.length}`}
        />
      </Link>

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
