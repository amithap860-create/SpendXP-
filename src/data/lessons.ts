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

// REORDERED (2026-09-29): the /learn page (src/app/learn/page.tsx) hard-locks
// lessons in this exact array order — lesson N+1 stays locked until lesson N
// is completed. The array used to be ordered budgeting → investing → ETFs →
// crypto → saving → debt → credit → taxes → emergency → short-term trading →
// insurance → stock analysis, which taught investing, ETFs and crypto BEFORE
// saving basics and "what a bank does with your money" — backwards, and it
// meant terms like "mutual fund" got used in later lessons before ever being
// defined. Reordered to a genuine basics-to-advanced progression:
//   1. Budgeting            — absolute foundation
//   2. Saving               — incl. what a bank actually does with deposits
//   3. Emergency Fund       — direct extension of saving
//   4. Debt                 — good/bad debt, avalanche method
//   5. Credit               — builds on debt (credit score sets your loan rate)
//   6. Insurance            — risk protection, still no investing vocab needed
//   7. Taxes                — standalone, no investing vocab needed
//   8. Investing basics     — first place stocks/bonds/mutual funds are taught
//   9. ETFs & Index Funds   — builds directly on investing basics
//  10. Short-term trading   — intermediate/advanced (short selling, leverage)
//  11. Crypto               — high-risk asset class, contrasted against stocks
//  12. Stock analysis       — most advanced (PEG ratio, value vs growth) — last
// If you add a new lesson, insert it where its required vocabulary is already
// covered by everything before it — don't just append to the end.
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
          senior: "Monthly stipend ₹15,000: ₹5,000 PG rent, ₹3,000 food, ₹2,000 travel, ₹5,000 into savings."
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
          senior: "With a ₹20,000 salary: ₹10,000 rent/bills, ₹6,000 lifestyle, ₹4,000 into savings."
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
      },
      {
        // NEW (2026-09-29): sourced from a finance-basics resource's
        // "intermediate budgeting" material. 50/30/20 is a fixed-ratio
        // starting point, but the natural next step once someone has that
        // habit down is assigning every rupee a specific job instead of
        // leaving anything unaccounted for — "zero-based budgeting."
        id: 'b3',
        title: 'Give Every Rupee a Job',
        body: {
          junior: "Once you're used to splitting money into Needs/Wants/Savings, try this next-level trick: before you spend anything, decide EXACTLY where every single rupee is going — so ₹0 is left with 'no plan.'",
          teen: "Zero-based budgeting means every rupee of income gets assigned a specific job — rent, food, savings, fun — before the month starts, until nothing is left unassigned. It's a step up from 50/30/20's fixed percentages: instead of one-size-fits-all ratios, you decide the exact amount for each category based on your actual life that month.",
          senior: "Zero-based budgeting assigns every unit of income to a category — expenses, debt repayment, investments, savings — until income minus allocations equals zero. Unlike the 50/30/20 rule's fixed ratios, it adapts month to month: a month with a large one-off expense (say, a device repair) gets rebalanced deliberately, rather than blowing through a rigid 'Wants' percentage.",
        },
        example: {
          junior: "₹500 pocket money: ₹200 to your snacks jar, ₹100 to a comic book, ₹200 to savings. Every rupee has a name — none is just 'floating around.'",
          teen: "₹8,000 monthly allowance: ₹3,000 essentials, ₹2,000 savings, ₹1,500 fun, ₹1,000 a new phone case fund, ₹500 buffer. ₹8,000 in, ₹8,000 assigned, ₹0 left unaccounted for.",
          senior: "₹40,000 take-home: ₹18,000 rent/bills, ₹6,000 groceries, ₹6,000 investments, ₹4,000 debt repayment, ₹4,000 lifestyle, ₹2,000 sinking fund for annual expenses. Every rupee assigned — nothing left to accidentally overspend.",
        },
        visual: 'none',
        xpReward: 25,
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
    // NEW (2026-09-29): sourced from SEBI Investor Education's "Understanding
    // Our Needs, Wants and Desires" — a genuine gap. The Budgeting chapter's
    // 50/30/20 rule already assumes a reader can sort spending into
    // Needs/Wants/Savings, but nothing ever explicitly taught the 3-tier
    // priority ladder (Needs > Wants > Desires) or named "Desires" as its
    // own category — the exact thing Budget Blitz's NEED/WANT/SAVE buckets
    // are built on. Placed right after Budgeting since it directly deepens
    // that chapter's core idea before moving on.
    id: 'l-needs-wants-desires',
    topic: 'spending',
    relatedGame: 'budgetBlitz',
    title: 'Needs, Wants & Desires',
    estimatedMinutes: 3,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'nwd1',
        title: 'The Three Buckets',
        body: {
          junior: "Every time you spend money, it falls into one of three buckets. Needs are things you MUST have to live — food, water, a place to sleep. Wants make life nicer but you could live without them — like games or eating out. Desires are big, exciting things you REALLY want but don't need at all — like the newest phone or a fancy bike.",
          teen: "Needs are essential for survival — food, water, housing, clothing, healthcare. Wants aren't essential but improve your lifestyle — entertainment, dining out, trips. Desires are strong aspirations for big-ticket items — a dream gadget, a luxury item — that go beyond both needs and wants.",
          senior: "The needs/wants/desires ladder extends the standard needs-vs-wants framework with a third, more dangerous tier: desires — strong aspirational purchases (a luxury car, the latest flagship phone) that carry real temptation to borrow money to fund them, precisely because they feel urgent even though nothing about them is.",
        },
        example: {
          junior: "Food for dinner = Need. A movie with friends = Want. The newest gaming console that just launched = Desire.",
          teen: "Rent and groceries = Needs. A weekend trip with friends = Want. The latest ₹1,50,000 flagship phone when your current one works fine = Desire.",
          senior: "Health insurance premium = Need. A nicer apartment than strictly necessary = Want. A luxury watch financed on EMI = Desire — and the one most likely to derail a budget.",
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Needs (survival)', value: 100, color: '#2e72db' },
            { label: 'Wants (lifestyle)', value: 60, color: '#19c0ed' },
            { label: 'Desires (aspiration)', value: 30, color: '#f59e0b' },
          ],
        },
        xpReward: 20,
      },
      {
        id: 'nwd2',
        title: 'Why Desires Are the Dangerous One',
        body: {
          junior: "Desires are tricky because they can make you want to borrow money — like asking to pay later — just to get something you don't actually need. If you spend on Desires before covering your Needs and saving, you can run out of money fast.",
          teen: "Desires are where budgets usually break. Because a desire isn't essential, satisfying it always competes directly with your savings — and it's also the #1 reason people turn to EMIs, BNPL (buy-now-pay-later), or credit cards for things they can't actually afford yet.",
          senior: "The correct spending order is Needs → Wants → Savings/Goals → Desires — not Needs → Desires. When desires jump the queue, they're almost always funded by debt (EMI, BNPL, credit card revolve) rather than surplus income, which is how an aspirational purchase quietly becomes an interest-bearing liability.",
        },
        example: {
          junior: "Aditi wants a ₹2,000 toy. Instead of skipping her savings, she waits and saves ₹200 a month for 10 months — no borrowing needed.",
          teen: "Instead of putting a ₹40,000 phone on a 12-month EMI at high interest, Zara saved ₹4,000/month for 10 months and bought it outright — paying ₹0 in interest.",
          senior: "A ₹1,20,000 gadget on a 24-month EMI at 15% effectively costs ₹1,38,000+ once interest is included. The same amount saved over 12 months first, then bought outright, costs exactly ₹1,20,000 — the 'desire tax' avoided entirely.",
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Bought on EMI/BNPL', value: 115, color: '#ef4444' },
          right: { label: 'Saved first, bought outright', value: 100, color: '#10b981' },
        },
        xpReward: 25,
      },
    ],
    quizCard: {
      question: "Which of these is a 'Desire' rather than a 'Need' or a 'Want'?",
      options: ['Groceries for the week', 'Dinner out with friends', 'A ₹1,50,000 flagship phone when your current one works fine', 'Your monthly rent'],
      correctIndex: 2,
      explanation: "Groceries and rent are Needs. Dinner out is a Want. An expensive upgrade you don't actually need — bought mostly for the aspiration — is a Desire, and the category most likely to be funded by debt.",
    },
    briefs: [
      { emoji: '🎯', fact: 'The correct spending priority is Needs → Wants → Savings → Desires. When "Desires" jump ahead of savings, budgets break — that\'s the single most common budgeting failure pattern.' },
      { emoji: '💳', fact: 'BNPL (buy-now-pay-later) usage in India has grown fastest among 18-25 year olds — and it is overwhelmingly used to fund Desires, not Needs.' },
      { emoji: '⏳', fact: 'Studies on impulse spending show the urge to buy an aspirational item fades within 72 hours in most cases. Waiting 3 days before a "Desire" purchase filters out most regretted buys.' },
    ],
  },
  {
    // NEW (2026-09-29): sourced from SEBI Investor Education's "Financial
    // Goal and Budgeting" — the app taught HOW to split money (50/30/20)
    // but never taught how to set the goal that budget is working toward.
    // Uses SEBI's own SMART framework (Specific, Measurable, Achievable,
    // Realistic, Time-bound), adapted to youth-relevant examples in place
    // of the source's grandchild's-birthday/daughter's-marriage examples.
    id: 'l-smart-goals',
    topic: 'budgeting',
    relatedGame: 'budgetBlitz',
    title: 'Setting SMART Financial Goals',
    estimatedMinutes: 3,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'sg1',
        title: 'What Makes a Goal SMART?',
        body: {
          junior: "A good money goal isn't just 'I want to save money' — that's too fuzzy! A SMART goal is Specific (exactly what), Measurable (exactly how much), Achievable (actually possible), Realistic (fits your real pocket money), and Time-bound (by when).",
          teen: "A SMART goal is Specific, Measurable, Achievable, Realistic, and Time-bound. 'I'll save some money' isn't a plan — 'I'll save ₹500 a month for 6 months to buy a ₹3,000 pair of headphones' is, because you can check your progress against it every single month.",
          senior: "SMART goal-setting (Specific, Measurable, Achievable, Realistic, Time-bound) turns a vague intention into a trackable plan. Without all five elements, a goal can't be monitored — and goals that can't be monitored are rarely met.",
        },
        example: {
          junior: "Vague: 'I want a new cricket bat someday.' SMART: 'I will save ₹50 a week for 10 weeks to buy a ₹500 cricket bat.'",
          teen: "Vague: 'I should save more.' SMART: 'I will save ₹800/month for 6 months to buy a ₹4,800 bicycle by March.'",
          senior: "Vague: 'I'll pay off most of my credit card soon.' SMART: 'I will pay ₹6,000/month for 5 months to clear my ₹30,000 credit card balance by February, and stop using the card until then.'",
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Vague goal', value: 20, color: '#ef4444' },
          right: { label: 'SMART goal', value: 90, color: '#10b981' },
        },
        xpReward: 20,
      },
      {
        id: 'sg2',
        title: 'Turning a Wish Into a Plan',
        body: {
          junior: "To make your own SMART goal, answer 5 quick questions: What EXACTLY do I want? How will I count my progress? Can I actually do this? Does it fit what I really earn or get? And by WHEN will I do it?",
          teen: "Build any SMART goal by filling in this template: 'I will save/pay ₹___ every [week/month] for ___ [weeks/months] to [buy/achieve] ___ by [date].' If you can't fill in every blank with a real number, the goal isn't SMART yet.",
          senior: "The SMART template works for saving, debt payoff, or investing goals equally: '₹[amount] every [period] for [duration] to [outcome] by [date].' Each blank forces a decision you'd otherwise skip — which is exactly why vague goals fail and specific ones don't.",
        },
        example: {
          junior: "'I will save ₹30 a week for 8 weeks to buy a ₹240 storybook set by my birthday.'",
          teen: "'I will save ₹1,200 a month for 5 months to buy a ₹6,000 gaming headset by December.'",
          senior: "'I will invest ₹5,000 a month for 24 months to build a ₹1,20,000+ down payment fund by the end of next year.'",
        },
        visual: 'none',
        xpReward: 20,
      },
    ],
    quizCard: {
      question: 'Which of these is a SMART financial goal?',
      options: [
        'I want to save money',
        'I will try to spend less on snacks',
        'I will save ₹500 every month for 8 months to buy a ₹4,000 bicycle by June',
        'I want to be rich someday',
      ],
      correctIndex: 2,
      explanation: 'This is the only option with a specific amount, a measurable monthly target, a realistic timeframe, and a clear deadline — all five SMART elements are present.',
    },
    briefs: [
      { emoji: '✍️', fact: 'People who write down a specific, measurable goal are significantly more likely to follow through than people who set only a general intention like "save more."' },
      { emoji: '📆', fact: 'A goal with no deadline has no urgency — and no way to tell if you\'re on track or falling behind until it\'s too late to fix.' },
      { emoji: '🧮', fact: 'The fastest way to check if a goal is SMART: try to fill in an exact number and an exact date. If you can\'t, it\'s still a wish, not a goal.' },
    ],
  },
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
          senior: "Set up an auto-transfer or standing instruction on your account to move money to savings the same day your salary arrives. What you don't see, you don't spend.",
        },
        example: {
          junior: "Every time Arun gets pocket money, he immediately puts ₹30 in his piggy bank — before buying anything. He saves without even trying!",
          teen: "Kavya set up a ₹500 auto-transfer to her savings account every 1st of the month. She never misses it because the money is gone before she checks her balance.",
          senior: "₹5,000 auto-transfer on salary day = ₹60,000 saved per year — built entirely on autopilot, before it ever has a chance to be spent.",
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Spend-first', value: 30, color: '#ef4444' },
          right: { label: 'Save-first', value: 95, color: '#10b981' },
        },
        xpReward: 20,
      },
      {
        // NEW (2026-09-29): genuine gap — nothing in the whole curriculum
        // ever explained what a bank actually DOES with money you deposit,
        // or why a savings account pays you interest at all. Flagged from
        // an external finance-101 resource's "fundamentals" section
        // ("what a bank actually does"). Placed in l-saving since that's
        // where a user is most likely wondering this — right after opening
        // or thinking about a savings account. Also now the intentional,
        // very first place "interest" is properly explained — everything
        // in the investing lessons later builds on this.
        id: 'sv3',
        title: "What Does a Bank Actually Do With Your Money?",
        body: {
          junior: "Your bank doesn't just lock your money in a safe and leave it there! It lends most of it to other people — like someone buying a house — and charges THEM interest. It then gives you a small slice of that interest for letting them borrow your money.",
          teen: "A bank isn't a storage locker for your cash. When you deposit ₹1,000, the bank keeps a small portion aside and lends most of the rest to other people and businesses — home loans, car loans, business loans — charging them a higher interest rate than it pays you. That difference is how banks make money. This is also why your money isn't 'just sitting there' — it's actively being lent out.",
          senior: "Banks run on a simple spread: they pay depositors a lower interest rate (say 3-4% on a savings account) and lend that same money out at a higher rate (say 9-12% on loans) — the gap is their profit. This is called fractional reserve banking: banks keep only a fraction of deposits on hand and lend out the rest. It's also why deposit insurance exists — in India, DICGC insures up to ₹5 lakh per depositor per bank, so if a bank fails, your money (up to that limit) is protected."
        },
        example: {
          junior: "You put ₹500 in the bank. The bank lends ₹400 of it to a family buying a scooter, charging them extra. The bank gives you a little bit of that extra as a 'thank you' for letting them use your ₹500.",
          teen: "You deposit ₹10,000 in a savings account earning 3.5% per year (₹350). The bank lends that same ₹10,000 as part of a car loan charging 10% (₹1,000). The bank keeps the ₹650 difference — that's the business model of every bank.",
          senior: "A bank holds ₹1 crore in deposits, keeps ₹10 lakh in reserve (as required), and lends out ₹90 lakh as home and business loans at 9-10%. It pays depositors 3-4% on their balances. The spread between what it pays and what it earns, across millions of accounts, is how banks are consistently profitable — and why keeping large sums outside the ₹5L DICGC insurance limit across multiple banks is a genuine safety consideration."
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'What bank pays you (~3-4%)', value: 35, color: '#3b82f6' },
            { label: 'What bank charges borrowers (~9-12%)', value: 100, color: '#10b981' }
          ]
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
      { emoji: '🏦', fact: 'DICGC (Deposit Insurance and Credit Guarantee Corporation) insures up to ₹5 lakh of your deposits per bank in India — automatically, at no cost to you. Worth knowing before choosing where to keep large sums.' },
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
          // FIX (2026-09-29): reordering the curriculum moved this lesson
          // BEFORE the investing lessons that formally define "mutual fund"
          // — so this can no longer casually say "liquid mutual fund" and
          // assume the reader already knows what that is. Added a short
          // inline gloss instead of a forward reference.
          senior: "Emergency funds should cover 3–6 months of fixed + variable expenses — not income. For a freelancer or entrepreneur, aim for 9–12 months. Keep it liquid: a savings account, or a liquid mutual fund (a low-risk pooled fund that invests in very short-term debt and lets you withdraw within a day).",
        },
        example: {
          junior: "Aryan saved ₹300 in a special envelope. When his cricket bat broke right before a match, he had the money to buy a new one — no problem!",
          teen: "Sneha had ₹12,000 in an emergency account. When her phone screen cracked during exams, she replaced it the same day without asking her parents or skipping meals.",
          senior: "Monthly expenses: ₹35,000 (rent ₹15K + food ₹8K + transport ₹5K + utilities ₹7K). Emergency fund target: ₹1.05–2.1L. Kept in a liquid fund at ~6% return.",
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
      {
        // NEW (2026-09-26): sourced from a real personal-finance Instagram post
        // (@sanjanaa.aggarwal) on WHERE specifically to park an emergency fund.
        // Added here since this lesson previously had only 1 card (thin
        // compared to every other lesson), and it directly extends ef1's
        // "keep it liquid" point with the actual how-to.
        id: 'ef2',
        title: 'Where to Actually Park It',
        body: {
          junior: "Don't just leave all your emergency money in one place doing nothing — but don't try to make it grow fast either, that's not what it's for! A couple of safe spots, used together, works best.",
          // FIX (2026-09-29): same forward-reference issue as ef1 — glossed
          // "liquid mutual funds" inline since this lesson now comes before
          // mutual funds are formally taught.
          teen: "Your emergency fund shouldn't just sit fully idle earning nothing — but it also shouldn't be chasing high returns. Both defeat the purpose. The best setup usually combines a few things: some money instantly accessible in a savings account, and some in liquid mutual funds — low-risk funds that pool many people's money into safe, short-term investments and let you withdraw within a day — for a slightly better return, so it's both safe AND not wasted.",
          senior: "An emergency fund should balance three things: safety, liquidity, and reasonable (not maximum) returns. In practice this usually means a combination of instruments rather than one: a portion instantly accessible in a savings account or sweep-in FD, and a portion in liquid mutual funds (low-risk funds investing in very short-term debt) for slightly better yield with T+1 accessibility. Splitting across instruments avoids both idle-cash waste and liquidity risk."
        },
        example: {
          junior: "Meera keeps ₹50 in her piggy bank for right-now emergencies, and asks her mom to safely hold ₹150 for bigger ones. Two spots, both safe, both there when needed.",
          teen: "Rahul keeps ₹3,000 of his ₹12,000 emergency fund in his savings account for instant access, and puts the other ₹9,000 in a liquid mutual fund earning a bit more — still accessible within a day if he really needs it.",
          senior: "A ₹1.5L emergency fund split: ₹30K in a savings account/sweep-FD for instant access, ₹1.2L in a liquid fund earning ~6-7% with T+1 withdrawal. Better returns than pure savings, without sacrificing real accessibility."
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Instant access (savings)', value: 20, color: '#3b82f6' },
            { label: 'Liquid fund (T+1)', value: 80, color: '#10b981' },
          ],
        },
        xpReward: 25,
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
    // NEW (2026-09-29): sourced from SEBI Investor Education's "Grow Your
    // Money with Power of Compounding" — a genuine gap. Nothing in the
    // curriculum ever explained WHY starting early matters mathematically,
    // even though "start investing earlier" gets said constantly in the
    // Investing chapter that follows. Placed right after Emergency Funds
    // and before Debt: it's the mathematical foundation for both — the
    // same compounding that grows savings also grows debt against you,
    // so this directly sets up the Debt Avalanche lesson next.
    id: 'l-compounding',
    topic: 'investing',
    relatedGame: 'finIQ',
    title: 'The Power of Compounding',
    estimatedMinutes: 3,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'cp1',
        title: 'Interest on Interest',
        body: {
          junior: "Compounding means you earn extra money not just on what you first saved, but ALSO on the extra money it already earned! It's like your money makes a baby, and then that baby grows up and makes its own money too.",
          teen: "Compound interest means you earn interest on your original amount PLUS on all the interest it has already earned — not just on the original amount, like simple interest does. Over many years, this difference becomes huge.",
          senior: "Compounding is interest earned on both the principal and all previously accumulated interest. Albert Einstein reportedly called it \"the eighth wonder of the world\": he who understands it, earns it; he who doesn't, pays it.",
        },
        example: {
          junior: "₹100 growing at 10% a year with compounding: Year 1 → ₹110. Year 2 → ₹121 (extra ₹1 because last year's ₹10 also earned interest!). Small, but it adds up a LOT over many years.",
          teen: "₹1,00,000 at 10% per year for 20 years: with SIMPLE interest, you'd have ₹3,00,000. With COMPOUND interest, you'd have ₹6,72,000 — more than double, for the exact same starting amount and rate.",
          senior: "₹1,00,000 @ 10% p.a. over 20 years: simple interest grows it to ₹3,00,000 (₹10,000/year, flat). Compound interest grows it to ₹6,72,000 — because each year's interest is calculated on an ever-growing base, not the original ₹1,00,000.",
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Simple interest (20yr)', value: 300000, color: '#94a3b8' },
          right: { label: 'Compound interest (20yr)', value: 672000, color: '#10b981' },
        },
        xpReward: 25,
      },
      {
        id: 'cp2',
        title: 'The Rule of 72',
        body: {
          junior: "Want a quick trick to guess how long it takes your money to DOUBLE? Divide 72 by your interest rate! At 9% a year, that's 72 ÷ 9 = 8 years to double your money.",
          teen: "The Rule of 72 is a shortcut: divide 72 by your annual return rate to estimate how many years it takes to double your money. At 9%, that's 72 ÷ 9 = 8 years. At 12%, it's just 6 years. Higher returns don't just add up — they compound the timeline too.",
          senior: "Rule of 72 (years to double) = 72 ÷ rate. Related shortcuts: Rule of 114 (years to triple) = 114 ÷ rate, and Rule of 144 (years to quadruple) = 144 ÷ rate. At 9%: double in 8 years, triple in ~12.7 years, quadruple in 16 years — the same money, purely from starting earlier.",
        },
        example: {
          junior: "At 9% a year, ₹1,000 becomes ₹2,000 in about 8 years — without adding a single extra rupee.",
          teen: "Two friends both invest ₹50,000 at 9%. Priya starts at 18, Rohan starts at 26. By age 34, Priya's money has doubled TWICE (8 years, then 8 more) to ₹2,00,000. Rohan's has only doubled once, to ₹1,00,000 — same rate, same amount, just 8 years earlier.",
          senior: "At a 9% return: money doubles in 8 years, triples in ~12.7, quadruples in 16. An investor starting at 22 sees their money quadruple by 38 with zero additional contributions — purely a function of time in the market, which is precisely why 'start early' is repeated so often in investing advice.",
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Double (Rule of 72)', value: 8, color: '#3b82f6' },
            { label: 'Triple (Rule of 114)', value: 12.7, color: '#f59e0b' },
            { label: 'Quadruple (Rule of 144)', value: 16, color: '#10b981' },
          ],
        },
        xpReward: 25,
      },
      {
        // NEW (2026-09-29): sourced from a finance-basics resource's
        // "advanced" material on real returns. Everything above shows
        // headline returns (9%, 10%) — but nothing in the curriculum yet
        // subtracts inflation and tax to show what you actually keep.
        // Placed last in this chapter since it directly builds on both
        // cp1/cp2 (compounding) and the separate Inflation content already
        // covered in the SEBI-sourced curriculum work.
        id: 'cp3',
        title: "What Return Are You Really Keeping?",
        body: {
          junior: "If your money grows by 9% in a year, but prices also went up by 6% that year, you didn't really get richer by 9% — some of that growth just kept up with things costing more. What's left after that is your REAL gain.",
          teen: "The return you see advertised (say, 9%) is your 'nominal' return. But if inflation was 6% that year, your money's actual buying power only grew by roughly 9% − 6% = 3%. That 3% is your 'real return' — the part that actually made you richer, not just kept pace with rising prices.",
          senior: "Real return ≈ nominal return − inflation − tax paid on the gain. A 9% investment return in a 6% inflation year, further reduced by tax on the gain, might leave a real return of just 1-2%. This is why comparing raw percentage returns across different investments or time periods without adjusting for inflation and tax can be seriously misleading.",
        },
        example: {
          junior: "Your ₹100 grows to ₹109 (9% return). But things that cost ₹100 last year now cost ₹106. Your real gain is only about ₹3 of actual extra buying power, not ₹9.",
          teen: "₹1,00,000 grows to ₹1,09,000 (9% return) in a year with 6% inflation. In today's buying power, that ₹1,09,000 is worth roughly what ₹1,03,000 would have been worth last year — a real return of about 3%, not 9%.",
          senior: "₹1,00,000 at 9% nominal return = ₹9,000 gain. At 6% inflation, ~₹6,000 of that gain is just offsetting rising prices. If the gain is also taxed (say 12.5% LTCG on the ₹9,000 = ₹1,125), the real, after-tax, after-inflation gain is closer to ₹1,875 — a real return of under 2%, not the 9% headline figure.",
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Nominal return', value: 9, color: '#94a3b8' },
            { label: 'Minus inflation', value: 3, color: '#f59e0b' },
            { label: 'Minus tax on gain', value: 1.9, color: '#10b981' },
          ],
        },
        xpReward: 25,
      },
    ],
    quizCard: {
      question: 'Using the Rule of 72, roughly how many years will it take to double your money at an 8% annual return?',
      options: ['6 years', '9 years', '14 years', '20 years'],
      correctIndex: 1,
      explanation: '72 ÷ 8 = 9 years. The Rule of 72 gives a fast estimate of doubling time for any steady annual return — no calculator needed.',
    },
    briefs: [
      { emoji: '🧙', fact: 'Einstein is widely (though perhaps apocryphally) credited with calling compound interest "the eighth wonder of the world" — because unlike simple interest, it grows faster the longer you leave it alone.' },
      { emoji: '⚖️', fact: 'Compounding cuts both ways: the same math that grows your savings also grows credit card debt left unpaid. A 36% APR credit card balance compounds against you exactly as powerfully as a good investment compounds for you.' },
      { emoji: '🐣', fact: 'Starting 8 years earlier at the same rate of return can mean your money doubles one extra time before you need it — often worth more than contributing extra money later ever could.' },
    ],
  },
  {
    id: 'l-debt',
    topic: 'spending',
    relatedGame: 'moneyMaze',
    title: 'Understanding Debt',
    estimatedMinutes: 4,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'd1',
        title: 'Good Debt vs Bad Debt',
        body: {
          junior: "Borrowing money isn't always bad. 'Good borrowing' helps you get something useful, like tools to earn more later. 'Bad borrowing' is for things you don't need — and you end up owing extra on top!",
          teen: 'Not all debt is bad. "Good debt" helps you build wealth or skills — like a student loan. "Bad debt" buys things that lose value and costs you extra via interest.',
          senior: 'Good debt has low interest rates and creates an asset or income: home loan, education loan, business loan. Bad debt is high-interest consumption: credit card revolving, personal loans for lifestyle, BNPL misuse.',
        },
        example: {
          junior: "If you borrow ₹50 from your sister for school notebooks and pay her back, that's smart borrowing. If you borrow ₹50 for candy and now owe her ₹60, that's not so smart!",
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
          junior: "If you owe money to more than one person, pay back whoever charges you the most extra first — that way you stop losing extra money the fastest!",
          teen: 'The avalanche method: list all debts by interest rate (highest first). Pay minimums on all — then throw every extra rupee at the highest-rate debt. Mathematically optimal.',
          senior: 'Avalanche vs Snowball: Avalanche saves the most interest. Snowball (smallest balance first) provides psychological wins. Research shows snowball produces better completion rates despite higher cost — choose what keeps you motivated.',
        },
        example: {
          junior: "You owe your brother ₹20 (no extra charge) and a friend ₹10 (he wants ₹2 extra every week). Pay your friend back first so the extra ₹2 stops piling up!",
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
      {
        // NEW (2026-09-29): sourced from a finance-basics resource's "Debt
        // & Asset Management" material on the DTI (Debt-to-Income) ratio —
        // adapted to India's actual lending heuristic, FOIR (Fixed
        // Obligation to Income Ratio), rather than the US mortgage industry's
        // 36% DTI figure, which Indian lenders don't use. Placed last in
        // this chapter since it builds on both cards above (good vs bad
        // debt, and interest rates) to answer a very practical question:
        // how much EMI is actually safe to take on.
        id: 'd3',
        title: 'How Much EMI Can You Actually Afford?',
        body: {
          junior: "Before you promise to pay back money bit by bit (an EMI), always check: after paying it, will you still have enough left for the things you actually need? If EMIs eat up almost everything, that's a warning sign.",
          teen: "Lenders in India look at your FOIR (Fixed Obligation to Income Ratio) — the share of your monthly take-home pay that goes toward all EMIs and fixed debt payments combined. As a personal rule of thumb, keeping total EMIs under 40% of your take-home pay leaves enough room for living expenses and savings without getting stretched thin.",
          senior: "FOIR (Fixed Obligation to Income Ratio) = total monthly EMI/debt obligations ÷ net take-home pay. Indian lenders commonly cap this around 40-50% when approving loans, but 'what a bank will approve' and 'what's actually comfortable' aren't the same thing — a personal ceiling closer to 35-40% leaves realistic room for an emergency fund and savings alongside every EMI you're already committed to.",
        },
        example: {
          junior: "If your total weekly EMI-style commitment is ₹40 out of ₹100 you get, that's 40% — right at the edge of comfortable. Any more and you'd struggle with everything else.",
          teen: "Take-home pay ₹20,000/month. A ₹6,000 EMI (phone + bike loan combined) = 30% FOIR — manageable. Add a ₹3,000 EMI for something else and you're at 45% — likely to feel tight every single month.",
          senior: "Take-home pay ₹60,000/month. Existing home loan EMI ₹18,000 (30% FOIR). Considering a car loan EMI of ₹12,000 would push FOIR to 50% — at or above what most lenders' own limits allow, and past the point where a job disruption or emergency becomes genuinely dangerous.",
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Comfortable (<40% FOIR)', value: 40, color: '#10b981' },
            { label: 'Lender max (~40-50%)', value: 50, color: '#f59e0b' },
            { label: 'Stretched thin (>50%)', value: 70, color: '#ef4444' },
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
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'cr1',
        title: 'What is a Credit Score?',
        body: {
          junior: "A credit score is like a trust score! It tells grown-ups whether someone pays back what they borrow, on time. The more you keep your promises to pay people back, the more they trust you with bigger things later.",
          teen: 'Your credit score is a 3-digit number that banks use to decide whether to lend you money and at what interest rate. Higher = better loan terms and lower interest rates. Every country has its own credit bureau: CIBIL in India (300–900), FICO in the USA (300–850), Experian in the UK.',
          senior: 'Credit bureaus compute your creditworthiness as a score: CIBIL in India (300–900), FICO in the USA (300–850), Experian in the UK. Scores above ~750 unlock the best loan rates. Scores below ~650 lead to rejections or high-risk premiums. Globally, the same five factors determine your score.',
        },
        example: {
          junior: "If you always pay your friend back on time when you borrow money, they'll happily lend to you again. If you forget, they won't trust you next time!",
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
          junior: "You build trust by always paying back what you borrow, on time, and by not borrowing more than you can pay back. Small promises kept build big trust over time!",
          teen: 'The fastest ways to build credit: always pay on time, keep your card balance below 30% of the limit, don\'t apply for many cards at once, and keep old accounts open.',
          senior: 'Credit-building strategy for beginners: start with a secured credit card (deposit-backed), pay in full every month, never exceed 30% utilisation. After 12–18 months of clean history, upgrade to a rewards card.',
        },
        example: {
          junior: "Ravi borrows ₹20 from his mom every week for the bus and always pays her back on Friday. After a few months, she trusts him enough to lend him more when he really needs it.",
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
    id: 'l-insurance',
    topic: 'spending',
    relatedGame: 'budgetBlitz',
    title: 'Insurance: Protecting What You Build',
    estimatedMinutes: 4,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'ins1',
        title: 'What Is Insurance?',
        body: {
          junior: "Insurance is when lots of people each pay a small amount into a shared pot, so that if something bad happens to ONE of them — like getting hurt or breaking something expensive — there's enough money to help them out.",
          teen: 'Insurance is a risk-pooling system. Everyone pays a small regular amount (a "premium"), and the fund covers large unexpected costs for whoever needs it. You are essentially sharing financial risk with thousands of strangers.',
          senior: 'Insurance transfers low-probability, high-impact financial risk to an insurer for a predictable cost. The insurer profits because most policyholders never claim — but for those who do, the payout far exceeds the premiums paid. It is the only financial product where the goal is to never "get your money\'s worth."',
        },
        example: {
          junior: "Imagine you and 20 friends each put ₹10 into a jar every month. If one friend's bike breaks, the jar pays to fix it — even though that friend only put in ₹10 themselves!",
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
          junior: "The most important insurance for anyone is health insurance — it helps pay for doctors and hospitals if you get sick or hurt, which can cost a LOT of money without it.",
          teen: 'Start with health insurance — always. If you are on a parent\'s policy, understand what it covers and when you age off. After health: renters/contents insurance if you have valuables, and eventually life insurance if others depend on your income.',
          senior: 'Priority order for most young adults: (1) Health insurance — non-negotiable. (2) Term life insurance — only if you have dependents or co-signed debt. (3) Disability insurance — often overlooked, but you are 3–4× more likely to be disabled for 3+ months than to die before 65. (4) Property insurance — renters or home. Skip whole-life and investment-linked policies as a rule: buy term, invest the difference.',
        },
        example: {
          junior: "If Meera breaks her arm and the hospital bill is ₹20,000, her family's health insurance covers most of it — so they don't have to use all their savings at once.",
          teen: 'Anaya, 19, pays ₹400/month for health insurance. Without it, a single ER visit or fracture could mean ₹50,000–₹2L in bills — a financial disaster on a student budget.',
          // FIX (2026-09-29): reordering moved this lesson before ETFs/index
          // funds are formally taught — softened the example so it no longer
          // leans on a term ("index funds") not yet introduced at this point
          // in the curriculum. The point of the example (term vs whole life)
          // doesn't need that specific detail anyway.
          senior: 'Rohan, 26, earns ₹8L/year. Term life at ₹500/month gives ₹1 crore cover — protecting his parents who depend on his income. Whole-life equivalent: ₹4,500/month for smaller cover. He invests the ₹4,000 difference instead — growing wealth on his own terms rather than paying for bundled, expensive coverage.',
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
  {
    // NEW (2026-09-29): sourced from a finance-basics resource's
    // "intermediate budgeting" material — "base your calculations on
    // take-home pay, not gross salary." A genuine gap: every quest and
    // lesson so far has just handed the reader a clean number to budget
    // with, without ever explaining that a payslip's headline number
    // (CTC/gross) isn't what actually lands in a bank account. Placed
    // right before Taxes since "what gets deducted and why" is the
    // natural bridge into "how income tax brackets work" next.
    id: 'l-takehome',
    topic: 'budgeting',
    relatedGame: 'finIQ',
    title: 'Take-Home Pay: What You Actually Get',
    estimatedMinutes: 3,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'th1',
        title: 'CTC Is Not Your Salary',
        body: {
          junior: "When someone gets a job, the number they're offered (like '₹5,00,000 a year!') isn't the amount that actually lands in their bank account. Some of it gets set aside automatically for things like tax and retirement savings before they ever see it.",
          teen: "The number in an Indian job offer — your CTC (Cost to Company) — is NOT what lands in your bank account. Before you get paid, deductions come out: income tax (TDS), your own PF (retirement savings) contribution, and sometimes professional tax. What's left is your 'take-home' or 'net' pay — often noticeably less than the CTC number that got you excited.",
          senior: "CTC includes your full cost to the employer: base salary, HRA, allowances, employer's PF contribution, and sometimes bonuses or insurance premiums that never touch your bank account at all. Take-home pay = Gross salary − TDS (tax deducted at source) − employee PF contribution − professional tax (where applicable). Budgeting off the CTC headline number instead of actual take-home pay is one of the most common first-job financial mistakes.",
        },
        example: {
          junior: "A job offer says '₹40,000 a month!' But after some is set aside automatically, only about ₹34,000 actually shows up in the bank account.",
          teen: "A ₹6,00,000 CTC offer sounds like ₹50,000/month. After TDS and PF deductions, take-home might be closer to ₹42,000/month — a ₹8,000 gap between the exciting headline number and what you can actually budget with.",
          senior: "₹8,00,000 CTC breaks down as: ₹6,40,000 base + allowances, ₹64,000 employer PF (never hits your account), ₹96,000 bonus/other. Of the ₹6,40,000 you do receive, TDS (~₹35,000) and employee PF (~₹38,000) come out before it reaches your bank — leaving roughly ₹5,67,000/year, or ~₹47,250/month take-home, well under the ₹66,667/month the ₹8L CTC headline implies.",
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'CTC headline', value: 100, color: '#94a3b8' },
            { label: 'Gross salary (excl. employer PF/bonus)', value: 88, color: '#3b82f6' },
            { label: 'Actual take-home (after TDS + PF)', value: 71, color: '#10b981' },
          ],
        },
        xpReward: 25,
      },
      {
        id: 'th2',
        title: 'Budget Off Take-Home, Not the Offer Letter',
        body: {
          junior: "Always plan your spending using the amount that actually shows up, not the bigger number from the offer — otherwise you'll plan to spend money you'll never actually see.",
          teen: "Every budgeting rule you've learned — 50/30/20, zero-based budgeting — only works correctly if you apply it to take-home pay. Apply it to CTC or gross salary instead, and you'll systematically over-plan every single category, because a chunk of that 'income' was never coming to your account at all.",
          senior: "Any financial plan built on gross or CTC figures overstates available cash by the exact size of TDS + PF deductions — often 15-25% of CTC for a salaried employee. This is precisely why the first step of any real budget is checking an actual payslip, not the offer letter, before assigning a single rupee to any category.",
        },
        example: {
          junior: "If ₹40,000 was promised but only ₹34,000 shows up, and you already planned to spend ₹38,000 based on the bigger number, you're already ₹4,000 short before the month even starts.",
          teen: "Planning 50/30/20 on a ₹50,000 'salary' (CTC/12) means ₹10,000 planned for savings. But real take-home is ₹42,000 — 20% of that is only ₹8,400. Budgeting off the wrong number means starting every month already ₹1,600 short of the savings goal.",
          senior: "A new hire budgets rent (₹15,000), lifestyle (₹15,000), and savings (₹10,000) — ₹40,000 total — based on a ₹50,000/month CTC-derived figure. Actual take-home is ₹42,500. The plan is ₹2,500/month short before any unplanned expense even happens, purely from budgeting off the wrong number.",
        },
        visual: 'none',
        xpReward: 25,
      },
    ],
    quizCard: {
      question: "You're offered a job with a CTC of ₹6,00,000/year. What should you use to plan your monthly budget?",
      options: [
        '₹6,00,000 ÷ 12 = ₹50,000/month',
        'Your actual monthly take-home pay, after TDS and PF deductions',
        'Whatever number sounds easiest to plan with',
        "Wait until you've spent a year at the job to find out",
      ],
      correctIndex: 1,
      explanation: "CTC includes deductions and employer contributions you'll never see in your bank account. Always budget off actual take-home pay — check a real payslip, not the offer letter.",
    },
    briefs: [
      { emoji: '💼', fact: "The gap between CTC and take-home pay in India is often 15-25%, made up of employee PF contribution, TDS, and sometimes professional tax — all of it invisible in the headline offer number." },
      { emoji: '📄', fact: "A payslip's 'Gross Salary' and a job offer's 'CTC' are usually two different, smaller numbers — and 'Net Pay' (take-home) is smaller again. Three different figures, and only the last one is what you can actually spend." },
      { emoji: '🏦', fact: "Employer PF contributions are real money — they're just locked away for retirement, not sitting in your bank account today. It's genuinely yours, just not yet spendable." },
    ],
  },
  {
    id: 'l-taxes',
    topic: 'taxes',
    relatedGame: 'finIQ',
    title: 'Taxes Made Simple',
    estimatedMinutes: 4,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'tx1',
        title: 'Progressive Tax: How Brackets Work',
        body: {
          junior: "When grown-ups earn money, the government takes a small part of it to pay for things everyone uses, like roads and schools. People who earn more give a bit more — but only on the EXTRA amount above a certain point, not on everything they earn!",
          teen: 'Most countries use progressive income tax — you pay low rates on lower income and higher rates on higher income. The key insight: only the income in each "bracket" is taxed at that higher rate, not your entire income.',
          senior: 'Progressive taxation means your effective tax rate (total tax ÷ total income) is always lower than your marginal rate (the rate on your top bracket). Standard deductions and retirement contributions reduce your taxable income before any bracket applies — that\'s the foundation of all legal tax optimisation.',
        },
        example: {
          junior: "Imagine your parents earn ₹100. The first ₹50 isn't taxed at all. Only the next ₹50 gets a small tax — so they don't pay tax on everything, just the part above ₹50!",
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
          junior: "There are smart, legal ways grown-ups can save some of the money they'd otherwise pay in tax — like putting money into special savings accounts for the future. It's like a reward for saving instead of spending!",
          teen: 'Most countries allow deductions that reduce your taxable income before any brackets apply. The most powerful: contributions to retirement accounts (EPF, PPF, 401k, ISA, pension). Investing here is essentially earning a government discount on top of your investment returns.',
          senior: 'Tax-advantaged accounts are the single biggest legal tax lever: employer pension matching (free money + deduction), retirement account contributions (deferred or exempt from tax), healthcare savings where available. Max these before any other investing — the combined tax benefit often delivers a higher return than the investment itself in year one.',
        },
        example: {
          junior: "If your dad puts ₹1,000 into a special retirement savings account, the government might let him pay less tax that year — so saving for later also helps him save right now!",
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
    // NEW (2026-09-29): sourced from finance-basics resources' "Net Worth
    // Tracking" material. Placed right before Investing as a deliberate
    // capstone: by this point the curriculum has covered assets (saving,
    // emergency fund) and liabilities (debt, credit) separately, but
    // nothing has ever zoomed out to combine them into the one number that
    // actually measures financial progress — which is also the natural
    // motivation for why the Investing chapter that follows matters at all.
    id: 'l-networth',
    topic: 'saving',
    relatedGame: 'finIQ',
    title: 'Net Worth: The Real Scoreboard',
    estimatedMinutes: 3,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'nw1',
        title: 'What You Own Minus What You Owe',
        body: {
          junior: "Net worth is a simple idea: add up everything you own that's worth money (savings, valuable things), then subtract anything you owe someone else. What's left over is your real financial score.",
          teen: "Net worth = Assets (everything you own of value: savings, investments, a phone you could resell) minus Liabilities (everything you owe: loans, credit card balances). It's a far better measure of financial health than income alone — someone earning a lot but owing more can have a LOWER net worth than someone earning less who owes nothing.",
          senior: "Net worth = total assets (cash, investments, home equity, other valuables) − total liabilities (loans, credit card debt, any other obligations). Unlike income, which measures cash flow in a given month, net worth measures accumulated financial position — and it's the number that actually tracks whether you're getting ahead over time, regardless of how much you earn.",
        },
        example: {
          junior: "You have ₹2,000 in savings and a bike worth ₹1,000 (assets: ₹3,000). You owe your brother ₹500 (liability). Net worth = ₹3,000 − ₹500 = ₹2,500.",
          teen: "Priya has ₹40,000 in savings, ₹20,000 in investments (assets: ₹60,000) and a ₹15,000 outstanding phone EMI (liability). Net worth = ₹60,000 − ₹15,000 = ₹45,000.",
          senior: "A 24-year-old has ₹3L in mutual funds, ₹1.5L in savings (assets: ₹4.5L) and a ₹2L outstanding personal loan plus a ₹40,000 credit card balance (liabilities: ₹2.4L). Net worth = ₹4.5L − ₹2.4L = ₹2.1L — a real number to track year over year, regardless of what their monthly salary is.",
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Assets', value: 450000, color: '#10b981' },
          right: { label: 'Liabilities', value: 240000, color: '#ef4444' },
        },
        xpReward: 25,
      },
      {
        id: 'nw2',
        title: 'Why Two People With the Same Salary Can Have Very Different Net Worth',
        body: {
          junior: "Two people can get the exact same pocket money every week, but if one saves it and the other spends every bit plus borrows more, they'll end up in very different places — even though they started with the same amount coming in.",
          teen: "Income tells you how much comes in. Net worth tells you what actually happened to it over time. A high earner who spends everything and carries debt can have a lower — even negative — net worth than a modest earner who saves consistently and avoids bad debt. Income is a flow; net worth is the result.",
          senior: "This is precisely the trap of lifestyle inflation: rising income with proportionally rising spending and debt produces income growth without net worth growth. Tracking net worth yearly — not just watching your salary go up — is the only way to know if you're actually building wealth or just spending more expensively.",
        },
        example: {
          junior: "Two kids both get ₹100/week. One saves ₹30 every week. The other spends it all and sometimes borrows ₹20 from a friend. After a year, their piggy banks look very different — even though they got the exact same amount.",
          teen: "Two friends both earn ₹30,000/month. Zara saves ₹5,000/month and has ₹0 debt — after 2 years, net worth ≈ ₹1,20,000. Dev spends everything and has a ₹40,000 credit card balance — after 2 years, net worth ≈ −₹40,000. Same income, ₹1,60,000 difference.",
          senior: "Two 28-year-olds both earn ₹12L/year. One has consistently invested 20% and avoided high-interest debt: net worth ≈ ₹18L after 5 years. The other upgraded their lifestyle with every raise and carries revolving credit card debt: net worth ≈ −₹2L after the same 5 years, despite identical income the entire time.",
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Saver (same income)', value: 120000, color: '#10b981' },
            { label: 'Spender (same income)', value: -40000, color: '#ef4444' },
          ],
        },
        xpReward: 25,
      },
    ],
    quizCard: {
      question: "Someone has ₹5,00,000 in savings and investments, and owes ₹1,50,000 across a personal loan and credit card. What is their net worth?",
      options: ['₹5,00,000', '₹1,50,000', '₹3,50,000', '₹6,50,000'],
      correctIndex: 2,
      explanation: 'Net worth = Assets − Liabilities = ₹5,00,000 − ₹1,50,000 = ₹3,50,000. Income never enters this calculation — only what you own minus what you owe.',
    },
    briefs: [
      { emoji: '📈', fact: "Financial advisors recommend recalculating net worth once a year, on the same date every year — it turns an abstract feeling of 'doing okay' or 'struggling' into an actual trackable number." },
      { emoji: '⚠️', fact: "Negative net worth (owing more than you own) is common right after taking on a student loan or starting a first job with debt — it's a starting point to improve from, not a permanent verdict." },
      { emoji: '🎯', fact: "Net worth, not salary, is what most 'financial independence' targets are actually built around — because it's the number that determines how long you could sustain yourself without any income at all." },
    ],
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
          senior: "Starting a monthly investment plan (called a SIP — Systematic Investment Plan) in a Nifty 50 Index Fund with ₹2,000 every month."
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
        // NEW (2026-09-26): sourced from a real personal-finance Instagram post
        // (@sanjanaa.aggarwal) — "buy less, buy better." Added here rather than
        // as a standalone lesson since this lesson previously had only 1 card
        // (thin compared to every other lesson's 4-6), and this is a natural
        // next step after "what is investing."
        id: 'i2',
        title: 'Buy Less, Buy Better',
        body: {
          junior: "When you start investing, don't spread your money across too many different things at once. Pick one or two good places to put it, and focus on adding more over time — not on finding the 'perfect' option.",
          teen: "When you're starting out, don't split a small amount across 5 different mutual funds hoping for 'diversification' — with a small amount, that usually just means owning tiny slices of everything and losing track. Pick 1–2 solid funds. As your income grows, increase how MUCH you invest — that matters far more than which fund you picked.",
          senior: "Splitting a small monthly investment across many funds often creates overlapping holdings (most flexicap/large-cap funds hold the same top 20-30 stocks) rather than real diversification — just a cluttered, harder-to-track portfolio. Buy less, buy better: 1-2 funds that give genuine exposure. Then redirect your energy toward increasing your investment amount as income grows — this has far more impact on your final corpus than optimising which fund outperforms by 1%."
        },
        example: {
          junior: "Aman has ₹100. Instead of putting ₹20 into five different piggy banks, he puts it all in one and adds more each week. Simple beats scattered.",
          teen: "Priya starts investing ₹1,000/month split across 5 funds (₹200 each). A better move: put the full ₹1,000 into 1 solid fund. When her stipend rises to ₹1,500, she increases the amount — not the number of funds.",
          senior: "Investor A splits ₹5,000/month across 5 flexicap funds — most hold overlapping large-cap stocks, so the 'diversification' is mostly illusion. Investor B puts ₹5,000 into 1 solid flexicap fund, and raises it to ₹8,000 when their salary increases the next year. Investor B's escalating contributions compound to a meaningfully larger corpus than Investor A's fund-hopping."
        },
        visual: 'none',
        xpReward: 25
      },
      {
        // NEW (2026-09-30): fills a real gap flagged from an external
        // finance-101 resource roundup (Morning Brew's "financial
        // instruments" guide) — this lesson covered stocks and (in l-etfs)
        // ETFs, but never explicitly named bonds or mutual funds, or the
        // core equity-vs-debt distinction that separates all three. This is
        // also the first lesson to use the term "mutual fund" — every later
        // lesson that references one (ETFs, emergency fund parking, short-
        // term trading) now comes after this definition, not before it.
        id: 'i3',
        title: 'Stocks vs. Bonds vs. Mutual Funds',
        body: {
          junior: "There are 3 main baskets for investing money. A STOCK means you own a tiny piece of a company. A BOND means you lent money to a company or the government, and they pay you back with a bit extra. A MUTUAL FUND is a basket that holds many stocks or bonds at once, run by an expert.",
          teen: "The 3 core building blocks of investing: a STOCK is equity — you own a slice of a company, so you profit if it grows (and lose if it shrinks). A BOND is debt — you're lending money to a company or government for a fixed interest rate, paid back on a schedule, regardless of how well the business does. A MUTUAL FUND pools money from many investors into a basket of stocks and/or bonds, managed by a professional fund manager.",
          senior: "Equity vs. debt is the core split. Stocks (equity) give ownership and unlimited upside, but sit last in line if a company fails. Bonds (debt) are a contractual promise of fixed interest and principal repayment — lower expected return, but paid before equity holders in any liquidation. Mutual funds aren't a separate asset class; they're a wrapper that holds a basket of either (or both), professionally managed, priced once daily at NAV."
        },
        example: {
          junior: "Stock: you own a slice of a chocolate factory — if it sells more chocolate, your slice is worth more. Bond: you lend the factory ₹100 and they promise to pay you ₹110 back next year, no matter what. Mutual fund: someone else picks 30 different chocolate factories for you, all in one basket.",
          teen: "Buy 1 Reliance share = equity, you're a part-owner. Buy a Government of India bond = debt, you get a fixed 7% per year for lending money to the government. Buy an HDFC Flexicap mutual fund = your money is spread across ~50 stocks the fund manager picked.",
          senior: "If a company goes bankrupt: bondholders get paid first (from whatever assets remain), and shareholders get whatever is left — often nothing. This is exactly why bonds are lower-risk/lower-return and stocks are higher-risk/higher-return. A mutual fund's risk depends entirely on what it holds — an equity mutual fund carries stock-like risk; a debt mutual fund carries bond-like risk."
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Stocks (higher risk/return)', value: 90, color: '#10b981' },
            { label: 'Mutual Funds (varies)', value: 60, color: '#3b82f6' },
            { label: 'Bonds (lower risk/return)', value: 30, color: '#64748b' }
          ]
        },
        xpReward: 25
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
      { emoji: '📚', fact: 'Want to go deeper on stocks, bonds, and mutual funds? Investopedia\'s free glossary and NerdWallet\'s "what are stocks" guide are two of the most trusted plain-English resources finance beginners use worldwide.' },
    ]
  },
  {
    id: 'l-etfs',
    topic: 'investing',
    relatedGame: 'stockMarketSim',
    title: 'ETFs & Index Funds',
    estimatedMinutes: 4,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'e1',
        title: 'What is an ETF?',
        body: {
          junior: "An ETF is like a basket that holds tiny pieces of LOTS of different companies at once — instead of picking just one company, you get a little bit of many!",
          teen: "An ETF (Exchange Traded Fund) is like a basket of many stocks. When you buy one ETF, you own tiny pieces of many companies at once.",
          senior: "An ETF tracks an index like the Nifty 50, holding all constituent stocks proportionally. Low expense ratios (typically 0.1–0.5%) make them highly cost-efficient vs active funds."
        },
        example: {
          junior: "It's like a mixed candy bag instead of just one candy bar — if one company does badly, you still have all the others in your basket!",
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
          junior: "Some people try to pick the one 'best' company. An ETF instead just owns a little bit of EVERYTHING — and owning everything usually wins more often than trying to guess the winner!",
          teen: "Active managers try to pick winners. Passive funds (ETFs) just follow the whole market. Statistically, the market wins more often!",
          senior: "Index funds aim for market returns (beta). Active funds aim to beat the market (alpha). However, 80% of active fund managers underperform their benchmark index over 10+ years."
        },
        example: {
          junior: "It's like picking one runner to win a race vs betting on the whole team — the whole team almost always does better over time!",
          teen: "An active manager might bet all on tech. An index fund owns tech, banking, energy, and more.",
          senior: "Passive investing removes the human error factor and significantly lowers management fees."
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Market Index', value: 100, color: '#10b981' },
            { label: 'Active Managers', value: 20, color: '#f43f5e' }
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
    id: 'l-shortterm',
    topic: 'investing',
    relatedGame: 'stockMarketSim',
    title: 'Short-Term Trading vs Long-Term Investing',
    estimatedMinutes: 3,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'st1',
        title: 'Trading vs Investing: The Difference',
        body: {
          junior: "Trading means buying something and selling it again really fast to try to make a quick profit. Investing means holding onto something for a long time and letting it grow bigger — like planting a tree instead of selling the seeds right away.",
          teen: 'Trading means buying and selling quickly to profit from price changes — sometimes in hours or days. Investing means holding for years to benefit from business growth. Both have very different risk profiles.',
          senior: 'Active traders use technical analysis, chart patterns, and momentum signals. Investors use fundamental analysis: revenue, earnings, moat, management quality. Academic research consistently shows that long-term passive index investing outperforms active trading for retail investors after fees and taxes.',
        },
        example: {
          junior: "If you buy a rare trading card for ₹50 and try to sell it tomorrow for ₹60, that's trading — quick and risky. If you keep a good stock for 10 years and it grows a lot, that's investing — usually safer.",
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
          junior: "Short selling is a tricky, advanced move where someone bets a price will go DOWN. If they're wrong and it goes up a lot instead, they can lose way more money than they started with — this is really for grown-up experts, not beginners!",
          teen: 'Short selling is betting that a stock will FALL. You borrow shares, sell them now, buy them back cheaper later, and return them — keeping the difference. If the price rises, you lose — with no cap on how much.',
          senior: 'Shorting mechanics: borrow shares via broker margin account, sell at market price, monitor, cover by buying back. Risk: unlimited upside on the stock means unlimited downside loss. Requires a margin account, maintenance margin requirements, and daily mark-to-market. Not suitable for retail investors without deep experience.',
        },
        example: {
          junior: "Imagine borrowing your friend's bike, selling it for ₹200, planning to buy it back cheaper later and return it. If the bike suddenly becomes worth ₹500, you're in big trouble — you still have to buy it back to give it back!",
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
      {
        // NEW (2026-09-29): genuine gap — "leverage" was named in passing
        // nowhere in the curriculum despite being one of the fundamentals
        // an external finance-101 resource explicitly calls out. It's the
        // natural companion to short selling (both covered here as
        // "advanced, handle with care" concepts) — leverage is what makes
        // margin trading and short selling possible in the first place.
        id: 'st3',
        title: 'Leverage: Borrowing to Invest',
        body: {
          junior: "Leverage means borrowing money to buy more of something than you could afford with just your own money — hoping it grows enough to pay back the loan AND leave you extra. Sounds great when it works! But if the price falls instead, you can lose more money than you actually had to begin with.",
          teen: "Leverage means using borrowed money to increase the size of an investment. If you have ₹10,000 and borrow another ₹10,000 to invest ₹20,000 total, any gain or loss is now doubled compared to investing just your own money. This is why leverage is often described as a 'double-edged sword' — it magnifies profits, but it magnifies losses by exactly the same amount.",
          senior: "Leverage (margin trading) lets you control a larger position than your own capital would allow, by borrowing the rest from a broker. A 2x leveraged position doubles both gains and losses relative to price movement. The real danger is the margin call: if the position moves against you enough, the broker can force-sell your holdings to cover the loan — often at the worst possible time, locking in losses you might have recovered from if you'd simply waited it out unleveraged."
        },
        example: {
          junior: "You have ₹100 and borrow ₹100 more to buy a ₹200 toy you plan to resell. If you sell it for ₹250, you pay back the ₹100 loan and keep ₹150 — more than double your original ₹100! But if you can only sell it for ₹150, you still owe ₹100 back — leaving you with just ₹50, half of what you started with.",
          teen: "Without leverage: ₹10,000 invested, stock drops 20% → you lose ₹2,000 (20% of your money). With 2x leverage: ₹10,000 of your own + ₹10,000 borrowed = ₹20,000 invested, same 20% drop → you lose ₹4,000, which is 40% of YOUR original ₹10,000. The stock only moved 20%; your loss doubled.",
          senior: "A trader puts up ₹1L margin to control a ₹5L leveraged position (5x). A 10% adverse move wipes out 50% of their actual capital. If it moves 20% against them, they're wiped out entirely and may owe the broker more — this is exactly how margin calls force liquidation at the bottom, turning a recoverable dip into a permanent loss."
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'No leverage: -20% move = -20% loss', value: 20, color: '#10b981' },
          right: { label: '2x leverage: -20% move = -40% loss', value: 40, color: '#ef4444' }
        },
        xpReward: 25,
      },
      {
        // NEW (2026-09-29): sourced from finance-basics resources' capital
        // gains material — genuine gap. Everything else in this chapter
        // compares trading vs investing on RISK; nothing compared them on
        // the actual TAX consequence, even though senior-track cards above
        // already gesture at "long-term gets a lower rate" without ever
        // stating what that rate is. Uses verified current (2026) Indian
        // equity capital gains rates rather than guessing — confirm these
        // are still current before reusing this content in future years,
        // since these rates do change with the Union Budget.
        id: 'st4',
        title: 'The Tax Difference Between Trading and Investing',
        body: {
          junior: "The government also takes a small cut when you sell an investment for a profit. If you sell something you've held for less than a year, it takes a bigger cut than if you'd held it for over a year. That's one more reason patience pays.",
          teen: "When you sell an investment for a profit, that profit (called a 'capital gain') is taxed differently depending on how long you held it. Sell within 12 months and it's a Short-Term Capital Gain (STCG), taxed at a flat rate. Hold for over 12 months and it becomes a Long-Term Capital Gain (LTCG), which gets a lower rate — and a yearly tax-free allowance on top.",
          senior: "For equity and equity mutual funds in India (rates as of 2026 — these are set by the Union Budget and do change): STCG (held under 12 months) is taxed at 20%. LTCG (held 12+ months) is taxed at 12.5%, with the first ₹1.25 lakh of LTCG gains in a financial year completely tax-free. The same profit, purely by waiting past the 12-month mark, can move from a 20% tax rate to a 12.5% rate with a tax-free allowance — a real, legal reward for holding rather than trading.",
        },
        example: {
          junior: "Sell a ₹100 profit after 6 months, and the government's cut is bigger. Wait past a year to sell the same ₹100 profit, and the cut is smaller.",
          teen: "₹50,000 profit from shares sold after 8 months (STCG): taxed at 20% = ₹10,000 tax. The same ₹50,000 profit from shares sold after 14 months (LTCG): taxed at 12.5%, and if it's your only gain that year, the first ₹1,25,000 is tax-free — so you might owe ₹0.",
          senior: "An investor books ₹2,00,000 in gains after 10 months (STCG): tax = 20% × ₹2,00,000 = ₹40,000. The same ₹2,00,000 gain after 13 months (LTCG): the first ₹1,25,000 is exempt, leaving ₹75,000 taxed at 12.5% = ₹9,375. Same trade, same profit — an ₹30,625 tax difference purely from a 3-month wait.",
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'STCG (<12mo): 20% tax', value: 40000, color: '#ef4444' },
          right: { label: 'LTCG (12mo+): 12.5%, ₹1.25L exempt', value: 9375, color: '#10b981' },
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
      { emoji: '⚠️', fact: 'Leverage was a central cause of the 2008 financial crisis — banks and investors had borrowed so heavily that even a modest fall in housing prices wiped out entire firms. Leverage doesn\'t just multiply your risk; at scale, it multiplies everyone\'s.' },
    ],
  },
  {
    id: 'l-crypto',
    topic: 'investing',
    relatedGame: 'stockMarketSim',
    title: 'Crypto & High-Risk Assets',
    estimatedMinutes: 3,
    // FIX (2026-09): was senior-only with blank junior AND teen text — the
    // only lesson missing two age tiers instead of one. Adding both closes
    // the gap consistently rather than leaving teen stranded while junior
    // gets access.
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'c1',
        title: 'What is Cryptocurrency?',
        body: {
          junior: "Crypto is a kind of money that only exists on computers — no coins or notes! Its price can jump up or crash down A LOT, much more wildly than normal money, because no company or government stands behind it.",
          teen: "Cryptocurrency (like Bitcoin) is digital money not controlled by any government or bank. Unlike a company's stock, there's no business behind it earning profits — its value comes purely from what other people are willing to pay for it.",
          senior: "Crypto (Bitcoin, Ethereum etc.) is a digital currency with no government backing. Unlike stocks, crypto has no underlying business earnings to support its value — price is purely based on what someone else will pay for it."
        },
        example: {
          junior: "It's like a rare digital trading card — some days everyone wants it and the price shoots up, other days nobody wants it and the price crashes.",
          teen: "One Bitcoin might be worth a lot today and much less next month — its price depends entirely on demand, not on any factory or store making money.",
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
          junior: "Crypto prices can crash really fast — sometimes losing most of their value in just a few months. Never touch this without a trusted adult, and never with money you can't afford to lose.",
          teen: "Crypto is extremely volatile — drops of 70-90% have happened more than once. There's little to no regulation, so if an exchange collapses or a wallet gets hacked, there's often no way to get your money back.",
          senior: "Crypto is extremely volatile. Crashes of 70–90% are common. There is no regulation in India, meaning no legal recourse if an exchange collapses or your wallet is hacked."
        },
        example: {
          junior: "Imagine a toy that was worth ₹500 last month and is only worth ₹100 today — that's how fast crypto prices can fall.",
          teen: "Bitcoin dropped 83% in 2018 and 77% in 2022 — money invested could have shrunk to less than a fifth of its value in months.",
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
  // ── Peter Lynch Stock Framework ──────────────────────────────────────────
  {
    id: 'l-stock-analysis',
    topic: 'investing',
    relatedGame: 'stockMarketSim',
    title: 'Pick Stocks Like Peter Lynch',
    estimatedMinutes: 4,
    // FIX (2026-09): this had full, well-written junior body/example text on
    // every card (lemonade-stand analogies etc.) but was still excluded from
    // junior's ageGroups — an oversight, not a deliberate content gap like
    // the other teen/senior-only lessons (which have genuinely blank junior
    // text). Note: the quizCard below (PEG ratio, promoter buying) isn't
    // junior-adapted — that's fine since it doesn't block completion XP, but
    // it's not fully polished for junior yet either.
    ageGroups: ['junior', 'teen', 'senior'],
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
        // FIX (2026-09-25): was { items: [...] } — the renderer's 'comparison'
        // case (LessonViewer.tsx renderVisual) destructures { left, right }
        // from visualData, same as every other lesson using this visual type.
        // This one card was the sole exception, authored with a shape that
        // matches the DIFFERENT 'bar' visual type instead. left/right came
        // back undefined, and reading .value off undefined crashed the app
        // on this, the final card of the lesson, right before the quiz.
        visualData: {
          left: { label: 'Stock A (PEG 2.0, Expensive)', value: 40, color: '#ef4444' },
          right: { label: 'Stock B (PEG 0.8, Value)', value: 80, color: '#10b981' }
        },
        xpReward: 30,
      },
      {
        // NEW (2026-09-26): sourced from a real Instagram post (@sanjanaa.aggarwal)
        // specifically correcting a misconception visible in that post's own
        // comments — people were reading "promoter buying" as an automatic buy
        // signal. sl-4 already mentions promoter buying as Lynch's Q4 in one
        // line; this deepens it with the actual checklist, and directly sets
        // up the new 'promoter-buying-trap' quest in quests.ts.
        id: 'sl-5',
        title: 'Promoter Buying: Signal, Not a Green Light',
        body: {
          junior: "If the people who run a company buy more of it with their own money, that's interesting — but it doesn't automatically mean you should buy too! Always check a few more things first.",
          teen: "When a company's founders buy more shares with their own money, it's worth paying attention to — nobody understands a business better than the people running it. But promoter buying ALONE is never enough to invest. Always also check: is the business actually growing? Is the stock reasonably priced? Is the promoter buying a meaningful amount (not a token gesture)? Is there a real reason behind it (new orders, expansion, industry tailwind)?",
          senior: "Promoter buying is a legitimate signal — insiders rarely buy without conviction. But it's a starting point for research, not a buy trigger. Cross-check: revenue/profit/cash-flow growth, valuation reasonability, whether the buying is a meaningful stake increase (not symbolic), and whether there's a genuine catalyst behind it. The strongest setups combine promoter buying with strong fundamentals AND reasonable valuation — never promoter buying alone."
        },
        example: {
          junior: "Just because the owner of a candy shop buys more candy machines doesn't mean the shop is doing well — check if people are actually buying candy first!",
          teen: "NovaTech's promoter just bought ₹50 lakh more shares — exciting! But before following: are NovaTech's sales actually growing? Is the stock already expensive? Is ₹50L a big deal for a promoter worth ₹500 crore, or is it symbolic? Check before you follow.",
          senior: "Two companies both show promoter buying. Company A: strong revenue growth, reasonable P/E, promoter bought 2% of their existing holding (meaningful), clear expansion catalyst. Company B: flat revenue, high P/E, promoter bought 0.1% of their holding (symbolic), no stated reason. Same headline signal, very different quality — the checklist is what separates them."
        },
        visual: 'none',
        xpReward: 25,
      },
      {
        // NEW (2026-09-30): fills a gap flagged from an external finance-101
        // resource roundup's "value vs. growth investing" category — this
        // lesson taught Lynch's PEG-ratio framework in detail (sl-4) but
        // never named the two classic investing schools PEG is actually
        // built to bridge. Placed last so it reframes everything just taught
        // as "Lynch = GARP, a deliberate blend of both schools."
        id: 'sl-6',
        title: 'Value vs. Growth: Which School Is Lynch?',
        body: {
          junior: "There are two classic ways people pick stocks. VALUE investors look for good companies that are 'on sale' — cheap compared to how much they're really worth. GROWTH investors look for companies growing super fast, even if they cost more right now. Peter Lynch's method mixes both — cheap AND growing.",
          teen: "Two classic investing styles: VALUE investing (made famous by Warren Buffett) hunts for solid, unglamorous companies trading below their real worth — patience over excitement. GROWTH investing chases companies with fast-rising revenue, often paying a high price today for a bigger future. Lynch's PEG ratio (which you just learned) is literally designed to combine both — it's called GARP: Growth At a Reasonable Price.",
          senior: "Value investing (Graham, Buffett) targets a margin of safety — low P/E and P/B ratios, betting the market has mispriced a fundamentally sound business. Growth investing accepts high current valuations in exchange for a high expected future earnings trajectory (common in tech, biotech). These aren't opposing camps by accident — decades of market cycles have favoured each style in turns. Lynch's PEG ratio is the bridge: it explicitly prices growth relative to what you're paying, refusing to accept 'it's growing fast' as a reason to ignore valuation, and refusing to accept 'it's cheap' as a reason to ignore whether it's actually going anywhere."
        },
        example: {
          junior: "Value investor: 'This toy is great and it's on sale — buying it!' Growth investor: 'This toy is popular and getting more popular every week — buying it even at full price!' Lynch: 'I want the toy that's popular AND still reasonably priced.'",
          teen: "Value pick: a boring bank stock trading cheap relative to its steady profits. Growth pick: a fast-scaling startup with no profits yet, priced on hope for 2030. Lynch's PEG check would reject an overpriced growth stock (PEG > 2) just as fast as it would flag a 'cheap' stock that isn't actually growing (low P/E for a real reason — it's dying).",
          senior: "Amazon in the early 2010s was a classic growth pick — high P/E, thin profits, priced on future dominance, and it worked. A regional bank trading at 0.8x book value with steady 12% ROE is a classic value pick. Neither approach is 'correct' in isolation; PEG-driven GARP investing (Lynch's actual method) tries to avoid both the value trap (cheap because it deserves to be) and the growth trap (priced for perfection with no room for error)."
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Value Investing', value: 70, color: '#3b82f6' },
          right: { label: 'Growth Investing', value: 70, color: '#10b981' }
        },
        xpReward: 25,
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
      { emoji: '📖', fact: 'Curious about value vs. growth investing beyond Lynch? Warren Buffett\'s own 1992 shareholder letter and "The Intelligent Investor" by Benjamin Graham are the two most-cited starting points, even 30+ years later.' },
    ],
  },
];
