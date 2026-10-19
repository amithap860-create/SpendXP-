/**
 * Story cast + expressions (2026-10-19). Portraits are image files in
 * public/story/<slug>/<mood>.png (see CharacterPortrait.tsx and
 * docs/STORY-CHARACTER-ART.md). The first SVG-drawn faces were dropped: they did
 * not match the app's illustrated avatars.
 */
export type Speaker = 'Warden Vale' | 'Pip' | 'The Broker' | 'Archivist Ines';

export type Emotion =
  | 'neutral' | 'content' | 'happy' | 'worried' | 'surprised'
  | 'determined' | 'proud' | 'sly' | 'sad';

export const EMOTIONS: Emotion[] = ['neutral', 'content', 'happy', 'worried', 'surprised', 'determined', 'proud', 'sly', 'sad'];

/** Default mood when a beat doesn't set one. */
export const DEFAULT_MOOD: Record<Speaker, Emotion> = {
  'Warden Vale': 'neutral',
  'Pip': 'happy',
  'The Broker': 'sly',
  'Archivist Ines': 'content',
};

export type SceneBeat = {
  /** omit for narration (no portrait) */
  who?: Speaker;
  mood?: Emotion;
  text: string;
};

/** Where each character's art lives, plus the placeholder shown until it exists. */
export const CHARACTER_ART: Record<Speaker, { slug: string; initial: string; gradient: string }> = {
  'Pip':            { slug: 'pip',    initial: 'P', gradient: 'from-teal-600 to-emerald-800' },
  'Warden Vale':    { slug: 'vale',   initial: 'V', gradient: 'from-slate-600 to-slate-900' },
  'Archivist Ines': { slug: 'ines',   initial: 'I', gradient: 'from-rose-700 to-red-950' },
  'The Broker':     { slug: 'broker', initial: 'B', gradient: 'from-zinc-700 to-black' },
};
