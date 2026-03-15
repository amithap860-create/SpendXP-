/**
 * @fileOverview 60 scenario-based financial literacy questions for SpendXP.
 * Categorized by age group and financial topic.
 */

export type Category = 'BUDGETING' | 'INVESTING' | 'CREDIT' | 'TAXES' | 'SPENDING';
export type AgeGroup = 'junior' | 'teen' | 'senior';

export interface Question {
  id: string;
  category: Category;
  ageGroups: AgeGroup[];
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const finIQQuestions: Question[] = [
  // --- BUDGETING (12) ---
  {
    id: 'b-1',
    category: 'BUDGETING',
    ageGroups: ['junior'],
    question: "You get $10 allowance. You want a $4 toy and a $3 snack. How much is left to save?",
    options: ["$3", "$7", "$10", "$5"],
    correctIndex: 0,
    explanation: "Subtracting your expenses ($4 + $3 = $7) from your income ($10) leaves $3 for your piggy bank!",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'b-2',
    category: 'BUDGETING',
    ageGroups: ['teen', 'senior'],
    question: "You earn $500/month. Rent is $300, food is $100. According to the 50/30/20 rule, how much should you ideally save?",
    options: ["$100 (20%)", "$50", "$200", "$0"],
    correctIndex: 0,
    explanation: "The 50/30/20 rule suggests putting 20% of your income into savings. 20% of $500 is $100.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'b-3',
    category: 'BUDGETING',
    ageGroups: ['senior'],
    question: "You have a $2,000 monthly income. Your fixed expenses (rent, insurance) are $1,400. What is your 'discretionary' income?",
    options: ["$600", "$1,400", "$2,000", "$400"],
    correctIndex: 0,
    explanation: "Discretionary income is what's left after paying for all necessities. $2,000 - $1,400 = $600.",
    xpReward: 40,
    difficulty: 'hard'
  },
  {
    id: 'b-4',
    category: 'BUDGETING',
    ageGroups: ['junior', 'teen'],
    question: "You're saving for a $60 game. You save $5 every week. How many weeks until you can buy it?",
    options: ["12 weeks", "10 weeks", "15 weeks", "20 weeks"],
    correctIndex: 0,
    explanation: "$60 divided by $5 per week equals 12 weeks of saving.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'b-5',
    category: 'BUDGETING',
    ageGroups: ['teen', 'senior'],
    question: "An 'Emergency Fund' should typically cover how many months of living expenses?",
    options: ["3-6 months", "1 month", "12-24 months", "None"],
    correctIndex: 0,
    explanation: "Most experts recommend 3-6 months of expenses to stay safe during unexpected job loss or repairs.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'b-6',
    category: 'BUDGETING',
    ageGroups: ['junior'],
    question: "You have $20. A 'Need' is something you must have. Which of these is a 'Need'?",
    options: ["School lunch", "A new video game", "Candy", "Movie tickets"],
    correctIndex: 0,
    explanation: "Needs are essentials like food and shelter. Games and candy are 'Wants'.",
    xpReward: 15,
    difficulty: 'easy'
  },
  {
    id: 'b-7',
    category: 'BUDGETING',
    ageGroups: ['senior'],
    question: "If you have a budget deficit (spending more than you earn), what is the first logical step?",
    options: ["Cut variable expenses", "Get a high-interest loan", "Stop paying rent", "Ignore it"],
    correctIndex: 0,
    explanation: "Reducing variable 'wants' (eating out, entertainment) is the fastest way to fix a deficit.",
    xpReward: 40,
    difficulty: 'medium'
  },
  {
    id: 'b-8',
    category: 'BUDGETING',
    ageGroups: ['teen'],
    question: "You want to buy a $1,000 laptop in 10 months. How much must you save monthly?",
    options: ["$100", "$50", "$1,000", "$10"],
    correctIndex: 0,
    explanation: "$1,000 total divided by 10 months = $100 per month.",
    xpReward: 25,
    difficulty: 'easy'
  },
  {
    id: 'b-9',
    category: 'BUDGETING',
    ageGroups: ['junior', 'teen', 'senior'],
    question: "Which of these is a variable expense (changes every month)?",
    options: ["Electricity bill", "Monthly Rent", "Netflix Subscription", "Car payment"],
    correctIndex: 0,
    explanation: "Electricity usage varies based on how much you use, while rent is usually fixed by a contract.",
    xpReward: 25,
    difficulty: 'medium'
  },
  {
    id: 'b-10',
    category: 'BUDGETING',
    ageGroups: ['senior'],
    question: "Zero-based budgeting means...",
    options: ["Every dollar has a job", "You have $0 in the bank", "You don't track spending", "Saving nothing"],
    correctIndex: 0,
    explanation: "In zero-based budgeting, Income minus Expenses equals zero, meaning every cent is accounted for.",
    xpReward: 35,
    difficulty: 'hard'
  },
  {
    id: 'b-11',
    category: 'BUDGETING',
    ageGroups: ['junior'],
    question: "You find $5. You put $2 in your piggy bank and spend $3. What is this called?",
    options: ["Budgeting", "Investing", "Losing money", "Borrowing"],
    correctIndex: 0,
    explanation: "Deciding how to split your money between spending and saving is the start of budgeting!",
    xpReward: 15,
    difficulty: 'easy'
  },
  {
    id: 'b-12',
    category: 'BUDGETING',
    ageGroups: ['teen', 'senior'],
    question: "What does 'Pay Yourself First' mean?",
    options: ["Save before spending", "Buy a gift for yourself", "Only spend on yourself", "Pay bills last"],
    correctIndex: 0,
    explanation: "It means moving money into savings as soon as you get paid, before any other spending happens.",
    xpReward: 30,
    difficulty: 'medium'
  },

  // --- INVESTING (12) ---
  {
    id: 'i-1',
    category: 'INVESTING',
    ageGroups: ['senior'],
    question: "Using the 'Rule of 72', how long will it take for an investment to double at a 6% annual return?",
    options: ["12 years", "6 years", "72 years", "10 years"],
    correctIndex: 0,
    explanation: "72 divided by the interest rate (6) equals the years to double: 12.",
    xpReward: 40,
    difficulty: 'hard'
  },
  {
    id: 'i-2',
    category: 'INVESTING',
    ageGroups: ['teen', 'senior'],
    question: "Compound interest is when...",
    options: ["You earn interest on interest", "The bank takes your money", "You pay fee to invest", "Prices go up"],
    correctIndex: 0,
    explanation: "Compound interest means your previous interest earnings also start earning interest themselves.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'i-3',
    category: 'INVESTING',
    ageGroups: ['junior'],
    question: "If you put money in a 'Stock', what are you buying?",
    options: ["A tiny piece of a company", "A loan to the city", "Insurance", "A gift card"],
    correctIndex: 0,
    explanation: "A stock represents ownership in a company. If the company does well, your piece becomes more valuable!",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'i-4',
    category: 'INVESTING',
    ageGroups: ['senior'],
    question: "What is an Index Fund?",
    options: ["A collection of many stocks", "A single tech company", "A type of bank account", "A government loan"],
    correctIndex: 0,
    explanation: "An index fund bundles many stocks together to track the market, providing automatic diversification.",
    xpReward: 40,
    difficulty: 'hard'
  },
  {
    id: 'i-5',
    category: 'INVESTING',
    ageGroups: ['teen', 'senior'],
    question: "Why do people say 'Don't put all your eggs in one basket' in investing?",
    options: ["Diversification reduces risk", "Eggs are expensive", "Stocks are like chickens", "To save on fees"],
    correctIndex: 0,
    explanation: "Diversification means spreading money across different investments so one failure doesn't ruin you.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'i-6',
    category: 'INVESTING',
    ageGroups: ['junior'],
    question: "Investing usually takes a long time. Is it for 'Short-term' or 'Long-term' goals?",
    options: ["Long-term", "Short-term", "One day", "Yesterday"],
    correctIndex: 0,
    explanation: "Investing works best over many years, helping you grow big savings for the future.",
    xpReward: 15,
    difficulty: 'easy'
  },
  {
    id: 'i-7',
    category: 'INVESTING',
    ageGroups: ['senior'],
    question: "What happens to the purchasing power of your cash during high inflation?",
    options: ["It decreases", "It increases", "Stays the same", "Depends on the bank"],
    correctIndex: 0,
    explanation: "Inflation means prices go up, so the same $1 buys less than it used to. This is why we invest!",
    xpReward: 40,
    difficulty: 'medium'
  },
  {
    id: 'i-8',
    category: 'INVESTING',
    ageGroups: ['teen'],
    question: "A 'Mutual Fund' is managed by...",
    options: ["Professional managers", "A computer only", "You alone", "Nobody"],
    correctIndex: 0,
    explanation: "Mutual funds pool money from many people and are managed by pros to buy various assets.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'i-9',
    category: 'INVESTING',
    ageGroups: ['senior'],
    question: "What is 'Dollar-Cost Averaging'?",
    options: ["Investing same amount regularly", "Buying only when low", "Spending dollars on costs", "Changing currencies"],
    correctIndex: 0,
    explanation: "Investing a fixed amount regularly regardless of price helps smooth out market volatility.",
    xpReward: 45,
    difficulty: 'hard'
  },
  {
    id: 'i-10',
    category: 'INVESTING',
    ageGroups: ['junior', 'teen'],
    question: "If you lend money to the government for a fixed time, you bought a...",
    options: ["Bond", "Stock", "Toy", "Lottery ticket"],
    correctIndex: 0,
    explanation: "Bonds are loans to organizations like governments. They pay you back with interest.",
    xpReward: 25,
    difficulty: 'medium'
  },
  {
    id: 'i-11',
    category: 'INVESTING',
    ageGroups: ['senior'],
    question: "The 'S&P 500' is an index of...",
    options: ["500 large US companies", "The 500 richest people", "500 types of gold", "500 bank accounts"],
    correctIndex: 0,
    explanation: "It tracks the stock performance of 500 of the largest companies listed on US stock exchanges.",
    xpReward: 40,
    difficulty: 'medium'
  },
  {
    id: 'i-12',
    category: 'INVESTING',
    ageGroups: ['teen', 'senior'],
    question: "Risk and Return are related. Usually, higher risk means...",
    options: ["Higher potential return", "Lower potential return", "Guaranteed profit", "No difference"],
    correctIndex: 0,
    explanation: "In finance, to get higher rewards, you usually have to accept a higher chance of losing money.",
    xpReward: 35,
    difficulty: 'medium'
  },

  // --- CREDIT & DEBT (12) ---
  {
    id: 'c-1',
    category: 'CREDIT',
    ageGroups: ['teen', 'senior'],
    question: "Your credit card has 20% APR. You owe $1,000. If you don't pay, roughly how much interest is added in a year?",
    options: ["$200", "$20", "$1,000", "$2,000"],
    correctIndex: 0,
    explanation: "20% of $1,000 is $200. High-interest debt grows very fast if not paid off!",
    xpReward: 35,
    difficulty: 'medium'
  },
  {
    id: 'c-2',
    category: 'CREDIT',
    ageGroups: ['senior'],
    question: "Which factor has the biggest impact on your Credit Score?",
    options: ["Payment History", "Income level", "Your job title", "The bank name"],
    correctIndex: 0,
    explanation: "Whether you pay your bills on time (Payment History) is the most critical part of your score.",
    xpReward: 40,
    difficulty: 'hard'
  },
  {
    id: 'c-3',
    category: 'CREDIT',
    ageGroups: ['junior'],
    question: "Borrowing money means you must pay it back later. This is called...",
    options: ["Debt", "A Gift", "Winning", "Free money"],
    correctIndex: 0,
    explanation: "Debt is money you owe. It usually costs more to pay back than what you borrowed!",
    xpReward: 15,
    difficulty: 'easy'
  },
  {
    id: 'c-4',
    category: 'CREDIT',
    ageGroups: ['senior'],
    question: "What is a 'Secured' loan?",
    options: ["Backed by an asset (like a car)", "A loan with a secret password", "A loan from family", "A loan that is free"],
    correctIndex: 0,
    explanation: "Secured loans use collateral (like a house or car) that the bank can take if you don't pay.",
    xpReward: 40,
    difficulty: 'medium'
  },
  {
    id: 'c-5',
    category: 'CREDIT',
    ageGroups: ['teen', 'senior'],
    question: "If you only pay the 'Minimum Balance' on a credit card...",
    options: ["You will pay massive interest", "You will pay off debt fast", "The bank gives you a bonus", "Nothing happens"],
    correctIndex: 0,
    explanation: "Minimum payments barely cover interest, meaning it can take decades to pay off even a small balance.",
    xpReward: 35,
    difficulty: 'hard'
  },
  {
    id: 'c-6',
    category: 'CREDIT',
    ageGroups: ['junior'],
    question: "If you borrow a toy, you have to give it back. If you borrow money from a bank, you also pay...",
    options: ["Interest (Extra money)", "Candy", "Nothing", "A thank you note"],
    correctIndex: 0,
    explanation: "Interest is the 'rent' you pay to the bank for using their money.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'c-7',
    category: 'CREDIT',
    ageGroups: ['senior'],
    question: "A high Credit Score (e.g., 800+) helps you...",
    options: ["Get lower interest rates", "Get a free house", "Avoid paying taxes", "Spend more money"],
    correctIndex: 0,
    explanation: "Banks trust high-score borrowers more, so they charge them less interest on loans.",
    xpReward: 40,
    difficulty: 'medium'
  },
  {
    id: 'c-8',
    category: 'CREDIT',
    ageGroups: ['teen'],
    question: "A Debit Card is different from a Credit Card because...",
    options: ["It uses your own money", "It is made of paper", "It is a loan", "It never expires"],
    correctIndex: 0,
    explanation: "Debit cards take money directly from your bank account. Credit cards are short-term loans.",
    xpReward: 25,
    difficulty: 'easy'
  },
  {
    id: 'c-9',
    category: 'CREDIT',
    ageGroups: ['senior'],
    question: "What is 'Credit Utilization'?",
    options: ["% of credit limit used", "How many cards you have", "Your total income", "Time since first card"],
    correctIndex: 0,
    explanation: "It's how much of your available credit you're using. Keeping it under 30% helps your score.",
    xpReward: 45,
    difficulty: 'hard'
  },
  {
    id: 'c-10',
    category: 'CREDIT',
    ageGroups: ['junior', 'teen'],
    question: "If you can't pay back a friend $5 today, and you wait a month, your friend might be upset. A bank will...",
    options: ["Charge you a late fee", "Forget about it", "Give you more money", "Call your teacher"],
    correctIndex: 0,
    explanation: "Banks are strict! Late payments lead to fees and hurt your financial reputation (credit score).",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'c-11',
    category: 'CREDIT',
    ageGroups: ['senior'],
    question: "Bankruptcy is a legal process that...",
    options: ["Helps people with huge debt", "Makes you rich", "Is a type of bank", "Is a savings goal"],
    correctIndex: 0,
    explanation: "It's a last resort for people who cannot pay debts, but it ruins your credit for many years.",
    xpReward: 40,
    difficulty: 'hard'
  },
  {
    id: 'c-12',
    category: 'CREDIT',
    ageGroups: ['teen', 'senior'],
    question: "APR stands for...",
    options: ["Annual Percentage Rate", "Automatic Payment Receipt", "Account Price Ratio", "Annual Profit Return"],
    correctIndex: 0,
    explanation: "APR is the yearly interest rate you pay on a loan or credit card.",
    xpReward: 30,
    difficulty: 'medium'
  },

  // --- TAXES (12) ---
  {
    id: 't-1',
    category: 'TAXES',
    ageGroups: ['teen', 'senior'],
    question: "You earn $15/hour and work 10 hours. Your paycheck is only $127.50 instead of $150. Why?",
    options: ["Income Tax (15%)", "The bank took it", "The boss is mean", "You lost hours"],
    correctIndex: 0,
    explanation: "Governments take 'Income Tax' from your earnings to pay for roads, schools, and safety.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 't-2',
    category: 'TAXES',
    ageGroups: ['senior'],
    question: "A 'Progressive' tax system means...",
    options: ["Higher earners pay more %", "Everyone pays the same %", "Only companies pay", "Taxes go down over time"],
    correctIndex: 0,
    explanation: "In a progressive system, the tax rate increases as the taxable amount (income) increases.",
    xpReward: 40,
    difficulty: 'hard'
  },
  {
    id: 't-3',
    category: 'TAXES',
    ageGroups: ['junior'],
    question: "Taxes are money paid to the government. What do they buy?",
    options: ["Parks and Schools", "Candy for everyone", "Video games", "Nothing"],
    correctIndex: 0,
    explanation: "Taxes pay for public things we all use, like public parks, libraries, and schools.",
    xpReward: 15,
    difficulty: 'easy'
  },
  {
    id: 't-4',
    category: 'TAXES',
    ageGroups: ['senior'],
    question: "What is a 'Standard Deduction'?",
    options: ["Tax-free portion of income", "A fee for filing taxes", "A penalty for late taxes", "Your total tax bill"],
    correctIndex: 0,
    explanation: "It's a flat amount you can subtract from your income before calculating how much tax you owe.",
    xpReward: 40,
    difficulty: 'medium'
  },
  {
    id: 't-5',
    category: 'TAXES',
    ageGroups: ['teen', 'senior'],
    question: "Sales Tax is added to...",
    options: ["Things you buy at shops", "Your monthly salary", "Your savings account", "Your birthday gifts"],
    correctIndex: 0,
    explanation: "Sales tax is a small extra percentage you pay on most products and services at the checkout.",
    xpReward: 25,
    difficulty: 'easy'
  },
  {
    id: 't-6',
    category: 'TAXES',
    ageGroups: ['senior'],
    question: "What does the IRS stand for?",
    options: ["Internal Revenue Service", "International Road Safety", "Investment Risk System", "Income Review Station"],
    correctIndex: 0,
    explanation: "The IRS is the US government agency responsible for collecting taxes.",
    xpReward: 35,
    difficulty: 'medium'
  },
  {
    id: 't-7',
    category: 'TAXES',
    ageGroups: ['senior'],
    question: "Capital Gains Tax is paid on...",
    options: ["Profit from selling assets", "Your hourly wage", "Buying groceries", "Property you live in"],
    correctIndex: 0,
    explanation: "If you buy a stock for $100 and sell for $150, you pay tax on that $50 profit (the 'gain').",
    xpReward: 45,
    difficulty: 'hard'
  },
  {
    id: 't-8',
    category: 'TAXES',
    ageGroups: ['junior', 'teen'],
    question: "If you work a 'Side Hustle' (like lawn mowing), do you technically owe taxes?",
    options: ["Yes, if you earn enough", "No, never", "Only if you use a bank", "Only on weekends"],
    correctIndex: 0,
    explanation: "Most income, even from small jobs, is technically taxable if you earn above a certain limit.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 't-9',
    category: 'TAXES',
    ageGroups: ['senior'],
    question: "A 'W-2' form is used to...",
    options: ["Report annual wages/taxes", "Apply for a new job", "Open a bank account", "Pay for college"],
    correctIndex: 0,
    explanation: "Your employer sends you a W-2 at the end of the year showing what you earned and taxes paid.",
    xpReward: 35,
    difficulty: 'medium'
  },
  {
    id: 't-10',
    category: 'TAXES',
    ageGroups: ['junior'],
    question: "When you see a toy for $1.00 but pay $1.08 at the counter, that extra 8 cents is...",
    options: ["Sales Tax", "A mistake", "A tip for the shop", "A shipping fee"],
    correctIndex: 0,
    explanation: "Most stores show the price without tax. The tax is added when you actually pay!",
    xpReward: 15,
    difficulty: 'easy'
  },
  {
    id: 't-11',
    category: 'TAXES',
    ageGroups: ['senior'],
    question: "Property Tax is based on...",
    options: ["The value of your home/land", "How many cars you have", "Your total savings", "Your annual income"],
    correctIndex: 0,
    explanation: "If you own a home or land, you pay a yearly tax based on what that property is worth.",
    xpReward: 40,
    difficulty: 'medium'
  },
  {
    id: 't-12',
    category: 'TAXES',
    ageGroups: ['teen', 'senior'],
    question: "Tax Evasion is...",
    options: ["Illegal refusal to pay tax", "Avoiding high prices", "A type of investment", "Saving on taxes legally"],
    correctIndex: 0,
    explanation: "Legally reducing taxes is 'Tax Avoidance'. Illegally lying to not pay is 'Tax Evasion'.",
    xpReward: 40,
    difficulty: 'hard'
  },

  // --- SPENDING (12) ---
  {
    id: 's-1',
    category: 'SPENDING',
    ageGroups: ['junior', 'teen', 'senior'],
    question: "You want a $50 hoodie. It's 20% off today. What is the sale price?",
    options: ["$40", "$30", "$45", "$10"],
    correctIndex: 0,
    explanation: "20% of $50 is $10. $50 minus $10 equals $40.",
    xpReward: 25,
    difficulty: 'medium'
  },
  {
    id: 's-2',
    category: 'SPENDING',
    ageGroups: ['junior'],
    question: "You have $5. You spend $4 on a comic book. What percentage of your money did you spend?",
    options: ["80%", "50%", "20%", "100%"],
    correctIndex: 0,
    explanation: "4 out of 5 is 80%. You spent most of your money!",
    xpReward: 20,
    difficulty: 'medium'
  },
  {
    id: 's-3',
    category: 'SPENDING',
    ageGroups: ['teen', 'senior'],
    question: "An 'Opportunity Cost' is...",
    options: ["What you give up to buy X", "The price of a product", "A shipping fee", "A discount"],
    correctIndex: 0,
    explanation: "If you spend $100 on shoes, the 'Opportunity Cost' is the concert ticket you can no longer afford.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 's-4',
    category: 'SPENDING',
    ageGroups: ['junior'],
    question: "Wait a day before buying something expensive. This helps avoid...",
    options: ["Impulse buying", "Saving money", "Getting a discount", "Losing your wallet"],
    correctIndex: 0,
    explanation: "Impulse buying is when you buy things quickly without thinking. Waiting helps you decide if you really need it.",
    xpReward: 15,
    difficulty: 'easy'
  },
  {
    id: 's-5',
    category: 'SPENDING',
    ageGroups: ['senior'],
    question: "Comparison shopping means...",
    options: ["Checking prices at many stores", "Buying what your friends have", "Only buying luxury brands", "Shopping every day"],
    correctIndex: 0,
    explanation: "By checking different sellers, you can find the best value for your money.",
    xpReward: 30,
    difficulty: 'easy'
  },
  {
    id: 's-6',
    category: 'SPENDING',
    ageGroups: ['teen', 'senior'],
    question: "A subscription costs $10/month. How much does it cost you per year?",
    options: ["$120", "$100", "$10", "$365"],
    correctIndex: 0,
    explanation: "$10 per month multiplied by 12 months in a year equals $120.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 's-7',
    category: 'SPENDING',
    ageGroups: ['junior'],
    question: "Buying in 'Bulk' (large packs) is often cheaper per item. This is called...",
    options: ["Unit Pricing", "Bulk Buying", "Free shopping", "Losing money"],
    correctIndex: 0,
    explanation: "Buying a pack of 10 usually makes each one cheaper than buying 10 separate ones.",
    xpReward: 20,
    difficulty: 'medium'
  },
  {
    id: 's-8',
    category: 'SPENDING',
    ageGroups: ['senior'],
    question: "Which of these is a 'Depreciating' asset (loses value over time)?",
    options: ["A new car", "A house", "A stock", "Gold"],
    correctIndex: 0,
    explanation: "Most cars lose value the moment you drive them away. Stocks and houses usually increase over time.",
    xpReward: 35,
    difficulty: 'medium'
  },
  {
    id: 's-9',
    category: 'SPENDING',
    ageGroups: ['teen'],
    question: "Marketing and Ads are designed to...",
    options: ["Make you want to spend", "Help you save money", "Teach you math", "Give you free gifts"],
    correctIndex: 0,
    explanation: "Ads use psychology to make products look exciting so you'll choose to spend your money on them.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 's-10',
    category: 'SPENDING',
    ageGroups: ['senior'],
    question: "What is 'Lifestyle Creep'?",
    options: ["Spending more as you earn more", "Moving to a bigger city", "Buying a haunted house", "Saving too much"],
    correctIndex: 0,
    explanation: "As people get raises, they often upgrade their lifestyle, meaning they don't actually save more.",
    xpReward: 40,
    difficulty: 'hard'
  },
  {
    id: 's-11',
    category: 'SPENDING',
    ageGroups: ['junior'],
    question: "If you have $10, and you spend it all today, you have $0 for tomorrow. This is...",
    options: ["Poor planning", "Saving", "Investing", "A good idea"],
    correctIndex: 0,
    explanation: "Spending everything now means you have no 'buffer' or money for future goals.",
    xpReward: 15,
    difficulty: 'easy'
  },
  {
    id: 's-12',
    category: 'SPENDING',
    ageGroups: ['teen', 'senior'],
    question: "What is the 'Real Cost' of a product (including maintenance/parts)?",
    options: ["Total Cost of Ownership", "Sticker Price", "Sales Tax", "Discount"],
    correctIndex: 0,
    explanation: "Buying a printer is cheap, but the ink you must keep buying makes the 'Total Cost' much higher.",
    xpReward: 35,
    difficulty: 'hard'
  },
];
