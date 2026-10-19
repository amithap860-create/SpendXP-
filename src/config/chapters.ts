/**
 * @fileOverview Story chapters for the Order of the Golden Ledger (2026-10-19).
 *
 * One chapter per rank (see RANKS in narrative.ts). A chapter unlocks when the
 * player reaches that rank, so unlocking is derived from XP — nothing extra is
 * stored server-side. Read/unread state is a light per-device convenience.
 *
 * ARC: The Gray Fog is not six separate enemies. Every enemy is one "hand" of a
 * single hidden figure — the Hollow Broker, who "sells tomorrow and takes today".
 * Chapters 3-5 plant clues (a blank gray coin, the initials "H.B."), chapter 6
 * names his motto, chapter 7 is the confrontation, chapter 8 keeps the saga open
 * (the Fog never fully ends — it just changes shape).
 *
 * CAST
 *   Warden Vale — head of the Order; calm, dry, never panics.
 *   Pip         — fellow recruit; impulsive, funny, learns by getting it wrong.
 *   Archivist Ines — keeper of the Golden Ledger (chapter 8).
 *
 * Money facts are deliberately general (no tax rates or product claims) so the
 * story never goes out of date; the lessons and quests carry the specifics.
 * Written for 9+ — no graphic content; the Fog is "chaos", not people.
 */

import type { SceneBeat } from '@/config/characters';
export type StoryBeat = SceneBeat;

export type Chapter = {
  /** Same id as the rank that unlocks it (apprentice … legend) */
  rankId: string;
  number: number;
  title: string;
  /** District id from DISTRICTS in narrative.ts */
  districtId: string;
  /** Fog enemy id from FOG_ENEMIES in narrative.ts */
  fogId: string;
  beats: StoryBeat[];
  /** The real-world idea this chapter carried */
  takeaway: string;
  mission: { label: string; href: string };
};

