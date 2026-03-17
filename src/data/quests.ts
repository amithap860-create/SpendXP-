/**
 * @fileOverview Deeply realistic, high-stakes financial quests for SpendXP.
 * Tailored for the Indian context with exact rupee consequences and cascading outcomes.
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
  realLifeTip?: string;
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
  startingBalance: number;
  steps: QuestStep[];
  badgeReward?: string;
};

export const quests: Quest[] = [
  {
    id: 'first-paycheck',
    title: 'Your First Salary: ₹35,000',
    description: 'You are 23, living in Bangalore. Your first paycheck just hit. Can you survive the month and still save?',
    category: 'income',
    difficulty: 'intermediate',
    ageGroups: ['teen', 'senior'],
    estimatedMinutes: 8,
    xpReward: 300,
    startingBalance: 35000,
    steps: [
      {
        id: 'fp-1',
        title: 'Payday Arrival',
        narrative: "It's the 1st of the month. Your salary of ₹35,000 is in. Your student loan EMI of ₹4,200 is due in 5 days, and your PG owner is asking for the ₹8,000 rent. Friends are also planning a trip to Coorg.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c1',
            text: 'Pay PG Rent + EMI immediately (₹12,200)',
            consequence: 'Smart. Your non-negotiables are handled. You have ₹22,800 left to allocate.',
            xpDelta: 60,
            healthDelta: 8,
            walletDelta: -12200,
            nextStepId: 'fp-2',
            isOptimal: true,
            explanation: 'Handling fixed obligations first protects your CIBIL score and housing security.',
            realLifeTip: 'Set up Auto-Debit for EMIs. A single missed payment can drop your CIBIL score by 50+ points.'
          },
          {
            id: 'c2',
            text: 'Save ₹10,000 first, then pay bills later',
            consequence: 'Good instinct, but you only have ₹12,800 left for the month after bills. It will be tight.',
            xpDelta: 50,
            healthDelta: 6,
            walletDelta: -10000,
            nextStepId: 'fp-2',
            isOptimal: false,
            explanation: 'Saving is great, but don\'t ignore immediate liquidity needs for committed bills.',
            realLifeTip: 'The "Pay Yourself First" rule works best when you already know your fixed costs.'
          },
          {
            id: 'c3',
            text: 'Book the ₹6,000 Coorg trip while excited',
            consequence: 'Trip booked! But you still owe ₹12,200 in bills. Only ₹16,800 remains for food and travel.',
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: -6000,
            nextStepId: 'fp-2',
            isOptimal: false,
            explanation: 'Impulse spending on lifestyle before bills is the #1 cause of month-end debt.',
            realLifeTip: 'Use a "Sinking Fund" for trips. Save ₹1,500/month for 4 months instead of one big hit.'
          }
        ]
      },
      {
        id: 'fp-2',
        title: 'The Tax Trap',
        narrative: "Your HR asks if you want to invest in NPS (National Pension System) to save tax under 80CCD(1B). It locks money until age 60 but saves you ₹3,120 in taxes this year.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'c4',
            text: 'Invest ₹2,000/month in NPS',
            consequence: 'Tax saved! This ₹2,000/month could grow to ₹2.1 Crore by age 60.',
            xpDelta: 55,
            healthDelta: 7,
            walletDelta: -2000,
            nextStepId: 'fp-3',
            isOptimal: true,
            explanation: 'Starting retirement savings at 23 is a compounding superpower.',
            realLifeTip: 'NPS is great for long-term, but ELSS mutual funds offer similar tax breaks with only a 3-year lock-in.'
          },
          {
            id: 'c5',
            text: 'Keep the cash. You need it for Bangalore life.',
            consequence: 'You have more cash today, but you will pay that ₹3,120 to the government instead of yourself.',
            xpDelta: 10,
            healthDelta: -4,
            walletDelta: 0,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: 'Skipping tax-saving investments is essentially giving away free money.',
            realLifeTip: 'Under the Old Tax Regime, Section 80C lets you save tax on up to ₹1.5 Lakh of investments.'
          }
        ]
      },
      {
        id: 'fp-3',
        title: 'The Invisible Drain',
        narrative: "End of Week 2. You check your statement: Swiggy/Zomato ₹4,500, Uber ₹3,200, Quick Commerce (Blinkit/Zepto) ₹2,800. You've spent ₹10,500 on convenience.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c6',
            text: 'Delete apps, cook at home for 2 weeks',
            consequence: 'You save ₹5,000 this month. Your wallet breathes again.',
            xpDelta: 65,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'fp-4',
            isOptimal: true,
            explanation: 'Aggressive correction when spending goes off-track is vital for financial health.',
            realLifeTip: 'Meal prep on Sundays can save the average Indian professional ₹6,000/month.'
          },
          {
            id: 'c7',
            text: 'Just cut the "extra" snacks. Keep the rides.',
            consequence: 'You save ₹1,200. Better than nothing, but your balance is still dipping fast.',
            xpDelta: 30,
            healthDelta: 2,
            walletDelta: 0,
            nextStepId: 'fp-4',
            isOptimal: false,
            explanation: 'Small cuts often fail to fix large systemic spending leaks like daily Ubers.',
            realLifeTip: 'Try the "24-hour rule": Wait one full day before clicking "Order" on non-essential items.'
          }
        ]
      },
      {
        id: 'fp-4',
        title: 'The Startup Offer',
        narrative: "A startup offers you ₹52,000 CTC. Your current is ₹35,000. But the startup has no PF (Provident Fund) and limited job security. It's 'exciting' but risky.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'c8',
            text: 'Negotiate current role to ₹42,000',
            consequence: 'Success! You get a ₹7,000 raise with PF intact and job safety.',
            xpDelta: 70,
            healthDelta: 9,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Negotiating at your current job is often lower risk than a lateral move to an unstable startup.',
            realLifeTip: 'Employer PF contributions are a "hidden" 12% bonus to your salary. Always calculate Net In-Hand.'
          },
          {
            id: 'c9',
            text: 'Jump to the startup for ₹52,000',
            consequence: 'Higher cash, but you lose ₹4,200/month in future PF wealth. High risk.',
            xpDelta: 40,
            healthDelta: -2,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Salary is more than just the monthly credit alert. Benefits and security have a rupee value.',
            realLifeTip: 'A 10% raise today compounds to nearly ₹1.2 Crore extra over a 30-year career.'
          }
        ]
      }
    ]
  },
  {
    id: 'renting-apartment',
    title: 'Renting in Mumbai: The BKC Choice',
    description: 'You got a job in BKC (₹55,000/month). Mumbai is expensive. Can you find a home without going broke?',
    category: 'housing',
    difficulty: 'advanced',
    ageGroups: ['senior'],
    estimatedMinutes: 10,
    xpReward: 350,
    startingBalance: 90000,
    steps: [
      {
        id: 'ra-1',
        title: 'Choosing Where to Live',
        narrative: "Your office is in BKC. You have ₹90,000 in savings. Where do you plant your roots?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c1',
            text: 'PG in BKC (Walking distance): ₹18,000',
            consequence: '₹18,000/month (33% of salary). No commute, meals included. Deposit: ₹18,000.',
            xpDelta: 40,
            healthDelta: 5,
            walletDelta: -18000,
            nextStepId: 'ra-2',
            isOptimal: false,
            explanation: 'High rent, but zero commute cost and food included makes it a balanced starter choice.',
            realLifeTip: 'Living close to work can save you 100+ hours of commute time a month—that time is worth money.'
          },
          {
            id: 'ra-c2',
            text: '1BHK shared in Andheri: ₹12,500',
            consequence: '₹12,500/month (23% of salary). 45 min Metro commute. Deposit: ₹37,500.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: -37500,
            nextStepId: 'ra-2',
            isOptimal: true,
            explanation: 'Keeping housing under 25% of salary is the key to building wealth in expensive cities.',
            realLifeTip: 'Aim for a 3:1 ratio: Your monthly income should be at least 3x your rent.'
          }
        ]
      },
      {
        id: 'ra-2',
        title: 'The Broker Problem',
        narrative: "The broker wants 1 month rent as brokerage (₹12,500 or ₹18,000). Your savings are depleting fast.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c3',
            text: 'Negotiate brokerage to 50%',
            consequence: 'Success! You save ₹6,250. Most people never even ask.',
            xpDelta: 55,
            healthDelta: 8,
            walletDelta: -6250,
            nextStepId: 'ra-3',
            isOptimal: true,
            explanation: 'Brokerage is almost always negotiable. 30 minutes of talking saved you a week of work.',
            realLifeTip: 'Use apps like NoBroker or local Facebook groups to find "Direct Owner" flats and save ₹20k+.'
          },
          {
            id: 'ra-c4',
            text: 'Pay the full amount to secure the flat',
            consequence: 'You have the flat, but your savings are now dangerously low.',
            xpDelta: 20,
            healthDelta: -4,
            walletDelta: -12500,
            nextStepId: 'ra-3',
            isOptimal: false,
            explanation: 'Accepting high upfront costs without pushback drains your liquidity unnecessarily.',
            realLifeTip: 'Always budget for "Move-in Costs" (Brokerage + Deposit + Transporter + Gas connection).'
          }
        ]
      },
      {
        id: 'ra-3',
        title: 'The Maintenance Surprise',
        narrative: "You move in. Suddenly, the Society office asks for a ₹2,500 'Move-in' fee and tells you monthly maintenance is ₹3,000 extra. Your budget is breaking.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c5',
            text: 'Deduct maintenance from Rent (Owner pays)',
            consequence: 'Smart. Most owners should pay maintenance. You save ₹3,000/month.',
            xpDelta: 65,
            healthDelta: 9,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Standard Mumbai practice is that the owner pays society maintenance. Clarify this in the lease!',
            realLifeTip: 'Always get rent receipts. You can save up to ₹60,000/year in taxes via HRA exemption.'
          },
          {
            id: 'ra-c6',
            text: 'Pay it yourself to avoid conflict',
            consequence: 'You lose ₹3,000 every month. That is ₹36,000 a year gone for nothing.',
            xpDelta: 10,
            healthDelta: -8,
            walletDelta: -3000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Avoiding a 5-minute awkward conversation cost you a full month of salary over a year.',
            realLifeTip: 'If your rent is >₹8,333/month, you MUST provide the owner\'s PAN to claim HRA tax benefits.'
          }
        ]
      }
    ]
  },
  {
    id: 'buying-phone-emi',
    title: 'The ₹60,000 Smartphone',
    description: 'You really want the new iPhone. Your salary is ₹40,000. Do you use "No Cost" EMI or wait?',
    category: 'debt',
    difficulty: 'beginner',
    ageGroups: ['teen', 'senior'],
    estimatedMinutes: 5,
    xpReward: 200,
    startingBalance: 15000,
    steps: [
      {
        id: 'p-1',
        title: 'The Deal',
        narrative: "The phone is ₹60,000. Amazon offers 'No Cost EMI' for ₹5,000/month for 12 months. You have ₹15,000 in savings.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'p-c1',
            text: 'Save ₹10,000/month for 5 months',
            consequence: 'You buy it in 5 months with cash. No debt. Fund stays intact.',
            xpDelta: 60,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'p-2',
            isOptimal: true,
            explanation: 'Sinking funds prevent your future income from being locked in debt.',
            realLifeTip: '"No Cost" EMI often has a hidden "Processing Fee" of ₹199-₹999 and GST on interest.'
          },
          {
            id: 'p-c2',
            text: 'Take the 12-month EMI today',
            consequence: 'You have the phone! But ₹5,000 of your salary is GONE every month for a year.',
            xpDelta: 20,
            healthDelta: -10,
            walletDelta: 0,
            nextStepId: 'p-2',
            isOptimal: false,
            explanation: 'Debt for depreciating assets (phones) is the fastest way to stay poor.',
            realLifeTip: 'If you can\'t buy it twice in cash, you can\'t afford it.'
          }
        ]
      },
      {
        id: 'p-2',
        title: 'The Screen Break',
        narrative: "Month 3. You drop the phone. No insurance. Repair costs ₹12,000. If you have an EMI, you are already tight.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'p-c3',
            text: 'Use your entire ₹15,000 savings',
            consequence: 'Phone fixed. But you have ₹3,000 total safety net left.',
            xpDelta: 40,
            healthDelta: 5,
            walletDelta: -12000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Using cash is painful but prevents the high-interest spiral of credit card debt.',
            realLifeTip: 'Buy a screen guard and a good case for ₹500—it saves a ₹12,000 headache.'
          },
          {
            id: 'p-c4',
            text: 'Put the repair on Credit Card',
            consequence: '₹12,000 added to card. At 42% APR, you pay ₹420 in interest every month.',
            xpDelta: 5,
            healthDelta: -15,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Consumer debt on top of consumer debt leads to a financial crash.',
            realLifeTip: 'Credit card interest in India is 3.5% PER MONTH. That is one of the highest in the world.'
          }
        ]
      }
    ]
  },
  {
    id: 'emergency-fund-quest',
    title: 'The Pink Slip Surprise',
    description: 'A sudden layoff hits. You have 30 days of pay left. How long can you survive?',
    category: 'emergency',
    difficulty: 'intermediate',
    ageGroups: ['senior'],
    estimatedMinutes: 7,
    xpReward: 300,
    startingBalance: 120000,
    steps: [
      {
        id: 'efq-1',
        title: 'The Layoff Notice',
        narrative: "Your startup closed. You get 1 month severance (₹40,000). You have ₹1,20,000 in total savings. Monthly expenses: ₹30,000.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'efq-c1',
            text: 'Cut all luxury immediately',
            consequence: 'Expenses drop to ₹20,000. Your savings now last 8 months instead of 5.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 40000,
            nextStepId: 'efq-2',
            isOptimal: true,
            explanation: 'Surviving a layoff is about extending your "runway" as much as possible.',
            realLifeTip: 'The first thing to cut is subscriptions and dining out. These are pure variable costs.'
          },
          {
            id: 'efq-c2',
            text: 'Maintain lifestyle to keep morale high',
            consequence: 'You stay happy, but you only have 5 months to find a job or move back home.',
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: 40000,
            nextStepId: 'efq-2',
            isOptimal: false,
            explanation: 'Denial is expensive. High fixed costs are your enemy during unemployment.',
            realLifeTip: 'Morale comes from security. Security comes from having a 6-month buffer.'
          }
        ]
      },
      {
        id: 'efq-2',
        title: 'The Medical Bill',
        narrative: "Month 2. Still no job. A family member needs ₹40,000 for a hospital deposit. Insurance will reimburse later, but you need cash NOW.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'efq-c3',
            text: 'Pay cash from Emergency Fund',
            consequence: 'Liquid and fast. Savings drop to ₹80,000. 4 months runway left.',
            xpDelta: 50,
            healthDelta: 8,
            walletDelta: -40000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'This is EXACTLY what the fund is for. It prevents you from taking predatory loans.',
            realLifeTip: 'Keep your emergency fund in a "Liquid Fund" or separate savings account for instant access.'
          },
          {
            id: 'efq-c4',
            text: 'Take a Personal Loan for ₹40,000',
            consequence: 'At 14%, you pay ₹5,600 in interest while unemployed. A heavy burden.',
            xpDelta: 10,
            healthDelta: -12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Taking a loan when you have no income is a recipe for a debt trap.',
            realLifeTip: 'Avoid personal loans for things you can cover with savings. Interest rates are usually 12-18%.'
          }
        ]
      }
    ]
  },
  {
    id: 'vacation-planning',
    title: 'The Bali Dream vs. Gokarna Reality',
    description: 'You want a break. Bali costs ₹80,000. Gokarna costs ₹15,000. You have ₹45,000 saved.',
    category: 'lifestyle',
    difficulty: 'beginner',
    ageGroups: ['teen', 'senior'],
    estimatedMinutes: 6,
    xpReward: 250,
    startingBalance: 45000,
    steps: [
      {
        id: 'vp-1',
        title: 'The Destination Dilemma',
        narrative: "Instagram is full of Bali photos. It costs ₹80,000 for a week. You have ₹45,000 in your 'fun fund'.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'vp-c1',
            text: 'Go to Gokarna now (₹15,000)',
            consequence: 'Amazing trip! You still have ₹30,000 in your fund for the next one.',
            xpDelta: 50,
            healthDelta: 10,
            walletDelta: -15000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Choosing experiences within your means prevents lifestyle debt.',
            realLifeTip: 'The "Instagram tax" is real. Lesser-known spots often provide 90% of the joy for 20% of the cost.'
          },
          {
            id: 'vp-c2',
            text: 'Save for 4 more months for Bali',
            consequence: 'Patience pays. You will enjoy Bali more knowing it is fully paid for.',
            xpDelta: 60,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Delayed gratification is the ultimate financial skill.',
            realLifeTip: 'Create a dedicated "Sinking Fund" savings account for travel to avoid accidental spending.'
          },
          {
            id: 'vp-c3',
            text: 'Swipe Credit Card for the ₹35,000 gap',
            consequence: 'Bali was great, but you now pay ₹1,200/month just in interest. No fun.',
            xpDelta: 10,
            healthDelta: -15,
            walletDelta: -35000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'Borrowing for vacations is the most common way young professionals enter a debt spiral.',
            realLifeTip: 'A ₹35,000 debt at 42% APR takes 4 years to pay off if you only pay the minimum.'
          }
        ]
      }
    ]
  },
  {
    id: 'first-credit-card',
    title: 'The Rewards Trap',
    description: 'You got your first credit card with a ₹50,000 limit. "10% Reward points" sounds like free money. Is it?',
    category: 'debt',
    difficulty: 'intermediate',
    ageGroups: ['senior'],
    estimatedMinutes: 7,
    xpReward: 300,
    startingBalance: 20000,
    steps: [
      {
        id: 'fcc-1',
        title: 'The Big Purchase',
        narrative: "A new laptop is ₹45,000. Your card gives 10x points on electronics. You have ₹20,000 in your bank account.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'fcc-c1',
            text: 'Buy a ₹20,000 laptop in cash',
            consequence: 'Basic but functional. You have 0 debt and your ₹20,000 is still yours.',
            xpDelta: 50,
            healthDelta: 10,
            walletDelta: -20000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: 'Buying what you can afford is always better than chasing points with money you don\'t have.',
            realLifeTip: 'Credit card rewards are designed to make you spend 20-30% more than you planned.'
          },
          {
            id: 'fcc-c2',
            text: 'Buy the ₹45,000 laptop on card',
            consequence: 'Great laptop! But you owe ₹25,000 more than you have. Points worth: ₹450.',
            xpDelta: 20,
            healthDelta: -12,
            walletDelta: -45000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: 'You earned ₹450 in points but will pay ₹875 in interest in just the first month.',
            realLifeTip: 'Never spend on a credit card unless you have the cash in your bank to pay it off today.'
          }
        ]
      }
    ]
  }
];
