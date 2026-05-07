/**
 * @fileOverview Avatar character definitions for SpendXP.
 *
 * Each avatar has:
 * - `imagePath`: path to the image file under /public/avatars/
 *   Place 200×200px PNG or SVG files there and they will be used automatically.
 *   If the file does not exist yet, the `fallbackInitial` is rendered instead.
 * - `fallbackInitial`: single letter shown in a coloured circle until real art arrives
 *
 * HOW TO GET PROFESSIONAL AVATARS:
 * Use the prompts in HANDOFF.md to generate each character via Gemini, Midjourney,
 * or a designer. Export as 200×200 PNG with transparent background and place in
 * /public/avatars/{id}.png — the app will pick them up automatically.
 */

export type AvatarConfig = {
  id: string;
  imagePath: string;       // Resolved from /public/avatars/{id}.png
  fallbackInitial: string; // Shown if imagePath file is missing
  name: string;            // Character name
  tagline: string;         // Short personality line
  bgGradient: string;      // Tailwind gradient — used as card/circle background
  ringColor: string;       // Tailwind ring colour when selected
  textColor: string;       // Tailwind text colour for name on the card
  /** Which age groups this avatar is recommended for (all can use any) */
  recommended?: ('junior' | 'teen' | 'senior')[];
};

export const AVATARS: AvatarConfig[] = [
  {
    id: 'rocket',
    imagePath: '/avatars/rocket.png',
    fallbackInitial: 'R',
    name: 'Rocket',
    tagline: 'Shoots for the stars',
    bgGradient: 'from-indigo-500 to-purple-600',
    ringColor: 'ring-indigo-400',
    textColor: 'text-white',
    recommended: ['junior', 'teen'],
  },
  {
    id: 'fox',
    imagePath: '/avatars/fox.png',
    fallbackInitial: 'F',
    name: 'Fox',
    tagline: 'Clever with every coin',
    bgGradient: 'from-orange-400 to-red-500',
    ringColor: 'ring-orange-400',
    textColor: 'text-white',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'owl',
    imagePath: '/avatars/owl.png',
    fallbackInitial: 'O',
    name: 'Owl',
    tagline: 'Wise investor',
    bgGradient: 'from-amber-500 to-yellow-600',
    ringColor: 'ring-amber-400',
    textColor: 'text-white',
    recommended: ['senior'],
  },
  {
    id: 'panda',
    imagePath: '/avatars/panda.png',
    fallbackInitial: 'P',
    name: 'Panda',
    tagline: 'Calm, patient saver',
    bgGradient: 'from-slate-400 to-slate-600',
    ringColor: 'ring-slate-400',
    textColor: 'text-white',
    recommended: ['junior'],
  },
  {
    id: 'dragon',
    imagePath: '/avatars/dragon.png',
    fallbackInitial: 'D',
    name: 'Dragon',
    tagline: 'Guards the gold',
    bgGradient: 'from-emerald-500 to-teal-600',
    ringColor: 'ring-emerald-400',
    textColor: 'text-white',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'robot',
    imagePath: '/avatars/robot.png',
    fallbackInitial: 'R',
    name: 'Robo',
    tagline: 'Calculates every dollar',
    bgGradient: 'from-cyan-500 to-blue-600',
    ringColor: 'ring-cyan-400',
    textColor: 'text-white',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'cat',
    imagePath: '/avatars/cat.png',
    fallbackInitial: 'N',
    name: 'Neko',
    tagline: 'Curious about markets',
    bgGradient: 'from-pink-400 to-rose-500',
    ringColor: 'ring-pink-400',
    textColor: 'text-white',
    recommended: ['junior', 'teen'],
  },
  {
    id: 'ninja',
    imagePath: '/avatars/ninja.png',
    fallbackInitial: 'N',
    name: 'Ninja',
    tagline: 'Silent but wealthy',
    bgGradient: 'from-gray-700 to-slate-900',
    ringColor: 'ring-gray-500',
    textColor: 'text-white',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'unicorn',
    imagePath: '/avatars/unicorn.png',
    fallbackInitial: 'U',
    name: 'Uni',
    tagline: 'Makes money magic',
    bgGradient: 'from-fuchsia-400 to-violet-600',
    ringColor: 'ring-fuchsia-400',
    textColor: 'text-white',
    recommended: ['junior'],
  },
  {
    id: 'bear',
    imagePath: '/avatars/bear.png',
    fallbackInitial: 'B',
    name: 'Bruno',
    tagline: 'Steady and reliable',
    bgGradient: 'from-yellow-600 to-amber-700',
    ringColor: 'ring-yellow-500',
    textColor: 'text-white',
    recommended: ['junior', 'teen'],
  },
  {
    id: 'lion',
    imagePath: '/avatars/lion.png',
    fallbackInitial: 'K',
    name: 'King',
    tagline: 'Leads with confidence',
    bgGradient: 'from-yellow-400 to-orange-500',
    ringColor: 'ring-yellow-400',
    textColor: 'text-white',
    recommended: ['senior'],
  },
  {
    id: 'shark',
    imagePath: '/avatars/shark.png',
    fallbackInitial: 'J',
    name: 'Jaws',
    tagline: 'Hunts the best deals',
    bgGradient: 'from-blue-500 to-indigo-600',
    ringColor: 'ring-blue-400',
    textColor: 'text-white',
    recommended: ['teen', 'senior'],
  },
];

export const DEFAULT_AVATAR = AVATARS[0];

export function getAvatar(id: string): AvatarConfig {
  return AVATARS.find(a => a.id === id) ?? DEFAULT_AVATAR;
}
