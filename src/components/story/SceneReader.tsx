'use client';

import React, { useEffect, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeatView } from '@/components/story/BeatView';
import type { SceneBeat } from '@/config/characters';

/**
 * Short story scene (2026-10-19): played when a player enters a new area, opens
 * a level for the first time, or clears an area. Tap to continue; X/Skip ends it.
 * Always calls onDone exactly once, whether finished or skipped.
 */
export function SceneReader({ title, kicker, beats, doneLabel = 'Continue', onDone }: {
  title: string; kicker?: string; beats: SceneBeat[]; doneLabel?: string; onDone: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const last = idx === beats.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDone(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDone]);

  const beat = beats[idx];
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
      <header className="px-5 pt-5 pb-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          {kicker && <p className="text-xs font-black uppercase tracking-widest text-primary">{kicker}</p>}
          <h1 className="text-2xl font-black text-foreground leading-tight truncate">{title}</h1>
        </div>
        <button onClick={onDone} className="h-11 shrink-0 rounded-full bg-muted hover:bg-muted/70 px-4 text-sm font-black uppercase tracking-widest flex items-center gap-1" aria-label="Skip story">
          Skip <X className="h-4 w-4" />
        </button>
      </header>
      <div className="px-5 flex gap-1.5" aria-hidden>
        {beats.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div className={`h-full bg-gold transition-all duration-500 ${i <= idx ? 'w-full' : 'w-0'}`} />
          </div>
        ))}
      </div>
      <main className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto px-5 py-8">
        <div key={idx}><BeatView beat={beat} /></div>
      </main>
      <footer className="px-5 pb-8 max-w-2xl w-full mx-auto">
        <Button onClick={() => (last ? onDone() : setIdx(i => i + 1))} className="w-full h-14 text-lg font-black rounded-2xl">
          {last ? doneLabel : 'Continue'} <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </footer>
    </div>
  );
}
