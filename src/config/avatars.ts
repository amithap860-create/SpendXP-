/**
 * @fileOverview SpendXP Avatar Archetypes — 12 Financial Personality Characters
 *
 * Each character represents a distinct financial personality type (think MBTI for money).
 * Portraits are rendered as inline SVGs via AvatarIllustration.tsx — no image files needed.
 *
 * Characters are Order operatives with codenames, each with a distinct money mindset.
 */

export type AvatarConfig = {
  id: string;
  imagePath: string;        // Reserved for future hi-res art
  fallbackInitial: string;  // Fallback if SVG component missing
  name: string;             // Operative codename
  tagline: string;          // Their financial philosophy in one line
  archetype: string;        // MBTI-style label
  bgGradient: string;       // Tailwind gradient — card background
  bgFrom: string;           // Solid colour for small avatars (Tailwind bg-*)
  ringColor: string;        // Tailwind ring when selected
  textColor: string;        // Tailwind text colour for name on card
  recommended?: ('junior' | 'teen' | 'senior')[];
};

export const AVATARS: AvatarConfig[] = [
  {
    id: 'voss',
    imagePath: '/avatars/voss.png',
    fallbackInitial: 'V',
    name: 'Voss',
    tagline: 'Three moves ahead of the market',
    archetype: 'The Strategist',
    bgGradient: 'from-slate-800 to-slate-950',
    bgFrom: 'bg-slate-800',
    ringColor: 'ring-slate-400',
    textColor: 'text-slate-200',
    recommended: ['senior'],
  },
  {
    id: 'luna',
    imagePath: '/avatars/luna.png',
    fallbackInitial: 'L',
    name: 'Luna',
    tagline: 'Never just one stream of income',
    archetype: 'The Hustler',
    bgGradient: 'from-amber-600 to-orange-700',
    bgFrom: 'bg-amber-600',
    ringColor: 'ring-amber-400',
    textColor: 'text-amber-100',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'rei',
    imagePath: '/avatars/rei.png',
    fallbackInitial: 'R',
    name: 'Rei',
    tagline: 'Maximum life on minimum spend',
    archetype: 'The Minimalist',
    bgGradient: 'from-emerald-800 to-green-950',
    bgFrom: 'bg-emerald-800',
    ringColor: 'ring-emerald-400',
    textColor: 'text-emerald-100',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'cipher',
    imagePath: '/avatars/cipher.png',
    fallbackInitial: 'C',
    name: 'Cipher',
    tagline: 'Anonymous wealth, maximum power',
    archetype: 'The Phantom',
    bgGradient: 'from-slate-900 to-black',
    bgFrom: 'bg-slate-950',
    ringColor: 'ring-teal-400',
    textColor: 'text-teal-300',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'atlas',
    imagePath: '/avatars/atlas.png',
    fallbackInitial: 'A',
    name: 'Atlas',
    tagline: 'Every number has its place',
    archetype: 'The Architect',
    bgGradient: 'from-blue-900 to-indigo-950',
    bgFrom: 'bg-blue-900',
    ringColor: 'ring-blue-400',
    textColor: 'text-blue-100',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'nova',
    imagePath: '/avatars/nova.png',
    fallbackInitial: 'N',
    name: 'Nova',
    tagline: 'The market speaks. She listens.',
    archetype: 'The Oracle',
    bgGradient: 'from-violet-900 to-purple-950',
    bgFrom: 'bg-violet-900',
    ringColor: 'ring-violet-400',
    textColor: 'text-violet-200',
    recommended: ['senior'],
  },
  {
    id: 'jade',
    imagePath: '/avatars/jade.png',
    fallbackInitial: 'J',
    name: 'Jade',
    tagline: 'Your future self says thank you',
    archetype: 'The Guardian',
    bgGradient: 'from-green-900 to-emerald-950',
    bgFrom: 'bg-green-900',
    ringColor: 'ring-green-400',
    textColor: 'text-green-100',
    recommended: ['junior', 'teen', 'senior'],
  },
  {
    id: 'storm',
    imagePath: '/avatars/storm.png',
    fallbackInitial: 'S',
    name: 'Storm',
    tagline: 'Disrupting the system, one move at a time',
    archetype: 'The Rebel',
    bgGradient: 'from-cyan-700 to-blue-800',
    bgFrom: 'bg-cyan-700',
    ringColor: 'ring-cyan-300',
    textColor: 'text-cyan-100',
    recommended: ['teen'],
  },
  {
    id: 'finn',
    imagePath: '/avatars/finn.png',
    fallbackInitial: 'F',
    name: 'Finn',
    tagline: 'Research is the best investment',
    archetype: 'The Scholar',
    bgGradient: 'from-amber-800 to-yellow-950',
    bgFrom: 'bg-amber-800',
    ringColor: 'ring-yellow-400',
    textColor: 'text-yellow-100',
    recommended: ['junior', 'teen'],
  },
  {
    id: 'zen',
    imagePath: '/avatars/zen.png',
    fallbackInitial: 'Z',
    name: 'Zen',
    tagline: 'Light wallet, rich in experiences',
    archetype: 'The Nomad',
    bgGradient: 'from-lime-800 to-green-900',
    bgFrom: 'bg-lime-800',
    ringColor: 'ring-lime-400',
    textColor: 'text-lime-100',
    recommended: ['junior', 'teen'],
  },
  {
    id: 'echo',
    imagePath: '/avatars/echo.png',
    fallbackInitial: 'E',
    name: 'Echo',
    tagline: 'Money flows through connections',
    archetype: 'The Connector',
    bgGradient: 'from-rose-700 to-pink-900',
    bgFrom: 'bg-rose-700',
    ringColor: 'ring-rose-400',
    textColor: 'text-rose-100',
    recommended: ['junior', 'teen'],
  },
  {
    id: 'blaze',
    imagePath: '/avatars/blaze.png',
    fallbackInitial: 'B',
    name: 'Blaze',
    tagline: 'Turns small habits into gold',
    archetype: 'The Alchemist',
    bgGradient: 'from-orange-800 to-red-950',
    bgFrom: 'bg-orange-800',
    ringColor: 'ring-orange-400',
    textColor: 'text-orange-100',
    recommended: ['teen', 'senior'],
  },
];

export const DEFAULT_AVATAR = AVATARS[0];

export function getAvatar(id: string): AvatarConfig {
  return AVATARS.find(a => a.id === id) ?? DEFAULT_AVATAR;
}
