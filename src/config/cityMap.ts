/**
 * @fileOverview SpendCity map (2026-10-19): the progression layer.
 *
 * The city is divided into AREAS. Each area is a money topic held by one Gray
 * Fog villain. An area has LEVELS; a level is one lesson plus (where one exists)
 * one case file (quest). Finish every level and the area is "crime-free" — the
 * villain is gone and the next area opens.
 *
 * XP = power and control: ranks unlock POWERS (see POWERS). The one that changes
 * the rules is Rank Clearance: from Agent rank, any area whose tier your rank
 * has reached is open even if the area before it isn't cleared yet.
 *
 * ORDER MATTERS: the Learn tab locks lessons in the array order of lessons.ts
 * (a lesson opens when the one before it is done). Areas below therefore take
 * CONTIGUOUS runs of that order — kids lessons first (Pocket Park, junior-only),
 * then budgeting → saving/credit → scams → tax → investing. Don't reorder
 * levels without checking lessons.ts, or a level will show as locked behind a
 * lesson in a later area.
 *
 * Age handling: a level's lesson/quest is dropped if it isn't available to the
 * player's age group; a quest is also dropped if an earlier level already used
 * it (resolveArea / resolveCity). Levels left with nothing are skipped; areas
 * left with no levels are hidden.
 */

import type { AgeGroup } from '@/data/quests';

export type MapLevel = {
  id: string;
  title: string;
  /** lesson id from lessons.ts (optional) */
  lesson?: string;
  /** candidate quest ids, first available/unused one for the player's age wins */
  quests?: string[];
};

export type MapArea = {
  id: string;
  name: string;
  emoji: string;
  /** Short line under the name on the map */
  topic: string;
  /** Fog villain id (FOG_ENEMIES in narrative.ts) */
  fogId: string;
  /** Rank index (0 = Apprentice) at which Rank Clearance opens this area */
  tier: number;
  /** Only these age groups see the area (default: all) */
  onlyFor?: AgeGroup[];
  levels: MapLevel[];
  /** Shown when the area becomes crime-free */
  clearedLine: string;
};

export const MAP_AREAS: MapArea[] = [
  {
    id: 'pocket_park', name: 'Pocket Park', emoji: '🛝', topic: 'Money basics for kids', fogId: 'impulse_storm', tier: 0, onlyFor: ['junior'],
    clearedLine: 'The Impulse Storm blows out of Pocket Park. Pip is back on the swings, with a piggy bank under one arm.',
    levels: [
      { id: 'pp1', title: 'The bank and the piggy', lesson: 'k-bank', quests: ['two-piggy-banks'] },
      { id: 'pp2', title: 'Saving for something big', lesson: 'k-goals', quests: ['pocket-money-puzzle'] },
      { id: 'pp3', title: 'Your first budget', lesson: 'k-budget', quests: ['birthday-loot'] },
      { id: 'pp4', title: 'Sharing and giving', lesson: 'k-sharing', quests: ['wants-vs-desires'] },
      { id: 'pp5', title: 'Money that grows', lesson: 'k-interest' },
      { id: 'pp6', title: 'Earning your own', lesson: 'k-earning', quests: ['lemonade-stand'] },
      { id: 'pp7', title: 'Borrowing, carefully', lesson: 'k-borrow' },
      { id: 'pp8', title: 'Running a tiny business', lesson: 'k-business' },
    ],
  },
  {
    id: 'neighbourhood', name: 'The Neighbourhood', emoji: '🏡', topic: 'Spending & budgeting', fogId: 'impulse_storm', tier: 0,
    clearedLine: 'The sale signs go dark. For the first time in months, the Neighbourhood spends on purpose.',
    levels: [
      { id: 'n1', title: 'Give every rupee a job', lesson: 'l-budgeting', quests: ['balanced-budget'] },
      { id: 'n2', title: 'Needs, wants and desires', lesson: 'l-needs-wants-desires', quests: ['wants-vs-desires'] },
      { id: 'n3', title: 'Sale signs and shiny traps', lesson: 'l-marketing', quests: ['group-chat-dilemma', 'phone-plan-trap'] },
      { id: 'n4', title: 'Goals with a deadline', lesson: 'l-smart-goals', quests: ['raise-trap', 'vacation-planning'] },
    ],
  },
  {
    id: 'bank_row', name: 'Bank Row', emoji: '🏦', topic: 'Saving, credit & debt', fogId: 'debt_web', tier: 1,
    clearedLine: 'The gray threads snap one by one. Bank Row\'s marble steps shine, and nobody is stuck in the Web.',
    levels: [
      { id: 'b1', title: 'Pay yourself first', lesson: 'l-saving', quests: ['first-paycheck'] },
      { id: 'b2', title: 'How banks really work', lesson: 'l-banking', quests: ['first-apartment'] },
      { id: 'b3', title: 'The emergency fund', lesson: 'l-emergency', quests: ['emergency-expense'] },
      { id: 'b4', title: 'Let time do the work', lesson: 'l-compounding', quests: ['the-early-start'] },
      { id: 'b5', title: 'Debt that grows', lesson: 'l-debt', quests: ['phone-emi'] },
      { id: 'b6', title: 'Credit scores', lesson: 'l-credit', quests: ['first-credit-card'] },
      { id: 'b7', title: 'Loans and EMIs', lesson: 'l-loans', quests: ['emi-affordability-check'] },
      { id: 'b8', title: 'Credit cards', lesson: 'l-credit-cards' },
    ],
  },
  {
    id: 'world_gate', name: 'The World Gate', emoji: '🌍', topic: 'Protection & scams', fogId: 'the_scammer', tier: 2,
    clearedLine: 'The stranger\'s smile slips. At the World Gate, every promise now gets asked one question: who is behind this?',
    levels: [
      { id: 'w1', title: 'Insurance: the safety net', lesson: 'l-insurance' },
      { id: 'w2', title: 'Spot the scam', lesson: 'l-scams', quests: ['investment-trap'] },
    ],
  },
  {
    id: 'central_hall', name: 'The Central Hall', emoji: '🏛️', topic: 'Tax & real wealth', fogId: 'inflation_spiral', tier: 3,
    clearedLine: 'The vault stops shrinking. In the Central Hall, the Order can finally see what its money is really worth.',
    levels: [
      { id: 'c1', title: 'Pay vs take-home', lesson: 'l-takehome', quests: ['lifestyle-design'] },
      { id: 'c2', title: 'How taxes work', lesson: 'l-taxes' },
      { id: 'c3', title: 'Income tax slabs', lesson: 'l-income-tax', quests: ['calculations-quest'] },
      { id: 'c4', title: 'GST on every bill', lesson: 'l-gst' },
      { id: 'c5', title: 'What are you worth?', lesson: 'l-networth', quests: ['net-worth-checkin'] },
    ],
  },
  {
    id: 'market_district', name: 'Market District', emoji: '📈', topic: 'Investing', fogId: 'market_madness', tier: 4,
    clearedLine: 'The screens stop flashing. The crowd goes quiet, and the Market District starts to think in years.',
    levels: [
      { id: 'm1', title: 'Investing basics', lesson: 'l-investing', quests: ['stock-investigator'] },
      { id: 'm2', title: 'What moves a stock', lesson: 'l-stock-movers', quests: ['promoter-buying-trap'] },
      { id: 'm3', title: 'Index funds and ETFs', lesson: 'l-etfs' },
      { id: 'm4', title: 'Retirement', lesson: 'l-retirement', quests: ['right-on-time'] },
      { id: 'm5', title: 'Short-term trading', lesson: 'l-shortterm' },
      { id: 'm6', title: 'Crypto, carefully', lesson: 'l-crypto' },
      { id: 'm7', title: 'Reading a company', lesson: 'l-stock-analysis', quests: ['sell-now-or-wait'] },
    ],
  },
  {
    id: 'academy', name: "The Order's Academy", emoji: '🎓', topic: 'Habits & planning', fogId: 'the_procrastinator', tier: 5,
    clearedLine: 'The soft voice goes silent. The recruits at the Academy are doing it today, and tomorrow is just another day to do it again.',
    levels: [
      { id: 'a1', title: 'A goal with a date', quests: ['smart-goal-setting'] },
      { id: 'a2', title: 'Your first side hustle', quests: ['first-side-hustle'] },
    ],
  },
];

