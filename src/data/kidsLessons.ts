import type { Lesson, LessonCard } from './lessons';

/**
 * MONEY BASICS FOR KIDS (ages 9–12) — added 2026-10-16.
 *
 * Eight short lessons for the junior track, following the same teaching
 * sequence as the FDIC's "Money Smart Basics for Kids" (what a bank is → goals
 * and saving → budgeting and shopping → sharing → compound interest → earning
 * → loans and credit → small business). The FDIC page was used ONLY as a
 * topic outline; all wording, examples and numbers here are original and
 * localised to ₹ and Indian settings. The FDIC's own two characters are not
 * used. Source: https://www.fdic.gov/consumer-resource-center/money-smart-basics-kids
 * (its Chapter 9 "Money and Banking Overview" is a review, which this app
 * covers with the fun facts + quiz at the end of every lesson instead).
 *
 * Child-safety notes (Families policy / Indian law):
 *  - "Earning" is framed around allowance, chores and small projects done WITH
 *    a grown-up. Nothing here suggests that children under 14 take jobs.
 *  - Any account, loan or business idea is explicitly done with a parent or
 *    guardian. No lesson asks a child to share personal or financial details.
 *
 * Maths checked in code:
 *  - ₹600 goal at ₹50/week = 12 weeks. ₹1,000 at 8% for 10 years = ₹2,159
 *    (1.08^10 = 2.1589). ₹100 borrowed, ₹110 repaid = 10% extra.
 *  - Lemonade: 20 cups × ₹10 = ₹200 sales − ₹120 costs = ₹80 profit.
 */

const same = (t: string) => ({ junior: t, teen: t, senior: t });

const card = (
  id: string,
  title: string,
  body: string,
  example: string,
  visual: LessonCard['visual'],
  visualData: any,
  xpReward = 20
): LessonCard => ({ id, title, body: same(body), example: same(example), visual, visualData, xpReward });

