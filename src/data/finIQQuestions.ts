/**
 * @fileOverview 110 scenario-based financial literacy questions for SpendXP.
 * Categorized by age group and financial topic.
 *
 * Country variants: most of these questions are universal finance concepts
 * (what is a stock, what is diversification) and need no localisation. Where
 * a question depends on currency amounts or a specific real-world institution
 * (tax authority, credit bureau, stock index, tax form), it carries an
 * optional `countryVariants` override — see resolveQuestion() below. Only the
 * questions that are genuinely country-dependent have variants; the rest
 * stay as a single shared version rather than 8 copies of identical text.
 */

import { CountryCode } from './countryFinance';

export type Category = 'BUDGETING' | 'INVESTING' | 'CREDIT' | 'TAXES' | 'SPENDING';
export type AgeGroup = 'junior' | 'teen' | 'senior';

export type QuestionVariant = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

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
  /** Per-country overrides. India's own numbers/wording live in the base
   *  fields above (this app's default), so IN is usually omitted here unless
   *  it needs to differ from those base fields for some reason. */
  countryVariants?: Partial<Record<CountryCode, QuestionVariant>>;
}

/** Resolves a question to the right variant for a user's country, falling
 *  back to the base (India-authored) fields if no override exists for that
 *  country — which is the common case for universal concept questions. */
export function resolveQuestion(q: Question, countryCode: string): QuestionVariant {
  const variant = q.countryVariants?.[countryCode as CountryCode];
  return variant ?? {
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  };
}

