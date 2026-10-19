'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Chapter } from '@/config/chapters';
import { DISTRICTS, getFogEnemy } from '@/config/narrative';

/**
 * Full-screen chapter reader (2026-10-19). One beat at a time, tap to continue;
 * ends on a "what the Order learned" card with a mission link. Rendered via a
 * portal by the caller (like LessonViewer) so it sits above the nav.
 */
export function ChapterReader({ chapter, onClose }: { chapter: Chapter; onClose: (finished: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const total = chapter.beats.length;
  const atEnd = idx >= total;
  const district = DISTRICTS.find(d => d.id === chapter.districtId);
  const fog = getFogEnemy(chapter.fogId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(atEnd); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, atEnd]);

  const beat = chapter.beats[Math.min(idx, total - 1)];

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-y-auto" role="dialog" aria-modal="true" aria-label={`Chapter ${chapter.number}: ${chapter.title}`}>
      <header className="px-5 pt-5 pb-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Chapter {chapter.number} · {district?.emoji} {district?.name}</p>
          <h1 className="text-2xl font-black text-foreground leading-tight truncate">{chapter.title}</h1>
        </div>
        <button onClick={() => onClose(atEnd)} aria-label="Close chapter" className="h-11 w-11 shrink-0 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center">
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="px-5 flex gap-1.5" aria-hidden>
        {chapter.beats.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div className={`h-full bg-gold transition-all duration-500 ${i < Math.min(idx + (atEnd ? 0 : 1), total) ? 'w-full' : 'w-0'}`} />
          </div>
        ))}
      </div>

      <main className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto px-5 py-8">
        {!atEnd ? (
          <div key={idx} className="lesson-rise space-y-4">
            {beat.who && (
              <span className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-black uppercase tracking-widest">{beat.who}</span>
            )}
            <p className={`text-2xl leading-relaxed ${beat.who ? 'text-foreground font-medium' : 'text-muted-foreground italic'}`}>
              {beat.who ? `“${beat.text}”` : beat.text}
            </p>
          </div>
        ) : (
          <div className="lesson-rise space-y-5">
            <div className="rounded-3xl border bg-card p-6 space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-primary">What the Order learned</p>
              <p className="text-xl text-foreground leading-relaxed font-medium">{chapter.takeaway}</p>
              <p className="text-sm text-muted-foreground">Enemy faced: {fog.emoji} {fog.name}</p>
            </div>
            <div className="rounded-3xl border bg-card p-6 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-primary">Your next mission</p>
              <Link href={chapter.mission.href} onClick={() => onClose(true)}>
                <Button className="w-full h-14 text-lg font-black rounded-2xl">{chapter.mission.label} <ChevronRight className="h-5 w-5 ml-1" /></Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="px-5 pb-8 max-w-2xl w-full mx-auto">
        {!atEnd ? (
          <Button onClick={() => setIdx(i => i + 1)} className="w-full h-14 text-lg font-black rounded-2xl">
            {idx === total - 1 ? 'Finish chapter' : 'Continue'} <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        ) : (
          <Button variant="outline" onClick={() => onClose(true)} className="w-full h-12 text-base font-black rounded-2xl">Back to the story</Button>
        )}
      </footer>
    </div>
  );
}
