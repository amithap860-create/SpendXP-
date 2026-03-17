/**
 * @fileOverview 12 financial concept breakdowns tailored for SpendXP age groups.
 */

export type ConceptBreakdown = {
  id: string;
  title: string;
  hook: string;
  keyPoints: string[];
  realWorldStat: string;
  quickQuestion: string;
  ageAdapted: {
    junior: {
      hook: string;
      keyPoints: string[];
    };
    teen: {
      hook: string;
      keyPoints: string[];
    };
    senior: {
      hook: string;
      keyPoints: string[];
      extraStat?: string;
    };
  };
  estimatedReadSeconds: number;
  relatedActivityIds: string[];
};

export const conceptBreakdowns: ConceptBreakdown[] = [
  {
    id: 'budgeting-basics',
    title: "Budgeting — telling your money where to go",
    hook: "Most people don't run out of money. They run out of plan.",
    keyPoints: [
      "A budget is a decision made in advance, not a restriction on your freedom",
      "The 50/30/20 rule: needs, wants, savings — one number to remember",
      "People who budget don't earn more — they just lose less"
    ],
    realWorldStat: "68% of Indians have no monthly budget. Those who do save 3x more on average.",
    quickQuestion: "If your income doubled tomorrow, would your spending double too? Why?",
    ageAdapted: {
      junior: {
        hook: "Pocket money that runs out before the week ends? There's a fix for that.",
        keyPoints: [
          "Split your money before spending any of it",
          "Needs first (food, school), wants second (games, snacks)",
          "Even ₹10 saved every day becomes ₹3,650 in a year"
        ]
      },
      teen: {
        hook: "Your allowance feels like it disappears. Budgeting shows you exactly where it went.",
        keyPoints: [
          "Write down every spend for one week — the results will shock you",
          "50% needs, 30% wants, 20% savings works at any income level",
          "A budget isn't a cage — it's a map"
        ]
      },
      senior: {
        hook: "Your first salary will feel like a lot until rent, food, and transport eat it whole.",
        keyPoints: [
          "Fixed expenses (rent, EMIs) should not exceed 50% of take-home pay",
          "Variable expenses are where budgets break — track them weekly not monthly",
          "Zero-based budgeting: assign every rupee a job before the month starts"
        ],
        extraStat: "The average Indian 22-year-old spends 40% of income on food and transport without realising it."
      }
    },
    estimatedReadSeconds: 45,
    relatedActivityIds: ['budgetBlitz', 'finIQ-budgeting']
  },
  {
    id: 'emergency-fund',
    title: "Emergency fund — the financial safety net",
    hook: "One unexpected expense separates those who stay stable from those who go into debt.",
    keyPoints: [
      "3 to 6 months of expenses, liquid, untouched",
      "Not investing — this money lives in a savings account where you can reach it in 24 hours",
      "Building it takes months. Not having it can cost years."
    ],
    realWorldStat: "Only 22% of Indian households can cover a ₹50,000 emergency without borrowing.",
    quickQuestion: "If you lost your income tomorrow, how many days could you survive on your savings?",
    ageAdapted: {
      junior: {
        hook: "What if something breaks and you need money right now? That's what a rainy day fund is for.",
        keyPoints: [
          "Keep some money that you NEVER touch unless it's a real emergency",
          "Not for games, treats, or things you want — only for real problems",
          "Start with ₹500. Then ₹1,000. Build slowly."
        ]
      },
      teen: {
        hook: "Your phone screen cracks. Your bike tyre bursts. Life happens — are you ready?",
        keyPoints: [
          "Aim for 3 months of your basic expenses saved and untouched",
          "Keep it in a separate account so you're not tempted to spend it",
          "Every time you use it, rebuild it before saving for anything else"
        ]
      },
      senior: {
        hook: "Job loss, medical bills, car breakdown — emergencies don't wait for a good time.",
        keyPoints: [
          "6 months expenses minimum if self-employed or on contract work",
          "High-yield savings account or liquid mutual fund — not a fixed deposit (can't break FD instantly)",
          "Emergency fund first, investing second — always in that order"
        ],
        extraStat: "Indians with an emergency fund are 4x less likely to take high-interest personal loans during a crisis."
      }
    },
    estimatedReadSeconds: 50,
    relatedActivityIds: ['emergency-fund-quest', 'finIQ-emergency']
  },
  {
    id: 'compound-interest',
    title: "Compound interest — the 8th wonder of the world",
    hook: "Einstein may have called it the most powerful force in the universe. Here's why.",
    keyPoints: [
      "You earn interest on your interest — money making money from money",
      "Time is the ingredient that makes compounding magical — starting early matters more than starting big",
      "The same principle that builds wealth also destroys it — credit card debt compounds too"
    ],
    realWorldStat: "₹5,000 invested monthly from age 22 becomes ₹3.5 crore by age 60 at 12% returns. Starting at 32 gives only ₹1.1 crore.",
    quickQuestion: "Would you rather have ₹10 lakh today or 1 paisa that doubles every day for 30 days?",
    ageAdapted: {
      junior: {
        hook: "What if your savings could grow by themselves while you sleep?",
        keyPoints: [
          "Interest means the bank pays YOU to keep money there",
          "Every year the interest gets added and then earns even more interest",
          "₹1,000 at 8% interest becomes ₹2,159 in 10 years — without adding anything"
        ]
      },
      teen: {
        hook: "The best time to start saving was when you were born. The second best time is today.",
        keyPoints: [
          "Rule of 72: divide 72 by the interest rate to find how many years to double your money",
          "At 12% your money doubles every 6 years",
          "A 5-year head start is worth more than doubling the amount you invest"
        ]
      },
      senior: {
        hook: "Your 20s are the most valuable investing decade of your life. Most people waste them.",
        keyPoints: [
          "SIP of ₹2,000/month from 22 beats ₹5,000/month from 30 by the time you're 60",
          "Equity mutual funds have historically returned 12-15% annually over 20+ years",
          "Inflation compounds too — money in a savings account at 4% loses value at 6% inflation"
        ],
        extraStat: "Indians who start SIPs before 25 accumulate 2.8x more wealth by retirement than those who start at 35."
      }
    },
    estimatedReadSeconds: 60,
    relatedActivityIds: ['compoundClicker', 'finIQ-investing']
  },
  {
    id: 'credit-scores',
    title: "Credit scores — your financial report card",
    hook: "A three-digit number will decide whether you get the apartment, the loan, and the rate.",
    keyPoints: [
      "CIBIL score ranges from 300 to 900 — above 750 is where good things happen",
      "Payment history is 35% of your score — one missed payment can drop it 50-100 points",
      "It takes years to build a good score and months to destroy one"
    ],
    realWorldStat: "People with CIBIL scores above 750 get home loan interest rates 1.5% lower — saving ₹8 lakh over a 20-year loan.",
    quickQuestion: "If your credit score was 580 today, what is the one thing you would change first?",
    ageAdapted: {
      junior: {
        hook: "Imagine a trust score that follows you everywhere and decides if people lend you money. That's a credit score.",
        keyPoints: [
          "Banks check this score before lending you money for big things like a house",
          "Paying back money you borrow — on time, every time — builds this score",
          "It takes years to build and is hard to fix once broken"
        ]
      },
      teen: {
        hook: "You don't have a credit score yet. That's actually a problem — here's why.",
        keyPoints: [
          "No credit history means banks see you as risky — you may get rejected for your first loan",
          "A student credit card used responsibly is the fastest way to build history",
          "Never miss a payment — even one 30-day late payment stays on your record 7 years"
        ]
      },
      senior: {
        hook: "Your first credit card, your first apartment, your first loan — all depend on a number you've probably never checked.",
        keyPoints: [
          "Check your CIBIL score free at cibil.com — errors are common and can be disputed",
          "Keep credit utilisation below 30% — if limit is ₹10,000 don't spend over ₹3,000",
          "Hard inquiries (applying for credit) drop your score temporarily — don't apply for multiple cards in a month"
        ],
        extraStat: "40% of Indians who check their CIBIL report find at least one error that is dragging their score down."
      }
    },
    estimatedReadSeconds: 55,
    relatedActivityIds: ['creditScoreBuilder', 'finIQ-credit']
  },
  {
    id: 'emi-and-debt',
    title: "EMI and debt — the real cost of buying now",
    hook: "That ₹40,000 phone on EMI? By the time you finish paying, it cost you ₹52,000.",
    keyPoints: [
      "EMI spreads cost over time but adds interest — always calculate total payment not monthly",
      "Good debt (education, home) builds assets. Bad debt (gadgets, holidays) builds nothing.",
      "The minimum payment trap: paying minimum on credit cards means you're mostly paying interest, not reducing debt"
    ],
    realWorldStat: "The average Indian between 25-35 spends 22% of income on EMIs — most of it on depreciating assets like phones and bikes.",
    quickQuestion: "Name one thing you currently own or want to buy — is it worth paying ₹12,000 extra in interest to have it sooner?",
    ageAdapted: {
      junior: {
        hook: "Buy now pay later sounds great until you realise you're paying more than the price tag.",
        keyPoints: [
          "Borrowing money always costs extra — that extra is called interest",
          "The longer you take to pay back, the more extra you pay",
          "Saving up and paying cash almost always costs less than buying on credit"
        ]
      },
      teen: {
        hook: "That phone on 12-month EMI feels affordable at ₹4,000/month. But you're paying ₹6,000 more than the price.",
        keyPoints: [
          "Always multiply: monthly EMI × number of months = total you actually pay",
          "Interest rate matters — 14% APR on a ₹30,000 loan adds ₹2,200 in interest",
          "If you can't afford it in cash in 3 months of saving, can you really afford the EMI?"
        ]
      },
      senior: {
        hook: "Your debt-to-income ratio is the number lenders check before your credit score.",
        keyPoints: [
          "Total EMIs should never exceed 40% of monthly take-home — banks reject above 50%",
          "Avalanche method: pay highest interest debt first — saves the most money overall",
          "Snowball method: pay smallest balance first — builds psychological momentum"
        ],
        extraStat: "Indians in their late 20s with more than 3 active EMIs save 60% less for retirement than those with 1 or none."
      }
    },
    estimatedReadSeconds: 55,
    relatedActivityIds: ['phone-emi', 'moneyMaze-debt']
  },
  {
    id: 'taxes-india',
    title: "Taxes — what the government takes and why",
    hook: "You will earn crores over your lifetime. Understanding taxes could keep lakhs of it.",
    keyPoints: [
      "Income tax in India uses slabs — different rates for different income levels, not a flat percentage",
      "TDS (Tax Deducted at Source) means your employer pays tax before you even see the money",
      "Section 80C lets you legally reduce taxable income by up to ₹1.5 lakh — most people never use this fully"
    ],
    realWorldStat: "Only 1.5% of India's population files income tax. Those who do miss ₹45,000 in average refunds by not claiming all deductions.",
    quickQuestion: "If you could legally pay ₹20,000 less in taxes every year, would you take 2 hours to learn how?",
    ageAdapted: {
      junior: {
        hook: "When you earn money someday, a part of it goes to the government to build roads, schools and hospitals.",
        keyPoints: [
          "Tax is how the government pays for things everyone uses",
          "The more you earn, the higher percentage you pay — this is called progressive tax",
          "Honest tax payment is a legal requirement — not optional"
        ]
      },
      teen: {
        hook: "Your first part-time job or internship stipend may have tax deducted before you even receive it.",
        keyPoints: [
          "Income under ₹2.5 lakh per year is not taxed in India currently",
          "TDS is deducted by whoever pays you — check your salary slip",
          "File an ITR even if you don't owe tax — it builds your financial record"
        ]
      },
      senior: {
        hook: "The difference between old tax regime and new tax regime could mean ₹30,000 saved or lost — annually.",
        keyPoints: [
          "Old regime: more deductions (80C, HRA, home loan) — better if you invest heavily",
          "New regime: lower rates, no deductions — better if you are just starting out"
        ],
        extraStat: "Salaried Indians who fully utilise Section 80C save an average ₹46,800 in taxes every year."
      }
    },
    estimatedReadSeconds: 60,
    relatedActivityIds: ['finIQ-taxes']
  },
  {
    id: 'investing-basics',
    title: "Investing — making money without working for it",
    hook: "There are only two ways to make money: you work for it, or your money works for you.",
    keyPoints: [
      "Investing means putting money to work in assets that grow in value over time",
      "Risk and return are inseparable — higher potential return always means higher risk",
      "Diversification: never put all eggs in one basket — spread across asset types"
    ],
    realWorldStat: "The Nifty 50 index has returned an average 13.2% annually over the last 20 years — turning ₹1 lakh into ₹11.5 lakh.",
    quickQuestion: "Would you rather have a guaranteed 5% return or a possible 15% return with a chance of losing 10%?",
    ageAdapted: {
      junior: {
        hook: "What if your money could grow by itself while you're at school?",
        keyPoints: [
          "Investing means letting your money work for you instead of just sitting there",
          "A piggy bank keeps money safe but doesn't grow it — investing grows it",
          "More risk means more potential reward — and more potential loss"
        ]
      },
      teen: {
        hook: "A mutual fund SIP of ₹500/month started at 16 is worth more at 60 than ₹5,000/month started at 30.",
        keyPoints: [
          "Mutual funds pool money from many investors to buy diversified assets",
          "SIP (Systematic Investment Plan) means investing a fixed amount monthly",
          "Index funds track the market — they beat 80% of actively managed funds long-term"
        ]
      },
      senior: {
        hook: "Your salary buys your lifestyle today. Your investments fund your life when you can no longer work.",
        keyPoints: [
          "Asset allocation: split between equity (high risk), debt (low risk), and gold (hedge)",
          "Thumb rule: subtract your age from 100 for equity percentage",
          "Rebalance once a year — bring allocation back to target as markets move"
        ],
        extraStat: "Indians who invest in equity mutual funds for 20+ years have never lost money in any rolling 20-year period in Nifty 50 history."
      }
    },
    estimatedReadSeconds: 60,
    relatedActivityIds: ['stockMarketSim', 'finIQ-investing']
  },
  {
    id: 'spending-habits',
    title: "Spending habits — the invisible money drain",
    hook: "It's never the big purchases that empty your account. It's the ₹50 here, ₹200 there, every single day.",
    keyPoints: [
      "Lifestyle inflation: as income rises, spending rises to match — net savings stay zero",
      "Emotional spending: stress, boredom, and social pressure are the real budget killers",
      "The 24-hour rule: wait one day before any unplanned purchase over ₹500"
    ],
    realWorldStat: "Indians spend an average ₹3,200 per month on impulse purchases — ₹38,400 per year that was never planned.",
    quickQuestion: "Think of the last purchase you regretted. What emotion were you feeling when you bought it?",
    ageAdapted: {
      junior: {
        hook: "Have you ever spent all your pocket money and not remembered where it went?",
        keyPoints: [
          "Small daily spends add up faster than big occasional ones",
          "Before buying ask: do I need this or do I just want it right now?",
          "Writing down every spend for one week is eye-opening"
        ]
      },
      teen: {
        hook: "Your friends' spending habits are the biggest threat to your savings goals.",
        keyPoints: [
          "Social spending — eating out, concerts, clothes — is the hardest to control",
          "FOMO (fear of missing out) is a billion-dollar marketing strategy",
          "Automate savings on payday so the money is gone before you can spend it"
        ]
      },
      senior: {
        hook: "Lifestyle inflation is how people with good salaries end up broke at 45.",
        keyPoints: [
          "Track every spend for 30 days — discover 3-5 categories you can cut",
          "Subscriptions are the modern money drain — audit yours quarterly",
          "Separate wants from needs by asking: would my life be worse without this in 30 days?"
        ],
        extraStat: "Indians earning ₹1 lakh/month who track spending save an average ₹18,000 more monthly than those who don't."
      }
    },
    estimatedReadSeconds: 55,
    relatedActivityIds: ['finIQ-spending']
  },
  {
    id: 'renting-housing',
    title: "Renting — finding a home without the headache",
    hook: "Rent is often your largest monthly bill—knowing how much is 'too much' is key to building wealth.",
    keyPoints: [
      "Rent-to-income ratio: try to keep your rent below 30% of your take-home pay",
      "Lease agreements: always read the notice period and maintenance clauses carefully",
      "The deposit trap: in some cities, deposits can be 10 months of rent—plan for this upfront"
    ],
    realWorldStat: "In cities like Mumbai and Bangalore, the average renter spends 45% of their income on housing.",
    quickQuestion: "Is living closer to work worth an extra ₹5,000 in rent if it saves you 2 hours of travel every day?",
    ageAdapted: {
      junior: {
        hook: "Someday you will have your own place. It costs money every month just to live there!",
        keyPoints: [
          "Rent is the money you pay to someone else to live in their house",
          "You also have to pay for lights, water, and fixing things that break",
          "Saving a little now helps you get a nice place when you grow up"
        ]
      },
      teen: {
        hook: "Moving out sounds exciting, but hidden costs like brokerage and deposits can ruin your first month.",
        keyPoints: [
          "Brokerage can be one full month of rent — a cost many people forget to save for",
          "Society fees and maintenance are often extra — always ask for the 'total' cost",
          "A roommate halves your rent but doubles your need for clear money rules"
        ]
      },
      senior: {
        hook: "Rent vs Buy: in India, renting is often mathematically cheaper than an EMI due to low rental yields.",
        keyPoints: [
          "Rental yield in India is ~3%, while home loan rates are ~9%",
          "Hidden costs: brokerage, annual rent hikes (usually 10%), and move-in fees",
          "Always inspect for water leakage and electrical safety before signing"
        ],
        extraStat: "Mumbai and Bangalore renters spend 45% of income on rent on average."
      }
    },
    estimatedReadSeconds: 65,
    relatedActivityIds: ['first-apartment']
  },
  {
    id: 'vacation-planning',
    title: "Vacation planning — travel without the debt",
    hook: "A vacation paid for in advance is a holiday. A vacation paid for on credit is a debt sentence.",
    keyPoints: [
      "Sinking funds: save a small amount every month for your next big trip",
      "Opportunity cost: that ₹50,000 trip could be ₹5 lakh in 20 years if invested",
      "Travel insurance: ₹1,000 spent now could save ₹10 lakh in foreign medical bills"
    ],
    realWorldStat: "42% of Indian millennials have taken a personal loan to fund a vacation at least once.",
    quickQuestion: "Would you rather have one luxury 3-day trip or three budget 7-day trips?",
    ageAdapted: {
      junior: {
        hook: "Going on a trip is fun! But flights and hotels cost a lot of pocket money.",
        keyPoints: [
          "Plan your fun before you go so you don't run out of money on day one",
          "Souvenirs are tempting, but they take away money for ice cream and rides",
          "Saving for a trip makes the trip feel even better!"
        ]
      },
      teen: {
        hook: "How to travel on ₹15,000 that most people spend ₹40,000 on.",
        keyPoints: [
          "Book flights 3 months early — last minute prices are for people who don't plan",
          "Hostels and homestays are 70% cheaper than hotels and often more fun",
          "Set a 'Daily Spend' limit and stick to it using an app or notebook"
        ]
      },
      senior: {
        hook: "Travel hacking isn't just for experts. Credit card points can pay for your entire flight.",
        keyPoints: [
          "Use a dedicated travel credit card for all daily spends to accumulate miles",
          "Off-season travel can save 50% on luxury stays while avoiding crowds",
          "Factor in 'Hidden Costs': airport transfers, visas, and roaming data"
        ]
      }
    },
    estimatedReadSeconds: 55,
    relatedActivityIds: ['vacation-planning']
  },
  {
    id: 'first-job-salary',
    title: "First job salary — the truth about your paycheck",
    hook: "Your 'Cost to Company' (CTC) is not your take-home pay. Understanding the gap saves you from payday surprises.",
    keyPoints: [
      "Gross vs Net: Gross is what they promised, Net is what hits your account",
      "PF (Provident Fund) is mandatory saving for your future — it's your money",
      "HRA (House Rent Allowance) is a major tax saver if you pay rent"
    ],
    realWorldStat: "80% of first-time employees don't know their net salary until their first message from the bank.",
    quickQuestion: "If you were offered a ₹50,000 higher CTC but ₹5,000 lower take-home pay, would you take it?",
    ageAdapted: {
      junior: {
        hook: "Someday you will get a job and earn a salary! But some money is saved for you automatically.",
        keyPoints: [
          "Salary is the reward for your hard work and skills",
          "Part of your pay is put in a 'future fund' that you get when you're older",
          "Always check your payslip to see where the money is going"
        ]
      },
      teen: {
        hook: "Stipends and part-time pay are your first taste of financial freedom.",
        keyPoints: [
          "If you earn over ₹2.5 lakh a year, you need to know about taxes",
          "Even a small stipend can start a massive investment if you save 30%",
          "Your first paycheck is a milestone — celebrate, but save first"
        ]
      },
      senior: {
        hook: "Negotiation matters: a 10% higher starting salary compounds to ₹1.2 crore extra over a career.",
        keyPoints: [
          "Form 16 is your most important tax document",
          "Professional Tax and Gratuity are other deductions that reduce take-home",
          "Always negotiate on the 'Fixed' component, as bonuses aren't guaranteed"
        ],
        extraStat: "A 10% higher starting salary compounds to ₹1.2 crore extra over a 30-year career."
      }
    },
    estimatedReadSeconds: 65,
    relatedActivityIds: ['first-paycheck']
  },
  {
    id: 'credit-cards',
    title: "Credit cards — the high-stakes game",
    hook: "Credit cards are not free money — they are interest-bearing loans with a 45-day interest-free window if you know the trick.",
    keyPoints: [
      "The Grace Period: if you pay in full on time, you pay 0% interest. Even one day late costs 40%!",
      "Minimum Payment Trap: banks only ask for 5% of what you owe to keep you in debt for years",
      "Rewards vs Fees: if the annual fee is ₹2,000 and you only earn ₹500 in points, the card costs you money"
    ],
    realWorldStat: "Indians pay over ₹10,000 crore in credit card interest and late fees every single year.",
    quickQuestion: "If a credit card company gives you ₹500 back for spending ₹10,000, who really won the deal?",
    ageAdapted: {
      junior: {
        hook: "A credit card is like a 'Trust Card'. The bank trusts you to pay them back later.",
        keyPoints: [
          "It's not your money — it's the bank's money that you are borrowing",
          "If you don't pay it back fast, it becomes much more expensive",
          "Only use a card if you already have the money in your piggy bank"
        ]
      },
      teen: {
        hook: "Credit cards are the ultimate double-edged sword: a free loan for the disciplined, and a debt trap for the unwary.",
        keyPoints: [
          "Companies make money when you FORGET to pay or can't afford to pay",
          "Never spend more on a card than you have in your bank account",
          "One missed payment can haunt your credit score for 7 years"
        ]
      },
      senior: {
        hook: "Interest rates on credit cards are ~42% per year — the most expensive debt in the world.",
        keyPoints: [
          "Statement Date vs Due Date: knowing the gap helps you maximise interest-free days",
          "Credit cards are great for building CIBIL score if utilised under 30%",
          "Avoid 'Cash Withdrawal' on credit cards — interest starts instantly"
        ]
      }
    },
    estimatedReadSeconds: 60,
    relatedActivityIds: ['first-credit-card']
  }
];
