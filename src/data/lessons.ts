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

export type Brief = {
  emoji: string;
  fact: string;
};

export type Lesson = {
  id: string;
  topic: 'budgeting' | 'saving' | 'investing' | 'credit' | 'taxes' | 'spending';
  relatedGame: string;
  title: string;
  estimatedMinutes: number;
  cards: LessonCard[];
  quizCard: QuizCard;
  briefs: Brief[]; // min 3 "Did You Know?" cards shown before the quiz
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
    },
    briefs: [
      { emoji: '🏦', fact: 'India has one of the world\'s lowest household savings rates among young adults — under 25s save just 4% on average. The 50/30/20 rule targets 20%.' },
      { emoji: '📅', fact: 'Warren Buffett started investing at age 11 with a strict personal budget. He says budgeting is the one habit that made everything else possible.' },
      { emoji: '🛒', fact: '"Lifestyle creep" is when your spending grows as fast as your income, leaving you no richer. A budget is the only defence against it.' },
    ]
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
      }
    ],
    quizCard: {
      question: "Which of these is a famous Indian stock market index?",
      options: ["Nifty 50", "The Big Bazar", "RBI Index", "Cricket Score"],
      correctIndex: 0,
      explanation: "The Nifty 50 tracks the 50 largest companies in India and is a great way to see how the market is doing."
    },
    briefs: [
      { emoji: '📈', fact: 'The Nifty 50 has given an average annual return of about 12% over the last 20 years — turning ₹1L into ₹9.6L without touching it.' },
      { emoji: '⏰', fact: 'If you invested ₹500/month from age 15 to age 60 at 12% returns, you would have over ₹2.6 crore at retirement.' },
      { emoji: '🏠', fact: 'Historically, equities outperform real estate in India over 10+ year periods when inflation is accounted for — but most people still prefer property.' },
    ]
  },
  {
    id: 'l-etfs',
    topic: 'investing',
    relatedGame: 'stockMarketSim',
    title: 'ETFs & Index Funds',
    estimatedMinutes: 4,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'e1',
        title: 'What is an ETF?',
        body: {
          junior: "",
          teen: "An ETF (Exchange Traded Fund) is like a basket of many stocks. When you buy one ETF, you own tiny pieces of many companies at once.",
          senior: "An ETF tracks an index like the Nifty 50, holding all constituent stocks proportionally. Low expense ratios (typically 0.1–0.5%) make them highly cost-efficient vs active funds."
        },
        example: {
          junior: "",
          teen: "Nifty 50 ETF = owning a small piece of India's 50 biggest companies for ₹100/unit",
          senior: "Nifty BeES ETF: expense ratio 0.04% vs average active fund 1.5% — saves ₹14,600 on ₹10L invested over 10 years"
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'ETF', value: 99, color: '#10b981' },
          right: { label: 'Active Fund', value: 85, color: '#f59e0b' }
        },
        xpReward: 30
      },
      {
        id: 'e2',
        title: 'Passive vs Active',
        body: {
          junior: "",
          teen: "Active managers try to pick winners. Passive funds (ETFs) just follow the whole market. Statistically, the market wins more often!",
          senior: "Index funds aim for market returns (beta). Active funds aim to beat the market (alpha). However, 80% of active fund managers underperform their benchmark index over 10+ years."
        },
        example: {
          junior: "",
          teen: "An active manager might bet all on tech. An index fund owns tech, banking, energy, and more.",
          senior: "Passive investing removes the human error factor and significantly lowers management fees."
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Market Index', value: 100, color: '#10b981' },
            { label: 'Active Managers', value: 20, color: '#rose-500' }
          ]
        },
        xpReward: 30
      }
    ],
    quizCard: {
      question: "A Nifty 50 ETF tracks India's top 50 companies. If you invest ₹1,000 in it, you own...",
      options: ["Only 1 company", "50 companies proportionally", "All BSE companies", "Only tech companies"],
      correctIndex: 1,
      explanation: "ETFs give you instant diversification by spreading your money across all companies in the index."
    },
    briefs: [
      { emoji: '💰', fact: 'The average Indian equity mutual fund charges 1.5% annual expense ratio. A Nifty 50 ETF charges just 0.04%. On ₹10L over 20 years, that difference is ₹12+ lakhs.' },
      { emoji: '📊', fact: 'In any given 10-year window, about 80% of active fund managers fail to beat the Nifty 50 index after fees. Passive investing wins statistically.' },
      { emoji: '🌏', fact: 'John Bogle founded Vanguard and invented the index fund in 1976. He was rejected by everyone. Today index funds manage over $15 trillion globally.' },
    ]
  },
  {
    id: 'l-crypto',
    topic: 'investing',
    relatedGame: 'stockMarketSim',
    title: 'Crypto & High-Risk Assets',
    estimatedMinutes: 3,
    ageGroups: ['senior'],
    cards: [
      {
        id: 'c1',
        title: 'What is Cryptocurrency?',
        body: {
          junior: "",
          teen: "",
          senior: "Crypto (Bitcoin, Ethereum etc.) is a digital currency with no government backing. Unlike stocks, crypto has no underlying business earnings to support its value — price is purely based on what someone else will pay for it."
        },
        example: {
          junior: "",
          teen: "",
          senior: "Buying a stock is like owning a piece of a pizza shop. Buying crypto is like owning a digital collectible where the price depends on hype."
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Stock (Earnings)', value: 80, color: '#2e72db' },
          right: { label: 'Crypto (Demand)', value: 80, color: '#8B5CF6' }
        },
        xpReward: 25
      },
      {
        id: 'c2',
        title: 'Serious Risks',
        body: {
          junior: "",
          teen: "",
          senior: "Crypto is extremely volatile. Crashes of 70–90% are common. There is no regulation in India, meaning no legal recourse if an exchange collapses or your wallet is hacked."
        },
        example: {
          junior: "",
          teen: "",
          senior: "Bitcoin lost 83% of its value in 2018 and 77% in 2022. Only invest what you can afford to lose entirely."
        },
        visual: 'line',
        visualData: {
          points: [
            { x: 0, y: 200 },
            { x: 5, y: 800 },
            { x: 10, y: 150 },
            { x: 15, y: 400 }
          ],
          label: 'Typical Crypto Volatility'
        },
        xpReward: 25
      }
    ],
    quizCard: {
      question: "A friend says a new crypto coin will give 50% monthly returns. What should you do?",
      options: ["Invest immediately", "Ask for a referral link", "Likely a scam — don't invest", "Invest only ₹1,000"],
      correctIndex: 2,
      explanation: "No legitimate investment guarantees 50% monthly returns. This pattern is typical of a Ponzi scheme."
    },
    briefs: [
      { emoji: '📉', fact: 'Bitcoin lost 83% of its value in 2018 and 77% again in 2022. It recovered both times — but only those who held through the crash benefited.' },
      { emoji: '🕵️', fact: 'India had more crypto scams than any other country in 2022 (Chainalysis report). ₹1,000 crore was lost to Ponzi schemes disguised as "DeFi" projects.' },
      { emoji: '⚖️', fact: 'Crypto is legal to hold in India but gains are taxed at a flat 30% with no offset allowed for losses — higher than almost any other asset class.' },
    ]
  },

  // ─── NEW LESSONS ───────────────────────────────────────────────────────────

  {
    id: 'l-saving',
    topic: 'saving',
    relatedGame: 'budgetBlitz',
    title: 'The Art of Saving',
    estimatedMinutes: 3,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'sv1',
        title: 'Why Save at All?',
        body: {
          junior: "Saving means keeping some of your money instead of spending it all. It protects you when something unexpected happens — like your phone breaking!",
          teen: "Saving builds a buffer between you and financial emergencies. Without savings, any unexpected expense forces you into debt — which costs even more money.",
          senior: "Savings serve three purposes: emergency fund (3–6 months of expenses), opportunity fund (take advantage of deals or investments), and goal fund (specific targets like education or travel).",
        },
        example: {
          junior: "Priya saves ₹20 from her ₹100 pocket money every week. After 10 weeks she has ₹200 — enough for the toy she wanted without asking anyone.",
          teen: "Rahul saves ₹500/month. When his laptop broke suddenly, he paid ₹3,000 from savings instead of asking his parents or taking a loan.",
          senior: "Meera's 3-month emergency fund of ₹45,000 covered her rent and food when she was between jobs for 6 weeks — no stress, no debt.",
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Emergency', value: 60, color: '#10b981' },
            { label: 'Goals', value: 25, color: '#2e72db' },
            { label: 'Opportunity', value: 15, color: '#f59e0b' },
          ],
        },
        xpReward: 20,
      },
      {
        id: 'sv2',
        title: 'Pay Yourself First',
        body: {
          junior: "Pay yourself first means saving BEFORE you spend. When you get money, the first thing you do is put some in your piggy bank — then spend the rest!",
          teen: "Automate your savings on payday — before you see the money, it is already saved. This removes the temptation to spend it and makes saving effortless.",
          senior: "Set up an auto-SIP or standing instruction on your account to transfer to savings or investments the same day your salary arrives. What you don't see, you don't spend.",
        },
        example: {
          junior: "Every time Arun gets pocket money, he immediately puts ₹30 in his piggy bank — before buying anything. He saves without even trying!",
          teen: "Kavya set up a ₹500 auto-transfer to her savings account every 1st of the month. She never misses it because the money is gone before she checks her balance.",
          senior: "₹5,000 auto-SIP on salary day = ₹60,000 saved per year = ₹5.4L after 5 years at 9% — built entirely on autopilot.",
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Spend-first', value: 30, color: '#ef4444' },
          right: { label: 'Save-first', value: 95, color: '#10b981' },
        },
        xpReward: 20,
      },
    ],
    quizCard: {
      question: 'You just received ₹1,000. What does "pay yourself first" mean?',
      options: [
        'Buy what you want, save what is left',
        'Save a set amount before spending anything',
        'Give money to family first',
        'Pay your bills first',
      ],
      correctIndex: 1,
      explanation: '"Pay yourself first" means saving before you spend. It is the single most effective savings habit because it removes the decision entirely.',
    },
    briefs: [
      { emoji: '💡', fact: 'The average Indian household saves 30% of income — but most of that is property. Liquid savings (accessible cash) for under-25s is often less than 1 month of expenses.' },
      { emoji: '🤖', fact: 'Automation is the #1 factor in savings success. People who automate savings save 3× more than those who save "what is left over" at month end.' },
      { emoji: '🏺', fact: 'Ancient Indians used the "kumbh" system — storing grain away before eating. Modern finance just replaced grain with money and earthen pots with savings accounts.' },
    ],
  },

  {
    id: 'l-debt',
    topic: 'spending',
    relatedGame: 'moneyMaze',
    title: 'Understanding Debt',
    estimatedMinutes: 4,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'd1',
        title: 'Good Debt vs Bad Debt',
        body: {
          junior: '',
          teen: 'Not all debt is bad. "Good debt" helps you build wealth or skills — like a student loan. "Bad debt" buys things that lose value and costs you extra via interest.',
          senior: 'Good debt has low interest rates and creates an asset or income: home loan, education loan, business loan. Bad debt is high-interest consumption: credit card revolving, personal loans for lifestyle, BNPL misuse.',
        },
        example: {
          junior: '',
          teen: 'Education loan at 8%: returns 3× in higher salary. Credit card debt at 36% APR: you pay ₹360 every year on every ₹1,000 borrowed — just for the privilege of using money.',
          senior: 'A ₹50L home loan at 8.5% builds equity. A ₹1L personal loan at 14% for a vacation builds nothing — just a ₹14,000/year interest bill.',
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Good Debt (8%)', value: 80, color: '#10b981' },
          right: { label: 'Bad Debt (36%)', value: 30, color: '#ef4444' },
        },
        xpReward: 25,
      },
      {
        id: 'd2',
        title: 'The Debt Avalanche',
        body: {
          junior: '',
          teen: 'The avalanche method: list all debts by interest rate (highest first). Pay minimums on all — then throw every extra rupee at the highest-rate debt. Mathematically optimal.',
          senior: 'Avalanche vs Snowball: Avalanche saves the most interest. Snowball (smallest balance first) provides psychological wins. Research shows snowball produces better completion rates despite higher cost — choose what keeps you motivated.',
        },
        example: {
          junior: '',
          teen: 'Credit card at 36%: ₹5,000 debt. Student loan at 10%: ₹30,000. Pay minimum on student loan; attack credit card first. Saves ₹1,800/year in interest.',
          senior: 'With avalanche, a ₹3L mixed-debt portfolio gets cleared 8 months faster and saves ₹28,000 vs paying equal amounts on each.',
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Credit Card (36%)', value: 100, color: '#ef4444' },
            { label: 'Personal Loan (14%)', value: 50, color: '#f59e0b' },
            { label: 'Education Loan (8%)', value: 25, color: '#10b981' },
          ],
        },
        xpReward: 25,
      },
    ],
    quizCard: {
      question: 'You have two debts: credit card at 36% interest and a student loan at 9%. Using the avalanche method, which do you pay first?',
      options: ['Student loan (smaller balance)', 'Credit card (higher interest)', 'Pay equal amounts on both', 'Neither — save first'],
      correctIndex: 1,
      explanation: 'Avalanche = highest interest rate first. The credit card at 36% is costing you 4× more per rupee than the student loan. Killing it first saves the most money.',
    },
    briefs: [
      { emoji: '💳', fact: 'India has 60M+ credit cards in circulation. The average revolving balance costs ₹540/year per ₹1,500 in interest alone — paid to the bank for spending money that wasn\'t theirs.' },
      { emoji: '📊', fact: 'A ₹10,000 credit card balance at 3% monthly interest takes 8+ years to repay with minimum payments — paying back ₹28,000 total on a ₹10,000 purchase.' },
      { emoji: '⛓️', fact: 'BNPL (Buy Now Pay Later) apps like LazyPay charge 0% only for 15 days. After that, annualised rates can hit 30–50%. Read the fine print before every split payment.' },
    ],
  },

  {
    id: 'l-credit',
    topic: 'credit',
    relatedGame: 'creditScoreBuilder',
    title: 'How Credit Scores Work',
    estimatedMinutes: 4,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'cr1',
        title: 'What is a CIBIL Score?',
        body: {
          junior: '',
          teen: 'Your CIBIL score is a 3-digit number (300–900) that banks use to decide if they will lend you money and at what interest rate. Higher = better terms, lower interest.',
          senior: 'CIBIL (Credit Information Bureau India Ltd.) scores range 300–900. Scores above 750 qualify for the best loan rates. Scores below 650 lead to rejections or high-risk premiums. It is calculated from 5 factors.',
        },
        example: {
          junior: '',
          teen: 'Amit\'s CIBIL score is 800. He gets a home loan at 8.5%. His friend with a score of 600 pays 11.5% — on a ₹50L loan, that is ₹15L extra in interest.',
          senior: 'On a ₹60L, 20-year home loan: 8.5% = EMI ₹52,118 = Total ₹1.25 crore. At 11.5% = EMI ₹63,879 = Total ₹1.53 crore. Score difference costs ₹28L.',
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Payment History (35%)', value: 35, color: '#2e72db' },
            { label: 'Utilisation (30%)', value: 30, color: '#10b981' },
            { label: 'Credit Length (15%)', value: 15, color: '#f59e0b' },
            { label: 'Credit Mix (10%)', value: 10, color: '#8b5cf6' },
            { label: 'Inquiries (10%)', value: 10, color: '#ef4444' },
          ],
        },
        xpReward: 25,
      },
      {
        id: 'cr2',
        title: 'Building Your Score',
        body: {
          junior: '',
          teen: 'The fastest ways to build credit: always pay on time, keep your card balance below 30% of the limit, don\'t apply for many cards at once, and keep old accounts open.',
          senior: 'Credit-building strategy for beginners: start with a secured credit card (deposit-backed), pay in full every month, never exceed 30% utilisation. After 12–18 months of clean history, upgrade to a rewards card.',
        },
        example: {
          junior: '',
          teen: 'Neha started with a ₹10,000 limit card and always paid full balance. 18 months later, her score was 760 — she qualified for a ₹1L limit at a premium rate.',
          senior: 'Secured card strategy: ₹20,000 fixed deposit → ₹20,000 credit limit. Spend ₹4,000/month (20%) and pay in full. Score goes from 0 to 720+ in 12 months.',
        },
        visual: 'line',
        visualData: {
          points: [
            { x: 0, y: 0 },
            { x: 6, y: 45 },
            { x: 12, y: 62 },
            { x: 18, y: 78 },
            { x: 24, y: 90 },
          ],
          label: 'Score growth with clean credit habits (%)',
        },
        xpReward: 25,
      },
    ],
    quizCard: {
      question: 'Which factor has the BIGGEST impact on your CIBIL score?',
      options: ['Number of credit cards you own', 'Payment history', 'Total balance across all accounts', 'The type of bank you use'],
      correctIndex: 1,
      explanation: 'Payment history accounts for 35% of your score — the largest single factor. Even one missed payment can drop your score by 50–100 points instantly.',
    },
    briefs: [
      { emoji: '📋', fact: 'You can check your CIBIL score for free once a year at cibil.com. Most banks and apps like Paytm, CRED, and BankBazaar offer unlimited free checks with soft pulls (no score impact).' },
      { emoji: '🛡️', fact: 'Checking your OWN credit score is a "soft inquiry" — it does NOT lower your score. Only "hard inquiries" (when a lender checks for an application) have a small, temporary impact.' },
      { emoji: '⚡', fact: 'Paying credit card dues 2 days BEFORE the billing cycle closes is a secret weapon: the bank reports a lower balance to CIBIL, boosting your utilisation score even with the same spending.' },
    ],
  },

  {
    id: 'l-taxes',
    topic: 'taxes',
    relatedGame: 'finIQ',
    title: 'Taxes Made Simple',
    estimatedMinutes: 4,
    ageGroups: ['senior'],
    cards: [
      {
        id: 'tx1',
        title: 'How Income Tax Works in India',
        body: {
          junior: '',
          teen: '',
          senior: 'India uses a slab-based income tax system. You pay different rates on different portions of your income — not the same rate on everything. In the new regime (2024-25), the first ₹3L is tax-free, ₹3–7L is 5%, ₹7–10L is 10%, and so on.',
        },
        example: {
          junior: '',
          teen: '',
          senior: 'Annual income ₹8L. Tax: ₹0 on first ₹3L + (₹4L × 5%) + (₹1L × 10%) = ₹0 + ₹20,000 + ₹10,000 = ₹30,000 tax. Standard deduction ₹50,000 reduces taxable income, so effective tax = ₹22,500.',
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: '0–3L (0%)', value: 0, color: '#10b981' },
            { label: '3–7L (5%)', value: 5, color: '#3b82f6' },
            { label: '7–10L (10%)', value: 10, color: '#f59e0b' },
            { label: '10–12L (15%)', value: 15, color: '#f97316' },
            { label: '12–15L (20%)', value: 20, color: '#ef4444' },
          ],
        },
        xpReward: 30,
      },
      {
        id: 'tx2',
        title: 'Tax Saving Strategies',
        body: {
          junior: '',
          teen: '',
          senior: 'Section 80C allows ₹1.5L of deductions per year: EPF, PPF, ELSS mutual funds, life insurance premiums, home loan principal repayment. NPS (Section 80CCD) adds ₹50,000 more. Home loan interest gets ₹2L deduction under Section 24.',
        },
        example: {
          junior: '',
          teen: '',
          senior: 'Income ₹12L. Without planning: tax ~₹1.1L. With 80C (₹1.5L ELSS) + 80CCD (₹50K NPS) + standard deduction (₹50K): taxable income = ₹9.5L. Tax ~₹62,500. Saves ₹47,500 in one year.',
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'No planning', value: 100, color: '#ef4444' },
          right: { label: 'With 80C', value: 43, color: '#10b981' },
        },
        xpReward: 30,
      },
    ],
    quizCard: {
      question: 'Under the new tax regime (2024-25), income up to which limit is tax-free?',
      options: ['₹2.5 lakh', '₹3 lakh', '₹5 lakh', '₹7 lakh'],
      correctIndex: 1,
      explanation: 'The new tax regime (FY2024-25) sets the basic exemption limit at ₹3 lakh. Combined with the standard deduction of ₹50,000, individuals earning up to ₹7.5L can have zero tax liability with rebate u/s 87A.',
    },
    briefs: [
      { emoji: '📝', fact: 'TDS (Tax Deducted at Source) is automatically cut from your salary before you receive it. Your Form 16 from your employer shows exactly how much was deducted — you can verify or claim refunds using ITR filing.' },
      { emoji: '🏦', fact: 'EPF (Employee Provident Fund) is mandatory for salaried employees earning under ₹15,000/month, but voluntary above. Both employee and employer contribute 12% each. The interest is tax-free.' },
      { emoji: '⏰', fact: 'ITR filing deadline is July 31 each year. Filing even if you have no tax due builds financial history, enables visa applications, and is required to carry forward capital losses.' },
    ],
  },

  {
    id: 'l-emergency',
    topic: 'saving',
    relatedGame: 'budgetBlitz',
    title: 'Emergency Funds',
    estimatedMinutes: 3,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'ef1',
        title: 'What is an Emergency Fund?',
        body: {
          junior: "An emergency fund is money saved for unexpected problems — like a broken toy, doctor visit, or something that isn't planned. It means you won't have to beg or borrow.",
          teen: "An emergency fund is 3–6 months of your living expenses kept in a separate savings account. It protects you from unexpected events: job loss, medical bills, or urgent repairs.",
          senior: "Emergency funds should cover 3–6 months of fixed + variable expenses — not income. For a freelancer or entrepreneur, aim for 9–12 months. Keep it liquid: savings account or liquid mutual fund.",
        },
        example: {
          junior: "Aryan saved ₹300 in a special envelope. When his cricket bat broke right before a match, he had the money to buy a new one — no problem!",
          teen: "Sneha had ₹12,000 in an emergency account. When her phone screen cracked during exams, she replaced it the same day without asking her parents or skipping meals.",
          senior: "Monthly expenses: ₹35,000 (rent ₹15K + food ₹8K + transport ₹5K + utilities ₹7K). Emergency fund target: ₹1.05–2.1L. Kept in liquid fund at ~6% return.",
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Junior (1 month)', value: 33, color: '#10b981' },
            { label: 'Teen (3 months)', value: 66, color: '#3b82f6' },
            { label: 'Senior (6 months)', value: 100, color: '#8b5cf6' },
          ],
        },
        xpReward: 20,
      },
    ],
    quizCard: {
      question: 'Where should you keep your emergency fund?',
      options: [
        'Stock market (for high returns)',
        'Fixed Deposit locked for 5 years',
        'Savings account or liquid mutual fund',
        'Cash under your mattress',
      ],
      correctIndex: 2,
      explanation: 'Emergency funds must be liquid — accessible within 24 hours. Savings accounts or liquid mutual funds are ideal: safe, earning modest interest, and available immediately without penalties.',
    },
    briefs: [
      { emoji: '🚑', fact: 'In India, 63% of households report that a single medical emergency would either push them into debt or require selling an asset. An emergency fund is the one protection against this.' },
      { emoji: '🔒', fact: 'Do NOT keep your emergency fund in a Fixed Deposit with a lock-in. FD premature withdrawal attracts a 1% penalty and takes 2–3 business days. Liquid mutual fund redemptions take 1 business day.' },
      { emoji: '🎯', fact: 'The FIRST savings goal for anyone should be a 1-month emergency fund. Even before starting an SIP, build a basic emergency buffer so you never have to break investments in a crisis.' },
    ],
  },

  {
    id: 'l-shortterm',
    topic: 'investing',
    relatedGame: 'stockMarketSim',
    title: 'Short-Term Trading vs Long-Term Investing',
    estimatedMinutes: 3,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'st1',
        title: 'Trading vs Investing: The Difference',
        body: {
          junior: '',
          teen: 'Trading means buying and selling quickly to profit from price changes — sometimes in hours or days. Investing means holding for years to benefit from business growth. Both have very different risk profiles.',
          senior: 'Active traders use technical analysis, chart patterns, and momentum signals. Investors use fundamental analysis: revenue, earnings, moat, management quality. Academic research consistently shows that long-term passive index investing outperforms active trading for retail investors after fees and taxes.',
        },
        example: {
          junior: '',
          teen: 'Trader: buys a stock at ₹500 on Monday, sells at ₹550 on Wednesday for ₹50 profit. But 80% of such trades lose money. Investor: buys a ₹500 stock, holds 10 years, sells at ₹2,200.',
          senior: 'Day trading in India: profits taxed at 30% as business income. Equity held >12 months: 10% LTCG over ₹1L. Trading costs + taxes often erase short-term profits entirely.',
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Trading (1yr)', value: 45, color: '#f59e0b' },
          right: { label: 'Investing (10yr)', value: 92, color: '#10b981' },
        },
        xpReward: 25,
      },
      {
        id: 'st2',
        title: 'Short Selling Explained',
        body: {
          junior: '',
          teen: 'Short selling is betting that a stock will FALL. You borrow shares, sell them now, buy them back cheaper later, and return them — keeping the difference. If the price rises, you lose — with no cap on how much.',
          senior: 'Shorting mechanics: borrow shares via broker margin account, sell at market price, monitor, cover by buying back. Risk: unlimited upside on the stock means unlimited loss. Requires SEBI margin account, maintenance margin, and daily mark-to-market. Not suitable for retail investors without deep experience.',
        },
        example: {
          junior: '',
          teen: 'Short at ₹200, price drops to ₹140 → profit ₹60. But if price rises to ₹350 → loss ₹150 per share. Every ₹1 price rise = ₹1 loss per share.',
          senior: 'GME short squeeze (2021): retail traders on Reddit forced hedge funds to cover shorts as the price rose 1,700% in a week. Several professional short-sellers lost billions.',
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Long: Max loss 100%', value: 100, color: '#10b981' },
          right: { label: 'Short: Loss unlimited', value: 20, color: '#ef4444' },
        },
        xpReward: 25,
      },
    ],
    quizCard: {
      question: 'A trader shorts a stock at ₹300. The stock rises to ₹450. What happens?',
      options: [
        'The trader profits ₹150 per share',
        'The trader breaks even',
        'The trader loses ₹150 per share',
        'Nothing — the trade is cancelled',
      ],
      correctIndex: 2,
      explanation: 'Short sellers profit when prices fall and lose when prices rise. A rise from ₹300 to ₹450 means the trader must buy back at ₹150 more per share to close the position — a real loss.',
    },
    briefs: [
      { emoji: '📊', fact: 'Studies show that 80–90% of day traders in India lose money over a 3-year period. The few who profit consistently are usually institutions with speed, data, and capital advantages over retail traders.' },
      { emoji: '💸', fact: 'Short-term trading profits are taxed at 15% STCG for equity held under 12 months. Day-trading profits are taxed as business income at your slab rate — which can be 30%.' },
      { emoji: '📖', fact: '"The market can remain irrational longer than you can remain solvent." — John Maynard Keynes. This is the core risk of short selling: being right but running out of margin before the price corrects.' },
    ],
  },
];
