import { AgeGroup } from '@/lib/ageAdapt';

export type LessonCard = {
  id: string;
  title: string;
  body: {
    junior: string;
    teen: string;
    senior: string;
  };
  example: {
    junior: string;
    teen: string;
    senior: string;
  };
  visual: 'bar' | 'pie' | 'line' | 'comparison' | 'none';
  visualData?: any;
  xpReward: number;
};

export type QuizCard = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Lesson = {
  id: string;
  topic: 'budgeting' | 'saving' | 'investing' | 'credit' | 'taxes' | 'spending';
  relatedGame: string;
  title: string;
  estimatedMinutes: number;
  cards: LessonCard[];
  quizCard: QuizCard;
  ageGroups: AgeGroup[];
};

export const lessons: Lesson[] = [
  {
    id: 'l-budgeting',
    topic: 'budgeting',
    relatedGame: 'budgetBlitz',
    title: 'Mastering the Budget',
    estimatedMinutes: 3,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'b1',
        title: 'What is a Budget?',
        body: {
          junior: "A budget is a plan for your money. It tells you how much you can spend on different things so you don't run out!",
          teen: "A budget is a financial roadmap. it tracks your income and ensures you allocate enough for both needs and future goals.",
          senior: "A budget is a strategic allocation of resources. It balances fixed obligations against variable expenses and investment goals."
        },
        example: {
          junior: "You get ₹200 pocket money. You plan: ₹50 for snacks, ₹50 for a notebook, and ₹100 for your piggy bank.",
          teen: "Your ₹2,000 monthly allowance: ₹1,000 for mobile/outings, ₹400 for books, and ₹600 for savings.",
          senior: "Monthly stipend ₹15,000: ₹5,000 PG rent, ₹3,000 food, ₹2,000 travel, ₹5,000 for your SIP."
        },
        visual: 'pie',
        visualData: {
          segments: [
            { label: 'Needs', value: 50, color: '#2e72db' },
            { label: 'Wants', value: 30, color: '#19c0ed' },
            { label: 'Savings', value: 20, color: '#10b981' }
          ]
        },
        xpReward: 20
      },
      {
        id: 'b2',
        title: 'The 50/30/20 Rule',
        body: {
          junior: "A simple way to split your money: 50% for Needs, 30% for Wants, and 20% for Savings!",
          teen: "Use 50% for essentials, 30% for lifestyle choices, and commit 20% to your financial future.",
          senior: "The 50/30/20 framework ensures a balanced lifestyle while maintaining a 20% savings rate for long-term wealth."
        },
        example: {
          junior: "If you have ₹100, ₹50 goes to food (Need), ₹30 to a toy (Want), and ₹20 to Save.",
          teen: "From ₹1,000: ₹500 for bills, ₹300 for fun, and ₹200 for your future self.",
          senior: "With a ₹20,000 salary: ₹10,000 rent/bills, ₹6,000 lifestyle, ₹4,000 into a Mutual Fund."
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Needs', value: 50, color: '#2e72db' },
            { label: 'Wants', value: 30, color: '#19c0ed' },
            { label: 'Savings', value: 20, color: '#10b981' }
          ]
        },
        xpReward: 20
      }
    ],
    quizCard: {
      question: "You earn ₹1,000 this week. Using the 50/30/20 rule, how much should you save?",
      options: ["₹500", "₹300", "₹200", "₹100"],
      correctIndex: 2,
      explanation: "20% of ₹1,000 is ₹200. This builds your safety net for the future!"
    }
  },
  {
    id: 'l-investing',
    topic: 'investing',
    relatedGame: 'stockMarketSim',
    title: 'The Power of Investing',
    estimatedMinutes: 4,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'i1',
        title: 'What is Investing?',
        body: {
          junior: "Investing is like planting a money tree. You put a little seed in now, and it grows into a big tree later!",
          teen: "Investing is putting your money to work in assets like stocks or funds so it earns more money over time.",
          senior: "Investing is the process of allocating capital to assets with the expectation of generating an inflation-beating return."
        },
        example: {
          junior: "If you save ₹100 in a bank, it stays ₹100. If you invest it, it could become ₹110 next year!",
          teen: "Buying 1 share of a company for ₹500. If the company grows, your share might be worth ₹600 later.",
          senior: "Starting a SIP (Systematic Investment Plan) in a Nifty 50 Index Fund with ₹2,000 every month."
        },
        visual: 'line',
        visualData: {
          points: [
            { x: 0, y: 100 },
            { x: 5, y: 150 },
            { x: 10, y: 250 },
            { x: 15, y: 450 },
            { x: 20, y: 800 }
          ],
          label: 'Growth over 20 years'
        },
        xpReward: 30
      },
      {
        id: 'i2',
        title: 'Early vs. Late',
        body: {
          junior: "The earlier you start, the bigger your tree grows. Time is your best friend in saving!",
          teen: "Compound interest needs time. Starting at 15 is much more powerful than starting at 25.",
          senior: "The 'Cost of Delay' is significant. Starting early allows compounding to do the heavy lifting for your wealth."
        },
        example: {
          junior: "Save ₹10 at age 8 and see it grow! If you wait until 18, you have much less time.",
          teen: "Starting ₹500/month at 15 vs 25 can result in lakhs of difference by the time you're 50.",
          senior: "A 10-year delay in starting a retirement SIP can halve your final corpus value."
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Start at 20', value: 100, color: '#10b981' },
          right: { label: 'Start at 30', value: 45, color: '#f59e0b' }
        },
        xpReward: 30
      }
    ],
    quizCard: {
      question: "Which of these is a famous Indian stock market index?",
      options: ["Nifty 50", "The Big Bazar", "RBI Index", "Cricket Score"],
      correctIndex: 0,
      explanation: "The Nifty 50 tracks the 50 largest companies in India and is a great way to see how the market is doing."
    }
  }
];