export const finIQQuestions: Question[] = [
  // --- BUDGETING (12) ---
  {
    id: 'b-1',
    category: 'BUDGETING',
    ageGroups: ['junior'],
    question: "You get ₹100 allowance. You want a ₹40 toy and a ₹30 snack. How much is left to save?",
    options: ["₹30", "₹70", "₹100", "₹50"],
    correctIndex: 0,
    explanation: "Subtracting your expenses (₹40 + ₹30 = ₹70) from your income (₹100) leaves ₹30 for your piggy bank!",
    xpReward: 20,
    difficulty: 'easy',
    countryVariants: {
      US: { question: "You get $10 allowance. You want a $4 toy and a $3 snack. How much is left to save?", options: ["$3", "$7", "$10", "$5"], correctIndex: 0, explanation: "Subtracting your expenses ($4 + $3 = $7) from your income ($10) leaves $3 for your piggy bank!" },
      GB: { question: "You get £10 allowance. You want a £4 toy and a £3 snack. How much is left to save?", options: ["£3", "£7", "£10", "£5"], correctIndex: 0, explanation: "Subtracting your expenses (£4 + £3 = £7) from your income (£10) leaves £3 for your piggy bank!" },
      CN: { question: "You get ¥50 allowance. You want a ¥20 toy and a ¥15 snack. How much is left to save?", options: ["¥15", "¥35", "¥50", "¥25"], correctIndex: 0, explanation: "Subtracting your expenses (¥20 + ¥15 = ¥35) from your income (¥50) leaves ¥15 for your piggy bank!" },
      JP: { question: "You get ¥1,000 allowance. You want a ¥400 toy and a ¥300 snack. How much is left to save?", options: ["¥300", "¥700", "¥1,000", "¥500"], correctIndex: 0, explanation: "Subtracting your expenses (¥400 + ¥300 = ¥700) from your income (¥1,000) leaves ¥300 for your piggy bank!" },
      RU: { question: "You get ₽300 allowance. You want a ₽120 toy and a ₽90 snack. How much is left to save?", options: ["₽90", "₽210", "₽300", "₽150"], correctIndex: 0, explanation: "Subtracting your expenses (₽120 + ₽90 = ₽210) from your income (₽300) leaves ₽90 for your piggy bank!" },
      ZA: { question: "You get R100 allowance. You want a R40 toy and a R30 snack. How much is left to save?", options: ["R30", "R70", "R100", "R50"], correctIndex: 0, explanation: "Subtracting your expenses (R40 + R30 = R70) from your income (R100) leaves R30 for your piggy bank!" },
      SD: { question: "You get $10 allowance. You want a $4 toy and a $3 snack. How much is left to save?", options: ["$3", "$7", "$10", "$5"], correctIndex: 0, explanation: "Subtracting your expenses ($4 + $3 = $7) from your income ($10) leaves $3 for your piggy bank!" },
    }
  },
  {
    id: 'b-2',
    category: 'BUDGETING',
    ageGroups: ['teen', 'senior'],
    question: "You earn ₹15,000/month. Rent is ₹9,000, food is ₹3,000. According to the 50/30/20 rule, how much should you ideally save?",
    options: ["₹3,000 (20%)", "₹1,500", "₹6,000", "₹0"],
    correctIndex: 0,
    explanation: "The 50/30/20 rule suggests putting 20% of your income into savings. 20% of ₹15,000 is ₹3,000.",
    xpReward: 30,
    difficulty: 'medium',
    countryVariants: {
      US: { question: "You earn $500/month. Rent is $300, food is $100. According to the 50/30/20 rule, how much should you ideally save?", options: ["$100 (20%)", "$50", "$200", "$0"], correctIndex: 0, explanation: "The 50/30/20 rule suggests putting 20% of your income into savings. 20% of $500 is $100." },
      GB: { question: "You earn £500/month. Rent is £300, food is £100. According to the 50/30/20 rule, how much should you ideally save?", options: ["£100 (20%)", "£50", "£200", "£0"], correctIndex: 0, explanation: "The 50/30/20 rule suggests putting 20% of your income into savings. 20% of £500 is £100." },
      CN: { question: "You earn ¥2,500/month. Rent is ¥1,500, food is ¥500. According to the 50/30/20 rule, how much should you ideally save?", options: ["¥500 (20%)", "¥250", "¥1,000", "¥0"], correctIndex: 0, explanation: "The 50/30/20 rule suggests putting 20% of your income into savings. 20% of ¥2,500 is ¥500." },
      JP: { question: "You earn ¥75,000/month. Rent is ¥45,000, food is ¥15,000. According to the 50/30/20 rule, how much should you ideally save?", options: ["¥15,000 (20%)", "¥7,500", "¥30,000", "¥0"], correctIndex: 0, explanation: "The 50/30/20 rule suggests putting 20% of your income into savings. 20% of ¥75,000 is ¥15,000." },
      RU: { question: "You earn ₽37,500/month. Rent is ₽22,500, food is ₽7,500. According to the 50/30/20 rule, how much should you ideally save?", options: ["₽7,500 (20%)", "₽3,750", "₽15,000", "₽0"], correctIndex: 0, explanation: "The 50/30/20 rule suggests putting 20% of your income into savings. 20% of ₽37,500 is ₽7,500." },
      ZA: { question: "You earn R7,500/month. Rent is R4,500, food is R1,500. According to the 50/30/20 rule, how much should you ideally save?", options: ["R1,500 (20%)", "R750", "R3,000", "R0"], correctIndex: 0, explanation: "The 50/30/20 rule suggests putting 20% of your income into savings. 20% of R7,500 is R1,500." },
      SD: { question: "You earn $500/month. Rent is $300, food is $100. According to the 50/30/20 rule, how much should you ideally save?", options: ["$100 (20%)", "$50", "$200", "$0"], correctIndex: 0, explanation: "The 50/30/20 rule suggests putting 20% of your income into savings. 20% of $500 is $100." },
    }
  },
  {
    id: 'b-3',
    category: 'BUDGETING',
    ageGroups: ['senior'],
    question: "You have a ₹60,000 monthly income. Your fixed expenses (rent, insurance) are ₹42,000. What is your 'discretionary' income?",
    options: ["₹18,000", "₹42,000", "₹60,000", "₹12,000"],
    correctIndex: 0,
    explanation: "Discretionary income is what's left after paying for all necessities. ₹60,000 - ₹42,000 = ₹18,000.",
    xpReward: 40,
    difficulty: 'hard',
    countryVariants: {
      US: { question: "You have a $2,000 monthly income. Your fixed expenses (rent, insurance) are $1,400. What is your 'discretionary' income?", options: ["$600", "$1,400", "$2,000", "$400"], correctIndex: 0, explanation: "Discretionary income is what's left after paying for all necessities. $2,000 - $1,400 = $600." },
      GB: { question: "You have a £2,000 monthly income. Your fixed expenses (rent, insurance) are £1,400. What is your 'discretionary' income?", options: ["£600", "£1,400", "£2,000", "£400"], correctIndex: 0, explanation: "Discretionary income is what's left after paying for all necessities. £2,000 - £1,400 = £600." },
      CN: { question: "You have a ¥10,000 monthly income. Your fixed expenses (rent, insurance) are ¥7,000. What is your 'discretionary' income?", options: ["¥3,000", "¥7,000", "¥10,000", "¥2,000"], correctIndex: 0, explanation: "Discretionary income is what's left after paying for all necessities. ¥10,000 - ¥7,000 = ¥3,000." },
      JP: { question: "You have a ¥300,000 monthly income. Your fixed expenses (rent, insurance) are ¥210,000. What is your 'discretionary' income?", options: ["¥90,000", "¥210,000", "¥300,000", "¥60,000"], correctIndex: 0, explanation: "Discretionary income is what's left after paying for all necessities. ¥300,000 - ¥210,000 = ¥90,000." },
      RU: { question: "You have a ₽150,000 monthly income. Your fixed expenses (rent, insurance) are ₽105,000. What is your 'discretionary' income?", options: ["₽45,000", "₽105,000", "₽150,000", "₽30,000"], correctIndex: 0, explanation: "Discretionary income is what's left after paying for all necessities. ₽150,000 - ₽105,000 = ₽45,000." },
      ZA: { question: "You have a R30,000 monthly income. Your fixed expenses (rent, insurance) are R21,000. What is your 'discretionary' income?", options: ["R9,000", "R21,000", "R30,000", "R6,000"], correctIndex: 0, explanation: "Discretionary income is what's left after paying for all necessities. R30,000 - R21,000 = R9,000." },
      SD: { question: "You have a $2,000 monthly income. Your fixed expenses (rent, insurance) are $1,400. What is your 'discretionary' income?", options: ["$600", "$1,400", "$2,000", "$400"], correctIndex: 0, explanation: "Discretionary income is what's left after paying for all necessities. $2,000 - $1,400 = $600." },
    }
  },
  {
    id: 'b-4',
    category: 'BUDGETING',
    ageGroups: ['junior', 'teen'],
    question: "You're saving for a ₹600 game. You save ₹50 every week. How many weeks until you can buy it?",
    options: ["12 weeks", "10 weeks", "15 weeks", "20 weeks"],
    correctIndex: 0,
    explanation: "₹600 divided by ₹50 per week equals 12 weeks of saving.",
    xpReward: 20,
    difficulty: 'easy',
    countryVariants: {
      US: { question: "You're saving for a $60 game. You save $5 every week. How many weeks until you can buy it?", options: ["12 weeks", "10 weeks", "15 weeks", "20 weeks"], correctIndex: 0, explanation: "$60 divided by $5 per week equals 12 weeks of saving." },
      GB: { question: "You're saving for a £60 game. You save £5 every week. How many weeks until you can buy it?", options: ["12 weeks", "10 weeks", "15 weeks", "20 weeks"], correctIndex: 0, explanation: "£60 divided by £5 per week equals 12 weeks of saving." },
      CN: { question: "You're saving for a ¥300 game. You save ¥25 every week. How many weeks until you can buy it?", options: ["12 weeks", "10 weeks", "15 weeks", "20 weeks"], correctIndex: 0, explanation: "¥300 divided by ¥25 per week equals 12 weeks of saving." },
      JP: { question: "You're saving for a ¥9,000 game. You save ¥750 every week. How many weeks until you can buy it?", options: ["12 weeks", "10 weeks", "15 weeks", "20 weeks"], correctIndex: 0, explanation: "¥9,000 divided by ¥750 per week equals 12 weeks of saving." },
      RU: { question: "You're saving for a ₽4,500 game. You save ₽375 every week. How many weeks until you can buy it?", options: ["12 weeks", "10 weeks", "15 weeks", "20 weeks"], correctIndex: 0, explanation: "₽4,500 divided by ₽375 per week equals 12 weeks of saving." },
      ZA: { question: "You're saving for a R900 game. You save R75 every week. How many weeks until you can buy it?", options: ["12 weeks", "10 weeks", "15 weeks", "20 weeks"], correctIndex: 0, explanation: "R900 divided by R75 per week equals 12 weeks of saving." },
      SD: { question: "You're saving for a $60 game. You save $5 every week. How many weeks until you can buy it?", options: ["12 weeks", "10 weeks", "15 weeks", "20 weeks"], correctIndex: 0, explanation: "$60 divided by $5 per week equals 12 weeks of saving." },
    }
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
    question: "You have ₹200. A 'Need' is something you must have. Which of these is a 'Need'?",
    options: ["School lunch", "A new video game", "Candy", "Movie tickets"],
    correctIndex: 0,
    explanation: "Needs are essentials like food and shelter. Games and candy are 'Wants'.",
    xpReward: 15,
    difficulty: 'easy',
    countryVariants: {
      US: { question: "You have $20. A 'Need' is something you must have. Which of these is a 'Need'?", options: ["School lunch", "A new video game", "Candy", "Movie tickets"], correctIndex: 0, explanation: "Needs are essentials like food and shelter. Games and candy are 'Wants'." },
      GB: { question: "You have £20. A 'Need' is something you must have. Which of these is a 'Need'?", options: ["School lunch", "A new video game", "Candy", "Movie tickets"], correctIndex: 0, explanation: "Needs are essentials like food and shelter. Games and candy are 'Wants'." },
      CN: { question: "You have ¥100. A 'Need' is something you must have. Which of these is a 'Need'?", options: ["School lunch", "A new video game", "Candy", "Movie tickets"], correctIndex: 0, explanation: "Needs are essentials like food and shelter. Games and candy are 'Wants'." },
      JP: { question: "You have ¥3,000. A 'Need' is something you must have. Which of these is a 'Need'?", options: ["School lunch", "A new video game", "Candy", "Movie tickets"], correctIndex: 0, explanation: "Needs are essentials like food and shelter. Games and candy are 'Wants'." },
      RU: { question: "You have ₽1,500. A 'Need' is something you must have. Which of these is a 'Need'?", options: ["School lunch", "A new video game", "Candy", "Movie tickets"], correctIndex: 0, explanation: "Needs are essentials like food and shelter. Games and candy are 'Wants'." },
      ZA: { question: "You have R300. A 'Need' is something you must have. Which of these is a 'Need'?", options: ["School lunch", "A new video game", "Candy", "Movie tickets"], correctIndex: 0, explanation: "Needs are essentials like food and shelter. Games and candy are 'Wants'." },
      SD: { question: "You have $20. A 'Need' is something you must have. Which of these is a 'Need'?", options: ["School lunch", "A new video game", "Candy", "Movie tickets"], correctIndex: 0, explanation: "Needs are essentials like food and shelter. Games and candy are 'Wants'." },
    }
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
    question: "You want to buy a ₹30,000 laptop in 10 months. How much must you save monthly?",
    options: ["₹3,000", "₹1,500", "₹30,000", "₹300"],
    correctIndex: 0,
    explanation: "₹30,000 total divided by 10 months = ₹3,000 per month.",
    xpReward: 25,
    difficulty: 'easy',
    countryVariants: {
      US: { question: "You want to buy a $1,000 laptop in 10 months. How much must you save monthly?", options: ["$100", "$50", "$1,000", "$10"], correctIndex: 0, explanation: "$1,000 total divided by 10 months = $100 per month." },
      GB: { question: "You want to buy a £1,000 laptop in 10 months. How much must you save monthly?", options: ["£100", "£50", "£1,000", "£10"], correctIndex: 0, explanation: "£1,000 total divided by 10 months = £100 per month." },
      CN: { question: "You want to buy a ¥5,000 laptop in 10 months. How much must you save monthly?", options: ["¥500", "¥250", "¥5,000", "¥50"], correctIndex: 0, explanation: "¥5,000 total divided by 10 months = ¥500 per month." },
      JP: { question: "You want to buy a ¥150,000 laptop in 10 months. How much must you save monthly?", options: ["¥15,000", "¥7,500", "¥150,000", "¥1,500"], correctIndex: 0, explanation: "¥150,000 total divided by 10 months = ¥15,000 per month." },
      RU: { question: "You want to buy a ₽75,000 laptop in 10 months. How much must you save monthly?", options: ["₽7,500", "₽3,750", "₽75,000", "₽750"], correctIndex: 0, explanation: "₽75,000 total divided by 10 months = ₽7,500 per month." },
      ZA: { question: "You want to buy a R15,000 laptop in 10 months. How much must you save monthly?", options: ["R1,500", "R750", "R15,000", "R150"], correctIndex: 0, explanation: "R15,000 total divided by 10 months = R1,500 per month." },
      SD: { question: "You want to buy a $1,000 laptop in 10 months. How much must you save monthly?", options: ["$100", "$50", "$1,000", "$10"], correctIndex: 0, explanation: "$1,000 total divided by 10 months = $100 per month." },
    }
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
    options: ["Every rupee has a job", "You have ₹0 in the bank", "You don't track spending", "Saving nothing"],
    correctIndex: 0,
    explanation: "In zero-based budgeting, Income minus Expenses equals zero, meaning every unit of currency is accounted for.",
    xpReward: 35,
    difficulty: 'hard',
    countryVariants: {
      US: { question: "Zero-based budgeting means...", options: ["Every dollar has a job", "You have $0 in the bank", "You don't track spending", "Saving nothing"], correctIndex: 0, explanation: "In zero-based budgeting, Income minus Expenses equals zero, meaning every dollar is accounted for." },
      GB: { question: "Zero-based budgeting means...", options: ["Every pound has a job", "You have £0 in the bank", "You don't track spending", "Saving nothing"], correctIndex: 0, explanation: "In zero-based budgeting, Income minus Expenses equals zero, meaning every pound is accounted for." },
      CN: { question: "Zero-based budgeting means...", options: ["Every yuan has a job", "You have ¥0 in the bank", "You don't track spending", "Saving nothing"], correctIndex: 0, explanation: "In zero-based budgeting, Income minus Expenses equals zero, meaning every yuan is accounted for." },
      JP: { question: "Zero-based budgeting means...", options: ["Every yen has a job", "You have ¥0 in the bank", "You don't track spending", "Saving nothing"], correctIndex: 0, explanation: "In zero-based budgeting, Income minus Expenses equals zero, meaning every yen is accounted for." },
      RU: { question: "Zero-based budgeting means...", options: ["Every ruble has a job", "You have ₽0 in the bank", "You don't track spending", "Saving nothing"], correctIndex: 0, explanation: "In zero-based budgeting, Income minus Expenses equals zero, meaning every ruble is accounted for." },
      ZA: { question: "Zero-based budgeting means...", options: ["Every rand has a job", "You have R0 in the bank", "You don't track spending", "Saving nothing"], correctIndex: 0, explanation: "In zero-based budgeting, Income minus Expenses equals zero, meaning every rand is accounted for." },
      SD: { question: "Zero-based budgeting means...", options: ["Every dollar has a job", "You have $0 in the bank", "You don't track spending", "Saving nothing"], correctIndex: 0, explanation: "In zero-based budgeting, Income minus Expenses equals zero, meaning every dollar is accounted for." },
    }
  },
  {
    id: 'b-11',
    category: 'BUDGETING',
    ageGroups: ['junior'],
    question: "You find ₹50. You put ₹20 in your piggy bank and spend ₹30. What is this called?",
    options: ["Budgeting", "Investing", "Losing money", "Borrowing"],
    correctIndex: 0,
    explanation: "Deciding how to split your money between spending and saving is the start of budgeting!",
    xpReward: 15,
    difficulty: 'easy',
    countryVariants: {
      US: { question: "You find $5. You put $2 in your piggy bank and spend $3. What is this called?", options: ["Budgeting", "Investing", "Losing money", "Borrowing"], correctIndex: 0, explanation: "Deciding how to split your money between spending and saving is the start of budgeting!" },
      GB: { question: "You find £5. You put £2 in your piggy bank and spend £3. What is this called?", options: ["Budgeting", "Investing", "Losing money", "Borrowing"], correctIndex: 0, explanation: "Deciding how to split your money between spending and saving is the start of budgeting!" },
      CN: { question: "You find ¥25. You put ¥10 in your piggy bank and spend ¥15. What is this called?", options: ["Budgeting", "Investing", "Losing money", "Borrowing"], correctIndex: 0, explanation: "Deciding how to split your money between spending and saving is the start of budgeting!" },
      JP: { question: "You find ¥750. You put ¥300 in your piggy bank and spend ¥450. What is this called?", options: ["Budgeting", "Investing", "Losing money", "Borrowing"], correctIndex: 0, explanation: "Deciding how to split your money between spending and saving is the start of budgeting!" },
      RU: { question: "You find ₽375. You put ₽150 in your piggy bank and spend ₽225. What is this called?", options: ["Budgeting", "Investing", "Losing money", "Borrowing"], correctIndex: 0, explanation: "Deciding how to split your money between spending and saving is the start of budgeting!" },
      ZA: { question: "You find R75. You put R30 in your piggy bank and spend R45. What is this called?", options: ["Budgeting", "Investing", "Losing money", "Borrowing"], correctIndex: 0, explanation: "Deciding how to split your money between spending and saving is the start of budgeting!" },
      SD: { question: "You find $5. You put $2 in your piggy bank and spend $3. What is this called?", options: ["Budgeting", "Investing", "Losing money", "Borrowing"], correctIndex: 0, explanation: "Deciding how to split your money between spending and saving is the start of budgeting!" },
    }
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
    explanation: "Inflation means prices go up, so the same ₹1 buys less than it used to. This is why we invest!",
    xpReward: 40,
    difficulty: 'medium',
    countryVariants: {
      US: { question: "What happens to the purchasing power of your cash during high inflation?", options: ["It decreases", "It increases", "Stays the same", "Depends on the bank"], correctIndex: 0, explanation: "Inflation means prices go up, so the same $1 buys less than it used to. This is why we invest!" },
      GB: { question: "What happens to the purchasing power of your cash during high inflation?", options: ["It decreases", "It increases", "Stays the same", "Depends on the bank"], correctIndex: 0, explanation: "Inflation means prices go up, so the same £1 buys less than it used to. This is why we invest!" },
      CN: { question: "What happens to the purchasing power of your cash during high inflation?", options: ["It decreases", "It increases", "Stays the same", "Depends on the bank"], correctIndex: 0, explanation: "Inflation means prices go up, so the same ¥1 buys less than it used to. This is why we invest!" },
      JP: { question: "What happens to the purchasing power of your cash during high inflation?", options: ["It decreases", "It increases", "Stays the same", "Depends on the bank"], correctIndex: 0, explanation: "Inflation means prices go up, so the same ¥1 buys less than it used to. This is why we invest!" },
      RU: { question: "What happens to the purchasing power of your cash during high inflation?", options: ["It decreases", "It increases", "Stays the same", "Depends on the bank"], correctIndex: 0, explanation: "Inflation means prices go up, so the same ₽1 buys less than it used to. This is why we invest!" },
      ZA: { question: "What happens to the purchasing power of your cash during high inflation?", options: ["It decreases", "It increases", "Stays the same", "Depends on the bank"], correctIndex: 0, explanation: "Inflation means prices go up, so the same R1 buys less than it used to. This is why we invest!" },
      SD: { question: "What happens to the purchasing power of your cash during high inflation?", options: ["It decreases", "It increases", "Stays the same", "Depends on the bank"], correctIndex: 0, explanation: "Inflation means prices go up, so the same $1 buys less than it used to. This is why we invest!" },
    }
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
    question: "What is it called when you invest a fixed amount on a regular schedule, no matter what the price is?",
    options: ["Regular/averaged investing", "Buying only when low", "Spending extra on fees", "Changing currencies"],
    correctIndex: 0,
    explanation: "Investing a fixed amount regularly regardless of price helps smooth out market volatility.",
    xpReward: 45,
    difficulty: 'hard',
    countryVariants: {
      IN: { question: "What is 'Rupee-Cost Averaging' (called a SIP in India)?", options: ["Investing same amount regularly", "Buying only when low", "Spending extra on fees", "Changing currencies"], correctIndex: 0, explanation: "Investing a fixed amount regularly (like a monthly SIP) regardless of price helps smooth out market volatility." },
      US: { question: "What is 'Dollar-Cost Averaging'?", options: ["Investing same amount regularly", "Buying only when low", "Spending extra on fees", "Changing currencies"], correctIndex: 0, explanation: "Investing a fixed amount regularly regardless of price helps smooth out market volatility — a classic US retirement-investing strategy (e.g. inside a 401(k))." },
      GB: { question: "What is 'Pound-Cost Averaging'?", options: ["Investing same amount regularly", "Buying only when low", "Spending extra on fees", "Changing currencies"], correctIndex: 0, explanation: "Investing a fixed amount regularly regardless of price helps smooth out market volatility — commonly done through a monthly ISA contribution in the UK." },
    }
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
    question: "The 'Nifty 50' is an index of...",
    options: ["50 large Indian companies", "The 50 richest people", "50 types of gold", "50 bank accounts"],
    correctIndex: 0,
    explanation: "It tracks the stock performance of 50 of the largest companies listed on India's National Stock Exchange (NSE).",
    xpReward: 40,
    difficulty: 'medium',
    countryVariants: {
      US: { question: "The 'S&P 500' is an index of...", options: ["500 large US companies", "The 500 richest people", "500 types of gold", "500 bank accounts"], correctIndex: 0, explanation: "It tracks the stock performance of 500 of the largest companies listed on US stock exchanges." },
      GB: { question: "The 'FTSE 100' is an index of...", options: ["100 large UK companies", "The 100 richest people", "100 types of gold", "100 bank accounts"], correctIndex: 0, explanation: "It tracks the stock performance of the 100 largest companies listed on the London Stock Exchange." },
      CN: { question: "The 'Shanghai Composite' is an index of...", options: ["Companies listed on the Shanghai Stock Exchange", "The richest people in China", "Types of gold", "Bank accounts"], correctIndex: 0, explanation: "It tracks the stock performance of companies listed on the Shanghai Stock Exchange, one of mainland China's main markets." },
      JP: { question: "The 'Nikkei 225' is an index of...", options: ["225 large Japanese companies", "The 225 richest people", "225 types of gold", "225 bank accounts"], correctIndex: 0, explanation: "It tracks the stock performance of 225 leading companies listed on the Tokyo Stock Exchange." },
      RU: { question: "The 'MOEX Russia Index' is an index of...", options: ["Major Russian companies", "The richest people in Russia", "Types of gold", "Bank accounts"], correctIndex: 0, explanation: "It tracks the stock performance of the largest and most liquid Russian companies listed on the Moscow Exchange." },
      ZA: { question: "The 'JSE Top 40' is an index of...", options: ["40 large South African companies", "The 40 richest people", "40 types of gold", "40 bank accounts"], correctIndex: 0, explanation: "It tracks the stock performance of the 40 largest companies listed on the Johannesburg Stock Exchange." },
      SD: { question: "The Khartoum Stock Exchange All-Share Index tracks...", options: ["Companies listed on Sudan's stock exchange", "The richest people in Sudan", "Types of gold", "Bank accounts"], correctIndex: 0, explanation: "It tracks the stock performance of companies listed on the Khartoum Stock Exchange (KSE), Sudan's principal stock market." },
    }
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
    question: "Your credit card has 20% APR. You owe ₹50,000. If you don't pay, roughly how much interest is added in a year?",
    options: ["₹10,000", "₹1,000", "₹50,000", "₹1,00,000"],
    correctIndex: 0,
    explanation: "20% of ₹50,000 is ₹10,000. High-interest debt grows very fast if not paid off!",
    xpReward: 35,
    difficulty: 'medium',
    countryVariants: {
      US: { question: "Your credit card has 20% APR. You owe $1,000. If you don't pay, roughly how much interest is added in a year?", options: ["$200", "$20", "$1,000", "$2,000"], correctIndex: 0, explanation: "20% of $1,000 is $200. High-interest debt grows very fast if not paid off!" },
      GB: { question: "Your credit card has 20% APR. You owe £1,000. If you don't pay, roughly how much interest is added in a year?", options: ["£200", "£20", "£1,000", "£2,000"], correctIndex: 0, explanation: "20% of £1,000 is £200. High-interest debt grows very fast if not paid off!" },
      CN: { question: "Your credit card has 20% APR. You owe ¥5,000. If you don't pay, roughly how much interest is added in a year?", options: ["¥1,000", "¥100", "¥5,000", "¥10,000"], correctIndex: 0, explanation: "20% of ¥5,000 is ¥1,000. High-interest debt grows very fast if not paid off!" },
      JP: { question: "Your credit card has 20% APR. You owe ¥150,000. If you don't pay, roughly how much interest is added in a year?", options: ["¥30,000", "¥3,000", "¥150,000", "¥300,000"], correctIndex: 0, explanation: "20% of ¥150,000 is ¥30,000. High-interest debt grows very fast if not paid off!" },
      RU: { question: "Your credit card has 20% APR. You owe ₽75,000. If you don't pay, roughly how much interest is added in a year?", options: ["₽15,000", "₽1,500", "₽75,000", "₽150,000"], correctIndex: 0, explanation: "20% of ₽75,000 is ₽15,000. High-interest debt grows very fast if not paid off!" },
      ZA: { question: "Your credit card has 20% APR. You owe R15,000. If you don't pay, roughly how much interest is added in a year?", options: ["R3,000", "R300", "R15,000", "R30,000"], correctIndex: 0, explanation: "20% of R15,000 is R3,000. High-interest debt grows very fast if not paid off!" },
      SD: { question: "Your credit card has 20% APR. You owe $1,000. If you don't pay, roughly how much interest is added in a year?", options: ["$200", "$20", "$1,000", "$2,000"], correctIndex: 0, explanation: "20% of $1,000 is $200. High-interest debt grows very fast if not paid off!" },
    }
  },
  {
    id: 'c-2',
    category: 'CREDIT',
    ageGroups: ['senior'],
    question: "Which factor has the biggest impact on your Credit Score?",
    options: ["Payment History", "Income level", "Your job title", "The bank name"],
    correctIndex: 0,
    explanation: "Whether you pay your bills on time (Payment History) is the most critical part of your score (in India, this is your CIBIL Score, 300–900).",
    xpReward: 40,
    difficulty: 'hard',
    countryVariants: {
      US: { question: "Which factor has the biggest impact on your Credit Score?", options: ["Payment History", "Income level", "Your job title", "The bank name"], correctIndex: 0, explanation: "Whether you pay your bills on time (Payment History) is the most critical part of your score (in the US, this is your FICO Score, 300–850)." },
      GB: { question: "Which factor has the biggest impact on your Credit Score?", options: ["Payment History", "Income level", "Your job title", "The bank name"], correctIndex: 0, explanation: "Whether you pay your bills on time (Payment History) is the most critical part of your score (in the UK, this is tracked via Experian/Equifax, roughly 0–999)." },
      CN: { question: "Which factor has the biggest impact on your Credit Score?", options: ["Payment History", "Income level", "Your job title", "The bank name"], correctIndex: 0, explanation: "Whether you pay your bills on time (Payment History) is the most critical part of your score (in China, this is closer to your Sesame Credit score via Alipay, 350–950)." },
      JP: { question: "Which factor has the biggest impact on your credit standing?", options: ["Payment History", "Income level", "Your job title", "The bank name"], correctIndex: 0, explanation: "Japan doesn't use a single FICO-style score — lenders check your payment history directly through credit bureaus like JICC and CIC instead." },
      RU: { question: "Which factor has the biggest impact on your Credit Score?", options: ["Payment History", "Income level", "Your job title", "The bank name"], correctIndex: 0, explanation: "Whether you pay your bills on time (Payment History) is the most critical part of your score (in Russia, this is tracked via NBKI, the country's largest credit bureau)." },
      ZA: { question: "Which factor has the biggest impact on your Credit Score?", options: ["Payment History", "Income level", "Your job title", "The bank name"], correctIndex: 0, explanation: "Whether you pay your bills on time (Payment History) is the most critical part of your score (in South Africa, this is tracked via TransUnion/Experian, roughly 0–999)." },
      SD: { question: "Which factor has the biggest impact on your credit standing?", options: ["Payment History", "Income level", "Your job title", "The bank name"], correctIndex: 0, explanation: "Sudan doesn't have a unified national credit bureau yet — banks assess your payment history directly rather than through a single score." },
    }
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
    question: "If you can't pay back a friend ₹50 today, and you wait a month, your friend might be upset. A bank will...",
    options: ["Charge you a late fee", "Forget about it", "Give you more money", "Call your teacher"],
    correctIndex: 0,
    explanation: "Banks are strict! Late payments lead to fees and hurt your financial reputation (credit score).",
    xpReward: 20,
    difficulty: 'easy',
    countryVariants: {
      US: { question: "If you can't pay back a friend $5 today, and you wait a month, your friend might be upset. A bank will...", options: ["Charge you a late fee", "Forget about it", "Give you more money", "Call your teacher"], correctIndex: 0, explanation: "Banks are strict! Late payments lead to fees and hurt your financial reputation (credit score)." },
      GB: { question: "If you can't pay back a friend £5 today, and you wait a month, your friend might be upset. A bank will...", options: ["Charge you a late fee", "Forget about it", "Give you more money", "Call your teacher"], correctIndex: 0, explanation: "Banks are strict! Late payments lead to fees and hurt your financial reputation (credit score)." },
      CN: { question: "If you can't pay back a friend ¥25 today, and you wait a month, your friend might be upset. A bank will...", options: ["Charge you a late fee", "Forget about it", "Give you more money", "Call your teacher"], correctIndex: 0, explanation: "Banks are strict! Late payments lead to fees and hurt your financial reputation (credit score)." },
      JP: { question: "If you can't pay back a friend ¥750 today, and you wait a month, your friend might be upset. A bank will...", options: ["Charge you a late fee", "Forget about it", "Give you more money", "Call your teacher"], correctIndex: 0, explanation: "Banks are strict! Late payments lead to fees and hurt your financial reputation (credit score)." },
      RU: { question: "If you can't pay back a friend ₽375 today, and you wait a month, your friend might be upset. A bank will...", options: ["Charge you a late fee", "Forget about it", "Give you more money", "Call your teacher"], correctIndex: 0, explanation: "Banks are strict! Late payments lead to fees and hurt your financial reputation (credit score)." },
      ZA: { question: "If you can't pay back a friend R75 today, and you wait a month, your friend might be upset. A bank will...", options: ["Charge you a late fee", "Forget about it", "Give you more money", "Call your teacher"], correctIndex: 0, explanation: "Banks are strict! Late payments lead to fees and hurt your financial reputation (credit score)." },
      SD: { question: "If you can't pay back a friend $5 today, and you wait a month, your friend might be upset. A bank will...", options: ["Charge you a late fee", "Forget about it", "Give you more money", "Call your teacher"], correctIndex: 0, explanation: "Banks are strict! Late payments lead to fees and hurt your financial reputation (credit score)." },
    }
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
    question: "You earn ₹150/hour and work 10 hours. Your paycheck is only ₹1,275 instead of ₹1,500. Why?",
    options: ["Income Tax (15%)", "The bank took it", "The boss is mean", "You lost hours"],
    correctIndex: 0,
    explanation: "Governments take 'Income Tax' from your earnings to pay for roads, schools, and safety.",
    xpReward: 30,
    difficulty: 'medium',
    countryVariants: {
      US: { question: "You earn $15/hour and work 10 hours. Your paycheck is only $127.50 instead of $150. Why?", options: ["Income Tax (15%)", "The bank took it", "The boss is mean", "You lost hours"], correctIndex: 0, explanation: "Governments take 'Income Tax' from your earnings to pay for roads, schools, and safety." },
      GB: { question: "You earn £15/hour and work 10 hours. Your paycheck is only £127.50 instead of £150. Why?", options: ["Income Tax (15%)", "The bank took it", "The boss is mean", "You lost hours"], correctIndex: 0, explanation: "Governments take 'Income Tax' from your earnings to pay for roads, schools, and safety." },
      CN: { question: "You earn ¥100/hour and work 10 hours. Your paycheck is only ¥850 instead of ¥1,000. Why?", options: ["Income Tax (15%)", "The bank took it", "The boss is mean", "You lost hours"], correctIndex: 0, explanation: "Governments take 'Income Tax' from your earnings to pay for roads, schools, and safety." },
      JP: { question: "You earn ¥1,500/hour and work 10 hours. Your paycheck is only ¥12,750 instead of ¥15,000. Why?", options: ["Income Tax (15%)", "The bank took it", "The boss is mean", "You lost hours"], correctIndex: 0, explanation: "Governments take 'Income Tax' from your earnings to pay for roads, schools, and safety." },
      RU: { question: "You earn ₽1,000/hour and work 10 hours. Your paycheck is only ₽8,500 instead of ₽10,000. Why?", options: ["Income Tax (15%)", "The bank took it", "The boss is mean", "You lost hours"], correctIndex: 0, explanation: "Governments take 'Income Tax' from your earnings to pay for roads, schools, and safety." },
      ZA: { question: "You earn R150/hour and work 10 hours. Your paycheck is only R1,275 instead of R1,500. Why?", options: ["Income Tax (15%)", "The bank took it", "The boss is mean", "You lost hours"], correctIndex: 0, explanation: "Governments take 'Income Tax' from your earnings to pay for roads, schools, and safety." },
      SD: { question: "You earn $15/hour and work 10 hours. Your paycheck is only $127.50 instead of $150. Why?", options: ["Income Tax (15%)", "The bank took it", "The boss is mean", "You lost hours"], correctIndex: 0, explanation: "Governments take 'Income Tax' from your earnings to pay for roads, schools, and safety." },
    }
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
    question: "GST (Goods and Services Tax) is added to...",
    options: ["Things you buy at shops", "Your monthly salary", "Your savings account", "Your birthday gifts"],
    correctIndex: 0,
    explanation: "GST is a consumption tax you pay on most products and services — in India it's already included in the price you see.",
    xpReward: 25,
    difficulty: 'easy',
    countryVariants: {
      US: { question: "Sales Tax is added to...", options: ["Things you buy at shops", "Your monthly salary", "Your savings account", "Your birthday gifts"], correctIndex: 0, explanation: "Sales tax is a small extra percentage added on top of the sticker price at the US checkout — unlike VAT/GST countries, the price you see isn't the final price." },
      GB: { question: "VAT (Value Added Tax) is added to...", options: ["Things you buy at shops", "Your monthly salary", "Your savings account", "Your birthday gifts"], correctIndex: 0, explanation: "VAT is a consumption tax on most goods and services — in the UK it's already included in the price you see on the shelf." },
      CN: { question: "VAT (增值税) is added to...", options: ["Things you buy at shops", "Your monthly salary", "Your savings account", "Your birthday gifts"], correctIndex: 0, explanation: "VAT is a consumption tax on most goods and services — in China it's already included in the retail price you see." },
      JP: { question: "Consumption Tax (消費税) is added to...", options: ["Things you buy at shops", "Your monthly salary", "Your savings account", "Your birthday gifts"], correctIndex: 0, explanation: "Consumption Tax applies to most goods and services — Japanese law requires the tax-included price (総額表示) to be shown on the price tag." },
      RU: { question: "VAT (НДС) is added to...", options: ["Things you buy at shops", "Your monthly salary", "Your savings account", "Your birthday gifts"], correctIndex: 0, explanation: "VAT is a consumption tax on most goods and services — in Russia it's already included in the shelf price." },
      ZA: { question: "VAT (Value-Added Tax) is added to...", options: ["Things you buy at shops", "Your monthly salary", "Your savings account", "Your birthday gifts"], correctIndex: 0, explanation: "VAT is a consumption tax on most goods and services — South African law requires the VAT-inclusive price to be shown on the shelf." },
      SD: { question: "VAT is added to...", options: ["Things you buy at shops", "Your monthly salary", "Your savings account", "Your birthday gifts"], correctIndex: 0, explanation: "VAT is a consumption tax on most goods and services, generally shown already included in the price in Sudan." },
    }
  },
  {
    id: 't-6',
    category: 'TAXES',
    ageGroups: ['senior'],
    question: "Which government body is responsible for collecting income tax in India?",
    options: ["Income Tax Department", "National Highways Authority", "Reserve Bank of India", "Election Commission"],
    correctIndex: 0,
    explanation: "The Income Tax Department (under the CBDT) is the Indian government body responsible for collecting direct taxes.",
    xpReward: 35,
    difficulty: 'medium',
    countryVariants: {
      US: { question: "Which government body is responsible for collecting income tax in the US?", options: ["IRS (Internal Revenue Service)", "Federal Reserve", "FBI", "Department of Education"], correctIndex: 0, explanation: "The IRS (Internal Revenue Service) is the US government agency responsible for collecting federal income tax." },
      GB: { question: "Which government body is responsible for collecting income tax in the UK?", options: ["HMRC", "Bank of England", "NHS", "Ministry of Defence"], correctIndex: 0, explanation: "HMRC (His Majesty's Revenue and Customs) is the UK government body responsible for collecting income tax." },
      CN: { question: "Which government body is responsible for collecting income tax in China?", options: ["State Taxation Administration", "People's Bank of China", "Ministry of Education", "China Post"], correctIndex: 0, explanation: "The State Taxation Administration is China's government body responsible for collecting taxes." },
      JP: { question: "Which government body is responsible for collecting income tax in Japan?", options: ["National Tax Agency (国税庁)", "Bank of Japan", "Japan Post", "Ministry of Defense"], correctIndex: 0, explanation: "The National Tax Agency (国税庁) is Japan's government body responsible for collecting national taxes." },
      RU: { question: "Which government body is responsible for collecting income tax in Russia?", options: ["Federal Tax Service (FNS)", "Central Bank of Russia", "Ministry of Sport", "Russian Post"], correctIndex: 0, explanation: "The Federal Tax Service (FNS) is Russia's government body responsible for collecting taxes." },
      ZA: { question: "Which government body is responsible for collecting income tax in South Africa?", options: ["SARS (South African Revenue Service)", "South African Reserve Bank", "Department of Health", "Eskom"], correctIndex: 0, explanation: "SARS (South African Revenue Service) is South Africa's government body responsible for collecting taxes." },
      SD: { question: "Which government body is responsible for collecting income tax in Sudan?", options: ["Sudan Taxation Chamber", "Central Bank of Sudan", "Ministry of Health", "Sudan Post"], correctIndex: 0, explanation: "The Sudan Taxation Chamber, under the Ministry of Finance, is responsible for collecting taxes in Sudan." },
    }
  },
  {
    id: 't-7',
    category: 'TAXES',
    ageGroups: ['senior'],
    question: "Capital Gains Tax is paid on...",
    options: ["Profit from selling assets", "Your hourly wage", "Buying groceries", "Property you live in"],
    correctIndex: 0,
    explanation: "If you buy a stock for ₹100 and sell for ₹150, you pay tax on that ₹50 profit (the 'gain').",
    xpReward: 45,
    difficulty: 'hard',
    countryVariants: {
      US: { question: "Capital Gains Tax is paid on...", options: ["Profit from selling assets", "Your hourly wage", "Buying groceries", "Property you live in"], correctIndex: 0, explanation: "If you buy a stock for $100 and sell for $150, you pay tax on that $50 profit (the 'gain')." },
      GB: { question: "Capital Gains Tax is paid on...", options: ["Profit from selling assets", "Your hourly wage", "Buying groceries", "Property you live in"], correctIndex: 0, explanation: "If you buy a stock for £100 and sell for £150, you pay tax on that £50 profit (the 'gain')." },
      CN: { question: "Capital Gains Tax is paid on...", options: ["Profit from selling assets", "Your hourly wage", "Buying groceries", "Property you live in"], correctIndex: 0, explanation: "If you buy a stock for ¥500 and sell for ¥750, you pay tax on that ¥250 profit (the 'gain')." },
      JP: { question: "Capital Gains Tax is paid on...", options: ["Profit from selling assets", "Your hourly wage", "Buying groceries", "Property you live in"], correctIndex: 0, explanation: "If you buy a stock for ¥15,000 and sell for ¥22,500, you pay tax on that ¥7,500 profit (the 'gain')." },
      RU: { question: "Capital Gains Tax is paid on...", options: ["Profit from selling assets", "Your hourly wage", "Buying groceries", "Property you live in"], correctIndex: 0, explanation: "If you buy a stock for ₽7,500 and sell for ₽11,250, you pay tax on that ₽3,750 profit (the 'gain')." },
      ZA: { question: "Capital Gains Tax is paid on...", options: ["Profit from selling assets", "Your hourly wage", "Buying groceries", "Property you live in"], correctIndex: 0, explanation: "If you buy a stock for R1,500 and sell for R2,250, you pay tax on that R750 profit (the 'gain')." },
      SD: { question: "Capital Gains Tax is paid on...", options: ["Profit from selling assets", "Your hourly wage", "Buying groceries", "Property you live in"], correctIndex: 0, explanation: "If you buy a stock for $100 and sell for $150, you pay tax on that $50 profit (the 'gain')." },
    }
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
    question: "A 'Form 16' is used to...",
    options: ["Report annual wages/taxes", "Apply for a new job", "Open a bank account", "Pay for college"],
    correctIndex: 0,
    explanation: "Your employer issues Form 16 at the end of the year showing your salary and the tax (TDS) deducted.",
    xpReward: 35,
    difficulty: 'medium',
    countryVariants: {
      US: { question: "A 'W-2' form is used to...", options: ["Report annual wages/taxes", "Apply for a new job", "Open a bank account", "Pay for college"], correctIndex: 0, explanation: "Your employer sends you a W-2 at the end of the year showing what you earned and taxes paid." },
      GB: { question: "A 'P60' is used to...", options: ["Report annual wages/taxes", "Apply for a new job", "Open a bank account", "Pay for college"], correctIndex: 0, explanation: "Your employer issues a P60 at the end of the tax year showing your total pay and tax deducted." },
      CN: { question: "An 'Individual Income Tax Withholding Certificate' is used to...", options: ["Report annual wages/taxes", "Apply for a new job", "Open a bank account", "Pay for college"], correctIndex: 0, explanation: "Your employer provides this certificate showing your annual salary and the tax withheld." },
      JP: { question: "A 'Gensen Choshuhyo (源泉徴収票)' is used to...", options: ["Report annual wages/taxes", "Apply for a new job", "Open a bank account", "Pay for college"], correctIndex: 0, explanation: "Your employer issues this withholding tax slip at year-end showing your salary and the tax withheld." },
      RU: { question: "A '2-NDFL certificate' is used to...", options: ["Report annual wages/taxes", "Apply for a new job", "Open a bank account", "Pay for college"], correctIndex: 0, explanation: "Your employer issues a 2-NDFL certificate showing your annual income and tax withheld." },
      ZA: { question: "An 'IRP5' is used to...", options: ["Report annual wages/taxes", "Apply for a new job", "Open a bank account", "Pay for college"], correctIndex: 0, explanation: "Your employer issues an IRP5 at the end of the tax year showing your income and tax deducted." },
      SD: { question: "An annual salary certificate from your employer is used to...", options: ["Report annual wages/taxes", "Apply for a new job", "Open a bank account", "Pay for college"], correctIndex: 0, explanation: "Your employer provides a salary certificate at year-end showing what you earned and any tax withheld." },
    }
  },
  {
    id: 't-10',
    category: 'TAXES',
    ageGroups: ['junior'],
    question: "In India, a price tag showing ₹100 on a toy already includes...",
    options: ["GST (tax)", "No tax at all", "A discount", "A tip"],
    correctIndex: 0,
    explanation: "India's MRP (Maximum Retail Price) law requires shops to show the final tax-included price — what you see on the tag is what you pay.",
    xpReward: 15,
    difficulty: 'easy',
    countryVariants: {
      US: { question: "You see a $10 toy priced at the store but pay $10.80 at the counter. That extra 80 cents is...", options: ["Sales Tax", "A mistake", "A tip for the shop", "A shipping fee"], correctIndex: 0, explanation: "Most US stores show prices without tax — unlike GST/VAT countries, sales tax is added on top when you actually pay!" },
      GB: { question: "In the UK, a price tag showing £10 on a toy already includes...", options: ["VAT (tax)", "No tax at all", "A discount", "A tip"], correctIndex: 0, explanation: "Unlike the US, UK price tags show the final price — VAT is already built in, so what you see is what you pay." },
      CN: { question: "In China, a price tag showing ¥50 on a toy already includes...", options: ["VAT (增值税)", "No tax at all", "A discount", "A tip"], correctIndex: 0, explanation: "Chinese retail prices are shown with VAT already included — what you see is what you pay." },
      JP: { question: "In Japan, a price tag showing ¥1,000 already includes...", options: ["Consumption Tax (消費税)", "No tax at all", "A discount", "A tip"], correctIndex: 0, explanation: "Japanese law requires price tags to show the tax-included price (総額表示) — what you see is what you pay." },
      RU: { question: "In Russia, a price tag showing ₽500 already includes...", options: ["VAT (НДС)", "No tax at all", "A discount", "A tip"], correctIndex: 0, explanation: "Russian retail prices are shown with VAT already included — what you see is what you pay." },
      ZA: { question: "In South Africa, a price tag showing R100 already includes...", options: ["VAT", "No tax at all", "A discount", "A tip"], correctIndex: 0, explanation: "South African law requires shops to show the VAT-inclusive price — what you see is what you pay." },
      SD: { question: "In Sudan, the price shown on a shop item already includes...", options: ["VAT", "No tax at all", "A discount", "A tip"], correctIndex: 0, explanation: "Like most VAT-based systems, Sudan's retail prices are generally shown with tax already included." },
    }
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
    question: "You want a ₹1,000 hoodie. It's 20% off today. What is the sale price?",
    options: ["₹800", "₹600", "₹900", "₹200"],
    correctIndex: 0,
    explanation: "20% of ₹1,000 is ₹200. ₹1,000 minus ₹200 equals ₹800.",
    xpReward: 25,
    difficulty: 'medium',
    countryVariants: {
      US: { question: "You want a $50 hoodie. It's 20% off today. What is the sale price?", options: ["$40", "$30", "$45", "$10"], correctIndex: 0, explanation: "20% of $50 is $10. $50 minus $10 equals $40." },
      GB: { question: "You want a £50 hoodie. It's 20% off today. What is the sale price?", options: ["£40", "£30", "£45", "£10"], correctIndex: 0, explanation: "20% of £50 is £10. £50 minus £10 equals £40." },
      CN: { question: "You want a ¥250 hoodie. It's 20% off today. What is the sale price?", options: ["¥200", "¥150", "¥225", "¥50"], correctIndex: 0, explanation: "20% of ¥250 is ¥50. ¥250 minus ¥50 equals ¥200." },
      JP: { question: "You want a ¥7,500 hoodie. It's 20% off today. What is the sale price?", options: ["¥6,000", "¥4,500", "¥6,750", "¥1,500"], correctIndex: 0, explanation: "20% of ¥7,500 is ¥1,500. ¥7,500 minus ¥1,500 equals ¥6,000." },
      RU: { question: "You want a ₽3,750 hoodie. It's 20% off today. What is the sale price?", options: ["₽3,000", "₽2,250", "₽3,375", "₽750"], correctIndex: 0, explanation: "20% of ₽3,750 is ₽750. ₽3,750 minus ₽750 equals ₽3,000." },
      ZA: { question: "You want a R750 hoodie. It's 20% off today. What is the sale price?", options: ["R600", "R450", "R675", "R150"], correctIndex: 0, explanation: "20% of R750 is R150. R750 minus R150 equals R600." },
      SD: { question: "You want a $50 hoodie. It's 20% off today. What is the sale price?", options: ["$40", "$30", "$45", "$10"], correctIndex: 0, explanation: "20% of $50 is $10. $50 minus $10 equals $40." },
    }
  },
  {
    id: 's-2',
    category: 'SPENDING',
    ageGroups: ['junior'],
    question: "You have ₹50. You spend ₹40 on a comic book. What percentage of your money did you spend?",
    options: ["80%", "50%", "20%", "100%"],
    correctIndex: 0,
    explanation: "₹40 out of ₹50 is 80%. You spent most of your money!",
    xpReward: 20,
    difficulty: 'medium',
    countryVariants: {
      US: { question: "You have $5. You spend $4 on a comic book. What percentage of your money did you spend?", options: ["80%", "50%", "20%", "100%"], correctIndex: 0, explanation: "$4 out of $5 is 80%. You spent most of your money!" },
      GB: { question: "You have £5. You spend £4 on a comic book. What percentage of your money did you spend?", options: ["80%", "50%", "20%", "100%"], correctIndex: 0, explanation: "£4 out of £5 is 80%. You spent most of your money!" },
      CN: { question: "You have ¥25. You spend ¥20 on a comic book. What percentage of your money did you spend?", options: ["80%", "50%", "20%", "100%"], correctIndex: 0, explanation: "¥20 out of ¥25 is 80%. You spent most of your money!" },
      JP: { question: "You have ¥750. You spend ¥600 on a comic book. What percentage of your money did you spend?", options: ["80%", "50%", "20%", "100%"], correctIndex: 0, explanation: "¥600 out of ¥750 is 80%. You spent most of your money!" },
      RU: { question: "You have ₽375. You spend ₽300 on a comic book. What percentage of your money did you spend?", options: ["80%", "50%", "20%", "100%"], correctIndex: 0, explanation: "₽300 out of ₽375 is 80%. You spent most of your money!" },
      ZA: { question: "You have R75. You spend R60 on a comic book. What percentage of your money did you spend?", options: ["80%", "50%", "20%", "100%"], correctIndex: 0, explanation: "R60 out of R75 is 80%. You spent most of your money!" },
      SD: { question: "You have $5. You spend $4 on a comic book. What percentage of your money did you spend?", options: ["80%", "50%", "20%", "100%"], correctIndex: 0, explanation: "$4 out of $5 is 80%. You spent most of your money!" },
    }
  },
  {
    id: 's-3',
    category: 'SPENDING',
    ageGroups: ['teen', 'senior'],
    question: "An 'Opportunity Cost' is...",
    options: ["What you give up to buy X", "The price of a product", "A shipping fee", "A discount"],
    correctIndex: 0,
    explanation: "If you spend ₹2,000 on shoes, the 'Opportunity Cost' is the concert ticket you can no longer afford.",
    xpReward: 30,
    difficulty: 'medium',
    countryVariants: {
      US: { question: "An 'Opportunity Cost' is...", options: ["What you give up to buy X", "The price of a product", "A shipping fee", "A discount"], correctIndex: 0, explanation: "If you spend $100 on shoes, the 'Opportunity Cost' is the concert ticket you can no longer afford." },
      GB: { question: "An 'Opportunity Cost' is...", options: ["What you give up to buy X", "The price of a product", "A shipping fee", "A discount"], correctIndex: 0, explanation: "If you spend £100 on shoes, the 'Opportunity Cost' is the concert ticket you can no longer afford." },
      CN: { question: "An 'Opportunity Cost' is...", options: ["What you give up to buy X", "The price of a product", "A shipping fee", "A discount"], correctIndex: 0, explanation: "If you spend ¥500 on shoes, the 'Opportunity Cost' is the concert ticket you can no longer afford." },
      JP: { question: "An 'Opportunity Cost' is...", options: ["What you give up to buy X", "The price of a product", "A shipping fee", "A discount"], correctIndex: 0, explanation: "If you spend ¥15,000 on shoes, the 'Opportunity Cost' is the concert ticket you can no longer afford." },
      RU: { question: "An 'Opportunity Cost' is...", options: ["What you give up to buy X", "The price of a product", "A shipping fee", "A discount"], correctIndex: 0, explanation: "If you spend ₽7,500 on shoes, the 'Opportunity Cost' is the concert ticket you can no longer afford." },
      ZA: { question: "An 'Opportunity Cost' is...", options: ["What you give up to buy X", "The price of a product", "A shipping fee", "A discount"], correctIndex: 0, explanation: "If you spend R1,500 on shoes, the 'Opportunity Cost' is the concert ticket you can no longer afford." },
      SD: { question: "An 'Opportunity Cost' is...", options: ["What you give up to buy X", "The price of a product", "A shipping fee", "A discount"], correctIndex: 0, explanation: "If you spend $100 on shoes, the 'Opportunity Cost' is the concert ticket you can no longer afford." },
    }
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
    question: "A subscription costs ₹200/month. How much does it cost you per year?",
    options: ["₹2,400", "₹2,000", "₹200", "₹3,650"],
    correctIndex: 0,
    explanation: "₹200 per month multiplied by 12 months in a year equals ₹2,400.",
    xpReward: 20,
    difficulty: 'easy',
    countryVariants: {
      US: { question: "A subscription costs $10/month. How much does it cost you per year?", options: ["$120", "$100", "$10", "$365"], correctIndex: 0, explanation: "$10 per month multiplied by 12 months in a year equals $120." },
      GB: { question: "A subscription costs £10/month. How much does it cost you per year?", options: ["£120", "£100", "£10", "£365"], correctIndex: 0, explanation: "£10 per month multiplied by 12 months in a year equals £120." },
      CN: { question: "A subscription costs ¥50/month. How much does it cost you per year?", options: ["¥600", "¥500", "¥50", "¥1,825"], correctIndex: 0, explanation: "¥50 per month multiplied by 12 months in a year equals ¥600." },
      JP: { question: "A subscription costs ¥1,500/month. How much does it cost you per year?", options: ["¥18,000", "¥15,000", "¥1,500", "¥54,750"], correctIndex: 0, explanation: "¥1,500 per month multiplied by 12 months in a year equals ¥18,000." },
      RU: { question: "A subscription costs ₽750/month. How much does it cost you per year?", options: ["₽9,000", "₽7,500", "₽750", "₽27,375"], correctIndex: 0, explanation: "₽750 per month multiplied by 12 months in a year equals ₽9,000." },
      ZA: { question: "A subscription costs R150/month. How much does it cost you per year?", options: ["R1,800", "R1,500", "R150", "R5,475"], correctIndex: 0, explanation: "R150 per month multiplied by 12 months in a year equals R1,800." },
      SD: { question: "A subscription costs $10/month. How much does it cost you per year?", options: ["$120", "$100", "$10", "$365"], correctIndex: 0, explanation: "$10 per month multiplied by 12 months in a year equals $120." },
    }
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
    question: "If you have ₹100, and you spend it all today, you have ₹0 for tomorrow. This is...",
    options: ["Poor planning", "Saving", "Investing", "A good idea"],
    correctIndex: 0,
    explanation: "Spending everything now means you have no 'buffer' or money for future goals.",
    xpReward: 15,
    difficulty: 'easy',
    countryVariants: {
      US: { question: "If you have $10, and you spend it all today, you have $0 for tomorrow. This is...", options: ["Poor planning", "Saving", "Investing", "A good idea"], correctIndex: 0, explanation: "Spending everything now means you have no 'buffer' or money for future goals." },
      GB: { question: "If you have £10, and you spend it all today, you have £0 for tomorrow. This is...", options: ["Poor planning", "Saving", "Investing", "A good idea"], correctIndex: 0, explanation: "Spending everything now means you have no 'buffer' or money for future goals." },
      CN: { question: "If you have ¥50, and you spend it all today, you have ¥0 for tomorrow. This is...", options: ["Poor planning", "Saving", "Investing", "A good idea"], correctIndex: 0, explanation: "Spending everything now means you have no 'buffer' or money for future goals." },
      JP: { question: "If you have ¥1,500, and you spend it all today, you have ¥0 for tomorrow. This is...", options: ["Poor planning", "Saving", "Investing", "A good idea"], correctIndex: 0, explanation: "Spending everything now means you have no 'buffer' or money for future goals." },
      RU: { question: "If you have ₽750, and you spend it all today, you have ₽0 for tomorrow. This is...", options: ["Poor planning", "Saving", "Investing", "A good idea"], correctIndex: 0, explanation: "Spending everything now means you have no 'buffer' or money for future goals." },
      ZA: { question: "If you have R150, and you spend it all today, you have R0 for tomorrow. This is...", options: ["Poor planning", "Saving", "Investing", "A good idea"], correctIndex: 0, explanation: "Spending everything now means you have no 'buffer' or money for future goals." },
      SD: { question: "If you have $10, and you spend it all today, you have $0 for tomorrow. This is...", options: ["Poor planning", "Saving", "Investing", "A good idea"], correctIndex: 0, explanation: "Spending everything now means you have no 'buffer' or money for future goals." },
    }
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

  // --- PETER LYNCH INVESTING (5) ---
  {
    id: 'inv-lynch-1',
    category: 'INVESTING',
    ageGroups: ['teen', 'senior'],
    question: "Peter Lynch says: 'If you can't explain why you own a stock in under ___, you probably shouldn't own it.'",
    options: ["2 minutes", "5 minutes", "10 minutes", "1 hour"],
    correctIndex: 0,
    explanation: "Lynch's 2-minute drill forces clarity. If you can't explain the investment simply, you don't understand it well enough — and confusion is expensive in the stock market.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'inv-lynch-2',
    category: 'INVESTING',
    ageGroups: ['teen', 'senior'],
    question: "You're researching a stock and your reason for buying is 'the sector is hot right now.' According to Peter Lynch, this reason is:",
    options: ["Not good enough — find the company-specific reason", "Excellent — ride the wave", "The most important factor", "Enough if combined with a rising share price"],
    correctIndex: 0,
    explanation: "Lynch insisted on knowing WHY a specific company is growing, not just that its sector is popular. Sector tailwinds lift all boats — including sinking ones. You need the company's specific competitive edge.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'inv-lynch-3',
    category: 'INVESTING',
    ageGroups: ['senior'],
    question: "The PEG ratio divides a stock's P/E by its earnings growth rate. Stock A has P/E 20 and grows at 25% per year. Its PEG is approximately:",
    options: ["0.8 — potentially undervalued", "20 — fairly valued", "25 — overvalued", "1.25 — overvalued"],
    correctIndex: 0,
    explanation: "PEG = P/E ÷ Growth Rate = 20 ÷ 25 = 0.8. Lynch considered PEG below 1 as a potential bargain — you're paying less than the growth justifies. It's a quick filter, not a guarantee.",
    xpReward: 50,
    difficulty: 'hard'
  },
  {
    id: 'inv-lynch-4',
    category: 'INVESTING',
    ageGroups: ['teen', 'senior'],
    question: "Why does Peter Lynch consider promoters (founders/management) buying their own company's shares a bullish signal?",
    options: ["They have the deepest knowledge and are voting with real money", "It legally guarantees the stock will rise", "It means the company is profitable", "It reduces the number of shares available"],
    correctIndex: 0,
    explanation: "Promoters know their business better than any analyst. When they spend their own personal money buying shares, it signals genuine confidence in future growth — not just optimistic press releases.",
    xpReward: 40,
    difficulty: 'medium'
  },
  {
    id: 'inv-lynch-5',
    category: 'INVESTING',
    ageGroups: ['teen', 'senior'],
    question: "You've answered all 4 Lynch questions strongly: clear business model, specific growth reason, PEG of 0.7, promoter bought ₹2 crore of their own shares. What should you do next?",
    options: ["Add it to your research shortlist and dig deeper", "Buy immediately — all signals are green", "Invest your entire savings", "Ignore it — PEG alone isn't reliable"],
    correctIndex: 0,
    explanation: "Lynch's 4 questions eliminate 95% of stocks — but what remains is your research shortlist, not your buy list. The real work — annual reports, risk assessment, position sizing — starts here. The framework opens the door; it doesn't walk you through it.",
    xpReward: 50,
    difficulty: 'hard'
  },
  // --- 2026-10-07 expansion: 45 currency-neutral questions (plain numbers / coins) so they need no per-country variants ---
  {
    id: 'nq-j-01',
    category: 'SPENDING',
    ageGroups: ['junior'],
    question: "A shop sells 3 pencils for 12 coins. How much does 1 pencil cost?",
    options: ["4 coins", "3 coins", "6 coins", "9 coins"],
    correctIndex: 0,
    explanation: "Divide the total price by the number of pencils: 12 ÷ 3 = 4 coins each. Working out the price of ONE item is how you compare deals.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-02',
    category: 'BUDGETING',
    ageGroups: ['junior'],
    question: "You get 50 coins pocket money every week. How much will you have received after 4 weeks?",
    options: ["200 coins", "150 coins", "54 coins", "250 coins"],
    correctIndex: 0,
    explanation: "50 coins × 4 weeks = 200 coins. Knowing your total income over a month helps you plan what to spend and what to save.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-03',
    category: 'SPENDING',
    ageGroups: ['junior'],
    question: "Which of these is a NEED, not a want?",
    options: ["Warm clothes in winter", "The newest video game", "Extra-fancy sneakers", "A bag of candy"],
    correctIndex: 0,
    explanation: "Needs are things you must have to stay healthy and safe, like food, shelter and warm clothes. Wants are nice to have, but you can live without them.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-04',
    category: 'BUDGETING',
    ageGroups: ['junior'],
    question: "You save 15 coins every week. How many weeks until you have 90 coins?",
    options: ["6 weeks", "5 weeks", "7 weeks", "9 weeks"],
    correctIndex: 0,
    explanation: "90 ÷ 15 = 6 weeks. Dividing your goal by what you save each week tells you how long it will take.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-05',
    category: 'SPENDING',
    ageGroups: ['junior'],
    question: "Your friends all say, \"Everyone has this toy — buy it now!\" What is the smartest first step?",
    options: ["Wait a day and ask yourself if you really want it", "Buy it right away so you don't miss out", "Borrow coins from a sibling", "Buy two so you have a spare"],
    correctIndex: 0,
    explanation: "Waiting a day takes away the pressure. If you still want it tomorrow, it's a real want; if not, you just saved your coins from a peer-pressure purchase.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-06',
    category: 'INVESTING',
    ageGroups: ['junior'],
    question: "A bank pays you a little extra money for keeping your savings with them. What is this extra money called?",
    options: ["Interest", "Tax", "A fine", "A discount"],
    correctIndex: 0,
    explanation: "Interest is the reward the bank pays you for letting it hold your money. The longer you save, the more interest you can earn.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-07',
    category: 'CREDIT',
    ageGroups: ['junior'],
    question: "You borrow 20 coins from a friend for lunch. What is the fair thing to do?",
    options: ["Pay it back on the day you promised", "Wait until they forget", "Pay back only 10 coins", "Borrow more to pay them"],
    correctIndex: 0,
    explanation: "Paying back on time builds trust. Banks work the same way: people who repay what they borrow, when they said they would, get trusted with more later.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-08',
    category: 'BUDGETING',
    ageGroups: ['junior'],
    question: "You have 80 coins. You spend 25 on a book and 30 on snacks. How many coins are left?",
    options: ["25 coins", "55 coins", "35 coins", "15 coins"],
    correctIndex: 0,
    explanation: "First add what you spent: 25 + 30 = 55. Then subtract from what you had: 80 − 55 = 25 coins left.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-09',
    category: 'TAXES',
    ageGroups: ['junior'],
    question: "Some shops add a small extra charge to the price that goes to the government to pay for roads and schools. What is this called?",
    options: ["Tax", "A tip", "A gift", "A loan"],
    correctIndex: 0,
    explanation: "Taxes are payments to the government that fund public things like roads, schools and hospitals. Sales tax is added on top of the shelf price.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-10',
    category: 'SPENDING',
    ageGroups: ['junior'],
    question: "Which habit best helps you spot a good deal?",
    options: ["Compare the price at 2 or 3 different shops", "Always buy from the first shop you see", "Pick the item with the shiniest box", "Buy whatever an advert tells you to"],
    correctIndex: 0,
    explanation: "Comparing prices is the simplest money-saving skill there is. The same item can cost very different amounts in different places.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-11',
    category: 'INVESTING',
    ageGroups: ['junior', 'teen'],
    question: "Why is it risky to put ALL your savings into just one thing?",
    options: ["If that one thing fails, you could lose everything", "It is against the rules", "It makes your money grow more slowly", "Banks do not allow it"],
    correctIndex: 0,
    explanation: "Spreading money across different places is called diversification. If one goes badly, the others can protect you — it's the 'don't put all your eggs in one basket' rule.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-12',
    category: 'BUDGETING',
    ageGroups: ['junior', 'teen'],
    question: "What does the 'save first' habit mean?",
    options: ["Set some money aside as soon as you receive it, then spend the rest", "Spend everything first and save what is left over", "Only save at the end of the year", "Save only when you feel rich"],
    correctIndex: 0,
    explanation: "If you wait to see what is left over, there usually is nothing. Saving first turns saving into a habit instead of a leftover.",
    xpReward: 20,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-13',
    category: 'CREDIT',
    ageGroups: ['junior', 'teen'],
    question: "What is a credit card?",
    options: ["A way to borrow money that you must pay back, sometimes with extra charges", "Free money from the bank", "A gift card for one shop", "A savings account with a card"],
    correctIndex: 0,
    explanation: "A credit card lets you spend the bank's money now and repay later. If you don't repay in full and on time, interest is added — so it's a loan, not free money.",
    xpReward: 25,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-14',
    category: 'BUDGETING',
    ageGroups: ['junior', 'teen'],
    question: "Why is it smart to keep a small emergency fund?",
    options: ["To cover surprise costs, like a broken phone, without borrowing", "To spend on treats every weekend", "Because banks make you", "To impress friends"],
    correctIndex: 0,
    explanation: "Surprises happen to everyone. A small cushion means a sudden cost doesn't force you into debt or to ask others for help.",
    xpReward: 25,
    difficulty: 'easy'
  },
  {
    id: 'nq-j-15',
    category: 'SPENDING',
    ageGroups: ['junior', 'teen'],
    question: "A toy costs 200 coins and the sign says '25% off'. How much do you pay?",
    options: ["150 coins", "175 coins", "125 coins", "50 coins"],
    correctIndex: 0,
    explanation: "25% of 200 is 50, so the discount is 50 coins. 200 − 50 = 150 coins. Don't mix up the discount (50) with the price you pay (150).",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-t-01',
    category: 'BUDGETING',
    ageGroups: ['teen', 'senior'],
    question: "You earn 20,000 a month and decide to save 15% of it. How much do you save each month?",
    options: ["3,000", "1,500", "2,000", "4,500"],
    correctIndex: 0,
    explanation: "15% of 20,000 = 20,000 × 0.15 = 3,000 per month, or 36,000 over a year.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-t-02',
    category: 'INVESTING',
    ageGroups: ['teen', 'senior'],
    question: "Using the Rule of 72, about how long does money take to double at 9% a year?",
    options: ["About 8 years", "About 6 years", "About 12 years", "About 9 years"],
    correctIndex: 0,
    explanation: "Rule of 72: divide 72 by the yearly return. 72 ÷ 9 = 8 years. It is a quick estimate, not an exact figure.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-t-03',
    category: 'CREDIT',
    ageGroups: ['teen', 'senior'],
    question: "Your credit card bill is 10,000 and you pay only the 500 minimum. The card charges 3% a month on the unpaid 9,500. About how much interest is added this month?",
    options: ["285", "300", "500", "95"],
    correctIndex: 0,
    explanation: "The interest is charged on what you did NOT pay: 9,500 × 3% = 285. At 3% a month that is about 36% a year — paying only the minimum is very expensive.",
    xpReward: 35,
    difficulty: 'medium'
  },
  {
    id: 'nq-t-03b',
    category: 'SPENDING',
    ageGroups: ['teen', 'senior'],
    question: "A streaming plan costs 299 a month, or 2,999 for a full year. How much do you save by paying yearly?",
    options: ["589", "599", "299", "12"],
    correctIndex: 0,
    explanation: "Monthly for a year: 299 × 12 = 3,588. Yearly plan: 2,999. Difference: 3,588 − 2,999 = 589. (Only worth it if you'll actually use it all year.)",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-t-05',
    category: 'INVESTING',
    ageGroups: ['teen', 'senior'],
    question: "How does an index fund mainly reduce risk?",
    options: ["By spreading your money across many companies", "By guaranteeing a fixed profit", "By only buying the cheapest shares", "By avoiding the stock market entirely"],
    correctIndex: 0,
    explanation: "An index fund holds many companies at once, so one company doing badly barely dents the whole. It lowers risk but does not remove it or guarantee profit.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-t-06',
    category: 'BUDGETING',
    ageGroups: ['teen', 'senior'],
    question: "With the 50/30/20 rule on a 40,000 monthly income, how much goes to 'wants' (30%)?",
    options: ["12,000", "8,000", "20,000", "15,000"],
    correctIndex: 0,
    explanation: "30% of 40,000 = 12,000. The rest: 20,000 for needs (50%) and 8,000 for savings (20%).",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-t-07',
    category: 'CREDIT',
    ageGroups: ['teen', 'senior'],
    question: "Which habit usually helps your credit score the most over time?",
    options: ["Paying every bill and EMI on time", "Opening many new cards quickly", "Always maxing out your limit", "Closing your oldest account"],
    correctIndex: 0,
    explanation: "Payment history is the biggest part of most credit scores. Late payments cause the most damage; consistent on-time payments build the strongest record.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-t-08',
    category: 'TAXES',
    ageGroups: ['teen', 'senior'],
    question: "Your monthly salary is 50,000 and 2,000 is deducted as tax at source (TDS) before it reaches you. What do you actually receive?",
    options: ["48,000", "52,000", "50,000", "46,000"],
    correctIndex: 0,
    explanation: "50,000 − 2,000 = 48,000. The money you take home is lower than your gross salary, so budget from take-home pay, not the offer letter figure.",
    xpReward: 25,
    difficulty: 'easy'
  },
  {
    id: 'nq-t-09',
    category: 'INVESTING',
    ageGroups: ['teen', 'senior'],
    question: "You invest 5,000 every month through a SIP for one year. How much have YOU put in (ignoring any returns)?",
    options: ["60,000", "5,000", "12,000", "6,000"],
    correctIndex: 0,
    explanation: "5,000 × 12 months = 60,000 invested. Whatever the fund earns is on top of that, but your own contribution is fixed by you.",
    xpReward: 25,
    difficulty: 'easy'
  },
  {
    id: 'nq-t-10',
    category: 'SPENDING',
    ageGroups: ['teen', 'senior'],
    question: "A 'buy now, pay later' app splits a 12,000 purchase into 4 payments of 3,000. What is the biggest danger?",
    options: ["It feels like free money, so you overspend and dues pile up", "The product costs more in the shop", "You can only use it once", "It lowers the product's quality"],
    correctIndex: 0,
    explanation: "Splitting a price makes it feel smaller, so people buy things they could not afford at once. Several small dues at the same time, plus late fees, add up fast.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-t-11',
    category: 'BUDGETING',
    ageGroups: ['teen'],
    question: "Your monthly allowance is 2,500. By day 20 you've spent 1,800, about 90 a day. If you keep spending at this pace, how will the 30-day month end?",
    options: ["You'll be 200 short", "Exactly on budget", "200 left over", "700 short"],
    correctIndex: 0,
    explanation: "90 a day × 30 days = 2,700, which is 200 more than 2,500. Checking your daily average mid-month lets you slow down before you run out.",
    xpReward: 35,
    difficulty: 'medium'
  },
  {
    id: 'nq-t-12',
    category: 'INVESTING',
    ageGroups: ['teen'],
    question: "Over the long run, which of these usually carries the HIGHEST risk and the highest potential return?",
    options: ["Stocks", "A savings account", "A fixed deposit", "Cash kept at home"],
    correctIndex: 0,
    explanation: "Stocks can swing a lot in the short term, but historically reward patient investors more than safer options. Higher potential return comes with higher risk.",
    xpReward: 25,
    difficulty: 'easy'
  },
  {
    id: 'nq-t-13',
    category: 'CREDIT',
    ageGroups: ['teen'],
    question: "A friend asks you to co-sign their loan. What happens if they stop paying?",
    options: ["You are legally responsible for the repayment", "Nothing, it is their loan", "The bank cancels the loan", "Only their family has to pay"],
    correctIndex: 0,
    explanation: "A co-signer promises to repay if the borrower can't. Missed payments hurt your credit too — only co-sign if you can afford to pay the whole loan yourself.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-t-14',
    category: 'SPENDING',
    ageGroups: ['teen'],
    question: "What is 'lifestyle inflation'?",
    options: ["Spending more every time your income goes up", "Prices rising across the country", "Buying cheaper goods over time", "Saving more as you earn more"],
    correctIndex: 0,
    explanation: "If every raise is absorbed by a nicer phone or more eating out, your savings never grow. Saving at least part of each raise breaks the cycle.",
    xpReward: 25,
    difficulty: 'easy'
  },
  {
    id: 'nq-t-15',
    category: 'TAXES',
    ageGroups: ['teen'],
    question: "Your income is below the level where you'd owe any income tax. Is filing a tax return still useful?",
    options: ["Yes — it creates an official income record for loans, visas and refunds", "No — it's illegal to file", "No — it cancels your savings", "Only if you are over 60"],
    correctIndex: 0,
    explanation: "A filed return is proof of income that lenders and visa offices often ask for, and it is how you claim a refund if tax was deducted by mistake.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-s-01',
    category: 'INVESTING',
    ageGroups: ['senior'],
    question: "You invest 100,000 at 10% a year, compounded annually. What is it worth after 2 years?",
    options: ["121,000", "120,000", "110,000", "122,000"],
    correctIndex: 0,
    explanation: "Year 1: 100,000 × 1.10 = 110,000. Year 2: 110,000 × 1.10 = 121,000. The extra 1,000 over simple interest (120,000) is interest earning interest.",
    xpReward: 40,
    difficulty: 'hard'
  },
  {
    id: 'nq-s-02',
    category: 'CREDIT',
    ageGroups: ['senior'],
    question: "A shop offers a 'flat 10% interest' loan on 100,000 for 2 years, repaid monthly. Why is the true annual rate (APR) well above 10%?",
    options: ["Interest is charged on the full original amount even as you repay it", "Banks add secret taxes", "Because 2 years is a long time", "The rate is actually lower than 10%"],
    correctIndex: 0,
    explanation: "With a flat rate, interest is calculated on the whole 100,000 for the entire term, even though your balance shrinks each month. A reducing-balance loan at the same stated rate would cost much less.",
    xpReward: 45,
    difficulty: 'hard'
  },
  {
    id: 'nq-s-03',
    category: 'INVESTING',
    ageGroups: ['senior'],
    question: "A fixed deposit pays 7% while inflation is 6%. Roughly what is your real return?",
    options: ["About 1%", "About 7%", "About 13%", "About −1%"],
    correctIndex: 0,
    explanation: "Real return ≈ (1.07 ÷ 1.06) − 1 ≈ 0.94%, about 1%. Most of your headline 7% is eaten by rising prices.",
    xpReward: 40,
    difficulty: 'hard'
  },
  {
    id: 'nq-s-04',
    category: 'TAXES',
    ageGroups: ['senior'],
    question: "Your 'marginal tax rate' is 20%. What does that mean?",
    options: ["The tax rate on your NEXT unit of income, not on all of it", "You pay 20% on every unit you earn", "You pay 20% only on investments", "Your effective tax rate is also 20%"],
    correctIndex: 0,
    explanation: "In a slab system, only income inside the higher slab is taxed at the higher rate. Your overall (effective) tax rate is lower than your marginal rate.",
    xpReward: 40,
    difficulty: 'hard'
  },
  {
    id: 'nq-s-05',
    category: 'INVESTING',
    ageGroups: ['senior'],
    question: "Fund A charges a 1.5% yearly fee, Fund B charges 0.2%. On 500,000 invested, about how much more does Fund A cost each year?",
    options: ["6,500", "1,300", "7,500", "65,000"],
    correctIndex: 0,
    explanation: "The difference is 1.5% − 0.2% = 1.3%. 1.3% of 500,000 = 6,500 a year, and the gap compounds over decades.",
    xpReward: 40,
    difficulty: 'hard'
  },
  {
    id: 'nq-s-06',
    category: 'CREDIT',
    ageGroups: ['senior'],
    question: "Your credit limit is 200,000 and you owe 90,000. To get your utilisation down to 30%, how much must you pay off?",
    options: ["30,000", "60,000", "90,000", "15,000"],
    correctIndex: 0,
    explanation: "30% of 200,000 = 60,000 is the most you should be using. You owe 90,000, so pay off 90,000 − 60,000 = 30,000.",
    xpReward: 45,
    difficulty: 'hard'
  },
  {
    id: 'nq-s-07',
    category: 'BUDGETING',
    ageGroups: ['senior'],
    question: "Your expenses are 28,000 a month and you want a 6-month emergency fund. You already have 70,000. How much more do you need?",
    options: ["98,000", "168,000", "70,000", "42,000"],
    correctIndex: 0,
    explanation: "Target: 28,000 × 6 = 168,000. You have 70,000, so you still need 168,000 − 70,000 = 98,000.",
    xpReward: 35,
    difficulty: 'medium'
  },
  {
    id: 'nq-s-08',
    category: 'INVESTING',
    ageGroups: ['senior'],
    question: "A stock trades at a P/E of 40 while similar companies average 18, with similar growth. What does that most likely suggest?",
    options: ["It may be expensive compared with its peers", "It's guaranteed to outperform", "It has no debt", "It pays no tax"],
    correctIndex: 0,
    explanation: "A much higher P/E than comparable companies means you pay more for each unit of profit. That can be justified by better growth, but with similar growth it signals the stock may be overpriced.",
    xpReward: 45,
    difficulty: 'hard'
  },
  {
    id: 'nq-s-09',
    category: 'SPENDING',
    ageGroups: ['senior'],
    question: "You buy a 60,000 phone. If that money had instead been invested at 12% a year for 5 years (compounded), roughly what would it have become?",
    options: ["About 105,700", "About 96,000", "About 120,000", "About 66,000"],
    correctIndex: 0,
    explanation: "60,000 × 1.12⁵ ≈ 60,000 × 1.7623 ≈ 105,740. That gap is the 'opportunity cost' — what a purchase really costs once you count what the money could have earned.",
    xpReward: 45,
    difficulty: 'hard'
  },
  {
    id: 'nq-s-10',
    category: 'CREDIT',
    ageGroups: ['senior'],
    question: "In the 'debt avalanche' method, which debt do you pay extra on first?",
    options: ["The one with the highest interest rate", "The one with the smallest balance", "The oldest one", "The one from your favourite lender"],
    correctIndex: 0,
    explanation: "Avalanche targets the highest interest rate first, which minimises the total interest paid. (Snowball targets the smallest balance first for motivation.)",
    xpReward: 35,
    difficulty: 'medium'
  },
  {
    id: 'nq-s-11',
    category: 'TAXES',
    ageGroups: ['teen', 'senior'],
    question: "In a simple tax system the first 300,000 of income is taxed at 0% and the next 300,000 at 5%. How much tax is due on an income of 600,000?",
    options: ["15,000", "30,000", "0", "9,000"],
    correctIndex: 0,
    explanation: "The first 300,000 is tax-free. The next 300,000 × 5% = 15,000. Only the portion inside each slab is taxed at that slab's rate.",
    xpReward: 35,
    difficulty: 'medium'
  },
  {
    id: 'nq-s-12',
    category: 'INVESTING',
    ageGroups: ['teen', 'senior'],
    question: "What is the main benefit of investing a fixed amount every month (a SIP) during ups and downs?",
    options: ["You buy more units when prices are low and fewer when high", "You never lose money", "You always beat the market", "You avoid all fees"],
    correctIndex: 0,
    explanation: "A fixed amount buys more units when prices fall and fewer when they rise, which averages out your cost. It smooths risk; it does not remove it.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-s-13',
    category: 'BUDGETING',
    ageGroups: ['teen', 'senior'],
    question: "Your 40,000 salary arrives and 8,000 is moved automatically to savings on payday. What share of income are you saving?",
    options: ["20%", "8%", "25%", "12%"],
    correctIndex: 0,
    explanation: "8,000 ÷ 40,000 = 0.20 = 20%. Automating it on payday means you never have to rely on willpower.",
    xpReward: 30,
    difficulty: 'medium'
  },
  {
    id: 'nq-s-14',
    category: 'CREDIT',
    ageGroups: ['teen', 'senior'],
    question: "Which of these is usually the CHEAPEST way to borrow?",
    options: ["A loan secured against an asset you own, like gold or a home", "An unpaid credit card balance", "An instant-loan app", "A credit card cash advance"],
    correctIndex: 0,
    explanation: "Secured loans carry lower interest because the lender can claim the asset if you don't repay. Unsecured, instant borrowing usually costs far more.",
    xpReward: 35,
    difficulty: 'medium'
  },
  {
    id: 'nq-s-15',
    category: 'SPENDING',
    ageGroups: ['teen', 'senior'],
    question: "A product is priced at 1,000 and 18% tax is added at checkout. What is the final price?",
    options: ["1,180", "1,018", "1,800", "1,080"],
    correctIndex: 0,
    explanation: "18% of 1,000 = 180, so the final price is 1,000 + 180 = 1,180. Always check whether a price shown includes tax.",
    xpReward: 25,
    difficulty: 'easy'
  },
];
