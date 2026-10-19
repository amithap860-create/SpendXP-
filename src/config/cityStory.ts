/**
 * @fileOverview Scenes for the SpendCity map (2026-10-19).
 *
 *  AREA_SCENES   — plays the first time a player enters an area
 *  LEVEL_SCENES  — plays the first time a player opens a level (before they go
 *                  to its lesson or case file); replayable from the level row
 *  CLEARED_SCENES— plays when an area becomes crime-free, before the reward card
 *
 * Same cast and arc as chapters.ts: Warden Vale (calm), Pip (impulsive,
 * learning). The Gray Fog is chaos, never people. Money content stays general —
 * the lessons and quests carry the specifics. Written for 9+.
 * Keep each line short: it is read on a phone, one beat at a time.
 */
import type { SceneBeat } from '@/config/characters';

const V = (text: string, mood: SceneBeat['mood'] = 'neutral'): SceneBeat => ({ who: 'Warden Vale', mood, text });
const P = (text: string, mood: SceneBeat['mood'] = 'happy'): SceneBeat => ({ who: 'Pip', mood, text });
const B = (text: string, mood: SceneBeat['mood'] = 'sly'): SceneBeat => ({ who: 'The Broker', mood, text });
const N = (text: string): SceneBeat => ({ text });

export const AREA_SCENES: Record<string, SceneBeat[]> = {
  pocket_park: [
    N('Pocket Park. Swings, a sandbox, and a lemonade stand with a very crooked sign.'),
    P('This is where I learned that candy costs money. Painful day.', 'sad'),
    V('Every expert started with a first coin. Today you start yours. Walk with me.', 'content'),
  ],
  neighbourhood: [
    N('The Neighbourhood. Shop windows glitter, and a thin gray mist clings to every sale sign.'),
    V('The Impulse Storm hides in plain sight here. It whispers "now, now, now".', 'determined'),
    P('Which is exactly what I hear at every checkout. So... how do we beat it?', 'worried'),
  ],
  bank_row: [
    N('Bank Row. Marble steps, brass doors. Fine gray threads stretch between the pillars.'),
    V('The Debt Web lives here. It rarely snaps shut. It tightens, a little each month.', 'worried'),
    P('So we do not touch anything with strings on it?', 'surprised'),
    V('We touch everything. We just learn to see the strings first.', 'determined'),
  ],
  world_gate: [
    N('The World Gate. Crowds, banners, strangers calling out from every direction at once.'),
    V('The Scammer works here. He changes faces, never the script.', 'determined'),
    P('He seems so friendly, though!', 'surprised'),
    V('That is the script. Stay curious. Stay a little suspicious.', 'sly'),
  ],
  central_hall: [
    N('The Central Hall. Tall windows, quiet desks, ledgers as old as the city.'),
    V('Here the Inflation Spiral drains the vault. Slowly. Quietly. Every day.', 'worried'),
    P('But the coins are all still in the pile!', 'surprised'),
    V('Yes. That is the trick. Let us look closer.', 'sly'),
  ],
  market_district: [
    N('The Market District. Screens flicker green and red. The air hums with shouting.'),
    V('Market Madness spreads like a yawn. One person panics and the whole floor follows.', 'worried'),
    P('So what do we do? Panic less?', 'happy'),
    V('Precisely. Panic less, think longer.', 'proud'),
  ],
  academy: [
    N('The Order\'s Academy. Notebooks open, pens ready, and a soft voice in the corridor saying "later".'),
    V('The Procrastinator is the quietest enemy we have. And the most patient.', 'determined'),
    P('I have a plan for that. I will fix it tomorrow!', 'happy'),
    V('...Pip.', 'worried'),
  ],
};

