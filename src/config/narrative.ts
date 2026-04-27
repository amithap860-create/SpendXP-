/**
 * @fileOverview The Order of the Golden Ledger — SpendXP's never-ending narrative universe.
 *
 * WORLD PREMISE:
 * SpendCity is a vast metropolis gripped by The Gray Fog — a spreading force of financial
 * chaos (impulse traps, debt spirals, scams, market madness). The Order of the Golden Ledger
 * is a secret society of financial detectives who fight back with knowledge and XP.
 *
 * The player rises through infinite ranks. There is no final chapter — because there is
 * no end to learning, and the Fog always finds new forms.
 */

// ─── RANKS ──────────────────────────────────────────────────────────────────

export type OrderRank = {
  id: string;
  name: string;
  emoji: string;
  minXP: number;
  maxXP: number;
  /** One-line story beat for the rank unlock moment */
  storyLine: string;
  /** What district the player is defending at this rank */
  district: string;
  /** Which Gray Fog force is currently strongest */
  activeFog: string;
  /** What the HQ dispatch says when this rank is reached */
  rankUpMessage: string;
  /** Tailwind colour class for the rank badge */
  color: string;
  bgColor: string;
};

export const RANKS: OrderRank[] = [
  {
    id: 'apprentice',
    name: 'Apprentice',
    emoji: '🔍',
    minXP: 0,
    maxXP: 500,
    storyLine: 'Your first Case File has arrived. The Neighbourhood needs you.',
    district: 'The Neighbourhood',
    activeFog: 'Impulse Storm',
    rankUpMessage: 'Welcome, recruit. The Order has been watching you. Your first case file is open — the Neighbourhood is under attack by the Impulse Storm. Time to show what you\'re made of.',
    color: 'text-slate-400',
    bgColor: 'bg-slate-800',
  },
  {
    id: 'scout',
    name: 'Scout',
    emoji: '🗺️',
    minXP: 500,
    maxXP: 1500,
    storyLine: 'Field missions begin. The Fog is spreading into Bank Row.',
    district: 'Bank Row',
    activeFog: 'Debt Web',
    rankUpMessage: 'Well done, Scout. The Neighbourhood is safer. But the Debt Web is spinning its traps in Bank Row — credit card scams, hidden fees, EMI traps. Your new case files are waiting.',
    color: 'text-[#A8D5BC]',
    bgColor: 'bg-[#1A1F2E]',
  },
  {
    id: 'agent',
    name: 'Agent',
    emoji: '🕵️',
    minXP: 1500,
    maxXP: 3500,
    storyLine: 'The Fog has corporate allies now. Market District is at risk.',
    district: 'Market District',
    activeFog: 'Market Madness',
    rankUpMessage: 'Agent. The Order trusts you with bigger cases now. Market Madness is sweeping the trading floors — panic selling, bubble chasing, get-rich-quick schemes. Eyes open.',
    color: 'text-[#4EA07A]',
    bgColor: 'bg-[#1A1F2E]',
  },
  {
    id: 'inspector',
    name: 'Inspector',
    emoji: '🌍',
    minXP: 3500,
    maxXP: 7500,
    storyLine: 'The World Gate opens. International case files begin.',
    district: 'The World Gate',
    activeFog: 'The Scammer',
    rankUpMessage: 'Inspector — the Order is opening the World Gate for you. The Scammer has gone global: crypto cons, Ponzi schemes, fake investment platforms. Eight countries need your help. Choose your next case file carefully.',
    color: 'text-[#A8D5BC]',
    bgColor: 'bg-[#1A1F2E]',
  },
  {
    id: 'detective',
    name: 'Detective',
    emoji: '🏛️',
    minXP: 7500,
    maxXP: 15000,
    storyLine: 'You lead investigations now. The Fog fears your name.',
    district: 'The Central Hall',
    activeFog: 'Inflation Spiral',
    rankUpMessage: 'Detective. Your name is known across SpendCity. The Inflation Spiral is eroding purchasing power in every district simultaneously — cost of living crises, shrinking savings. This will be your hardest cases yet.',
    color: 'text-primary',
    bgColor: 'bg-[#1A1F2E]',
  },
  {
    id: 'chief',
    name: 'Chief',
    emoji: '📋',
    minXP: 15000,
    maxXP: 30000,
    storyLine: 'You train new recruits. The Parent Command Room is yours.',
    district: 'The Order\'s Academy',
    activeFog: 'The Procrastinator',
    rankUpMessage: 'Chief. The Order needs you to lead. New recruits are arriving — and The Procrastinator is whispering in their ears: "start saving later, invest tomorrow, no rush." Mentor them. The Parent Command Room is now active.',
    color: 'text-[#4EA07A]',
    bgColor: 'bg-[#1A1F2E]',
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    emoji: '⚔️',
    minXP: 30000,
    maxXP: 60000,
    storyLine: 'Global crises. The Fog wages its most powerful attacks.',
    district: 'The Infinite City',
    activeFog: 'all_fog_forces',
    rankUpMessage: 'Grandmaster. Every district is under attack simultaneously. The Gray Fog has united all its forces — Impulse Storm, Debt Web, Market Madness, The Scammer, Inflation Spiral, The Procrastinator. The Order needs everything you have.',
    color: 'text-[#A8D5BC]',
    bgColor: 'bg-[#1A1F2E]',
  },
  {
    id: 'legend',
    name: 'Legend',
    emoji: '📜',
    minXP: 60000,
    maxXP: Infinity,
    storyLine: 'Your name is written in the Golden Ledger. The saga never ends.',
    district: 'The Golden Ledger',
    activeFog: 'new_seasonal_threats',
    rankUpMessage: 'Legend. Your name is now inscribed in the Golden Ledger — permanent, honoured, remembered. But the Fog never sleeps. New seasonal crises emerge every quarter. The Order will always need you. There is no retirement for a Legend.',
    color: 'text-[#E8F5EE]',
    bgColor: 'bg-[#1A1F2E]',
  },
];