/** What each rank unlocks. Only powers that actually do something are listed. */
export type Power = { id: 'fog_sight' | 'pathfinder' | 'clearance'; name: string; rankIndex: number; rankName: string; desc: string };
export const POWERS: Power[] = [
  { id: 'fog_sight', name: 'Fog Sight', rankIndex: 0, rankName: 'Apprentice', desc: 'See each villain\'s trap and its weakness on the map.' },
  { id: 'pathfinder', name: 'Pathfinder', rankIndex: 1, rankName: 'Scout', desc: 'The map marks your best next level.' },
  { id: 'clearance', name: 'Rank Clearance', rankIndex: 2, rankName: 'Agent', desc: 'Areas open by rank, even if the area before them isn\'t cleared yet.' },
];

// ─── Resolution (age filtering, quest de-duplication) ───────────────────────

export type ResolvedLevel = { id: string; title: string; lessonId?: string; questId?: string };
export type ResolvedArea = Omit<MapArea, 'levels'> & { levels: ResolvedLevel[] };

type LessonLike = { id: string; ageGroups: AgeGroup[] };
type QuestLike = { id: string; ageGroups: AgeGroup[] };

export function resolveCity(age: AgeGroup, lessons: LessonLike[], quests: QuestLike[]): ResolvedArea[] {
  const lessonOk = new Set(lessons.filter(l => l.ageGroups.includes(age)).map(l => l.id));
  const questOk = new Set(quests.filter(q => q.ageGroups.includes(age)).map(q => q.id));
  const usedQuests = new Set<string>();
  const out: ResolvedArea[] = [];
  for (const area of MAP_AREAS) {
    if (area.onlyFor && !area.onlyFor.includes(age)) continue;
    const levels: ResolvedLevel[] = [];
    for (const lv of area.levels) {
      const lessonId = lv.lesson && lessonOk.has(lv.lesson) ? lv.lesson : undefined;
      const questId = (lv.quests ?? []).find(q => questOk.has(q) && !usedQuests.has(q));
      if (questId) usedQuests.add(questId);
      if (!lessonId && !questId) continue;
      levels.push({ id: lv.id, title: lv.title, lessonId, questId });
    }
    if (levels.length) out.push({ ...area, levels });
  }
  return out;
}