export const CHAPTERS: Chapter[] = [
  {
    rankId: 'apprentice',
    number: 1,
    title: 'The First Case File',
    districtId: 'neighbourhood',
    fogId: 'impulse_storm',
    beats: [
      { text: 'SpendCity at dawn. Gray mist curls between the shop fronts of the Neighbourhood, and every window flashes SALE — TODAY ONLY.' },
      { who: 'Warden Vale', mood: 'content', text: 'You are the new recruit. Good. The Order of the Golden Ledger does not fight with swords. We fight with questions. Case File one is open on your desk.' },
      { who: 'Pip', mood: 'worried', text: 'I bought the glow-in-the-dark sneakers! The sign said only two pairs were left! ...They were the third pair on that shelf, weren\'t they.' },
      { who: 'Warden Vale', mood: 'neutral', text: 'That is the Impulse Storm. It makes everything feel urgent, so you stop thinking. Urgent is its whole trick.' },
      { who: 'Warden Vale', mood: 'determined', text: 'Your first tool is simple. For anything you do not need, wait one day. If you still want it tomorrow, it is a real want. If not, the Storm just lost.' },
    ],
    takeaway: 'The 24-hour rule: wait a day before any non-essential purchase. Urgency is a pressure tactic, not a reason.',
    mission: { label: 'Open your first Case File', href: '/quests' },
  },
  {
    rankId: 'scout',
    number: 2,
    title: 'Threads in Bank Row',
    districtId: 'bank_row',
    fogId: 'debt_web',
    beats: [
      { text: 'Bank Row is quiet, almost too quiet. The marble steps shine, but fine gray threads run between the pillars like cobwebs.' },
      { who: 'Pip', mood: 'happy', text: 'It is only a small monthly payment for the new phone. Tiny! You would barely notice it.' },
      { who: 'Warden Vale', mood: 'neutral', text: 'That is how the Debt Web works. One thread is nothing. Ten threads, and you cannot move your arms.' },
      { who: 'Warden Vale', mood: 'worried', text: 'Look at this card. The minimum due is small, but the balance barely drops, and interest keeps feeding on what is left. The Web does not need you to fall. It only needs you to stay.' },
      { who: 'Warden Vale', mood: 'determined', text: 'When you owe on several things, pay the minimum on all, then throw every spare rupee at the one with the highest interest. Cut the thickest thread first.' },
    ],
    takeaway: 'The avalanche method: attack the highest-interest debt first, and always compare the total cost of a loan, not just the monthly payment.',
    mission: { label: 'Play Credit Score Builder', href: '/games' },
  },
  {
    rankId: 'agent',
    number: 3,
    title: 'Panic on the Trading Floor',
    districtId: 'market_district',
    fogId: 'market_madness',
    beats: [
      { text: 'The Market District roars. Screens flash red, then green, then red again. A hundred people shout the same word: SELL.' },
      { who: 'Pip', mood: 'surprised', text: 'Everyone is selling! Shouldn\'t we? Maybe they know something we don\'t!' },
      { who: 'Warden Vale', mood: 'neutral', text: 'Notice that nobody can say what they know. That is Market Madness. It spreads like a yawn. A price that moves fast is not the same as a business that changed.' },
      { text: 'Beneath the trading desk, Vale picks up something small and gray: a coin with no face on either side. He frowns, and pockets it.' },
      { who: 'Warden Vale', mood: 'determined', text: 'Spread your money across many companies. Invest for years, not for headlines. Time in the market usually beats guessing the timing.' },
    ],
    takeaway: 'Herd panic is not information. Diversify, think in years, and decide before the crowd gets loud.',
    mission: { label: 'Try the Stock Market Sim', href: '/games' },
  },
  {
    rankId: 'inspector',
    number: 4,
    title: 'The Face in Every City',
    districtId: 'world_gate',
    fogId: 'the_scammer',
    beats: [
      { text: 'The World Gate opens onto city after city. In each one, a stranger leans in with the same smile and the same promise.' },
      { who: 'Pip', mood: 'happy', text: 'This message says I can double my money in a week. It even has a screenshot of someone else doing it!' },
      { who: 'Warden Vale', mood: 'neutral', text: 'The Scammer wears a different face in every city, but the script never changes: huge returns, no risk, hurry, and tell no one.' },
      { who: 'Warden Vale', mood: 'worried', text: 'Check three things before any money moves: who is behind this, are they licensed by a regulator you can look up yourself, and what do I lose if it is false? Never share a PIN or OTP with anyone, ever.' },
      { text: 'On the stranger\'s table sits another gray coin, blank on both sides. Vale turns it over twice. "Same hand," he says quietly.' },
    ],
    takeaway: 'If returns sound too good to be true, they are. Verify the platform with the regulator yourself, and never share PINs or OTPs.',
    mission: { label: 'Take the Scams lesson', href: '/learn' },
  },
  {
    rankId: 'detective',
    number: 5,
    title: 'The Slow Drain',
    districtId: 'central_hall',
    fogId: 'inflation_spiral',
    beats: [
      { text: 'Inside the Central Hall, the Order\'s vault holds the same pile of gold it did last year. It buys a little less every month.' },
      { who: 'Pip', mood: 'surprised', text: 'But nothing was stolen! The money is all still here.' },
      { who: 'Warden Vale', mood: 'neutral', text: 'That is the Inflation Spiral. It does not take your money. It shrinks what your money can buy. The quietest thief in the city.' },
      { who: 'Warden Vale', mood: 'determined', text: 'Savings keep you safe in the short run, and you need them. But money you will not touch for many years has to grow faster than prices. Look at the real return — what is left after prices rise.' },
      { text: 'In the old ledger, beside each stolen sum, the same two initials are scratched: H.B. Vale closes the book. "We have been fighting his hands. Now we know he has a name."' },
    ],
    takeaway: 'Look at real returns (after inflation). Keep emergency savings safe, and let long-term money work harder than prices rise.',
    mission: { label: 'Use the Compound Interest tool', href: '/tools' },
  },
  {
    rankId: 'chief',
    number: 6,
    title: 'Tomorrow, Tomorrow',
    districtId: 'academy',
    fogId: 'the_procrastinator',
    beats: [
      { text: 'The Order\'s Academy is full of new recruits, notebooks open, pens ready. Somewhere in the corridor, a soft voice says: later.' },
      { who: 'The Broker', mood: 'sly', text: 'You have time. Start next month. Save tomorrow. There is always tomorrow, and tomorrow is where I keep it.' },
      { who: 'Pip', mood: 'worried', text: 'It sounds so reasonable. That is the scary part, isn\'t it?' },
      { who: 'Warden Vale', mood: 'neutral', text: 'The Hollow Broker sells tomorrow and takes today. Every fog we have met is one of his hands. And this is his favourite: the one that never feels like an attack.' },
      { who: 'Warden Vale', mood: 'determined', text: 'Money grows by compounding — earnings that earn their own earnings — and compounding needs time. At around 8% a year, money roughly doubles every nine years. Start with a little, start now, and set it to repeat by itself.' },
    ],
    takeaway: 'Start early, even small, and automate it. Compounding rewards time more than amount.',
    mission: { label: 'Try the SIP calculator', href: '/tools' },
  },
  {
    rankId: 'grandmaster',
    number: 7,
    title: 'All the Fog at Once',
    districtId: 'infinite_city',
    fogId: 'all_fog_forces',
    beats: [
      { text: 'Every district is under attack at the same time. Flash sales, gray threads, falling screens, strangers with smiles, shrinking vaults, soft voices saying later.' },
      { who: 'The Broker', mood: 'sly', text: 'You cannot stop all of it. Nobody can. Sooner or later you will give me one small yes, and one small yes is all I need.' },
      { who: 'Pip', mood: 'sad', text: 'He is right that we cannot be perfect. Isn\'t he?' },
      { who: 'Warden Vale', mood: 'determined', text: 'Perfect is not the goal. A plan is. A budget that gives every rupee a job. An emergency fund. Insurance for the big risks. Investments you understand. One decision made in advance beats a hundred made in panic.' },
      { text: 'You open the Order\'s ledger and write the plan down, line by line. As the last line dries, the Fog thins. The Broker is still there, but smaller. He does not like plans.' },
    ],
    takeaway: 'Mastery is a system: budget, emergency fund, protection, long-term investing — decided calmly, in advance.',
    mission: { label: 'Review your Case Files', href: '/quests' },
  },
  {
    rankId: 'legend',
    number: 8,
    title: 'The Ledger Never Closes',
    districtId: 'infinite_city',
    fogId: 'new_seasonal_threats',
    beats: [
      { text: 'A quiet room at the top of the Order. A single book, bound in gold, lies open on a desk.' },
      { who: 'Archivist Ines', mood: 'proud', text: 'Every name in this ledger belongs to someone who did a hard, ordinary thing again and again: paid the bill, saved the amount, asked the question. Today yours is written here.' },
      { who: 'Pip', mood: 'happy', text: 'So... we won?' },
      { who: 'Archivist Ines', mood: 'content', text: 'The Fog changes shape — a new kind of scam, a new kind of trap each season. What does not change is what works: knowing the tricks, keeping a plan, and teaching the next recruit.' },
      { who: 'Warden Vale', mood: 'proud', text: 'There is no last chapter, Legend. That is the point. Go on. The next case file is already open.' },
    ],
    takeaway: 'Financial skill is a habit, not a finish line. Stay curious, keep the plan current, and pass it on.',
    mission: { label: 'Open the next Case File', href: '/quests' },
  },
];

export function getChapter(rankId: string): Chapter | undefined {
  return CHAPTERS.find(c => c.rankId === rankId);
}

/** The first chapter set in a given district (used by the quest briefing's story tag). */
export function getChapterForDistrict(districtId: string): Chapter | undefined {
  return CHAPTERS.find(c => c.districtId === districtId);
}