// ─── GRAY FOG ENEMIES ────────────────────────────────────────────────────────

export type FogEnemy = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** What financial behaviour this enemy represents */
  realWorldTrap: string;
  /** How to defeat it (the lesson) */
  weakness: string;
};

export const FOG_ENEMIES: FogEnemy[] = [
  {
    id: 'impulse_storm',
    name: 'Impulse Storm',
    emoji: '💸',
    description: 'A whirlwind that makes everything feel urgent — flash sales, FOMO, peer pressure spending.',
    realWorldTrap: 'Impulse buying, lifestyle inflation, keeping up with friends',
    weakness: 'The 24-hour rule: wait a day before any non-essential purchase.',
  },
  {
    id: 'debt_web',
    name: 'Debt Web',
    emoji: '🕸️',
    description: 'Invisible threads that tighten slowly — credit card minimums, EMI spirals, hidden fees.',
    realWorldTrap: 'Revolving credit card debt, buy-now-pay-later traps, loan stacking',
    weakness: 'The avalanche method: attack the highest-interest debt first.',
  },
  {
    id: 'market_madness',
    name: 'Market Madness',
    emoji: '📉',
    description: 'A contagious hysteria that makes crowds buy at peaks and panic-sell at bottoms.',
    realWorldTrap: 'Herd mentality investing, chasing hot stocks, selling during dips',
    weakness: 'Long-term index investing. Time in the market beats timing the market.',
  },
  {
    id: 'the_scammer',
    name: 'The Scammer',
    emoji: '🎭',
    description: 'A shapeshifter who takes any form — Ponzi schemes, crypto cons, fake investment promises.',
    realWorldTrap: 'Get-rich-quick schemes, unregulated crypto, WhatsApp investment groups',
    weakness: 'If returns sound too good to be true, they always are. SEBI-registered only.',
  },
  {
    id: 'inflation_spiral',
    name: 'Inflation Spiral',
    emoji: '🌀',
    description: 'A slow, invisible drain — the cost of everything rising while savings sit still.',
    realWorldTrap: 'Keeping money in low-interest savings, ignoring real returns',
    weakness: 'Beat inflation: equity investments historically outpace inflation over 10+ years.',
  },
  {
    id: 'the_procrastinator',
    name: 'The Procrastinator',
    emoji: '🦥',
    description: 'The most dangerous enemy — invisible, comfortable, and always whispering "tomorrow".',
    realWorldTrap: 'Delaying investment starts, skipping emergency funds, no goals',
    weakness: 'Compound interest: ₹1,000 invested at 20 beats ₹10,000 invested at 35.',
  },
  {
    // Used when a Grandmaster faces all Fog forces simultaneously
    id: 'all_fog_forces',
    name: 'All Fog Forces',
    emoji: '🌫️',
    description: 'The Gray Fog has united. Every financial trap strikes at once — impulse, debt, madness, scams, inflation, and procrastination.',
    realWorldTrap: 'Complex real-world scenarios where multiple financial threats converge',
    weakness: 'Mastery of all disciplines: budget, invest, protect, and never stop learning.',
  },
  {
    // Used for Legend-rank seasonal threats that rotate each quarter
    id: 'new_seasonal_threats',
    name: 'Seasonal Threat',
    emoji: '🔄',
    description: 'The Fog never sleeps — new financial crises emerge every quarter: tax traps, festival spending, crypto winters, housing bubbles.',
    realWorldTrap: 'Recurring seasonal financial pressures that catch the unprepared off-guard',
    weakness: 'Calendar awareness: anticipate seasonal pressures before they arrive.',
  },
];

// ─── DISTRICTS ───────────────────────────────────────────────────────────────

