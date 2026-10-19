'use client';

import React, { useState } from 'react';
import type { Emotion, Speaker } from '@/config/characters';
import { CHARACTER_ART } from '@/config/characters';

/**
 * Story character portrait (2026-10-19).
 *
 * Shows /story/<slug>/<mood>.png. If that mood's image is missing it falls back
 * to /story/<slug>/neutral.png, and if that is missing too it shows a simple
 * nameplate medallion — so the story works before any art exists and never
 * shows a broken image. Art spec: docs/STORY-CHARACTER-ART.md.
 */
export function CharacterPortrait({ who, mood = 'neutral', size = 132 }: { who: Speaker; mood?: Emotion; size?: number }) {
  const art = CHARACTER_ART[who];
  const [stage, setStage] = useState<'mood' | 'neutral' | 'none'>('mood');

  if (stage === 'none') {
    return (
      <div
        role="img" aria-label={who}
        className={`flex items-center justify-center rounded-full bg-gradient-to-br ${art.gradient} border-4 border-white/20 shadow-md`}
        style={{ width: size, height: size }}
      >
        <span className="font-black text-white" style={{ fontSize: size * 0.42 }}>{art.initial}</span>
      </div>
    );
  }
  const file = stage === 'mood' ? mood : 'neutral';
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`${who}-${file}`}
      src={`/story/${art.slug}/${file}.png`}
      alt={`${who}, ${mood}`}
      width={size} height={size}
      className="object-contain"
      style={{ width: size, height: size }}
      onError={() => setStage(s => (s === 'mood' && mood !== 'neutral' ? 'neutral' : 'none'))}
    />
  );
}
