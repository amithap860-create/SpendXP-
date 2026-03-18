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
  unlockRequirement?: {
    completedQuestId: string;
  };
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
            nextStepId: 'fp-2-balanced',
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
            nextStepId: 'fp-2-saver',
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
            nextStepId: 'fp-2-tight',
            isOptimal: false,
            explanation: "Impulse spending on lifestyle before bills is the #1 cause of month-end debt.",
            realLifeTip: "Use a 'Sinking Fund' for trips. Save ₹1,500/month for 4 months instead of one big hit."
          }
        ]
      },
      {
        id: 'fp-2-balanced',
        title: 'The Tax Opportunity',
        narrative: "You have ₹22,800. PG and EMI paid. Now what? A colleague mentions that opening an NPS (National Pension System) account would save ₹15,600 in taxes this year under 80CCD(1B).",
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
            text: 'Open ELSS mutual fund (₹2,000)',
            consequence: 'ELSS gives the same tax deduction but unlocks in 3 years. More flexible than NPS.',
            xpDelta: 50,
            healthDelta: 6,
            walletDelta: -2000,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "ELSS is excellent for flexibility, though NPS has higher long-term compounding potential.",
            realLifeTip: "Under the Old Tax Regime, Section 80C lets you save tax on up to ₹1.5 Lakh of investments."
          },
          {
            id: 'c6',
            text: 'Skip retirement for now',
            consequence: "Waiting 5 years to start costs you ₹94 lakh in final corpus at 60 due to lost compounding.",
            xpDelta: 10,
            healthDelta: -5,
            walletDelta: 0,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "The 'I have time' trap is the most expensive mistake in personal finance.",
            realLifeTip: "Compounding is a function of time. Starting small now beats starting big 10 years later."
          }
        ]
      },
      {
        id: 'fp-2-saver',
        title: 'The Saver Advantage',
        narrative: "You have ₹10,000 in savings and ₹15,000 for the month after bills. You're ahead of 80% of people your age already. How do you optimize your taxes?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'c7',
            text: 'Add ₹2,000/month to NPS',
            consequence: 'Perfect. You are building wealth and saving ₹3,120 in annual tax simultaneously.',
            xpDelta: 65,
            healthDelta: 8,
            walletDelta: -2000,
            nextStepId: 'fp-3',
            isOptimal: true,
            explanation: "Aggressive tax-optimized saving early in career leads to massive wealth.",
            realLifeTip: "NPS Tier 1 has a mandatory lock-in until 60, making it a forced savings habit."
          },
          {
            id: 'c8',
            text: 'Stick to the ₹10,000 in savings',
            consequence: 'Safe, but you will pay more to the government instead of yourself at year-end.',
            xpDelta: 30,
            healthDelta: 2,
            walletDelta: 0,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "Idle cash in a savings account loses value to inflation and missed tax breaks.",
            realLifeTip: "Use Section 80C to your advantage early."
          },
          {
            id: 'c9',
            text: 'Invest ₹5,000 in Stocks',
            consequence: 'Exciting, but you missed the tax break opportunity first. Efficiency matters.',
            xpDelta: 40,
            healthDelta: 4,
            walletDelta: -5000,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "Invest in tax-saving instruments (ELSS/NPS) before standard equity for higher net returns.",
            realLifeTip: "Always fill your 80C bucket before normal investing."
          }
        ]
      },
      {
        id: 'fp-2-tight',
        title: 'The Budget Crunch',
        narrative: "You have ₹16,800 for the month including bills. It's week 2. Swiggy/Zomato has cost ₹4,000. Your Ola/Uber has cost ₹2,800. You have ₹10,000 left for 2 weeks.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c10',
            text: 'Cook at home, use public transport',
            consequence: 'You save ₹3,000 this month. Your wallet breathes again.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'fp-3',
            isOptimal: true,
            explanation: "Aggressive correction when spending goes off-track is vital for financial health.",
            realLifeTip: "Meal prep on Sundays can save the average Indian professional ₹6,000/month."
          },
          {
            id: 'c11',
            text: 'Use credit card for shortfall',
            consequence: "You spent ₹2,400 on the credit card at 36% APR. That ₹2,400 becomes ₹2,472 after 30 days.",
            xpDelta: 10,
            healthDelta: -12,
            walletDelta: -2400,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "Using credit to fund lifestyle gaps is a debt trap that's hard to escape.",
            realLifeTip: "Credit card debt is the most expensive debt. Never use it for daily survival."
          },
          {
            id: 'c12',
            text: 'Ask family for ₹3,000',
            consequence: 'They help, but you have a social debt to pay back next month. The cycle continues.',
            xpDelta: 20,
            healthDelta: -2,
            walletDelta: 3000,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "Borrowing from family solves the symptom but not the habit of overspending.",
            realLifeTip: "Track every rupee for 30 days to see your real leaks."
          }
        ]
      },
      {
        id: 'fp-3',
        title: 'Pattern Recognition',
        narrative: "Month 3. Looking at your statement: Swiggy ₹3,200, Zomato ₹1,800, Uber ₹4,100, Amazon ₹2,900. Total lifestyle spend: ₹12,000/month.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c13',
            text: 'Set hard limits: ₹5,500 total',
            consequence: "Saves ₹6,500/month. Over a year: ₹78,000 more in savings. Invested at 12%: ₹82,000.",
            xpDelta: 65,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Setting category-wise limits is the most effective way to control impulse spending.",
            realLifeTip: "Delete delivery apps for 1 week every month to reset your habits."
          },
          {
            id: 'c14',
            text: 'Cut only Swiggy/Zomato',
            consequence: "Realistic and sustainable. Saves ₹1,800/month. ₹21,600/year extra.",
            xpDelta: 40,
            healthDelta: 5,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Consistent small changes are good, but larger leaks like Uber often need attention too.",
            realLifeTip: "The 24-hour rule: Wait one day before clicking 'Order' on non-essentials."
          },
          {
            id: 'c15',
            text: 'Track for one more month',
            consequence: "Another month of data costs you ₹6,500 in potential savings. Tracking without acting is idle.",
            xpDelta: 15,
            healthDelta: 1,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "More data rarely fixes a spending problem; decisive action does.",
            realLifeTip: "Knowledge without discipline equals zero wealth."
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
        narrative: "BKC is your office. You have ₹90,000 in savings. Renting here is high-stakes.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c1',
            text: 'PG in BKC (Walking): ₹18,000',
            consequence: 'High rent, but ₹0 commute and meals included. Deposit: ₹18,000.',
            xpDelta: 40,
            healthDelta: 5,
            walletDelta: -18000,
            nextStepId: 'ra-2',
            isOptimal: false,
            explanation: "Good for time management, but eats 33% of salary. Balanced for a first job.",
            realLifeTip: "Commute time is money. Living close can save you 100+ hours of travel a month."
          },
          {
            id: 'ra-c2',
            text: 'Shared 1BHK in Andheri: ₹12,500',
            consequence: 'Low rent (23% of salary). Deposit: ₹37,500. 45 min commute.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: -37500,
            nextStepId: 'ra-2',
            isOptimal: true,
            explanation: "Housing under 25% of salary is the gold standard for wealth building in India.",
            realLifeTip: "Use the 3:1 income-to-rent ratio rule."
          },
          {
            id: 'ra-c3',
            text: 'Self 1BHK in Ghatkopar: ₹22,000',
            consequence: 'Your own space, but 40% of salary. Deposit: ₹66,000. Commute extra.',
            xpDelta: 20,
            healthDelta: -8,
            walletDelta: -66000,
            nextStepId: 'ra-2',
            isOptimal: false,
            explanation: "40% on rent is a 'House Poor' trap. Your savings will never grow.",
            realLifeTip: "Mumbai deposits are high. Plan for 3-6 months' rent upfront."
          }
        ]
      },
      {
        id: 'ra-2',
        title: 'The Broker Problem',
        narrative: "The broker wants 1 month rent as brokerage. This is on top of your deposit.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c4',
            text: 'Negotiate brokerage to 50%',
            consequence: 'Success! You save ₹6,250 - ₹11,000. Most people never ask.',
            xpDelta: 55,
            healthDelta: 8,
            walletDelta: -6250,
            nextStepId: 'ra-3',
            isOptimal: true,
            explanation: "Brokerage is negotiable. A 30-minute talk saved you 10 days of work.",
            realLifeTip: "Brokers are more willing to negotiate if you can sign and pay today."
          },
          {
            id: 'ra-c5',
            text: 'Use NoBroker.in (₹0 fees)',
            consequence: 'Saves ₹12,500 - ₹22,000 but takes 2 weeks longer to find a place.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'ra-3',
            isOptimal: true,
            explanation: "Avoid unnecessary middleman fees whenever possible to preserve your capital.",
            realLifeTip: "Direct owner listings are rare but high-value."
          },
          {
            id: 'ra-c6',
            text: 'Pay full to secure flat',
            consequence: 'Flat secured! But your savings are now dangerously low. No buffer left.',
            xpDelta: 15,
            healthDelta: -4,
            walletDelta: -12500,
            nextStepId: 'ra-3',
            isOptimal: false,
            explanation: "Accepting high upfront costs without pushback drains your liquidity.",
            realLifeTip: "Always have a 'Move-in Fund' separate from your security deposit."
          }
        ]
      },
      {
        id: 'ra-3',
        title: 'The Lease Trap',
        narrative: "Clause 7 says: rent increases 10% on renewal. Clause 12: tenant pays for all repairs under ₹5,000.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c7',
            text: 'Negotiate Clause 12 to ₹2,000',
            consequence: 'Saves you ₹3,000 per repair event. Landlord agreed to 5% cap on hike too.',
            xpDelta: 70,
            healthDelta: 9,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Leases are living documents. Negotiating terms now saves thousands later.",
            realLifeTip: "Landlords often put aggressive clauses just to see if you'll sign."
          },
          {
            id: 'ra-c8',
            text: 'Sign without reading fully',
            consequence: "Month 3: pipe bursts. Repair cost ₹3,200. Clause 12 means you pay it. Month 11: Rent jumps ₹2,200.",
            xpDelta: 5,
            healthDelta: -8,
            walletDelta: -3200,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Ignorance of contract terms is a recurring cost in personal finance.",
            realLifeTip: "The 11-month lease is standard in India to avoid high stamp duty registration."
          },
          {
            id: 'ra-c9',
            text: 'Accept terms as written',
            consequence: "You have the place, but you've accepted high maintenance risk and high future costs.",
            xpDelta: 25,
            healthDelta: 2,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Failing to push back on boilerplate terms leaves money on the table.",
            realLifeTip: "Normal wear and tear should always be the owner's responsibility."
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
        narrative: "iPhone 15 is ₹60,000. Amazon offers 'No Cost EMI' for ₹5,000/month for 12 months. You have ₹15,000 saved.",
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
          },
          {
            id: 'p-c3',
            text: 'Buy a used model for ₹30,000',
            consequence: 'Great value. You save ₹30,000 and own it today without an EMI.',
            xpDelta: 50,
            healthDelta: 8,
            walletDelta: -30000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Second-hand purchases are high-value for tech, but the ₹30k hit to savings is large.",
            realLifeTip: "Check battery health before buying used iPhones."
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
          },
          {
            id: 'efq-c3',
            text: 'Start freelancing immediately',
            consequence: 'Brings in ₹10,000/mo. Extends your survival by 2 months.',
            xpDelta: 50,
            healthDelta: 7,
            walletDelta: 40000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Income diversification prevents total depletion during job gaps.",
            realLifeTip: "Never rely on a single source of income."
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
        narrative: "Instagram is full of Bali photos. It costs ₹80,000. You have ₹45,000.",
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
            realLifeTip: "Lesser-known spots often provide 90% of the joy for 20% of the cost."
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
          },
          {
            id: 'vp-c3',
            text: 'Book Bali on Credit Card',
            consequence: "Bali was great, but the 42% APR interest on ₹35,000 will haunt you for a year.",
            xpDelta: 10,
            healthDelta: -15,
            walletDelta: -35000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Financing memories with high-interest debt is a recipe for long-term stress.",
            realLifeTip: "If a vacation costs interest, it's not a break, it's a burden."
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
            text: 'Buy ₹20,000 laptop in cash',
            consequence: 'Basic but functional. 0 debt. Your ₹20,000 is still yours.',
            xpDelta: 50,
            healthDelta: 10,
            walletDelta: -20000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Buying what you can afford beats chasing points with money you don't have.",
            realLifeTip: "Credit card points are worth ~1-2% in reality, not 10% cash value."
          },
          {
            id: 'fcc-c2',
            text: 'Buy ₹45,000 laptop on card',
            consequence: 'You owe ₹25,000 more than you have. Points worth: ₹450.',
            xpDelta: 20,
            healthDelta: -12,
            walletDelta: -45000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "You earned ₹450 in points but will pay ₹875 in interest in month one.",
            realLifeTip: "Never spend on credit unless you have the cash today."
          },
          {
            id: 'fcc-c3',
            text: 'Wait 3 months, buy in cash',
            consequence: 'The best financial choice. No debt, and you might get a better deal later.',
            xpDelta: 60,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Avoiding high-interest consumer debt is the fastest way to wealth.",
            realLifeTip: "Sales happen every 3 months. Patience saves more than points."
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
        narrative: "You have ₹50,000 in a Fixed Deposit earning 6% interest. Inflation in India is 5.5%. After one year, how much did your wealth grow in real purchasing power?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c1',
            text: 'It grew by 6% (₹3,000)',
            consequence: "That is your 'Nominal' growth. Your real gain is almost invisible.",
            xpDelta: 10,
            healthDelta: -2,
            walletDelta: 3000,
            nextStepId: 'mq-2',
            isOptimal: false,
            explanation: "Nominal returns are a vanity metric. Real returns are what build wealth.",
            realLifeTip: "If your return equals inflation, your lifestyle stays the same forever."
          },
          {
            id: 'mq-c2',
            text: 'It grew by 0.5% (₹250)',
            consequence: "Correct! Your 'Real Rate of Return' is 0.5%. Money just barely kept its value.",
            xpDelta: 80,
            healthDelta: 10,
            walletDelta: 250,
            nextStepId: 'mq-2',
            isOptimal: true,
            explanation: "Real return calculation: (1 + Nominal)/(1 + Inflation) - 1.",
            realLifeTip: "Always subtract inflation from your return rate."
          },
          {
            id: 'mq-c3',
            text: 'It lost value',
            consequence: "Not quite, but close. 0.5% is so low it feels like losing value.",
            xpDelta: 30,
            healthDelta: 2,
            walletDelta: 250,
            nextStepId: 'mq-2',
            isOptimal: false,
            explanation: "You technically gained power, but not enough to change your life.",
            realLifeTip: "Investing in equity is the only reliable way to beat 6% inflation."
          }
        ]
      },
      {
        id: 'mq-2',
        title: 'Personal Loan Math',
        narrative: "₹1,00,000 bike loan at 14% for 2 years. Monthly EMI is ₹4,801. How much interest will you pay in total?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c4',
            text: '₹14,000',
            consequence: "Incorrect. That assumes you pay once at the end. Reducing balance is different.",
            xpDelta: 10,
            healthDelta: -5,
            walletDelta: -15224,
            nextStepId: 'mq-3',
            isOptimal: false,
            explanation: "Personal loan interest is calculated on a reducing balance.",
            realLifeTip: "Ask for an Amortization Schedule before signing."
          },
          {
            id: 'mq-c5',
            text: '₹15,224',
            consequence: "Correct! You pay ₹15,224 extra just to have the bike 2 years earlier.",
            xpDelta: 80,
            healthDelta: 10,
            walletDelta: -15224,
            nextStepId: 'mq-3',
            isOptimal: true,
            explanation: "Total interest = (EMI * Tenure) - Principal.",
            realLifeTip: "Calculate Total Cost of Ownership including interest."
          },
          {
            id: 'mq-c6',
            text: '₹28,000',
            consequence: "Too high! 14% is yearly, not monthly. Still, the real cost is high.",
            xpDelta: 20,
            healthDelta: 0,
            walletDelta: -15224,
            nextStepId: 'mq-3',
            isOptimal: false,
            explanation: "Don't overestimate, but don't ignore the reduced balance math.",
            realLifeTip: "Reducing balance EMI is cheaper than flat rate, but still expensive."
          }
        ]
      },
      {
        id: 'mq-3',
        title: 'The Rule of 72',
        narrative: "You invest ₹50,000 in a Nifty 50 Index fund returning 12% annually. How long until it doubles to ₹1,00,000?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c7',
            text: '6 years',
            consequence: 'Correct! 72 / 12 = 6 years. A vital wealth-building shortcut.',
            xpDelta: 80,
            healthDelta: 10,
            walletDelta: 50000,
            nextStepId: 'mq-4',
            isOptimal: true,
            explanation: "The Rule of 72 estimates doubling time by dividing 72 by the rate.",
            realLifeTip: "Want to double in 4 years? You need an 18% return."
          },
          {
            id: 'mq-c8',
            text: '8.3 years',
            consequence: 'Incorrect. Compounding makes it happen faster than simple division.',
            xpDelta: 20,
            healthDelta: 0,
            walletDelta: 50000,
            nextStepId: 'mq-4',
            isOptimal: false,
            explanation: "Compounding accelerates doubling exponentially.",
            realLifeTip: "Rule of 72 works for debt too. 24% credit debt doubles in 3 years."
          },
          {
            id: 'mq-c9',
            text: '12 years',
            consequence: 'Too slow! At 12%, you gain speed every year.',
            xpDelta: 10,
            healthDelta: -2,
            walletDelta: 50000,
            nextStepId: 'mq-4',
            isOptimal: false,
            explanation: "Compounding is faster than you think.",
            realLifeTip: "Start early to let the curve do the work."
          }
        ]
      },
      {
        id: 'mq-4',
        title: 'The New Tax Bite (LTCG)',
        narrative: "Budget 2024: Long Term Capital Gains (LTCG) above ₹1.25 Lakh are taxed at 12.5%. You gained ₹2,00,000 in 2 years. What is the tax?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c10',
            text: '₹25,000',
            consequence: "Wait! You forgot the exemption. You only pay on the amount ABOVE ₹1.25 Lakh.",
            xpDelta: 10,
            healthDelta: -2,
            walletDelta: -9375,
            nextStepId: 'mq-5',
            isOptimal: false,
            explanation: "Tax: (2,00,000 - 1,25,000) * 0.125 = ₹9,375.",
            realLifeTip: "Tax-harvesting within the limit saves lakhs over a lifetime."
          },
          {
            id: 'mq-c11',
            text: '₹9,375',
            consequence: "Correct! Using the ₹1.25 Lakh exemption accurately preserves your wealth.",
            xpDelta: 100,
            healthDelta: 12,
            walletDelta: -9375,
            nextStepId: 'mq-5',
            isOptimal: true,
            explanation: "Knowing tax thresholds prevents over-budgeting for liability.",
            realLifeTip: "Track your NAV to calculate true tax liability."
          },
          {
            id: 'mq-c12',
            text: '₹0',
            consequence: "Incorrect. You are well above the ₹1.25L tax-free limit.",
            xpDelta: 5,
            healthDelta: -5,
            walletDelta: -9375,
            nextStepId: 'mq-5',
            isOptimal: false,
            explanation: "Tax avoidance is legal; tax evasion is not.",
            realLifeTip: "LTCG applies after holding for 12 months in equity."
          }
        ]
      },
      {
        id: 'mq-5',
        title: 'Credit Card Debt Cycle',
        narrative: "You owe ₹20,000 at 3.5% monthly interest (42% APR). You pay only the ₹1,000 minimum. How much debt did you clear?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c13',
            text: '₹300',
            consequence: "Exactly. ₹700 of your hard-earned money went straight to the bank's profit.",
            xpDelta: 100,
            healthDelta: 10,
            walletDelta: -1000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "3.5% of ₹20,000 is ₹700. Only ₹300 reduces your debt.",
            realLifeTip: "Paying minimum is a 'Subscription to Debt'."
          },
          {
            id: 'mq-c14',
            text: '₹1,000',
            consequence: "Incorrect. Interest was stolen before it ever reached your principal.",
            xpDelta: 0,
            healthDelta: -15,
            walletDelta: -1000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Interest always eats the first chunk of your payment.",
            realLifeTip: "Credit debt at 42% is a financial emergency."
          },
          {
            id: 'mq-c15',
            text: '₹500',
            consequence: "Close, but the math is worse. ₹700 went to interest.",
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: -1000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "The high APR makes minimum payments nearly useless.",
            realLifeTip: "Transfer high-rate card debt to a personal loan if you can't pay in full."
          }
        ]
      }
    ]
  }
];