export const LEVEL_SCENES: Record<string, SceneBeat[]> = {
  // Pocket Park
  pp1: [P('My piggy bank is so full it rattles. Is that good?'), V('It is a start. A bank keeps your money safe and, later, lets it grow.', 'content')],
  pp2: [P('I want a bike. It costs more than everything I own.', 'sad'), V('Then we need a goal, a number and a date. Big things are built in small steps.', 'determined')],
  pp3: [P('A budget? Like a rule that ruins fun?', 'worried'), V('The opposite. It tells your money where to go so you can enjoy what is left.', 'content')],
  pp4: [P('If I share, I have less. That is just maths.', 'sad'), V('Sometimes. But money is also a way to be kind. Let us see how to do both.', 'content')],
  pp5: [P('Wait, money can make more money? By itself?', 'surprised'), V('With time and patience. That is interest.', 'proud')],
  pp6: [P('I earned my first rupees today! I want to spend them all!', 'happy'), V('Careful. Earning is a skill. Keeping some is another.', 'determined')],
  pp7: [P('Can I borrow from my friend and pay later?', 'worried'), V('You can. But borrowing always comes with a promise. Let us learn what it costs.', 'determined')],
  pp8: [P('I want to sell my own lemonade!', 'happy'), V('Then you are already a business. Let us do the numbers.', 'content')],
  // The Neighbourhood
  n1: [P('Where does all my money go? It just vanishes.', 'sad'), V('A budget gives every rupee a job. Then nothing vanishes.', 'determined')],
  n2: [P('I need it. Well... I want it. Actually, I just saw it.', 'worried'), V('There are three kinds of "I need it". Let us sort them out.', 'content')],
  n3: [N('Every shop window has a SALE sign. The signs seem to be watching.'), V('Signs are made to feel urgent. Our job is to notice.', 'sly')],
  n4: [P('I will save more money someday!', 'happy'), V('"Someday" has no address. We need a number and a date.', 'determined')],
  // Bank Row
  b1: [V('Rule one of Bank Row: before you spend, set some aside.', 'determined'), P('But I have not got much to set aside.', 'worried')],
  b2: [N('Behind the brass doors, a clerk smiles. Banks are not scary. They are just misunderstood.'), V('Let us learn how they actually work.', 'content')],
  b3: [P('Why save for an emergency that may never come?', 'surprised'), V('Because emergencies are the one thing we can count on. Not when, only that.', 'worried')],
  b4: [V('Money invested early has something money invested late does not: time.', 'proud'), P('Time is a weird thing to put in a bank.', 'surprised')],
  b5: [N('A gray thread drifts down, tiny and almost invisible. It lands on a monthly bill.'), V('Debt grows quietly. We will measure it before it measures us.', 'worried')],
  b6: [P('What is a credit score, anyway? A grade for adults?', 'surprised'), V('Close. It is a number lenders use to guess how reliably you repay.', 'neutral')],
  b7: [P('The monthly payment is so small. What is the catch?', 'worried'), V('Excellent question. The catch is often in the total, not the monthly.', 'sly')],
  b8: [N('A shiny card, a tiny minimum, and a very patient Web.'), V('Credit cards are tools. Like any tool, they cut both ways.', 'determined')],
  // The World Gate
  w1: [P('Insurance is paying for something I hope never happens?', 'surprised'), V('Yes. That is its strange magic. You pay a little so one bad day does not become a ruined year.', 'content')],
  w2: [N('A message glows on Pip\'s phone: DOUBLE YOUR MONEY IN A WEEK.'), P('That sounds amazing!', 'happy'), V('Put the phone down, Pip. Let us look at this together.', 'worried')],
  // The Central Hall
  c1: [P('My offer letter shows one big yearly number. Is that what I take home?', 'happy'), V('Almost never. Let us find out what actually reaches your bank account.', 'sly')],
  c2: [P('Why do we pay taxes at all?', 'surprised'), V('Roads, schools, hospitals. The city runs on them. The only question is how.', 'content')],
  c3: [P('If I earn more, will I take home less?', 'worried'), V('A common fear, and a common myth. Let us read the slabs properly.', 'sly')],
  c4: [N('Every receipt has a tiny line near the bottom that most people never read.'), V('Today we read it.', 'determined')],
  c5: [P('How rich am I, really?', 'happy'), V('Net worth answers that honestly. Everything you own, minus everything you owe.', 'content')],
  // Market District
  m1: [N('Screens flicker. A hundred voices shout at once.'), V('Before buying anything here, learn what a share actually is.', 'determined')],
  m2: [P('Why did that stock drop when the company did well?', 'surprised'), V('Prices move on what people expect, not only on what happens.', 'sly')],
  m3: [P('Instead of picking one winner, can I own a little of everything?', 'happy'), V('You can. That is the idea behind index funds and ETFs.', 'proud')],
  m4: [P('Retirement? I am nowhere near that!', 'surprised'), V('Exactly why it is the right time to understand it.', 'content')],
  m5: [P('What if I just buy and sell quickly and win every day?', 'happy'), V('Many have tried. Let us see what the numbers say.', 'sly')],
  m6: [N('A coin glints on the screen, rising 40% in a day, then falling 40% the next.'), V('Crypto is not a toy and not a promise. Learn the risks first.', 'determined')],
  m7: [P('How do I know if a company is any good?', 'worried'), V('You read it like a detective: what it earns, what it owes, what it plans.', 'content')],
  // The Order's Academy
  a1: [P('I will save more. Eventually. Soon.', 'happy'), V('Turn "soon" into a date and an amount.', 'determined')],
  a2: [P('Could I earn something on the side? Like, a real hustle?', 'surprised'), V('You could. Let us look at how to start small and stay safe.', 'content')],
};

export const CLEARED_SCENES: Record<string, SceneBeat[]> = {
  pocket_park: [P('The swings are quiet. The Storm is gone!', 'happy'), V('Well done. You started where every good detective starts: with a coin.', 'proud')],
  neighbourhood: [P('I just walked past a sale and did not buy anything. I feel weird.', 'surprised'), V('That feeling is called self-control. Get used to it.', 'proud')],
  bank_row: [P('The threads are gone! Is it over?', 'happy'), V('For here, yes. But a thread remains somewhere in the dark, pulling. We will find it.', 'sly')],
  world_gate: [P('The stranger just... left. Like a deflated balloon.', 'surprised'), V('Scammers hate a question they cannot answer. Keep asking.', 'determined')],
  central_hall: [P('Is the vault still shrinking?', 'worried'), V('Not anymore. And we know which pen has been signing those thefts: H.B.', 'determined')],
  market_district: [P('Everyone stopped shouting.', 'surprised'), V('A calm market is a thinking market. You helped it get there.', 'proud')],
  academy: [P('The voice stopped saying "later".', 'happy'), B('Not gone. Only quieter. I am patient, little recruit.', 'sly')],
};
