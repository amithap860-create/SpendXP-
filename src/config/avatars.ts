/**
 * @fileOverview Avatar character definitions for SpendXP.
 * Each avatar has a personality, a colour palette, and an emoji face.
 * Users pick their character during onboarding and can change it in Profile.
 */

export type AvatarConfig = {
  id: string;
  emoji: string;           // Large display emoji
  name: string;            // Character name
  tagline: string;         // Short personality line
  bgGradient: string;      // Tailwind gradient classes for the avatar card bg
  ringColor: string;       // Tailwind ring colour when selected
  textColor: string;       // Tailwind text colour for name
  /** Which age groups this avatar is recommended for (all can use any) */
  recommended?: ('junior' | 'teen' | 'senior')[];
};

export const AVATARS: AvatarConfig[] = [
  {
    id: 'rocket',
    emoji: '🚀',
    name: 'Rocket',
    tagline: 'Shoots for the stars',
    bgGradient: 'from-indigo-500 to-purple-600',
    ringColor: 'ring-indigo-400',
    textColor: 'text-[#1A1F2E]',
    recommended: ['junior', 'teen'],
  },
  {
    id: 'fox',
    emoji: '🦊',
    name: 'Fox',
    tagline: 'Clever with every coin',
    bgGradient: 'from-orange-400 to-red-500',
    ringColor: 'ring-orange-400',
    textColor: 'text-[#2E7D5A]',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'owl',
    emoji: '🦉',
    name: 'Owl',
    tagline: 'Wise investor',
    bgGradient: 'from-amber-500 to-yellow-600',
    ringColor: 'ring-[#4EA07A]',
    textColor: 'text-[#2E7D5A]',
    recommended: ['senior'],
  },
  {
    id: 'panda',
    emoji: '🐼',
    name: 'Panda',
    tagline: 'Calm, patient saver',
    bgGradient: 'from-slate-400 to-slate-600',
    ringColor: 'ring-slate-400',
    textColor: 'text-slate-700',
    recommended: ['junior'],
  },
  {
    id: 'dragon',
    emoji: '🐲',
    name: 'Dragon',
    tagline: 'Guards the gold',
    bgGradient: 'from-emerald-500 to-teal-600',
    ringColor: 'ring-emerald-400',
    textColor: 'text-[#2E7D5A]',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'robot',
    emoji: '🤖',
    name: 'Robo',
    tagline: 'Calculates every rupee',
    bgGradient: 'from-cyan-400 to-blue-500',
    ringColor: 'ring-cyan-400',
    textColor: 'text-[#1A1F2E]',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'cat',
    emoji: '😸',
    name: 'Neko',
    tagline: 'Curious about markets',
    bgGradient: 'from-pink-400 to-rose-500',
    ringColor: 'ring-pink-400',
    textColor: 'text-pink-700',
    recommended: ['junior', 'teen'],
  },
  {
    id: 'ninja',
    emoji: '🥷',
    name: 'Ninja',
    tagline: 'Silent but wealthy',
    bgGradient: 'from-gray-700 to-slate-900',
    ringColor: 'ring-gray-500',
    textColor: 'text-gray-700',
    recommended: ['teen', 'senior'],
  },
  {
    id: 'unicorn',
    emoji: '🦄',
    name: 'Uni',
    tagline: 'Makes money magic',
    bgGradient: 'from-fuchsia-400 to-violet-600',
    ringColor: 'ring-fuchsia-400',
    textColor: 'text-fuchsia-700',
    recommended: ['junior'],
  },
  {
    id: 'bear',
    emoji: '🐻',
    name: 'Bruno',
    tagline: 'Steady & reliable',
    bgGradient: 'from-yellow-600 to-amber-700',
    ringColor: 'ring-yellow-500',
    textColor: 'text-[#1A1F2E]',
    recommended: ['junior', 'teen'],
  },
  {
    id: 'lion',
    emoji: '🦁',
    name: 'King',
    tagline: 'Leads with confidence',
    bgGradient: 'from-yellow-400 to-orange-500',
    ringColor: 'ring-yellow-400',
    textColor: 'text-[#1A1F2E]',
    recommended: ['senior'],
  },
  {
    id: 'shark',
    emoji: '🦈',
    name: 'Jaws',
    tagline: 'Hunts the best deals',
    bgGradient: 'from-blue-500 to-indigo-600',
    ringColor: 'ring-blue-400',
    textColor: 'text-blue-700',
    recommended: ['teen', 'senior'],
  },
];

export const DEFAULT_AVATAR = AVATARS[0];

export function getAvatar(id: string): AvatarConfig {
  return AVATARS.find(a => a.id === id) ?? DEFAULT_AVATAR;
}