export const kidsLessons: Lesson[] = [
  {
    id: 'k-bank',
    topic: 'saving',
    relatedGame: 'budgetBlitz',
    title: 'Kids: What Is a Bank?',
    estimatedMinutes: 3,
    ageGroups: ['junior'],
    cards: [
      card('kb1', 'A Safe Place for Money',
        "A bank is a place that keeps people's money safe. It has strong locks, guards and cameras. That is much safer than keeping a lot of money at home.",
        "Think of a bank like a giant, super-safe piggy bank that many families share. Each family gets its own account, and only that family can take its money out.",
        'chain',
        { steps: [
          { title: 'You put money into your account', note: 'This is called a deposit.' },
          { title: 'The bank keeps it safe', note: 'Locks, alarms and rules protect it.' },
          { title: 'You take money out when you need it', note: 'This is called a withdrawal.' }
        ] }),
      card('kb2', 'Banks Pay You to Wait',
        "When you keep money in a savings account, the bank uses a little of everyone's money to help other people. To say thank you, it adds a little extra money to yours. That extra money is called interest.",
        "You keep ₹1,000 in a savings account for a year. The bank adds a little extra, so you end up with a bit more than you started with. A piggy bank never does that.",
        'comparison',
        { left: { label: 'Piggy bank after a year', value: 1000, color: '#94a3b8' }, right: { label: 'Savings account after a year', value: 1040, color: '#10b981' }, prefix: '₹' }),
      card('kb3', 'Keep Your Secrets Secret',
        "Some things about your money are secret: your PIN, passwords and the codes that come on a phone. Never tell them to anyone except a parent or guardian. A real bank will never ask you for them.",
        "A message says, 'You won a prize! Send us your secret code.' Do not reply. Show it to a grown-up. Real prizes never need your secret codes.",
        'none', null)
    ],
    quizCard: {
      question: "Someone online asks for your secret PIN to give you a prize. What do you do?",
      options: ["Don't share it and tell a grown-up", "Send it quickly", "Send half of it", "Ask a friend to send it"],
      correctIndex: 0,
      explanation: "Secret codes are keys to your money. Real banks and real prizes never ask for them. Tell a trusted grown-up instead."
    },
    briefs: [
      { emoji: '🏦', fact: 'Banks in India are watched by the Reserve Bank of India (RBI), which sets rules so people\'s money stays safe.' },
      { emoji: '🔑', fact: 'To open a bank account as a child, you usually need a parent or guardian to help you.' },
      { emoji: '🐷', fact: 'A piggy bank keeps your money, but only a bank account can add interest to it.' }
    ]
  },

  {
    id: 'k-goals',
    topic: 'saving',
    relatedGame: 'budgetBlitz',
    title: 'Kids: Goals and Saving',
    estimatedMinutes: 3,
    ageGroups: ['junior'],
    cards: [
      card('kg1', 'Pick a Goal',
        "A saving goal is something you want and are willing to wait for. Good goals are clear: you know exactly what it is, how much it costs, and when you want it.",
        "Goal: a ₹600 football. Without a plan it feels far away. With a plan — save ₹50 each week — you can count down to the day you buy it.",
        'none', null),
      card('kg2', 'Small Steps Add Up',
        "Saving a little at a time works. The trick is to save first, before you spend. Put your saving away on the day your pocket money arrives.",
        "₹600 goal, ₹50 saved every week: after 4 weeks you have ₹200, after 8 weeks ₹400, and after 12 weeks you have the whole ₹600.",
        'line',
        { points: [{ x: 0, y: 0 }, { x: 4, y: 200 }, { x: 8, y: 400 }, { x: 12, y: 600 }], label: 'Savings (₹) after each week' }),
      card('kg3', 'Waiting Is a Superpower',
        "Waiting for what you want is called delayed gratification, and it is a real money superpower. When you wait, you can buy something bigger and better, and you stop buying things you forget about in a week.",
        "Option A: spend ₹50 on a snack today. Option B: save it for 12 weeks and buy the ₹600 football. Both are okay, but only one gets you the football.",
        'none', null)
    ],
    quizCard: {
      question: "You want a ₹600 football and save ₹50 each week. How many weeks until you can buy it?",
      options: ["12 weeks", "6 weeks", "10 weeks", "20 weeks"],
      correctIndex: 0,
      explanation: "₹600 ÷ ₹50 = 12 weeks. A clear goal plus a steady amount makes waiting easy to count down."
    },
    briefs: [
      { emoji: '📅', fact: 'Putting your saving away first, before you spend, is called "paying yourself first".' },
      { emoji: '🎯', fact: 'A goal with a number and a date is much easier to reach than "I want to save more".' },
      { emoji: '⏳', fact: 'Waiting is a skill you can practise. Each time you wait for something you really want, the next wait gets a little easier.' }
    ]
  },

  {
    id: 'k-budget',
    topic: 'budgeting',
    relatedGame: 'budgetBlitz',
    title: 'Kids: Budgeting and Smart Shopping',
    estimatedMinutes: 3,
    ageGroups: ['junior'],
    cards: [
      card('kbd1', 'Needs, Wants and a Plan',
        "A budget is a plan for your money. First you cover your needs (things you must have). Then you choose wants (things that are nice to have). Then you save.",
        "You get ₹300 for a school trip. A water bottle (a need) costs ₹100. A sticker pack (a want) costs ₹80. That leaves ₹120 to save or spend on something else.",
        'bar',
        { items: [{ label: 'Needs', value: 100, color: '#2e72db' }, { label: 'Wants', value: 80, color: '#f59e0b' }, { label: 'Left to save', value: 120, color: '#10b981' }], prefix: '₹' }),
      card('kbd2', 'Compare Before You Buy',
        "Smart shoppers compare. The same thing can cost different amounts in different shops, and a bigger pack is not always cheaper per piece. Look at the price for one item.",
        "Pack A has 5 pencils for ₹50, so each costs ₹10. Pack B has 8 pencils for ₹72, so each costs ₹9. Pack B is the better deal.",
        'comparison',
        { left: { label: 'Pack A: price per pencil', value: 10, color: '#ef4444' }, right: { label: 'Pack B: price per pencil', value: 9, color: '#10b981' }, prefix: '₹' }),
      card('kbd3', 'Speed Bumps',
        "Sometimes a surprise cost shows up: a friend's birthday gift, a broken pencil box. A good budget keeps a little extra money for surprises so a plan doesn't fall apart.",
        "Always keep a small 'oops' amount, for example ₹20 out of every ₹200. If nothing surprising happens, it adds to your savings.",
        'none', null)
    ],
    quizCard: {
      question: "Pack A: 5 pencils for ₹50. Pack B: 8 pencils for ₹72. Which is the better deal?",
      options: ["Pack B, ₹9 per pencil", "Pack A, ₹10 per pencil", "They are the same", "You can't tell"],
      correctIndex: 0,
      explanation: "₹72 ÷ 8 = ₹9 per pencil, which is less than ₹50 ÷ 5 = ₹10. Dividing to get the price for one is the best way to compare."
    },
    briefs: [
      { emoji: '🛒', fact: 'Shops often put the items they most want to sell at eye level. A cheaper alternative is often higher or lower on the shelf.' },
      { emoji: '🧾', fact: 'Asking for a bill and keeping it helps if you need to return or fix something.' },
      { emoji: '✏️', fact: 'Writing down what you spend for just one week helps you spot where your money disappears.' }
    ]
  },

  {
    id: 'k-sharing',
    topic: 'spending',
    relatedGame: 'budgetBlitz',
    title: 'Kids: Sharing as Part of the Plan',
    estimatedMinutes: 3,
    ageGroups: ['junior'],
    cards: [
      card('ks1', 'Spend, Save, Share',
        "A smart money plan has room for three things: spending on what you need and want, saving for later, and sharing with others. Sharing can be giving money, time or help.",
        "You get ₹100. A simple plan: ₹50 to spend, ₹30 to save and ₹20 to share. You can change the numbers, as long as every part has a job.",
        'pie',
        { segments: [{ label: 'Spend', value: 50, color: '#2e72db' }, { label: 'Save', value: 30, color: '#10b981' }, { label: 'Share', value: 20, color: '#f59e0b' }] }),
      card('ks2', 'Ways to Share',
        "You do not need a lot of money to share. You can give a small amount to a cause, donate toys or books you've outgrown, or help a neighbour. Doing it with a parent keeps you safe.",
        "Your class collects books for a village library. You give two books you have already read, and you also add ₹10 from your sharing part. Together, many small gifts do big things.",
        'none', null),
      card('ks3', 'Be Careful Who You Give To',
        "Only give to causes that a trusted grown-up has checked. Some people pretend to collect money for good causes but keep it. Never send money to strangers online.",
        "A message says, 'Send ₹50 right now to help a sick puppy!' Show it to a grown-up. Real charities let you take your time and check them first.",
        'none', null)
    ],
    quizCard: {
      question: "You get ₹100 and split it ₹50 spend, ₹30 save, ₹20 share. How much do you save?",
      options: ["₹30", "₹20", "₹50", "₹100"],
      correctIndex: 0,
      explanation: "₹30 goes into savings. The plan has three jobs for your money: spend, save and share."
    },
    briefs: [
      { emoji: '🤝', fact: 'Giving your time, like helping a neighbour or cleaning up a park, counts as sharing too.' },
      { emoji: '🧺', fact: 'Giving away things you have outgrown, like clothes and books, helps others and costs you nothing.' },
      { emoji: '✅', fact: 'Always ask a grown-up to help you check that a charity is real before giving.' }
    ]
  },

  {
    id: 'k-interest',
    topic: 'investing',
    relatedGame: 'finIQ',
    title: 'Kids: The Money Snowball',
    estimatedMinutes: 4,
    ageGroups: ['junior'],
    cards: [
      card('ki1', 'Interest on Interest',
        "Compound interest is like a snowball rolling downhill. Your money earns interest. Then that interest earns interest too. The longer it rolls, the bigger the snowball gets.",
        "Year 1: ₹1,000 earns a little extra and becomes ₹1,080. Year 2: the extra is earned on ₹1,080, not just ₹1,000. Each year the extra gets a bit bigger.",
        'line',
        { points: [{ x: 0, y: 1000 }, { x: 2, y: 1166 }, { x: 4, y: 1360 }, { x: 6, y: 1587 }, { x: 8, y: 1851 }, { x: 10, y: 2159 }], label: '₹1,000 growing at 8% a year (example, not a promise)' }),
      card('ki2', 'Time Is the Secret Ingredient',
        "Starting early matters more than starting big. A snowball that has rolled for ten years is far bigger than one that has just begun. That is why even small savings start now.",
        "₹1,000 at 8% a year becomes about ₹2,159 after 10 years without adding anything. That's more than double, just from waiting.",
        'comparison',
        { left: { label: 'Your ₹1,000 today', value: 1000, color: '#94a3b8' }, right: { label: 'After 10 years at 8%', value: 2159, color: '#10b981' }, prefix: '₹' }),
      card('ki3', 'The Snowball Works Against You Too',
        "The same snowball effect works when you owe money. If you borrow and do not pay it back, the interest you owe keeps growing, too. So the snowball is great for saving and bad for debt.",
        "That is why grown-ups say, 'Pay what you borrow back on time.' Waiting makes saving bigger, but it makes debt bigger too.",
        'none', null)
    ],
    quizCard: {
      question: "What makes a money snowball (compound interest) grow bigger?",
      options: ["Time, because interest earns more interest", "Spending it quickly", "Hiding it at home", "Lending it to friends"],
      correctIndex: 0,
      explanation: "Compound interest grows as interest earns interest. The longer you leave money to grow, the bigger the snowball gets."
    },
    briefs: [
      { emoji: '⛄', fact: 'Compound interest is often called "interest on interest". It is what makes savings accounts grow faster over many years.' },
      { emoji: '🌱', fact: 'A tree grows slowly at first and then very fast. Compound interest behaves the same way.' },
      { emoji: '📝', fact: 'The numbers in this lesson are examples. Real interest rates change from bank to bank and from year to year.' }
    ]
  },

  {
    id: 'k-earning',
    topic: 'budgeting',
    relatedGame: 'budgetBlitz',
    title: 'Kids: Where Does Money Come From?',
    estimatedMinutes: 3,
    ageGroups: ['junior'],
    cards: [
      card('ke1', 'Money Comes From Work',
        "Grown-ups earn money by doing a job. They use their skills and time to help people, and in return they get paid. That pay is called income.",
        "A doctor helps sick people, a farmer grows food, a driver takes people places. Each job helps someone, and each gets paid for it.",
        'none', null),
      card('ke2', 'What Kids Can Do',
        "Children under 14 should not take jobs. But you can learn about money at home: pocket money, helping with extra chores, and small projects with a grown-up, like making cards or helping at a family stall.",
        "You help wash the car every Sunday and your parent gives you ₹30. You have learned that money comes from effort, and you can plan what to do with it.",
        'none', null),
      card('ke3', 'Skills Earn More',
        "The more you learn, the more things you can do well. Many grown-up jobs need skills that take years to build, like reading, maths and working with others. School is how you build them.",
        "A person who learns to fix phones, bake cakes or write computer programs can help more people, and often earns more, than someone who has no training.",
        'none', null)
    ],
    quizCard: {
      question: "Which is the best way for a child under 14 to start learning about earning?",
      options: ["Pocket money and chores at home with a grown-up", "Taking a full-time job", "Asking strangers for money", "Selling things to people they don't know"],
      correctIndex: 0,
      explanation: "Children under 14 should not work in jobs. Pocket money, chores and projects at home are safe ways to practise planning with money."
    },
    briefs: [
      { emoji: '👷', fact: 'In India, the law does not allow most paid jobs for children under 14, so learning about earning happens at home and at school.' },
      { emoji: '🧠', fact: 'The skills you build in school, like reading, maths and teamwork, are the ones most grown-up jobs depend on.' },
      { emoji: '🎨', fact: 'Many people turn hobbies like art, music or cooking into careers when they are older.' }
    ]
  },

  {
    id: 'k-borrow',
    topic: 'credit',
    relatedGame: 'moneyMaze',
    title: 'Kids: Borrowing and Credit',
    estimatedMinutes: 3,
    ageGroups: ['junior'],
    cards: [
      card('kc1', 'Borrowing Costs Extra',
        "Borrowing means using someone else's money and promising to pay it back. Banks and lenders usually charge a fee for it, called interest. So you always pay back more than you borrowed.",
        "You borrow ₹100 and promise to pay back ₹110. The extra ₹10 is the interest. It is the price of using the money before you've earned it.",
        'comparison',
        { left: { label: 'You borrow', value: 100, color: '#94a3b8' }, right: { label: 'You pay back', value: 110, color: '#ef4444' }, prefix: '₹' }),
      card('kc2', 'Borrow Only When It Makes Sense',
        "Borrowing can help with big things that a family can't pay for all at once, like a house or a school fee. It is a poor choice for little wants you can save for.",
        "Borrowing to buy a ₹50 toy is a bad idea, because you can easily save for it. Saving for a few weeks costs nothing.",
        'none', null),
      card('kc3', 'A Promise to Pay Back',
        "Lenders keep a record of whether people pay back on time. Paying back on time builds trust, and that trust is called good credit. It makes borrowing cheaper when you're grown up.",
        "If a friend borrows your pen and always returns it on time, you'll happily lend again. Banks think the same about people who pay back on time.",
        'none', null)
    ],
    quizCard: {
      question: "You borrow ₹100 and pay back ₹110. What is the extra ₹10 called?",
      options: ["Interest", "A prize", "A discount", "A gift"],
      correctIndex: 0,
      explanation: "Interest is the price of borrowing. The longer you borrow, the more it usually adds up."
    },
    briefs: [
      { emoji: '🤝', fact: 'Credit comes from an old word meaning "trust". Good credit means people trust you to pay back what you borrow.' },
      { emoji: '📚', fact: 'Some loans, like the ones for education, can be worth it because they help you earn more later.' },
      { emoji: '🙅', fact: 'If someone asks a child to borrow money or sign a loan, the answer is always "ask a grown-up first".' }
    ]
  },

  {
    id: 'k-business',
    topic: 'investing',
    relatedGame: 'finIQ',
    title: 'Kids: Your Own Small Business',
    estimatedMinutes: 4,
    ageGroups: ['junior'],
    cards: [
      card('kbz1', 'Make Something People Want',
        "A business solves a problem or makes something people like. A good idea starts with a question: who will buy this, and why? Always test an idea with a grown-up's help.",
        "Idea: a lemonade stand at a family fair, run with your parents. People are hot and thirsty, so many will want a cold drink.",
        'none', null),
      card('kbz2', 'Income, Costs and Profit',
        "Income is the money coming in from sales. Costs are the money you spend to make your product. Profit is what's left: income minus costs. Profit is the reward for the work.",
        "You sell 20 cups of lemonade at ₹10 each, so income is ₹200. Lemons, sugar and cups cost ₹120. Profit = ₹200 − ₹120 = ₹80.",
        'bar',
        { items: [{ label: 'Income (sales)', value: 200, color: '#2e72db' }, { label: 'Costs', value: 120, color: '#ef4444' }, { label: 'Profit', value: 80, color: '#10b981' }], prefix: '₹' }),
      card('kbz3', 'Price It Right',
        "If your price is too low, you may lose money. If it is too high, no one buys. Add up your costs for each item, then add a fair profit. Always ask a grown-up to help check your numbers.",
        "Each cup costs ₹6 to make. If you sell at ₹5, you lose ₹1 on every cup. At ₹10, you earn ₹4 on every cup.",
        'none', null)
    ],
    quizCard: {
      question: "You sell lemonade for ₹200 in total and your costs were ₹120. What is your profit?",
      options: ["₹80", "₹320", "₹200", "₹120"],
      correctIndex: 0,
      explanation: "Profit = income − costs = ₹200 − ₹120 = ₹80. If costs were more than income, you would have a loss."
    },
    briefs: [
      { emoji: '🍋', fact: 'Many famous companies started as small ideas run from a home or a garage, but their founders were grown-ups.' },
      { emoji: '📒', fact: 'Writing down your costs and sales is what turns a good idea into a real business.' },
      { emoji: '🧑‍🤝‍🧑', fact: 'Children can learn about business by helping at a family shop or a school fair stall, with a parent.' }
    ]
  }
];
