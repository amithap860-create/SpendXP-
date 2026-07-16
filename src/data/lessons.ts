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
      question: "What does a stock market index (like the Nifty 50 or S&P 500) actually measure?",
      options: ["The total money in all bank accounts", "The average performance of a selected group of companies", "The price of one specific company's stock", "The government's budget"],
      correctIndex: 1,
      explanation: "A stock market index tracks the average performance of a selected group of companies — for example, the Nifty 50 tracks India's 50 largest, and the S&P 500 tracks America's 500 largest. They act as a 'health check' for the economy."
    },
    briefs: [
      { emoji: '📈', fact: 'Global stock markets have historically returned 8–12% per year over long periods. ₹1 lakh invested in a broad market index 20 years ago would be worth ₹9L+ today — without touching it once.' },
      { emoji: '⏰', fact: 'If you invested ₹500/month from age 15 to age 60 at 12% annual returns, you would have over ₹2.6 crore at retirement — built almost entirely from compound growth, not contributions.' },
      { emoji: '🏠', fact: 'Historically, equities outperform real estate over 10+ year periods when adjusted for inflation — but most people still prefer property because it feels more "real" and tangible.' },
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
      question: "An index ETF (e.g. Nifty 50 or S&P 500 fund) lets you invest ₹1,000 and immediately own...",
      options: ["Only the top 1 company", "All companies in the index, proportionally", "Only tech companies", "A fixed deposit with bonus shares"],
      correctIndex: 1,
      explanation: "Index ETFs give you instant diversification — your ₹1,000 is spread across every company in the index, proportional to its size. One purchase, dozens or hundreds of companies."
    },
    briefs: [
      { emoji: '💰', fact: 'The average actively managed mutual fund charges 1–2% annual expense ratio. A broad market ETF (tracking Nifty 50, S&P 500, or similar) charges just 0.03–0.1%. On ₹10L over 20 years, that fee difference is worth ₹10+ lakhs.' },
      { emoji: '📊', fact: 'In any given 10-year window, about 80% of active fund managers fail to beat their benchmark index after fees. Passive investing wins statistically — consistently, across every major market globally.' },
      { emoji: '🌏', fact: 'John Bogle founded Vanguard and invented the index fund in 1976. He was rejected by everyone. Today, index funds and ETFs manage over $15 trillion globally — the biggest shift in personal finance history.' },
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
      { emoji: '📉', fact: 'Bitcoin lost 83% of its value in 2018 and 77% again in 2022. It recovered both times — but only those who held through the crash and had no urgent need for the money benefited.' },
      { emoji: '🕵️', fact: 'Crypto scams cost the world over $8 billion in 2022 (Chainalysis report). Ponzi schemes disguised as "DeFi" and "staking" projects are the most common trap — promising yield that never materialises.' },
      { emoji: '⚖️', fact: 'Crypto tax treatment varies by country but is generally unfavourable — gains are often taxed as income with limited or no ability to offset losses. Always check local tax rules before investing.' },
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
      { emoji: '💡', fact: 'Most young adults save far less than they think. Liquid savings (accessible cash) for under-25s is often less than 1 month of expenses — leaving no real buffer when something unexpected happens.' },
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
      { emoji: '⛓️', fact: 'Buy Now Pay Later (BNPL) apps advertise 0% interest — but only for 15–30 days. After that, annualised rates can reach 30–50%. Always read the repayment terms before splitting any payment.' },
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
        title: 'What is a Credit Score?',
        body: {
          junior: '',
          teen: 'Your credit score is a 3-digit number that banks use to decide whether to lend you money and at what interest rate. Higher = better loan terms and lower interest rates. Every country has its own credit bureau: CIBIL in India (300–900), FICO in the USA (300–850), Experian in the UK.',
          senior: 'Credit bureaus compute your creditworthiness as a score: CIBIL in India (300–900), FICO in the USA (300–850), Experian in the UK. Scores above ~750 unlock the best loan rates. Scores below ~650 lead to rejections or high-risk premiums. Globally, the same five factors determine your score.',
        },
        example: {
          junior: '',
          teen: 'Amit\'s credit score is 800. He gets a home loan at 8.5%. His friend with a score of 600 pays 11.5% — on a ₹50L loan, that\'s ₹15L extra in interest over 20 years.',
          senior: 'On a ₹60L, 20-year home loan: 8.5% (score 800+) = EMI ₹52,118 = Total ₹1.25 crore. At 11.5% (score 600): EMI ₹63,879 = Total ₹1.53 crore. Score difference costs ₹28L.',
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
      question: 'Which factor has the BIGGEST impact on your credit score?',
      options: ['Number of credit cards you own', 'Payment history', 'Total balance across all accounts', 'The type of bank you use'],
      correctIndex: 1,
      explanation: 'Payment history accounts for 35% of your score — the largest single factor. Even one missed payment can drop your score by 50–100 points instantly.',
    },
    briefs: [
      { emoji: '📋', fact: 'You can usually check your credit score for free through your bank\'s app, your country\'s official credit bureau (CIBIL in India, Experian/Equifax in USA/UK), or many financial apps. Free checks are "soft inquiries" and do not affect your score.' },
      { emoji: '🛡️', fact: 'Checking your OWN credit score is a "soft inquiry" — it does NOT lower your score. Only "hard inquiries" (when a lender checks for an application) have a small, temporary impact.' },
      { emoji: '⚡', fact: 'Paying credit card dues 2 days BEFORE the billing cycle closes is a secret weapon: the bank reports a lower balance to the credit bureau, boosting your utilisation score even with the same spending.' },
    ],
  },

  {
    id: 'l-taxes',
    topic: 'taxes',
    relatedGame: 'finIQ',
    title: 'Taxes Made Simple',
    estimatedMinutes: 4,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'tx1',
        title: 'Progressive Tax: How Brackets Work',
        body: {
          junior: '',
          teen: 'Most countries use progressive income tax — you pay low rates on lower income and higher rates on higher income. The key insight: only the income in each "bracket" is taxed at that higher rate, not your entire income.',
          senior: 'Progressive taxation means your effective tax rate (total tax ÷ total income) is always lower than your marginal rate (the rate on your top bracket). Standard deductions and retirement contributions reduce your taxable income before any bracket applies — that\'s the foundation of all legal tax optimisation.',
        },
        example: {
          junior: '',
          teen: 'Two brackets: ₹0–3L = 0%, ₹3–8L = 5%. If you earn ₹6L: tax = ₹0 (first ₹3L) + ₹15,000 (next ₹3L × 5%) = ₹15,000. Not ₹6L × 5% = ₹30,000. Bracket math saves you money.',
          senior: 'Income ₹10L: ₹0–3L at 0% = ₹0. ₹3–7L at 5% = ₹20,000. ₹7–10L at 10% = ₹30,000. Total = ₹50,000. Effective rate = 5%, even though the top bracket rate is 10%. Standard deduction reduces this further.',
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Band 1 (0%)', value: 0, color: '#10b981' },
            { label: 'Band 2 (5%)', value: 5, color: '#3b82f6' },
            { label: 'Band 3 (10%)', value: 10, color: '#f59e0b' },
            { label: 'Band 4 (20%)', value: 20, color: '#ef4444' },
          ],
        },
        xpReward: 30,
      },
      {
        id: 'tx2',
        title: 'Legal Ways to Pay Less Tax',
        body: {
          junior: '',
          teen: 'Most countries allow deductions that reduce your taxable income before any brackets apply. The most powerful: contributions to retirement accounts (EPF, PPF, 401k, ISA, pension). Investing here is essentially earning a government discount on top of your investment returns.',
          senior: 'Tax-advantaged accounts are the single biggest legal tax lever: employer pension matching (free money + deduction), retirement account contributions (deferred or exempt from tax), healthcare savings where available. Max these before any other investing — the combined tax benefit often delivers a higher return than the investment itself in year one.',
        },
        example: {
          junior: '',
          teen: 'Investing ₹10,000 in a tax-saving account: if your marginal tax rate is 10%, you immediately owe ₹1,000 less in tax. Your effective cost is only ₹9,000 — an instant 11% return before the money even grows.',
          senior: 'Salary ₹12L. Without planning: tax ~₹1.05L. With ₹1.5L in retirement savings + standard deduction (₹50K): taxable income drops to ~₹10L. Tax ~₹62,500. Annual saving: ~₹42,500 — just from using the right accounts.',
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'No planning', value: 100, color: '#ef4444' },
          right: { label: 'With deductions', value: 41, color: '#10b981' },
        },
        xpReward: 30,
      },
    ],
    quizCard: {
      question: 'You earn ₹8L. Brackets: ₹0–3L at 0%, ₹3–8L at 5%. How much total tax do you owe?',
      options: ['₹25,000', '₹40,000', '₹8,000', '₹0'],
      correctIndex: 0,
      explanation: 'Progressive tax: ₹0 on first ₹3L + (₹5L × 5%) = ₹25,000. Not ₹8L × 5% = ₹40,000. Only the income in each bracket is taxed at that rate — never your full income.',
    },
    briefs: [
      { emoji: '📝', fact: 'In most countries, tax is deducted from your salary before you receive it (called withholding, TDS, or PAYE). Your annual tax return reconciles what was withheld vs. what you actually owed — and you either get a refund or pay the difference.' },
      { emoji: '🧮', fact: 'Your "marginal tax rate" (top bracket rate) is almost always higher than your "effective tax rate" (actual % of total income paid). On ₹8L income with standard deductions, an effective rate of 4–6% is common even with a 10% top bracket.' },
      { emoji: '🏦', fact: '"Tax-advantaged" retirement accounts (EPF, 401k, ISA, pension) let your investments grow tax-free or tax-deferred. Over 30 years, this tax shelter effect alone can add lakhs to your final balance.' },
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
      { emoji: '🚑', fact: 'Globally, medical emergencies and sudden job loss are the top two triggers for household debt crises. An emergency fund is the one financial buffer that stands between stability and a debt spiral.' },
      { emoji: '🔒', fact: 'Do NOT keep your emergency fund in a locked account or fixed-term deposit with early-withdrawal penalties. You need the money available within 24 hours — not in 3 business days with a penalty fee.' },
      { emoji: '🎯', fact: 'The FIRST savings goal for anyone should be a 1-month emergency fund — even before starting investments. A crisis that forces you to sell investments at a bad time costs far more than delayed investing.' },
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
          senior: 'Day trading profits are typically taxed as ordinary business income — your highest marginal rate. Long-term capital gains on equity usually get a lower preferential rate. Trading costs + taxes + spread often erase short-term profits entirely.',
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
          senior: 'Shorting mechanics: borrow shares via broker margin account, sell at market price, monitor, cover by buying back. Risk: unlimited upside on the stock means unlimited downside loss. Requires a margin account, maintenance margin requirements, and daily mark-to-market. Not suitable for retail investors without deep experience.',
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
      { emoji: '📊', fact: 'Studies across every major market show 75–90% of day traders lose money over a 3-year period. The few who profit consistently are usually institutions with speed, data, and capital advantages that retail traders cannot match.' },
      { emoji: '💸', fact: 'Tax treatment of trading profits varies by country — but short-term gains are almost always taxed at higher rates than long-term gains. Frequent trading also generates more taxable events, a hidden cost that compounds over years.' },
      { emoji: '📖', fact: '"The market can remain irrational longer than you can remain solvent." — John Maynard Keynes. This is the core risk of short selling: being right but running out of margin before the price corrects.' },
    ],
  },

  {
    id: 'l-insurance',
    topic: 'spending',
    relatedGame: 'budgetBlitz',
    title: 'Insurance: Protecting What You Build',
    estimatedMinutes: 4,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'ins1',
        title: 'What Is Insurance?',
        body: {
          junior: '',
          teen: 'Insurance is a risk-pooling system. Everyone pays a small regular amount (a "premium"), and the fund covers large unexpected costs for whoever needs it. You are essentially sharing financial risk with thousands of strangers.',
          senior: 'Insurance transfers low-probability, high-impact financial risk to an insurer for a predictable cost. The insurer profits because most policyholders never claim — but for those who do, the payout far exceeds the premiums paid. It is the only financial product where the goal is to never "get your money\'s worth."',
        },
        example: {
          junior: '',
          teen: '1,000 people each pay ₹3,000 per year for health insurance = ₹30L in the pool. When one person needs surgery costing ₹5L, the pool pays. Each person\'s small premium funds coverage that would otherwise be unaffordable.',
          senior: 'Health insurance premium: ₹8,000/year. Hospitalisation claim: ₹2.5L. Effective "return" on the premium: 31×. But the value was never the return — it was eliminating the risk of a ₹2.5L expense with no savings to cover it.',
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Without insurance', value: 15, color: '#ef4444' },
          right: { label: 'With insurance', value: 95, color: '#10b981' },
        },
        xpReward: 30,
      },
      {
        id: 'ins2',
        title: 'What Insurance Do You Actually Need?',
        body: {
          junior: '',
          teen: 'Start with health insurance — always. If you are on a parent\'s policy, understand what it covers and when you age off. After health: renters/contents insurance if you have valuables, and eventually life insurance if others depend on your income.',
          senior: 'Priority order for most young adults: (1) Health insurance — non-negotiable. (2) Term life insurance — only if you have dependents or co-signed debt. (3) Disability insurance — often overlooked, but you are 3–4× more likely to be disabled for 3+ months than to die before 65. (4) Property insurance — renters or home. Skip whole-life and investment-linked policies as a rule: buy term, invest the difference.',
        },
        example: {
          junior: '',
          teen: 'Anaya, 19, pays ₹400/month for health insurance. Without it, a single ER visit or fracture could mean ₹50,000–₹2L in bills — a financial disaster on a student budget.',
          senior: 'Rohan, 26, earns ₹8L/year. Term life at ₹500/month gives ₹1 crore cover — protecting his parents who depend on his income. Whole-life equivalent: ₹4,500/month for smaller cover. He invests the ₹4,000 difference in index funds.',
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Health (must-have)', value: 100, color: '#ef4444' },
            { label: 'Disability (overlooked)', value: 75, color: '#f59e0b' },
            { label: 'Term Life (if dependents)', value: 60, color: '#3b82f6' },
            { label: 'Property (if you have valuables)', value: 45, color: '#10b981' },
          ],
        },
        xpReward: 30,
      },
    ],
    quizCard: {
      question: 'Which type of insurance should a young adult prioritise above all others?',
      options: ['Whole-life insurance', 'Health insurance', 'Car insurance (even without a car)', 'Travel insurance'],
      correctIndex: 1,
      explanation: 'Health insurance is universally the most important for a young adult — medical costs are unpredictable, potentially catastrophic, and happen at any age. No other insurance replaces it.',
    },
    briefs: [
      { emoji: '🏥', fact: 'Medical bills are the #1 cause of personal bankruptcy in the USA, and a leading cause of debt crises worldwide. Health insurance doesn\'t feel necessary — until it is desperately necessary.' },
      { emoji: '🔒', fact: 'Term life vs whole life: term covers you for a fixed period at low cost (₹500–800/month for ₹1 crore). Whole life mixes insurance and investment at high cost. Financial experts near-universally recommend: buy term, invest the difference.' },
      { emoji: '⚠️', fact: 'Disability insurance is the most underrated protection: you are statistically 3–4× more likely to be unable to work for 3+ months due to illness or injury than to die before retirement. Yet most people never think about it.' },
    ],
  },

  // ── Peter Lynch Stock Framework ──────────────────────────────────────────
  {
    id: 'l-stock-analysis',
    topic: 'investing',
    relatedGame: 'stockMarketSim',
    title: 'Pick Stocks Like Peter Lynch',
    estimatedMinutes: 4,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'sl-1',
        title: 'The 2-Minute Stock Test',
        body: {
          junior: "Before you buy anything, you should be able to explain what it is in simple words. If you can't, you probably don't understand it well enough yet!",
          teen: "Legendary investor Peter Lynch managed the world's best-performing fund for 13 years. His rule: if you can't explain why you own a stock in 2 minutes, you probably shouldn't own it. Confusion costs money in the market.",
          senior: "Peter Lynch returned 29.2% annually at Magellan Fund (1977–1990). His core thesis: genuine understanding is the only reliable edge a retail investor has over institutional money. If you can't articulate the investment thesis in 2 minutes, you don't have one."
        },
        example: {
          junior: "Like explaining a game to a friend — if you need 20 minutes, you don't really know the rules yet. Money is the same!",
          teen: "Bad: 'I'm buying ZetaCorp because everyone says it's going up.' Good: 'ZetaCorp runs India's top UPI payment rails, growing 40% per year as digital payments replace cash.' The second person has a thesis.",
          senior: "The 2-minute test eliminates FOMO, hot tips, and hype. It forces you to locate your actual edge. Without a clear thesis, you don't know when to sell — which means you'll panic at the first correction."
        },
        visual: 'none',
        xpReward: 20,
      },
      {
        id: 'sl-2',
        title: 'Question 1: What Does It Do?',
        body: {
          junior: "The first question to ask about any investment: what does this company do to make money? Say it in one sentence. One sentence only!",
          teen: "Question 1 of Lynch's framework: 'What does this company do to make money?' Answer in exactly one sentence. Not a paragraph — one sentence. If it takes longer, you don't fully understand the business model yet.",
          senior: "The first filter: one-sentence business model articulation. This tests whether you understand the revenue engine, not just the product. Revenue model clarity is the foundation of all subsequent valuation work."
        },
        example: {
          junior: "Amul: 'Amul makes milk and dairy products and sells them across India.' Done — one sentence. You understand Amul.",
          teen: "Good: 'Zomato earns commissions from restaurant deliveries and charges restaurants for platform visibility.' Bad: 'Zomato is a tech-enabled food-ecosystem platform leveraging network effects...' — that second sentence says nothing.",
          senior: "The test: can you write the business model on a post-it note? If not, the company may not have a clear model — or your understanding is incomplete. Either is a risk you're carrying into your portfolio."
        },
        visual: 'none',
        xpReward: 20,
      },
      {
        id: 'sl-3',
        title: 'Question 2: Why Is It Growing?',
        body: {
          junior: "If a company is doing better and better, there must be a specific reason. 'Everyone likes it' isn't a reason. What is the real reason?",
          teen: "Question 2: 'Why specifically is it growing?' The answer cannot be 'the sector is hot.' You need the company's specific reason — a product, a market, or an advantage only they have. Generic answers = generic results.",
          senior: "Sector tailwinds are necessary but not sufficient. The core question: what is this company's defensible competitive advantage within the sector? Network effects? Switching costs? Proprietary data? Regulatory moat? The 'why' must be company-specific to be investment-grade."
        },
        example: {
          junior: "Why does your school canteen sell more than the one next to it? Maybe the samosas are better! That's the specific reason — not just 'because students are hungry.'",
          teen: "Weak: 'IndiaMART is growing because e-commerce is growing.' Strong: 'IndiaMART has a 7-million SMB network with deep switching costs — businesses can't easily migrate their buyer-seller relationships elsewhere.' That's a specific moat.",
          senior: "Beware 'rising tide' reasoning. Sector booms lift all boats — including boats with holes. The question is: does this company have a moat that protects it when the tide inevitably recedes? Lynch looked for companies with durable, specific, articulable advantages."
        },
        visual: 'none',
        xpReward: 20,
      },
      {
        id: 'sl-4',
        title: 'Questions 3 & 4: Price and Conviction',
        body: {
          junior: "Would you pay ₹200 for a toy that costs ₹100 elsewhere? No! The same idea applies to stocks — even a great company can be a bad investment if you pay too much. And when the people who own the company buy more of it themselves, that's a great sign!",
          teen: "Question 3: 'What are you paying per unit of growth?' Use the PEG ratio — divide the P/E ratio by the annual earnings growth rate. PEG below 1 = potentially undervalued. PEG above 2 = paying a high premium. Question 4: 'Is the promoter buying with their own money?' When founders buy their own shares, they're voting with real cash — not just optimistic quotes to journalists.",
          senior: "PEG = P/E ÷ Annual EPS Growth Rate. Lynch considered PEG < 1 as a fair-to-low price. PEG > 2 requires very high conviction on sustained growth. For Q4, check BSE/NSE insider trading disclosures — promoter buying is a quantitative conviction signal. These two checks together cover price sanity and insider alignment, two of the most reliable edges in fundamental analysis."
        },
        example: {
          junior: "Meera's lemonade stand earns ₹100/day. You want to buy it for ₹200. That's only 2 days of earnings — cheap! But if she only earns ₹5/day, ₹200 is 40 days of earnings — too expensive!",
          teen: "Stock A: P/E 40, growing at 20% → PEG 2.0 (expensive). Stock B: P/E 20, growing at 25% → PEG 0.8 (potential bargain!). Then check: did the CEO just buy ₹2 crore of their own shares? That's real conviction.",
          senior: "PEG is most useful for steady-growth companies. It breaks down for cyclicals, financials, and pre-profit companies. Cross-reference with FCF yield and ROIC to avoid value traps where earnings are manipulated but cash flow tells the truth."
        },
        visual: 'comparison',
        visualData: {
          items: [
            { label: 'Stock A (PEG 2.0)', value: 40, color: '#ef4444', note: 'Expensive' },
            { label: 'Stock B (PEG 0.8)', value: 80, color: '#10b981', note: 'Potential value' }
          ]
        },
        xpReward: 30,
      },
    ],
    quizCard: {
      question: "After passing all 4 Lynch checks (clear business model, specific growth reason, PEG < 1, promoter buying), the stock should go:",
      options: [
        "Straight into your portfolio — all signals green!",
        "Onto your research shortlist for deeper investigation",
        "Into a ₹10,000 immediate investment",
        "Into the bin — Lynch's rules are too old now"
      ],
      correctIndex: 1,
      explanation: "Lynch's 4 questions eliminate 95% of stocks — but what remains is your research shortlist, not your buy list. Reading annual reports, understanding risks, sizing positions — the real work starts here. The framework finds the door; you still have to walk through it."
    },
    briefs: [
      { emoji: '📈', fact: 'Peter Lynch averaged 29.2% annual returns for 13 years at Magellan Fund — growing it from $18M to $14B. His edge? Only buying what he deeply understood, never what sounded impressive.' },
      { emoji: '🔍', fact: 'Lynch coined "invest in what you know." He found winning stocks like Hanes and Dunkin\' Donuts by noticing products his family used daily — months before Wall Street analysts noticed them.' },
      { emoji: '📊', fact: 'The PEG ratio Lynch popularised is now one of the most widely used stock screening metrics globally — 35 years after he introduced it to mainstream investors in his book One Up on Wall Street.' },
    ],
  },
];
