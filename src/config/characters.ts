/**
 * Story cast + expressions (2026-10-19). Faces are drawn in code
 * (src/components/story/CharacterFace.tsx) — original designs, no image files.
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
