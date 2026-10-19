import React from 'react';
import { CharacterFace } from '@/components/story/CharacterFace';
import { DEFAULT_MOOD, type SceneBeat } from '@/config/characters';

/** One story beat: portrait + speaker + line (or italic narration with no portrait). */
export function BeatView({ beat }: { beat: SceneBeat }) {
  if (!beat.who) {
    return (
      <p className="lesson-rise text-2xl leading-relaxed text-muted-foreground italic">{beat.text}</p>
    );
  }
  const mood = beat.mood ?? DEFAULT_MOOD[beat.who];
  return (
    <div className="lesson-rise flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
      <div key={`${beat.who}-${mood}`} className="lesson-pop shrink-0 rounded-3xl bg-secondary p-3 border border-border">
        <CharacterFace who={beat.who} mood={mood} size={132} />
      </div>
      <div className="space-y-2">
        <span className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-black uppercase tracking-widest">{beat.who}</span>
        <p className="text-2xl leading-relaxed text-foreground font-medium">“{beat.text}”</p>
      </div>
    </div>
  );
}
