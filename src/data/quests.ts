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
        narrative: "It's the 1st of the month. Your salary of ₹35,000 is in. Your student loan EMI of ₹4,200 is due in 5 days, and your PG owner is asking for the ₹8,000 rent.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c1',
            text: 'Pay PG Rent + EMI immediately (₹12,200)',
            consequence: 'Smart. Your two non-negotiables are handled. You have ₹22,800 left to allocate.',
            xpDelta: 60,
            healthDelta: 8,
            walletDelta: -12200,
            nextStepId: 'fp-2',
            isOptimal: true,
            explanation: "Handling fixed obligations first protects your CIBIL score and housing security.",
            realLifeTip: "Set up Auto-Debit for EMIs. A single missed payment can drop your CIBIL score by 50+ points."
          },
          {
            id: 'c2',
            text: 'Transfer ₹10,000 to savings first',
            consequence: "Good instinct, but your EMI is due in 5 days. You have ₹25,000 remaining and must remember to pay the bills.",
            xpDelta: 50,
            healthDelta: 6,
            walletDelta: -10000,
            nextStepId: 'fp-2',
            isOptimal: false,
            explanation: "Saving is great, but don't ignore immediate liquidity needs for committed bills.",
            realLifeTip: "The 'Pay Yourself First' rule works best when you already know your fixed costs."
          },
          {
            id: 'c3',
            text: 'Book a ₹6,000 trip with friends now',
            consequence: 'Trip booked! But you still owe ₹12,200 in bills. Only ₹16,800 remains for food and travel.',
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: -6000,
            nextStepId: 'fp-2',
            isOptimal: false,
            explanation: "Impulse spending on lifestyle before bills is the #1 cause of month-end debt.",
            realLifeTip: "Use a 'Sinking Fund' for trips. Save ₹1,500/month for 4 months instead of one big hit."
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
            explanation: "Starting retirement savings at 23 is a compounding superpower.",
            realLifeTip: "NPS is great for long-term, but ELSS mutual funds offer similar tax breaks with shorter lock-ins."
          },
          {
            id: 'c5',
            text: 'Keep the cash for Bangalore life',
            consequence: 'You have more cash today, but you will pay that ₹3,120 to the government instead of yourself.',
            xpDelta: 10,
            healthDelta: -4,
            walletDelta: 0,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "Skipping tax-saving investments is essentially giving away free money.",
            realLifeTip: "Under the Old Tax Regime, Section 80C lets you save tax on up to ₹1.5 Lakh of investments."
          }
        ]
      },
      {
        id: 'fp-3',
        title: 'Pattern Recognition',
        narrative: "End of month 3. You check Swiggy/Zomato: ₹4,500, Uber: ₹3,200, Blinkit: ₹2,800. You spent ₹10,500 on convenience.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c6',
            text: 'Delete apps, cook at home for 2 weeks',
            consequence: 'You save ₹5,000 this month. Your wallet breathes again.',
            xpDelta: 65,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Aggressive correction when spending goes off-track is vital for financial health.",
            realLifeTip: "Meal prep on Sundays can save the average Indian professional ₹6,000/month."
          },
          {
            id: 'c7',
            text: 'Just cut the "extra" snacks',
            consequence: 'You save ₹1,200. Better than nothing, but your balance is still dipping fast.',
            xpDelta: 30,
            healthDelta: 2,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Small cuts often fail to fix large systemic spending leaks like daily Ubers.",
            realLifeTip: "Try the '24-hour rule': Wait one full day before clicking 'Order' on non-essential items."
          }
        ]
      }
    ]
  },
  {
    id: 'first-apartment',
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
            text: 'PG in BKC (Walking): ₹18,000',
            consequence: '₹18,000/month. No commute, meals included. Deposit: ₹18,000.',
            xpDelta: 40,
            healthDelta: 5,
            walletDelta: -18000,
            nextStepId: 'ra-2',
            isOptimal: false,
            explanation: "High rent, but zero commute cost and food included makes it a balanced starter choice.",
            realLifeTip: "Living close to work can save you 100+ hours of commute time a month—that time is worth money."
          },
          {
            id: 'ra-c2',
            text: 'Shared 1BHK in Andheri: ₹12,500',
            consequence: '₹12,500/month. 45 min Metro commute. Deposit: ₹37,500.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: -37500,
            nextStepId: 'ra-2',
            isOptimal: true,
            explanation: "Keeping housing under 25% of salary is the key to building wealth in expensive cities.",
            realLifeTip: "Aim for a 3:1 ratio: Your monthly income should be at least 3x your rent."
          }
        ]
      },
      {
        id: 'ra-2',
        title: 'The Broker Problem',
        narrative: "The broker wants 1 month rent as brokerage. Your savings are depleting fast.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c3',
            text: 'Negotiate brokerage to 50%',
            consequence: 'Success! You save ₹6,250. Most people never even ask.',
            xpDelta: 55,
            healthDelta: 8,
            walletDelta: -6250,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Brokerage is almost always negotiable. 30 minutes of talking saved you a week of work.",
            realLifeTip: "Use apps like NoBroker or local Facebook groups to find 'Direct Owner' flats and save ₹20k+."
          },
          {
            id: 'ra-c4',
            text: 'Pay full to secure the flat',
            consequence: 'You have the flat, but your savings are now dangerously low.',
            xpDelta: 20,
            healthDelta: -4,
            walletDelta: -12500,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Accepting high upfront costs without pushback drains your liquidity unnecessarily.",
            realLifeTip: "Always budget for 'Move-in Costs' (Brokerage + Deposit + Transporter + Gas connection)."
          }
        ]
      }
    ]
  },
  {
    id: 'phone-emi',
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
        narrative: "The phone is ₹60,000. Amazon offers 'No Cost EMI' for ₹5,000/month for 12 months. You have ₹15,000 saved.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'p-c1',
            text: 'Save ₹10,000/mo for 5 months',
            consequence: 'You buy it in 5 months with cash. No debt. Savings stay intact.',
            xpDelta: 60,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Sinking funds prevent your future income from being locked in debt.",
            realLifeTip: "'No Cost' EMI often has hidden processing fees and GST on the interest component."
          },
          {
            id: 'p-c2',
            text: 'Take the 12-month EMI today',
            consequence: 'You have the phone! But ₹5,000 of your salary is GONE every month for a year.',
            xpDelta: 20,
            healthDelta: -10,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Debt for depreciating assets (phones) is the fastest way to stay poor.",
            realLifeTip: "If you can't buy it twice in cash, you can't afford it."
          }
        ]
      }
    ]
  },
  {
    id: 'emergency-expense',
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
        narrative: "Your startup closed. You get 1 month severance (₹40,000). You have ₹1,20,000 in total savings.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'efq-c1',
            text: 'Cut all luxury immediately',
            consequence: 'Expenses drop to ₹20,000. Your savings now last 8 months instead of 5.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 40000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Surviving a layoff is about extending your 'runway' as much as possible.",
            realLifeTip: "The first thing to cut is subscriptions and dining out. These are pure variable costs."
          },
          {
            id: 'efq-c2',
            text: 'Maintain lifestyle for morale',
            consequence: 'You stay happy, but you only have 5 months to find a job or move back home.',
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: 40000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Denial is expensive. High fixed costs are your enemy during unemployment.",
            realLifeTip: "Morale comes from security. Security comes from having a 6-month buffer."
          }
        ]
      }
    ]
  },
  {
    id: 'vacation-planning',
    title: 'Bali Dream vs. Gokarna Reality',
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
        title: 'Destination Dilemma',
        narrative: "Instagram is full of Bali photos. It costs ₹80,000 for a week. You have ₹45,000.",
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
            explanation: "Choosing experiences within your means prevents lifestyle debt.",
            realLifeTip: "The 'Instagram tax' is real. Lesser-known spots often provide 90% of the joy for 20% of the cost."
          },
          {
            id: 'vp-c2',
            text: 'Save 4 more months for Bali',
            consequence: 'Patience pays. You will enjoy Bali more knowing it is fully paid for.',
            xpDelta: 60,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Delayed gratification is the ultimate financial skill.",
            realLifeTip: "Create a dedicated 'Sinking Fund' for travel to avoid accidental spending."
          }
        ]
      }
    ]
  },
  {
    id: 'first-credit-card',
    title: 'The Rewards Trap',
    description: 'You got your first credit card with a ₹50,000 limit. "10% Reward points" sounds like free money.',
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
        narrative: "A new laptop is ₹45,000. Your card gives 10x points. You have ₹20,000 in your bank account.",
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
            explanation: "Buying what you can afford is always better than chasing points with money you don't have.",
            realLifeTip: "Credit card rewards are designed to make you spend 20-30% more than you planned."
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
            explanation: "You earned ₹450 in points but will pay ₹875 in interest in just the first month.",
            realLifeTip: "Never spend on a credit card unless you have the cash in your bank to pay it off today."
          }
        ]
      }
    ]
  },
  {
    id: 'calculations-quest',
    title: 'The Math of Money: Projections',
    description: 'Can you calculate your way to wealth? Test your ability to project returns and understand inflation.',
    category: 'investing',
    difficulty: 'advanced',
    ageGroups: ['senior'],
    estimatedMinutes: 10,
    xpReward: 400,
    startingBalance: 50000,
    steps: [
      {
        id: 'mq-1',
        title: 'The Inflation Stealth',
        narrative: "You have ₹50,000 in a Fixed Deposit earning 6% interest. Inflation in India is currently 5.5%. After one year, how much did your wealth actually grow in real purchasing power?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c1',
            text: 'It grew by 6% (₹3,000)',
            consequence: "That is your 'Nominal' growth. After adjusting for 5.5% inflation, your real gain is almost invisible.",
            xpDelta: 10,
            healthDelta: -2,
            walletDelta: 3000,
            nextStepId: 'mq-2',
            isOptimal: false,
            explanation: "Nominal returns are a vanity metric. Real returns (Nominal - Inflation) are what build wealth.",
            realLifeTip: "If your investment return is equal to inflation, your lifestyle stays the same forever."
          },
          {
            id: 'mq-c2',
            text: 'It grew by 0.5% (₹250)',
            consequence: "Correct! Your 'Real Rate of Return' is 0.5%. Your money just barely kept its value.",
            xpDelta: 80,
            healthDelta: 10,
            walletDelta: 250,
            nextStepId: 'mq-2',
            isOptimal: true,
            explanation: "Real return calculation: (1 + Nominal)/(1 + Inflation) - 1. A 6% FD at 5.5% inflation is a 0.47% real gain.",
            realLifeTip: "Always subtract current inflation from your FD rate to see if you are actually getting richer."
          }
        ]
      },
      {
        id: 'mq-2',
        title: 'The Lure of the Personal Loan',
        narrative: "You want a bike for ₹1,00,000. Bank offers a loan at 14% for 2 years. Monthly EMI is ₹4,801. How much interest will you pay in total?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c3',
            text: '₹14,000 (14% of 1 Lakh)',
            consequence: "Incorrect. That assumes you pay once at the end. Monthly compounding changes the math.",
            xpDelta: 10,
            healthDelta: -5,
            walletDelta: -15224,
            nextStepId: 'mq-3',
            isOptimal: false,
            explanation: "Personal loan interest is calculated on a reducing balance. 4801 * 24 = 1,15,224 total.",
            realLifeTip: "Always ask for the 'Amortization Schedule' before signing a loan to see every rupee of interest."
          },
          {
            id: 'mq-c4',
            text: '₹15,224',
            consequence: "Correct! You pay ₹15,224 extra just to have the bike 2 years earlier.",
            xpDelta: 80,
            healthDelta: 10,
            walletDelta: -15224,
            nextStepId: 'mq-3',
            isOptimal: true,
            explanation: "Total interest = (EMI * Tenure) - Principal. You are essentially working 10 days a year just to pay the bank.",
            realLifeTip: "Calculate the 'Total Cost of Ownership' including interest, not just the sticker price."
          }
        ]
      },
      {
        id: 'mq-3',
        title: 'Compounding Speed (Rule of 72)',
        narrative: "You invest ₹50,000 in a Nifty 50 Index fund returning 12% annually. Using the 'Rule of 72', how long until your money doubles to ₹1,00,000?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c5',
            text: '6 years',
            consequence: 'Exactly! 72 / 12 = 6 years. No calculator needed for this wealth-building shortcut.',
            xpDelta: 80,
            healthDelta: 10,
            walletDelta: 50000,
            nextStepId: 'mq-4',
            isOptimal: true,
            explanation: "The Rule of 72 is a quick way to estimate doubling time by dividing 72 by the interest rate.",
            realLifeTip: "Want to double your money in 4 years? You need an 18% return. Rule of 72 helps you set realistic targets."
          },
          {
            id: 'mq-c6',
            text: '8.3 years',
            consequence: 'Incorrect. That is 100 divided by 12. Compounding makes it happen much faster than that.',
            xpDelta: 20,
            healthDelta: 0,
            walletDelta: 50000,
            nextStepId: 'mq-4',
            isOptimal: false,
            explanation: "Simple division ignores the 'snowball' effect of interest earning interest.",
            realLifeTip: "Understand the difference between Simple Interest and Compound Interest early."
          }
        ]
      },
      {
        id: 'mq-4',
        title: 'The New Tax Bite (LTCG)',
        narrative: "Your Mutual Fund gained ₹2,00,000 in 2 years. In India, Long Term Capital Gains (LTCG) above ₹1.25 Lakh are now taxed at 12.5%. How much tax do you actually owe?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c7',
            text: '₹25,000 (12.5% of 2 Lakh)',
            consequence: "Wait! You forgot the exemption. You only pay on the amount ABOVE ₹1.25 Lakh.",
            xpDelta: 10,
            healthDelta: -2,
            walletDelta: -9375,
            nextStepId: 'mq-5',
            isOptimal: false,
            explanation: "Tax calculation: (2,00,000 - 1,25,000) * 0.125 = ₹9,375. You overpaid ₹15,625 in your head!",
            realLifeTip: "Tax-harvesting (selling and re-buying within the limit) can save you lakhs over a lifetime."
          },
          {
            id: 'mq-c8',
            text: '₹9,375',
            consequence: "Correct! You used the ₹1.25 Lakh exemption threshold accurately. That is more money in your pocket.",
            xpDelta: 100,
            healthDelta: 12,
            walletDelta: -9375,
            nextStepId: 'mq-5',
            isOptimal: true,
            explanation: "Budget 2024 updated LTCG to 12.5% with a ₹1.25L exemption. Knowing the rules prevents overpaying.",
            realLifeTip: "Always track your 'Buy Price' (NAV) to calculate your true tax liability."
          }
        ]
      },
      {
        id: 'mq-5',
        title: 'The Credit Card Multiplier',
        narrative: "You owe ₹20,000 on a credit card at 3.5% monthly interest (42% APR). If you pay only the ₹1,000 minimum, how much debt did you actually clear?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c9',
            text: '₹1,000',
            consequence: "Incorrect. Most of that ₹1,000 was stolen by interest before it ever reached your principal.",
            xpDelta: 0,
            healthDelta: -15,
            walletDelta: -1000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "3.5% of ₹20,000 is ₹700. Only ₹300 of your payment reduced your debt. You will be in debt for years.",
            realLifeTip: "Paying only the minimum is a 'Subscription to Debt' where the bank is the only winner."
          },
          {
            id: 'mq-c10',
            text: '₹300',
            consequence: "Exactly. You realized that ₹700 of your hard-earned money went straight to the bank's profit.",
            xpDelta: 100,
            healthDelta: 10,
            walletDelta: -1000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "High APR debt is an emergency. At 42%, you must pay the full amount or transfer to a lower-rate loan.",
            realLifeTip: "If you have a credit card balance, your effective 'Return' on paying it off is 42%. Beat that in the market!"
          }
        ]
      }
    ]
  }
];
