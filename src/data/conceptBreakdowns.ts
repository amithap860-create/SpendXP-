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
          "Even ₹10 saved every day becomes ₹3,650 in a year",
          "A simple rule: spend half, save half — even on small amounts"
        ]
      },
      teen: {
        hook: "Your allowance feels like it disappears. Budgeting shows you exactly where it went.",
        keyPoints: [
          "Write down every spend for one week — the results will shock you",
          "50% needs, 30% wants, 20% savings works at any income level",
          "A budget isn't a cage — it's a map",
          "Apps like Walnut or just a notes app can track every rupee automatically"
        ]
      },
      senior: {
        hook: "Your first salary will feel like a lot until rent, food, and transport eat it whole.",
        keyPoints: [
          "Fixed expenses (rent, EMIs) should not exceed 50% of take-home pay",
          "Variable expenses are where budgets break — track them weekly not monthly",
          "Zero-based budgeting: assign every rupee a job before the month starts",
          "Pay yourself first — automate a savings transfer on the same day salary arrives"
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
          "It takes years to build and is hard to fix once broken",
          "Think of it like a class report card but for money behaviour — you want A grades"
        ]
      },
      teen: {
        hook: "You don't have a credit score yet. That's actually a problem — here's why.",
        keyPoints: [
          "No credit history means banks see you as risky — you may get rejected for your first loan",
          "A student credit card used responsibly is the fastest way to build history",
          "Never miss a payment — even one 30-day late payment stays on your record 7 years",
          "Credit utilisation: using less than 30% of your credit limit is the sweet spot"
        ]
      },
      senior: {
        hook: "Your first credit card, your first apartment, your first loan — all depend on a number you've probably never checked.",
        keyPoints: [
          "Check your CIBIL score free at cibil.com — errors are common and can be disputed",
          "Keep credit utilisation below 30% — if limit is ₹10,000 don't spend over ₹3,000",
          "Hard inquiries (applying for credit) drop your score temporarily — don't apply for multiple cards in a month",
          "Five factors: payment history (35%), utilisation (30%), length (15%), mix (10%), inquiries (10%)"
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
          "Honest tax payment is a legal requirement — not optional",
          "GST is a tax you already pay — it's added to every product you buy in a shop"
        ]
      },
      teen: {
        hook: "Your first part-time job or internship stipend may have tax deducted before you even receive it.",
        keyPoints: [
          "Income under ₹2.5 lakh per year is not taxed in India currently",
          "TDS is deducted by whoever pays you — check your salary slip",
          "File an ITR even if you don't owe tax — it builds your financial record",
          "GST applies at different rates: 0% on essentials, 5–28% on other goods and services"
        ]
      },
      senior: {
        hook: "The difference between old tax regime and new tax regime could mean ₹30,000 saved or lost — annually.",
        keyPoints: [
          "Old regime: more deductions (80C, HRA, home loan) — better if you invest heavily",
          "New regime: lower slab rates, no deductions — better if you are just starting out",
          "Section 80C covers EPF, ELSS, PPF, LIC, home loan principal up to ₹1.5 lakh",
          "HRA exemption can save ₹20,000–₹80,000 per year if you live in a rented home"
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
          "More risk means more potential reward — and more potential loss",
          "Starting small is fine — even ₹100 in a recurring deposit teaches the habit"
        ]
      },
      teen: {
        hook: "A mutual fund SIP of ₹500/month started at 16 is worth more at 60 than ₹5,000/month started at 30.",
        keyPoints: [
          "Mutual funds pool money from many investors to buy diversified assets",
          "SIP (Systematic Investment Plan) means investing a fixed amount monthly",
          "Index funds track the market — they beat 80% of actively managed funds long-term",
          "Diversify: don't put all your money in one stock, one company, or one sector"
        ]
      },
      senior: {
        hook: "Your salary buys your lifestyle today. Your investments fund your life when you can no longer work.",
        keyPoints: [
          "Asset allocation: split between equity (high risk), debt (low risk), and gold (hedge)",
          "Thumb rule: subtract your age from 100 for equity percentage",
          "Rebalance once a year — bring allocation back to target as markets move",
          "ELSS mutual funds give you tax deduction under Section 80C AND equity growth"
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
          "Writing down every spend for one week is eye-opening",
          "Waiting 1 day before buying something you really want helps avoid regret spending"
        ]
      },
      teen: {
        hook: "Your friends' spending habits are the biggest threat to your savings goals.",
        keyPoints: [
          "Social spending — eating out, concerts, clothes — is the hardest to control",
          "FOMO (fear of missing out) is a billion-dollar marketing strategy",
          "Automate savings on payday so the money is gone before you can spend it",
          "Unsubscribe from promotional emails — they are designed to make you spend"
        ]
      },
      senior: {
        hook: "Lifestyle inflation is how people with good salaries end up broke at 45.",
        keyPoints: [
          "Track every spend for 30 days — discover 3-5 categories you can cut",
          "Subscriptions are the modern money drain — audit yours quarterly",
          "Separate wants from needs by asking: would my life be worse without this in 30 days?",
          "The latte factor: ₹200/day on coffee is ₹6,000/month, ₹72,000/year — invest it instead"
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
  },

  // ─── Quest-specific breakdowns ───────────────────────────────────────────

  {
    id: 'birthday-loot',
    title: "Windfalls — what to do when money arrives all at once",
    hook: "Getting a lump sum feels amazing. What you do in the next 24 hours decides if it lasts 24 days or 24 years.",
    keyPoints: [
      "A windfall is any money that arrives unexpectedly or all at once — birthday cash, bonuses, gifts",
      "The '48-hour rule': don't touch windfall money for two days — let the excitement settle first",
      "The smart split: save 50%, enjoy 40%, give or invest 10% — a ratio that feels good AND builds wealth"
    ],
    realWorldStat: "Studies show people spend 70% of unexpected money within 30 days. Those who save first spend less than 30%.",
    quickQuestion: "If you got ₹5,000 right now, what would you do with it in the next 10 minutes?",
    ageAdapted: {
      junior: {
        hook: "Birthday money is the best! But it disappears fast if you don't have a plan.",
        keyPoints: [
          "Split it before you spend it — decide how much to save first, then enjoy the rest",
          "Put savings in a separate place so the 'spend' pile feels separate",
          "What would make you happier: one big thing you really want, or lots of small things you forget next week?",
          "Saving birthday money every year is how kids build their first big goal fund"
        ]
      },
      teen: {
        hook: "₹3,000 from relatives on your birthday. Spend it all on one day or let it work for you?",
        keyPoints: [
          "Decide your split before you see something you want — otherwise emotions decide",
          "Even saving ₹1,000 from each birthday adds up: ₹10,000 in 10 years, more with interest",
          "Experiences (trips, events) create longer happiness than things (gadgets, clothes)",
          "Start a 'goal jar' — write what you're saving for so you stay motivated"
        ]
      },
      senior: {
        hook: "A bonus, a gift, a freelance payment — windfalls are wealth-building opportunities in disguise.",
        keyPoints: [
          "Treat windfalls as 'extra' — your regular budget should never depend on them",
          "Invest the majority before lifestyle inflation kicks in and absorbs it",
          "Use lump sums to fast-track goals: top up emergency fund, pay down high-interest debt, start a SIP"
        ],
        extraStat: "People who pre-commit to saving 50% of bonuses before receiving them save 3x more than those who decide after."
      }
    },
    estimatedReadSeconds: 45,
    relatedActivityIds: ['birthday-loot']
  },

  {
    id: 'pocket-money-puzzle',
    title: "Goal-based saving — wanting something so much you plan for it",
    hook: "The gap between what you want and what you have is bridged by one thing: a plan with a deadline.",
    keyPoints: [
      "Goal-based saving means assigning every saved rupee a purpose — it's far more powerful than 'saving in general'",
      "Break big goals into weekly targets: ₹600 goal ÷ 4 weeks = ₹150 per week feels doable",
      "Delayed gratification is a superpower — research shows kids who wait for bigger rewards earn more as adults"
    ],
    realWorldStat: "People with written savings goals are 42% more likely to achieve them than those who just 'try to save'.",
    quickQuestion: "What is one thing you've really wanted but never saved up for? How long would it actually take if you saved every week?",
    ageAdapted: {
      junior: {
        hook: "There's something you really want but can't afford yet. The secret? A savings countdown.",
        keyPoints: [
          "Write down what you want and how much it costs",
          "Divide the cost by your weekly pocket money to find how many weeks to save",
          "Every time you don't spend, colour in a box on a chart — make the progress visible",
          "Telling a parent or friend your goal makes you 2x more likely to reach it"
        ]
      },
      teen: {
        hook: "You want something. Your pocket money isn't enough. Most people give up — but there's a better move.",
        keyPoints: [
          "Set a specific goal with a date: 'Save ₹2,000 by March 15' beats 'save more'",
          "Track progress weekly — momentum keeps you going when motivation dips",
          "Look for small ways to top up: selling things you don't use, small side jobs",
          "Ask: is this still what I want? Sometimes goals change — that's okay to admit"
        ]
      },
      senior: {
        hook: "Every large financial achievement started as a specific goal with a specific date.",
        keyPoints: [
          "SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound — works for money too",
          "Automate transfers on payday so savings happen before you can spend",
          "Separate savings accounts per goal make progress feel real and prevent 'borrowing from yourself'"
        ],
        extraStat: "People with specific savings goals accumulate 3x more wealth over 10 years than those without goals."
      }
    },
    estimatedReadSeconds: 40,
    relatedActivityIds: ['pocket-money-puzzle']
  },

  {
    id: 'lemonade-stand',
    title: "Running a business — revenue, costs, and profit",
    hook: "Every business in the world runs on three numbers: how much comes in, how much goes out, and what's left.",
    keyPoints: [
      "Revenue is the total money earned. Cost is what you spent to earn it. Profit = Revenue − Cost.",
      "Pricing too low means working hard for nothing. Pricing too high means no customers. Finding the sweet spot is the job.",
      "Reinvesting profit back into the business is how small ventures become big ones"
    ],
    realWorldStat: "90% of small businesses fail in their first year — most because they never tracked their costs carefully.",
    quickQuestion: "If you spent ₹200 making something and sold it for ₹350, how much profit did you make per unit? What if you sold 10?",
    ageAdapted: {
      junior: {
        hook: "What if you could make money from something you enjoy doing? That's exactly what a business is.",
        keyPoints: [
          "Revenue = all the money customers pay you",
          "Costs = everything you spent to make your product (ingredients, supplies, time)",
          "Profit = what's left after subtracting costs from revenue — that's YOUR money",
          "The more customers you serve, the more profit you can make — this is called scaling"
        ]
      },
      teen: {
        hook: "Starting a business sounds big. But every business started with someone solving one small problem.",
        keyPoints: [
          "Start small and test: sell 10 units before investing in 100",
          "Fixed costs (equipment, setup) happen once. Variable costs (ingredients, time) grow with sales",
          "A simple profit margin rule: charge at least 2x your material cost",
          "Keep a notebook of income and expenses from day one — guessing kills small businesses"
        ]
      },
      senior: {
        hook: "The difference between a hobby and a business is whether you track the numbers.",
        keyPoints: [
          "Break-even point: how many units you must sell before you stop losing money",
          "Cash flow vs profit: a business can be profitable on paper but broke in reality",
          "Always separate business money from personal money — even for tiny ventures"
        ],
        extraStat: "Entrepreneurs who track expenses from day one are 2.5x more likely to still be running after 3 years."
      }
    },
    estimatedReadSeconds: 50,
    relatedActivityIds: ['lemonade-stand']
  },

  {
    id: 'group-chat-dilemma',
    title: "Peer pressure and money — when social life attacks your budget",
    hook: "The most expensive thing you'll ever buy is trying to keep up with people who can't actually afford what they're buying either.",
    keyPoints: [
      "Social spending is spending triggered by others' expectations — the hardest category to control",
      "FOMO (fear of missing out) is a marketing strategy and a social pressure strategy at the same time",
      "You don't have to explain your budget to anyone — 'I'm saving for something' is a complete sentence"
    ],
    realWorldStat: "62% of millennials say they've spent money they didn't have because of social pressure from friends or social media.",
    quickQuestion: "Think of the last time you spent money to 'keep up' with someone. Did it make you feel better or worse a week later?",
    ageAdapted: {
      junior: {
        hook: "When all your friends have something, it feels like you need it too. But do you really?",
        keyPoints: [
          "Just because everyone has it doesn't mean it's worth the money",
          "Real friends don't care if you have the latest thing or not",
          "It's okay to say 'I'm saving my money for something else'",
          "Ask yourself: do I want this, or do I want people to see me having this?"
        ]
      },
      teen: {
        hook: "Group chats, outings, and social media create invisible spending pressure every single day.",
        keyPoints: [
          "Suggest free or low-cost alternatives — a walk, a home hangout, a free event",
          "Set a 'social budget' each month so you can say yes sometimes without guilt",
          "If friends mock your budget, that's information about those friends — not about you",
          "The most confident person in the room isn't always the one who spends the most"
        ]
      },
      senior: {
        hook: "Lifestyle creep often comes from keeping up with colleagues, not your own genuine desires.",
        keyPoints: [
          "Distinguish between genuine shared experiences and performative spending",
          "Suggest cost-sharing for group plans — most people are quietly relieved",
          "Your financial goals deserve the same respect as your social goals — guard them equally"
        ],
        extraStat: "Indians who track 'social spending' as a separate budget category reduce it by 30% within 3 months."
      }
    },
    estimatedReadSeconds: 45,
    relatedActivityIds: ['group-chat-dilemma']
  },

  {
    id: 'first-side-hustle',
    title: "Side hustles — turning skills into income",
    hook: "Your main job pays your bills. Your side hustle builds your freedom. But only if you treat it like a business.",
    keyPoints: [
      "Pricing your time: charge what the work is worth, not what feels comfortable to say out loud",
      "Freelance income is not guaranteed — save 30% of every payment before spending anything",
      "As a freelancer, YOU are the HR, tax, accounts, and marketing department — build simple systems early"
    ],
    realWorldStat: "India has over 15 million freelancers — the third-largest freelance workforce globally. Top earners charge 10x what beginners do for the same skill.",
    quickQuestion: "What skill do you have that someone, somewhere, would pay for? Have you ever charged for it?",
    ageAdapted: {
      junior: {
        hook: "Did you know kids can earn money from things they're already good at?",
        keyPoints: [
          "Drawing, gaming, music, coding — any skill can become something others pay for",
          "Teaching someone else what you know is one of the easiest ways to earn",
          "Start small: one customer, one project, one skill",
          "Keep your earnings separate so you know exactly how much your hustle made"
        ]
      },
      teen: {
        hook: "Your design skills, video editing, tutoring — these are real services people pay real money for.",
        keyPoints: [
          "Platforms like Fiverr and Upwork let you find clients from day one",
          "Your first price will feel too high. It isn't — time has value.",
          "Build a simple portfolio of 3 projects before approaching paid clients",
          "Track every hour worked and every rupee earned — know your hourly rate"
        ]
      },
      senior: {
        hook: "A side hustle that earns ₹10,000/month in your 20s becomes ₹40,000/month by your 30s if you build it right.",
        keyPoints: [
          "Register as a freelancer and pay advance tax quarterly if earnings exceed ₹2.5 lakh/year",
          "Keep business and personal accounts separate from the first payment",
          "Raise prices with every new client — your experience has value that compounds"
        ],
        extraStat: "Freelancers who raise their rates every 6 months earn 70% more than those who keep their starting rate for 2+ years."
      }
    },
    estimatedReadSeconds: 50,
    relatedActivityIds: ['first-side-hustle']
  },

  {
    id: 'phone-plan-trap',
    title: "Reading the fine print — total cost vs monthly cost",
    hook: "Companies don't advertise total cost because if they did, you'd rarely buy.",
    keyPoints: [
      "Always multiply: monthly price × 12 (or contract months) = the real price you're committing to",
      "Free trials auto-convert to paid plans — calendar reminders before trial end are essential",
      "Upgrades are cheap. Downgrades are hard. Always ask what happens if you want to cancel or switch."
    ],
    realWorldStat: "The average Indian household pays for 2.3 subscriptions they don't actively use — ₹8,000/year wasted.",
    quickQuestion: "How many apps, plans, or subscriptions are you currently paying for? Have you checked in the last 3 months?",
    ageAdapted: {
      junior: {
        hook: "Sometimes something looks cheap but costs a LOT more than you think.",
        keyPoints: [
          "Always ask: what's the TOTAL price, not just what I pay today?",
          "Monthly plans add up fast — ₹99/month is ₹1,188 every year",
          "Ask a parent to help you read the rules before agreeing to anything",
          "Free sometimes means you pay with your data or attention instead of money"
        ]
      },
      teen: {
        hook: "That ₹149/month plan sounds fine until you add it up and realise it's costing you a new phone every 2 years.",
        keyPoints: [
          "Compare plans by annual cost, not monthly — companies use monthly to hide the total",
          "Read cancellation terms before you subscribe — some charge fees for early exit",
          "Bundled plans are only a deal if you use ALL the features you're paying for",
          "The 'best deal' often isn't — calculate price per GB, not just headline data allowance"
        ]
      },
      senior: {
        hook: "Every service contract has a paragraph designed to make you stay longer than you planned.",
        keyPoints: [
          "Lock-in periods on phones and plans can cost ₹3,000–₹8,000 to exit early",
          "Compare 'total cost of ownership' not sticker price — includes accessories, insurance, repairs",
          "Audit all subscriptions quarterly — set a phone reminder every 3 months"
        ],
        extraStat: "Indians overspend ₹12,000/year on average on unused data, streaming, and subscription plan upgrades."
      }
    },
    estimatedReadSeconds: 45,
    relatedActivityIds: ['phone-plan-trap']
  },

  {
    id: 'first-paycheck',
    title: "Your first salary — CTC vs take-home and where the rest goes",
    hook: "Your offer letter says ₹35,000. Your bank notification says ₹28,500. You didn't get robbed — you just didn't understand the payslip.",
    keyPoints: [
      "CTC (Cost to Company) includes PF, gratuity, and benefits that never reach your account — your take-home is always less",
      "PF (Provident Fund) is 12% of your basic salary saved for your future — it's yours, just locked until retirement",
      "HRA (House Rent Allowance) is a tax-free component if you live in a rented home — it reduces your tax significantly"
    ],
    realWorldStat: "80% of first-time employees don't understand their payslip until month 3 — and many overpay tax the entire first year.",
    quickQuestion: "If your CTC is ₹5 lakh and your take-home is ₹38,000/month, where do you think the difference is going?",
    ageAdapted: {
      junior: {
        hook: "When you grow up and get a job, the number on your contract and what arrives in your bank are different!",
        keyPoints: [
          "Companies set aside some of your salary as savings for your future — it's still your money",
          "The government takes a small part as income tax for schools, roads, and hospitals",
          "Your 'take-home' is what's left after these — and it's what you plan your life around",
          "Always look at your payslip to understand where every rupee went"
        ]
      },
      teen: {
        hook: "Your first internship or part-time stipend has deductions too — knowing what they are is financial literacy 101.",
        keyPoints: [
          "TDS (Tax Deducted at Source) is tax taken before you see the money — it can be refunded if overpaid",
          "Professional Tax is a small state tax deducted monthly — usually ₹200",
          "Your first payslip will confuse you. Print it, google every line, and understand it fully"
        ]
      },
      senior: {
        hook: "Negotiate on the fixed component — bonuses aren't guaranteed, but your basic salary compounds every hike.",
        keyPoints: [
          "Basic salary determines your PF contribution and HRA calculation — a higher basic helps both",
          "Form 16 is your annual tax summary — keep every year's filed safely",
          "Declare rent receipts and investments to HR at the start of the financial year to avoid excess TDS",
          "Check if your company offers flexible benefits (meal coupons, NPS) — they reduce taxable income"
        ],
        extraStat: "Employees who submit investment proofs on time save an average ₹18,000–₹36,000 in excess TDS every year."
      }
    },
    estimatedReadSeconds: 55,
    relatedActivityIds: ['first-paycheck']
  },

  {
    id: 'first-apartment',
    title: "Renting your first home — the costs nobody warns you about",
    hook: "The rent is ₹25,000. Moving in actually costs ₹2.5 lakh. Here's what they don't put in the listing.",
    keyPoints: [
      "Security deposit in cities like Mumbai and Bangalore can be 5–10 months of rent — that's ₹1.25–2.5 lakh just to move in",
      "Brokerage is typically one month's rent paid upfront — factor this into your move-in budget",
      "Monthly rent is just the start: society maintenance, electricity, internet, and annual hikes add 15–20% to your real cost"
    ],
    realWorldStat: "The average first-time Mumbai renter underestimates move-in costs by ₹80,000 — leading many to borrow in their first month.",
    quickQuestion: "If rent is ₹22,000/month in BKC, how much cash do you need on day one before accounting for food or furniture?",
    ageAdapted: {
      junior: {
        hook: "Getting your own place someday sounds exciting! But it costs a LOT more than just the monthly rent.",
        keyPoints: [
          "You usually pay several months of rent upfront as a 'deposit' that you get back when you leave",
          "Electricity, water, and internet are extra every month on top of rent",
          "Moving furniture and setting up a home has its own big cost",
          "Saving early makes the first move-out much less stressful"
        ]
      },
      teen: {
        hook: "Your first apartment costs ₹18,000/month. Your actual move-in expense? Closer to ₹1.5 lakh.",
        keyPoints: [
          "Security deposit (2–10 months), brokerage (1 month), moving costs — add them all up before you sign",
          "Always negotiate the deposit — in some cities it's negotiable by 1–2 months",
          "Split with a flatmate to cut rent in half — but set clear rules about money from day one",
          "Read the lease before signing: check notice period, rent hike clause, and who pays for repairs"
        ]
      },
      senior: {
        hook: "Rent vs Buy in India: at 9% home loan rates and 3% rental yields, renting is often the financially smarter choice in your 20s.",
        keyPoints: [
          "Keep rent below 30% of take-home — above 40% and you have no room to build wealth",
          "Annual rent hikes of 10% are standard in most leases — budget for them in year 2",
          "Inspect for water seepage, building age, and lift maintenance before committing"
        ],
        extraStat: "Renters in Mumbai who split with one flatmate save an average ₹4.2 lakh over 3 years compared to living alone."
      }
    },
    estimatedReadSeconds: 55,
    relatedActivityIds: ['first-apartment']
  },

  {
    id: 'phone-emi',
    title: "EMI traps — the real price of buying now",
    hook: "That ₹80,000 iPhone on 12-month EMI feels like ₹6,666/month. It actually costs you ₹92,000. Here's the maths.",
    keyPoints: [
      "EMI total = monthly amount × number of months — always calculate this before signing",
      "Interest rates on consumer electronics EMIs range from 14–24% per year — far higher than most people realise",
      "No-cost EMI is rarely free: the 'discount' you get upfront is exactly equal to the interest you're paying in disguise"
    ],
    realWorldStat: "Indians spend over ₹2.3 lakh crore on consumer electronics EMIs annually — the fastest growing debt category among under-30s.",
    quickQuestion: "If you saved ₹6,666 per month for 12 months instead of paying EMI, you'd have ₹80,000 cash. Why does most of India choose EMI instead?",
    ageAdapted: {
      junior: {
        hook: "Paying a little every month sounds easier than paying it all at once — but it ends up costing more!",
        keyPoints: [
          "When you split a payment, the shop or bank charges extra — that's the interest",
          "The longer you take to pay, the more extra money you give them",
          "Saving up and paying at once almost always costs less than paying in instalments"
        ]
      },
      teen: {
        hook: "Your friend's ₹80,000 phone on 'easy EMI' — by the time they finish paying, it cost ₹95,000.",
        keyPoints: [
          "Calculate total payout before agreeing: monthly EMI × total months",
          "Ask if there's a processing fee — it adds to the real cost on top of interest",
          "The question isn't 'can I afford the EMI?' — it's 'do I need this enough to pay ₹15,000 extra?'"
        ]
      },
      senior: {
        hook: "Debt for depreciating assets is a double loss — you pay interest AND the asset loses value simultaneously.",
        keyPoints: [
          "Electronics lose 30–40% of value in year one — you're paying interest on something worth less every month",
          "EMIs on consumer goods reduce your investable income — the real cost is lost compounding",
          "If you must use EMI: choose shortest tenure, pre-close when possible, and never on a credit card"
        ],
        extraStat: "Indians who avoid consumer electronics EMIs and save instead accumulate ₹6–12 lakh more by age 35, purely from redirected EMI amounts invested in SIPs."
      }
    },
    estimatedReadSeconds: 50,
    relatedActivityIds: ['phone-emi']
  },

  {
    id: 'emergency-expense',
    title: "When income stops — surviving and rebuilding after a financial shock",
    hook: "A job loss, a medical bill, a sudden repair — financial shocks don't announce themselves. Your emergency fund is the announcement they never made.",
    keyPoints: [
      "3–6 months of essential expenses in liquid savings is the target — not total income, just what you need to survive",
      "Liquid means accessible in 24 hours: savings account or liquid mutual fund, not FD, stocks, or real estate",
      "In a crisis, cut non-essentials immediately and ruthlessly — survival mode is temporary, but debt is permanent"
    ],
    realWorldStat: "Only 22% of Indian households could survive a ₹50,000 emergency without borrowing. Among millennials, it's under 15%.",
    quickQuestion: "If your income stopped today, how many days could you cover your rent, food, and EMIs without help?",
    ageAdapted: {
      junior: {
        hook: "What happens if something breaks and you need money fast? That's what a rainy day fund is for.",
        keyPoints: [
          "A rainy day fund is money saved for unexpected problems, not fun things",
          "Start with ₹500, then grow it to ₹2,000 — a small safety net is better than none",
          "Never spend it on things you want — only on things you genuinely need right now",
          "After using it, rebuild it before saving for anything else"
        ]
      },
      teen: {
        hook: "Your phone breaks. Your bike needs repairs. Life's emergencies are expensive and don't wait for a convenient time.",
        keyPoints: [
          "Aim for 3 months of your essential costs saved and completely separate from spending money",
          "A separate savings account you don't look at daily is the best emergency fund",
          "List your 'survival expenses' — rent, food, transport — that's the target amount to cover",
          "Health insurance covers medical emergencies — it's part of your emergency strategy too"
        ]
      },
      senior: {
        hook: "Getting laid off feels like the floor dropped. An emergency fund is the new floor.",
        keyPoints: [
          "6 months of expenses if self-employed, 3 months minimum if salaried with stable employment",
          "Liquid mutual funds offer slightly better returns than savings accounts with same-day redemption",
          "In a layoff: cut discretionary spending before touching savings, negotiate notice pay, claim PF immediately"
        ],
        extraStat: "Professionals with a 6-month emergency fund recover from job loss 2.4x faster and with 60% less debt than those without one."
      }
    },
    estimatedReadSeconds: 55,
    relatedActivityIds: ['emergency-expense']
  },

  {
    id: 'first-credit-card',
    title: "Your first credit card — power tool or debt trap",
    hook: "A credit card is the best financial tool ever created — for people who pay it in full every month. For everyone else, it's a 42% loan.",
    keyPoints: [
      "Grace period: pay your full statement balance by due date and you pay exactly 0% interest — not a rupee more",
      "The minimum payment trap: paying just 5% of what you owe means the rest grows at 3–4% per MONTH",
      "Credit utilisation: use under 30% of your credit limit to build a strong CIBIL score"
    ],
    realWorldStat: "The average Indian credit card holder carries a balance of ₹38,000 at 3.5% monthly interest — paying ₹1,330 in interest every single month for nothing.",
    quickQuestion: "If your credit card limit is ₹50,000 and you spend ₹40,000 and pay only the minimum, what do you think happens to the remaining ₹38,000?",
    ageAdapted: {
      junior: {
        hook: "A credit card lets you buy things now and pay later — but if you wait too long, you pay a LOT more.",
        keyPoints: [
          "Credit cards lend you the bank's money — not your own",
          "Pay it back fast and you pay nothing extra",
          "Pay it back slow and you pay a lot more than the original price",
          "It's not free money — think of it like a very short-term loan"
        ]
      },
      teen: {
        hook: "Your first credit card feels like free money. It absolutely is not. Here's what actually happens.",
        keyPoints: [
          "Always spend only what you already have in your bank account — never more",
          "Set up autopay for the full statement balance so you never miss a due date",
          "Never withdraw cash from a credit card — interest starts instantly with no grace period",
          "One card, low limit, zero rollover balance — the starter formula that builds great credit"
        ]
      },
      senior: {
        hook: "Used right, a credit card gives you 45 days free credit, purchase protection, and reward points. Used wrong, it charges 42% annually.",
        keyPoints: [
          "Statement date vs due date: spend just after statement date to maximise interest-free window to ~45 days",
          "Never close your oldest card — account age is 15% of your CIBIL score",
          "Choose a card that matches your spending: travel card for flying, cashback card for daily expenses"
        ],
        extraStat: "CIBIL scores above 750 — mostly built on consistent credit card payment history — save an average ₹8 lakh in lower interest over a home loan."
      }
    },
    estimatedReadSeconds: 55,
    relatedActivityIds: ['first-credit-card']
  }
];
