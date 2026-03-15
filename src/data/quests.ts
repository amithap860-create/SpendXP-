/**
 * @fileOverview Data definitions and content for SpendXP Financial Quests.
 * Multi-step narratives where financial decisions have lasting consequences.
 */

import { AgeGroup } from '@/lib/ageAdapt';

export type QuestChoice = {
  id: string;
  text: string;
  consequence: string;
  xpDelta: number;
  healthDelta: number;
  walletDelta: number;
  nextStepId: string | 'end';
  isOptimal: boolean;
  explanation: string;
};

export type QuestStep = {
  id: string;
  title: string;
  narrative: string;
  amount?: number;
  choices: QuestChoice[];
  ageGroups: AgeGroup[];
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  category: 'income' | 'housing' | 'debt' | 'emergency' | 'investing' | 'lifestyle';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageGroups: AgeGroup[];
  estimatedMinutes: number;
  xpReward: number;
  steps: QuestStep[];
  unlockRequirement?: {
    minLevel?: number;
    completedQuestId?: string;
  };
  badgeReward?: string;
};

export const quests: Quest[] = [
  {
    id: 'first-paycheck',
    title: 'First Paycheck',
    description: 'You just earned your first income! Deciding how to allocate it now sets the stage for your future wealth.',
    category: 'income',
    difficulty: 'beginner',
    ageGroups: ['junior', 'teen', 'senior'],
    estimatedMinutes: 3,
    xpReward: 200,
    steps: [
      {
        id: 'fp-1-senior',
        title: 'Payday Arrival',
        narrative: 'Your first salary of ₹20,000 has just hit your bank account. The excitement is real, but so are the possibilities.',
        amount: 20000,
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c1',
            text: 'Transfer ₹4,000 to Savings first',
            consequence: 'You have ₹16,000 left for the month.',
            xpDelta: 50,
            healthDelta: 8,
            walletDelta: -4000,
            nextStepId: 'fp-2-senior',
            isOptimal: true,
            explanation: 'Paying yourself first is the #1 habit of wealth builders. Saving 20% is the gold standard.'
          },
          {
            id: 'c2',
            text: 'Spend now, save what is left later',
            consequence: 'You head to the mall with ₹20,000 in your pocket.',
            xpDelta: 10,
            healthDelta: -5,
            walletDelta: 0,
            nextStepId: 'fp-2-senior',
            isOptimal: false,
            explanation: 'People who spend first rarely save. There is always "one more thing" to buy.'
          },
          {
            id: 'c3',
            text: 'Treat everyone to an expensive dinner',
            consequence: '₹5,000 gone in one night. You feel like a king, for now.',
            xpDelta: 20,
            healthDelta: -12,
            walletDelta: -5000,
            nextStepId: 'fp-2-senior',
            isOptimal: false,
            explanation: 'Celebration is fine, but spending 25% of your first check on one meal is a risky start.'
          }
        ]
      },
      {
        id: 'fp-1-junior',
        title: 'Pocket Money Day',
        narrative: 'You received ₹500 for helping with chores this month. It feels like a fortune!',
        amount: 500,
        ageGroups: ['junior'],
        choices: [
          {
            id: 'j-c1',
            text: 'Put ₹100 in your piggy bank',
            consequence: 'You have ₹400 for toys and snacks.',
            xpDelta: 50,
            healthDelta: 8,
            walletDelta: -100,
            nextStepId: 'fp-2-junior',
            isOptimal: true,
            explanation: 'Saving a small part of every rupee you get is how you grow a big "money tree" later!'
          },
          {
            id: 'j-c2',
            text: 'Buy ₹500 worth of candy',
            consequence: 'Your tummy is full, but your wallet is empty.',
            xpDelta: 5,
            healthDelta: -10,
            walletDelta: -500,
            nextStepId: 'fp-2-junior',
            isOptimal: false,
            explanation: 'If you spend it all today, you will have zero for anything else you might want tomorrow.'
          },
          {
            id: 'j-c3',
            text: 'Keep it all in your pocket',
            consequence: 'You carry it everywhere. It is easy to lose!',
            xpDelta: 10,
            healthDelta: -2,
            walletDelta: 0,
            nextStepId: 'fp-2-junior',
            isOptimal: false,
            explanation: 'Keeping large cash on you is risky. Piggy banks or bank accounts are safer.'
          }
        ]
      },
      {
        id: 'fp-2-senior',
        title: 'The Cracked Screen',
        narrative: 'Disaster! You dropped your phone and the screen is a mess. A repair shop quotes ₹3,500.',
        amount: 3500,
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c4',
            text: 'Pay cash from your remaining balance',
            consequence: 'Your wallet takes a hit, but the phone is fixed.',
            xpDelta: 40,
            healthDelta: 5,
            walletDelta: -3500,
            nextStepId: 'fp-3-senior',
            isOptimal: true,
            explanation: 'Using your cash flow for repairs prevents you from going into high-interest debt.'
          },
          {
            id: 'c5',
            text: 'Put it on a credit card',
            consequence: 'Phone fixed for ₹0 today, but you owe ₹3,500 next month.',
            xpDelta: 15,
            healthDelta: -6,
            walletDelta: 0,
            nextStepId: 'fp-3-senior',
            isOptimal: false,
            explanation: 'Small debts on credit cards can snowball if you do not pay them off in full immediately.'
          },
          {
            id: 'c6',
            text: 'Ignore it and use the cracked screen',
            consequence: 'It is ugly and cuts your finger, but you have the cash.',
            xpDelta: 5,
            healthDelta: 0,
            walletDelta: 0,
            nextStepId: 'fp-3-senior',
            isOptimal: false,
            explanation: 'Frugality is good, but ignoring essential repairs can lead to total device failure later.'
          }
        ]
      },
      {
        id: 'fp-2-junior',
        title: 'The Broken Toy',
        narrative: 'Oh no! Your favorite action figure broke. A new one costs ₹100.',
        amount: 100,
        ageGroups: ['junior'],
        choices: [
          {
            id: 'j-c4',
            text: 'Use your birthday money to buy it',
            consequence: 'You have a new toy!',
            xpDelta: 30,
            healthDelta: 2,
            walletDelta: -100,
            nextStepId: 'fp-3-junior',
            isOptimal: true,
            explanation: 'Using money you saved for special things is what savings are for!'
          },
          {
            id: 'j-c5',
            text: 'Ask parents to buy it for you',
            consequence: 'They say no because you just got your pocket money.',
            xpDelta: 5,
            healthDelta: -5,
            walletDelta: 0,
            nextStepId: 'fp-3-junior',
            isOptimal: false,
            explanation: 'Part of growing up is learning to buy some of your own fun things.'
          },
          {
            id: 'j-c6',
            text: 'Try to fix it with tape',
            consequence: 'It looks okay and you still have your ₹100.',
            xpDelta: 20,
            healthDelta: 5,
            walletDelta: 0,
            nextStepId: 'fp-3-junior',
            isOptimal: true,
            explanation: 'Repairing instead of replacing is a brilliant way to save money!'
          }
        ]
      },
      {
        id: 'fp-3-senior',
        title: 'The Weekend Trip',
        narrative: 'Friends are planning a Goa trip next month. Cost is ₹8,000 per person.',
        amount: 8000,
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c7',
            text: 'Start a "Trip Fund" and save ₹2,000 for 4 months',
            consequence: 'You tell them you will join the NEXT trip.',
            xpDelta: 45,
            healthDelta: 6,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Planning ahead prevents "vacation hangovers" where you spend months paying off one weekend.'
          },
          {
            id: 'c8',
            text: 'Go now! Use your entire remaining balance',
            consequence: 'You have ₹0 for food the last week of the month.',
            xpDelta: 5,
            healthDelta: -8,
            walletDelta: -8000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Spending every last rupee on fun leaves you vulnerable to any small emergency.'
          },
          {
            id: 'c9',
            text: 'Decline the trip entirely',
            consequence: 'You stay home and save. You feel a bit left out.',
            xpDelta: 30,
            healthDelta: 3,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Sometimes saying "no" is the best financial choice, even if it is not the most fun one.'
          }
        ]
      },
      {
        id: 'fp-3-junior',
        title: 'The School Trip',
        narrative: 'Your class is going to the zoo! You need ₹200 for the ticket and lunch.',
        amount: 200,
        ageGroups: ['junior'],
        choices: [
          {
            id: 'j-c7',
            text: 'Use the ₹200 you saved',
            consequence: 'You have a great day with your friends!',
            xpDelta: 40,
            healthDelta: 10,
            walletDelta: -200,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'This is why we save—so we can afford the big, fun events when they happen!'
          },
          {
            id: 'j-c8',
            text: 'Ask a friend to lend you ₹200',
            consequence: 'You go, but now you owe your friend your next 2 months of allowance.',
            xpDelta: 5,
            healthDelta: -10,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Borrowing for fun makes the fun feel heavy because you have to pay it back later.'
          },
          {
            id: 'j-c9',
            text: 'Stay home and save the ₹200',
            consequence: 'You missed the lions, but you are ₹200 richer.',
            xpDelta: 10,
            healthDelta: 2,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Money is a tool for life. Do not miss important experiences just to watch numbers go up.'
          }
        ]
      }
    ]
  },
  {
    id: 'renting-apartment',
    title: 'Renting Your First Apartment',
    description: 'Housing is usually your largest expense. Getting it right determines how much you can save for everything else.',
    category: 'housing',
    difficulty: 'intermediate',
    ageGroups: ['senior'],
    estimatedMinutes: 5,
    xpReward: 250,
    badgeReward: 'housing-master',
    steps: [
      {
        id: 'ra-1',
        title: 'The Budget Dilemma',
        narrative: 'You earn ₹25,000/month. You found a nice PG near your office for ₹11,000/month. Utilities included.',
        amount: 11000,
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c1',
            text: 'Take it. The location is perfect.',
            consequence: '₹11,000 is 44% of your income. Very high.',
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: -11000,
            nextStepId: 'ra-2',
            isOptimal: false,
            explanation: 'Spending >35% of income on housing makes it very hard to build an emergency fund or invest.'
          },
          {
            id: 'ra-c2',
            text: 'Look for a room further away for ₹7,500',
            consequence: 'Longer commute, but more cash in hand.',
            xpDelta: 50,
            healthDelta: 8,
            walletDelta: -7500,
            nextStepId: 'ra-2',
            isOptimal: true,
            explanation: 'Starting your career with lower fixed costs gives you a massive advantage in compounding your wealth.'
          },
          {
            id: 'ra-c3',
            text: 'Stay with family/relatives for ₹0',
            consequence: 'No independence, but ₹25,000 stays in your pocket.',
            xpDelta: 30,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'ra-2',
            isOptimal: true,
            explanation: 'If it is an option, staying home for even one year can build a lifelong safety net.'
          }
        ]
      },
      {
        id: 'ra-2',
        title: 'The Security Deposit',
        narrative: 'The landlord wants 3 months of rent as a security deposit upfront (₹24,000). Your total savings are ₹30,000.',
        amount: 24000,
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c4',
            text: 'Pay the full ₹24,000 deposit',
            consequence: 'You have only ₹6,000 left for EVERYTHING.',
            xpDelta: 15,
            healthDelta: -8,
            walletDelta: -24000,
            nextStepId: 'ra-3',
            isOptimal: false,
            explanation: 'Draining your emergency fund for a deposit leaves you one bad day away from debt.'
          },
          {
            id: 'ra-c5',
            text: 'Negotiate for a 1-month deposit',
            consequence: 'Landlord agrees to ₹10,000. You keep ₹20,000.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: -10000,
            nextStepId: 'ra-3',
            isOptimal: true,
            explanation: 'Negotiating upfront costs is a key financial skill that preserves your liquidity.'
          },
          {
            id: 'ra-c6',
            text: 'Walk away and find a no-deposit place',
            consequence: 'It takes longer, but your ₹30,000 is safe.',
            xpDelta: 25,
            healthDelta: 5,
            walletDelta: 0,
            nextStepId: 'ra-3',
            isOptimal: false,
            explanation: 'Patience in searching can save you from signing a lease that puts you in a tight spot.'
          }
        ]
      },
      {
        id: 'ra-3',
        title: 'The Electricity Surprise',
        narrative: 'Summer hit hard. AC usage was high. Your electricity bill is ₹3,500—triple what you planned.',
        amount: 3500,
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c7',
            text: 'Borrow from a friend to pay it',
            consequence: 'Bill paid, but you owe a favor + cash.',
            xpDelta: 5,
            healthDelta: -6,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Relying on friends for predictable utility spikes indicates a budget that is too tight.'
          },
          {
            id: 'ra-c8',
            text: 'Cut dining out for the next 2 weeks',
            consequence: 'You cover the bill with your food budget.',
            xpDelta: 45,
            healthDelta: 7,
            walletDelta: -3500,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Adapting your variable spending to cover fixed cost surprises is advanced budgeting.'
          },
          {
            id: 'ra-c9',
            text: 'Pay late and take the penalty',
            consequence: '₹200 late fee added. Power might be cut.',
            xpDelta: 0,
            healthDelta: -10,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Late fees are purely wasted money. Always pay essential utilities on time.'
          }
        ]
      }
    ]
  },
  {
    id: 'buying-phone-emi',
    title: 'The EMI Trap',
    description: 'Learn to calculate the true cost of "No Cost" EMI and installments.',
    category: 'debt',
    difficulty: 'beginner',
    ageGroups: ['teen', 'senior'],
    estimatedMinutes: 4,
    xpReward: 200,
    steps: [
      {
        id: 'emi-1',
        title: 'The Latest Model',
        narrative: 'The New Galaxy Phone is ₹45,000. You have ₹15,000 saved. You really want it today.',
        amount: 45000,
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'emi-c1',
            text: 'Buy on 12-month EMI: ₹4,200/month',
            consequence: 'Total cost will be ₹50,400. You pay ₹5,400 interest.',
            xpDelta: 10,
            healthDelta: -10,
            walletDelta: -15000,
            nextStepId: 'emi-2',
            isOptimal: false,
            explanation: 'Interest is money you pay for the "privilege" of spending money you do not have yet.'
          },
          {
            id: 'emi-c2',
            text: 'Save ₹5,000/month for 6 months',
            consequence: 'You wait 6 months, then buy it for ₹45,000 cash.',
            xpDelta: 60,
            healthDelta: 15,
            walletDelta: 0,
            nextStepId: 'emi-2',
            isOptimal: true,
            explanation: 'Saving up means YOU earn interest while you wait, instead of paying it to a bank.'
          },
          {
            id: 'emi-c3',
            text: 'Buy a ₹15,000 model outright now',
            consequence: 'No debt, but it is not the top-tier model.',
            xpDelta: 30,
            healthDelta: 10,
            walletDelta: -15000,
            nextStepId: 'emi-2',
            isOptimal: true,
            explanation: 'Buying what you can afford today is the safest financial path.'
          }
        ]
      },
      {
        id: 'emi-2',
        title: 'The Unexpected Bill',
        narrative: 'Month 3: You have an ₹8,000 medical bill. If you have an EMI, it is due in 5 days.',
        amount: 8000,
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'emi-c4',
            text: 'Miss the EMI to pay the medical bill',
            consequence: 'Late fee + credit score drop.',
            xpDelta: 0,
            healthDelta: -15,
            walletDelta: -8000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Missing EMIs is the fastest way to ruin your credit reputation.'
          },
          {
            id: 'emi-c5',
            text: 'Use your Emergency Fund',
            consequence: 'Bills paid. Fund is now ₹0.',
            xpDelta: 40,
            healthDelta: 5,
            walletDelta: -12200,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'This is EXACTLY why we have emergency funds—so life does not ruin our plans.'
          },
          {
            id: 'emi-c6',
            text: 'Ask parents for a loan',
            consequence: 'They help, but you feel dependent.',
            xpDelta: 10,
            healthDelta: -2,
            walletDelta: -8000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Relying on family is a backup, but building your own buffer is the goal.'
          }
        ]
      }
    ]
  },
  {
    id: 'emergency-fund',
    title: 'Handling an Emergency',
    description: 'Life happens. An emergency fund is the difference between a minor setback and a financial crisis.',
    category: 'emergency',
    difficulty: 'beginner',
    ageGroups: ['junior', 'teen', 'senior'],
    estimatedMinutes: 4,
    xpReward: 200,
    steps: [
      {
        id: 'ef-1',
        title: 'The Hospital Bill',
        narrative: 'Sudden surgery needed! Total bill is ₹15,000. You have ₹10,000 in your emergency fund.',
        amount: 15000,
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'ef-c1',
            text: 'Use fund + borrow ₹5,000 from family',
            consequence: 'Bill paid. No interest debt.',
            xpDelta: 50,
            healthDelta: 5,
            walletDelta: -10000,
            nextStepId: 'ef-2',
            isOptimal: true,
            explanation: 'Your fund covered 66% of the crisis! That is a huge win for stability.'
          },
          {
            id: 'ef-c2',
            text: 'Put the full ₹15,000 on a credit card',
            consequence: 'Debt at 36% APR. Your savings stay in the bank.',
            xpDelta: 10,
            healthDelta: -12,
            walletDelta: 0,
            nextStepId: 'ef-2',
            isOptimal: false,
            explanation: 'Keeping savings while paying high-interest debt is a common but expensive mistake.'
          },
          {
            id: 'ef-c3',
            text: 'Delay the non-critical parts of the bill',
            consequence: 'Hospital refuses. Stress levels skyrocket.',
            xpDelta: 5,
            healthDelta: -5,
            walletDelta: 0,
            nextStepId: 'ef-2',
            isOptimal: false,
            explanation: 'Health crises are non-negotiable. Always prioritize treatment and recovery.'
          }
        ]
      },
      {
        id: 'ef-2',
        title: 'Rebuilding the Wall',
        narrative: 'Your fund is empty. You earn ₹20,000/month. How do you get back to ₹10,000?',
        amount: 10000,
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'ef-c4',
            text: 'Save ₹2,000/month for 5 months',
            consequence: 'Slow and steady. You feel safe again by June.',
            xpDelta: 40,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Consistency is the key to maintaining your financial safety net.'
          },
          {
            id: 'ef-c5',
            text: 'Do not bother. Emergencies do not happen twice.',
            consequence: 'Next month your laptop breaks. You are in deep trouble.',
            xpDelta: 0,
            healthDelta: -20,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Life is unpredictable. Assuming "one and done" is a major risk.'
          },
          {
            id: 'ef-c6',
            text: 'Save ₹500/month (all you can afford)',
            consequence: 'It takes 20 months, but you are trying.',
            xpDelta: 25,
            healthDelta: 5,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Some progress is always better than no progress.'
          }
        ]
      }
    ]
  },
  {
    id: 'vacation-planning',
    title: 'Planning a Vacation',
    description: 'Travel is a top priority for many, but doing it on credit can steal your future fun.',
    category: 'lifestyle',
    difficulty: 'intermediate',
    ageGroups: ['teen', 'senior'],
    estimatedMinutes: 4,
    xpReward: 200,
    steps: [
      {
        id: 'vp-1',
        title: 'Goa Calling',
        narrative: 'Friends want to go to Goa in 3 months. Cost is ₹18,000. You currently have ₹2,000 available.',
        amount: 18000,
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'vp-c1',
            text: 'Save ₹5,500/month from your salary',
            consequence: 'Budget is tight for 3 months, but trip is paid.',
            xpDelta: 50,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'vp-2',
            isOptimal: true,
            explanation: 'Deferred gratification makes the vacation much more relaxing because it is truly free.'
          },
          {
            id: 'vp-c2',
            text: 'Put it all on a credit card today',
            consequence: 'Trip booked! You have ₹18,000 debt at 3.5%/month.',
            xpDelta: 10,
            healthDelta: -10,
            walletDelta: 0,
            nextStepId: 'vp-2',
            isOptimal: false,
            explanation: 'If you can not afford the trip today, you can not afford the interest on the trip tomorrow.'
          },
          {
            id: 'vp-c3',
            text: 'Only go if your friends can lend you part',
            consequence: 'They agree, but tension grows during the trip.',
            xpDelta: 5,
            healthDelta: -5,
            walletDelta: 0,
            nextStepId: 'vp-2',
            isOptimal: false,
            explanation: 'Mixing money and friendship without a clear repayment plan can ruin both.'
          }
        ]
      },
      {
        id: 'vp-2',
        title: 'The Budget Blowout',
        narrative: 'Trip is next week. Flight prices jumped. You need ₹6,000 more than planned.',
        amount: 6000,
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'vp-c4',
            text: 'Take from your Rent fund',
            consequence: 'Trip is on! But rent is due in 10 days.',
            xpDelta: 5,
            healthDelta: -15,
            walletDelta: -6000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Never touch essential bills for optional lifestyle spending.'
          },
          {
            id: 'vp-c5',
            text: 'Tell friends you can not stay at the 5-star hotel',
            consequence: 'You move to a cheaper hostel nearby.',
            xpDelta: 60,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Sticking to your financial boundaries despite peer pressure is a superpower.'
          },
          {
            id: 'vp-c6',
            text: 'Take a "Buy Now Pay Later" loan',
            consequence: 'Debt increases. You feel the stress during the trip.',
            xpDelta: 15,
            healthDelta: -8,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'BNPL is just another name for high-interest lifestyle debt.'
          }
        ]
      }
    ]
  },
  {
    id: 'first-credit-card',
    title: 'Your First Credit Card',
    description: 'A credit card is a sharp tool—use it correctly to build your life, or incorrectly to cut your wallet.',
    category: 'debt',
    difficulty: 'advanced',
    ageGroups: ['senior'],
    estimatedMinutes: 6,
    xpReward: 300,
    steps: [
      {
        id: 'cc-1',
        title: 'Choosing the Plastic',
        narrative: 'You qualify for three cards. Which one do you apply for?',
        ageGroups: ['senior'],
        choices: [
          {
            id: 'cc-c1',
            text: 'Card A: No fee, 15% APR, No rewards',
            consequence: 'Simple, low-cost starter card.',
            xpDelta: 40,
            healthDelta: 8,
            walletDelta: 0,
            nextStepId: 'cc-2',
            isOptimal: true,
            explanation: 'For your first card, low cost and low APR are more important than complex rewards.'
          },
          {
            id: 'cc-c2',
            text: 'Card B: ₹1,500 fee, 12% APR, 2% Cashback',
            consequence: 'You need to spend ₹75,000 just to break even on the fee.',
            xpDelta: 20,
            healthDelta: 2,
            walletDelta: -1500,
            nextStepId: 'cc-2',
            isOptimal: false,
            explanation: 'Many beginners pay fees for rewards they never actually earn back.'
          },
          {
            id: 'cc-c3',
            text: 'Card C: ₹500 fee, 22% APR, Lounge Access',
            consequence: 'You travel once a year. The high APR is a huge risk.',
            xpDelta: 10,
            healthDelta: -5,
            walletDelta: -500,
            nextStepId: 'cc-2',
            isOptimal: false,
            explanation: 'Do not choose a card based on "perks" you rarely use while accepting high interest.'
          }
        ]
      },
      {
        id: 'cc-2',
        title: 'The First Bill',
        narrative: 'You spent ₹12,000. The bill arrives. Minimum payment is only ₹600. You have ₹15,000 in your account.',
        amount: 12000,
        ageGroups: ['senior'],
        choices: [
          {
            id: 'cc-c4',
            text: 'Pay ₹600 (The Minimum)',
            consequence: 'You pay ₹1,800 in interest over the next year.',
            xpDelta: 0,
            healthDelta: -12,
            walletDelta: -600,
            nextStepId: 'cc-3',
            isOptimal: false,
            explanation: 'Paying the minimum is a debt trap. The bank loves it; your wallet hates it.'
          },
          {
            id: 'cc-c5',
            text: 'Pay ₹12,000 (The Full Amount)',
            consequence: '₹0 interest. Your credit score increases.',
            xpDelta: 60,
            healthDelta: 15,
            walletDelta: -12000,
            nextStepId: 'cc-3',
            isOptimal: true,
            explanation: 'This is the ONLY way to use a credit card properly. Pay in full, every single month.'
          },
          {
            id: 'cc-c6',
            text: 'Pay ₹6,000 (Half)',
            consequence: 'Better than minimum, but you still pay interest.',
            xpDelta: 20,
            healthDelta: 0,
            walletDelta: -6000,
            nextStepId: 'cc-3',
            isOptimal: false,
            explanation: 'Any balance carried to the next month incurs high interest immediately.'
          }
        ]
      },
      {
        id: 'cc-3',
        title: 'The "Mix" Advice',
        narrative: 'A friend says you should apply for 3 more cards to "improve your credit mix" and boost your score.',
        ageGroups: ['senior'],
        choices: [
          {
            id: 'cc-c7',
            text: 'Apply for all 3 today',
            consequence: '3 "Hard Inquiries" drop your score by 40 points instantly.',
            xpDelta: 0,
            healthDelta: -15,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Too many applications in a short time make you look desperate to lenders.'
          },
          {
            id: 'cc-c8',
            text: 'Apply for one after 6 months of use',
            consequence: 'Steady growth. Score builds slowly.',
            xpDelta: 30,
            healthDelta: 5,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Wait for your current history to mature before adding more complexity.'
          },
          {
            id: 'cc-c9',
            text: 'Stick with your current card for now',
            consequence: 'Simple and safe. No score drops.',
            xpDelta: 40,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'One card used perfectly is better than five cards used poorly.'
          }
        ]
      }
    ]
  }
];