export type District = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocksAtRank: string;
  /** Which game/feature is set here */
  primaryFeature: string;
};

export const DISTRICTS: District[] = [
  {
    id: 'neighbourhood',
    name: 'The Neighbourhood',
    emoji: '🏡',
    description: 'Where every story begins. Pocket money, first savings, peer pressure spending.',
    unlocksAtRank: 'apprentice',
    primaryFeature: 'quests',
  },
  {
    id: 'bank_row',
    name: 'Bank Row',
    emoji: '🏦',
    description: 'Compound interest, credit scores, loan mechanics. The Debt Web lurks here.',
    unlocksAtRank: 'scout',
    primaryFeature: 'learn',
  },
  {
    id: 'market_district',
    name: 'Market District',
    emoji: '📈',
    description: 'The stock exchange, IPOs, mutual funds. Market Madness strikes here hardest.',
    unlocksAtRank: 'agent',
    primaryFeature: 'market',
  },
  {
    id: 'world_gate',
    name: 'The World Gate',
    emoji: '🌍',
    description: 'International case files. Eight countries, eight chapters of the Fog.',
    unlocksAtRank: 'inspector',
    primaryFeature: 'quests',
  },
  {
    id: 'central_hall',
    name: 'The Central Hall',
    emoji: '🏛️',
    description: 'The Order\'s operational headquarters. Advanced strategy and multi-threat defence.',
    unlocksAtRank: 'detective',
    primaryFeature: 'games',
  },
  {
    id: 'academy',
    name: 'The Order\'s Academy',
    emoji: '🎓',
    description: 'Where Chiefs train the next generation of detectives. The Parent Command Room.',
    unlocksAtRank: 'chief',
    primaryFeature: 'parent',
  },
  {
    id: 'infinite_city',
    name: 'The Infinite City',
    emoji: '♾️',
    description: 'Always expanding. New districts appear as new financial challenges emerge in the world.',
    unlocksAtRank: 'legend',
    primaryFeature: 'seasonal',
  },
];

// ─── SEASONAL SAGAS (the infinite layer) ────────────────────────────────────

export type SeasonalSaga = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  fogEnemy: string;
  /** Months this saga is active (0-indexed) */
  months?: number[];
};

export const SEASONAL_SAGAS: SeasonalSaga[] = [
  {
    id: 'tax_season',
    name: 'Tax Season Siege',
    emoji: '🧾',
    tagline: 'The Fog hides in fine print. Uncover every deduction.',
    fogEnemy: 'the_procrastinator',
    months: [1, 2, 3], // Feb, Mar, Apr — Indian tax season
  },
  {
    id: 'festival_trap',
    name: 'Festival Spending Trap',
    emoji: '🪔',
    tagline: 'The Impulse Storm rides the festive season. Spend smart, celebrate smart.',
    fogEnemy: 'impulse_storm',
    months: [9, 10], // Oct, Nov — Diwali season
  },
  {
    id: 'crypto_winter',
    name: 'Crypto Winter',
    emoji: '❄️',
    tagline: 'The Scammer is everywhere. Don\'t let the ice burn you.',
    fogEnemy: 'the_scammer',
  },
  {
    id: 'housing_bubble',
    name: 'Housing Bubble',
    emoji: '🏠',
    tagline: 'Market Madness inflates prices. Know when to wait.',
    fogEnemy: 'market_madness',
  },
  {
    id: 'inflation_crisis',
    name: 'Inflation Crisis',
    emoji: '📊',
    tagline: 'The Spiral tightens. Protect your purchasing power.',
    fogEnemy: 'inflation_spiral',
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Get the current rank for a given XP total */
export function getRankForXP(xp: number): OrderRank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i];
  }
  return RANKS[0];
}

/** Get XP progress within the current rank (0–1) */
export function getRankProgress(xp: number): number {
  const rank = getRankForXP(xp);
  if (rank.maxXP === Infinity) return 1;
  const progress = (xp - rank.minXP) / (rank.maxXP - rank.minXP);
  return Math.min(1, Math.max(0, progress));
}

/** Get the next rank (undefined if already at Legend) */
export function getNextRank(xp: number): OrderRank | undefined {
  const current = getRankForXP(xp);
  const idx = RANKS.findIndex(r => r.id === current.id);
  return RANKS[idx + 1];
}

/** Get a fog enemy by id */
export function getFogEnemy(id: string): FogEnemy {
  return FOG_ENEMIES.find(f => f.id === id) ?? FOG_ENEMIES[0];
}

/** Get the current seasonal saga based on today's month */
export function getCurrentSaga(): SeasonalSaga | undefined {
  const month = new Date().getMonth(); // 0-indexed
  return SEASONAL_SAGAS.find(s => s.months?.includes(month));
}

/** Case file number formatting */
export function getCaseFileId(questIndex: number): string {
  return `CF-${String(questIndex + 1).padStart(3, '0')}`;
}
