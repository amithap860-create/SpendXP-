/**
 * @fileOverview Data definitions for the Budget Blitz game.
 * Contains a variety of financial items categorized as NEED, WANT, or SAVE.
 */

export type BudgetCategory = 'NEED' | 'WANT' | 'SAVE';

export interface BudgetItem {
  name: string;
  category: BudgetCategory;
  /**
   * FIX (2026-09-28): this used to be a generic 'small' | 'medium' | 'large'
   * bucket, looked up against a SHARED number per age group in ageAdapt.ts
   * (e.g. every "medium" item for a teen was exactly ₹200, no matter if it
   * was an Electricity Bill or a Gaming Mouse). That's how an Electricity
   * Bill ended up displaying as $2.40 (₹200 scaled to USD) — not a currency
   * bug, a pricing-design bug: real bills and real treats are wildly
   * different magnitudes and a shared bucket can't represent that.
   *
   * Each item now carries its own realistic INR estimate, chosen with two
   * different anchors depending on what the item actually is:
   *  - NEED and SAVE items (rent, electricity, groceries, insurance,
   *    savings contributions) are genuinely cost-of-living items — real
   *    prices for these differ by country, not just currency, so an
   *    India-realistic number will legitimately look "cheap" once converted
   *    to USD/GBP. That's correct, not a bug — a real Indian electricity
   *    bill genuinely is a lower USD figure than an American one.
   *  - WANT items are mostly globally-traded goods (electronics, branded
   *    clothing, tickets) whose price is fairly consistent worldwide in USD
   *    terms regardless of local cost of living, so these are priced from a
   *    realistic global-average USD estimate and converted to INR at the
   *    live rate checked 2026-09-28 (~₹96/$1) — e.g. a "Designer Jacket"
   *    is priced as a real ~$220 jacket, not an India-only bargain-rack one.
   */
  priceINR: number;
}

export const budgetBlitzItems: BudgetItem[] = [
  // NEEDS (15 items)
  { name: 'Monthly Rent', category: 'NEED', priceINR: 15000 },
  { name: 'Weekly Groceries', category: 'NEED', priceINR: 1500 },
  { name: 'Bus Pass', category: 'NEED', priceINR: 500 },
  { name: 'Electricity Bill', category: 'NEED', priceINR: 2000 },
  { name: 'Water Utility', category: 'NEED', priceINR: 300 },
  { name: 'Health Insurance', category: 'NEED', priceINR: 1200 },
  { name: 'Basic Toiletries', category: 'NEED', priceINR: 400 },
  { name: 'School Supplies', category: 'NEED', priceINR: 800 },
  { name: 'Home Internet', category: 'NEED', priceINR: 800 },
  { name: 'Mobile Phone Plan', category: 'NEED', priceINR: 300 },
  { name: 'Car Insurance', category: 'NEED', priceINR: 1500 },
  { name: 'Emergency Repairs', category: 'NEED', priceINR: 8000 },
  { name: 'Heating Bill', category: 'NEED', priceINR: 1500 },
  { name: 'Doctor Visit', category: 'NEED', priceINR: 500 },
  { name: 'Prescription Medicine', category: 'NEED', priceINR: 350 },

  // WANTS (16 items) — priced from realistic global-average USD estimates,
  // converted to INR at ~₹96/$1 (see note above)
  { name: 'New Sneakers', category: 'WANT', priceINR: 6200 },       // ~$65
  { name: 'Concert Ticket', category: 'WANT', priceINR: 7200 },     // ~$75
  { name: 'Video Game Console', category: 'WANT', priceINR: 43200 }, // ~$450
  { name: 'Movie Streaming', category: 'WANT', priceINR: 1440 },    // ~$15/mo
  { name: 'Ice Cream Sundae', category: 'WANT', priceINR: 580 },    // ~$6
  { name: 'Cinema Ticket', category: 'WANT', priceINR: 770 },       // ~$8
  { name: 'Designer Jacket', category: 'WANT', priceINR: 21000 },   // ~$220
  { name: 'Fancy Coffee', category: 'WANT', priceINR: 530 },        // ~$5.50
  { name: 'Pizza Delivery', category: 'WANT', priceINR: 1700 },     // ~$18
  { name: 'Gaming Mouse', category: 'WANT', priceINR: 3300 },       // ~$35
  { name: 'Skateboard', category: 'WANT', priceINR: 6200 },         // ~$65
  { name: 'VR Headset', category: 'WANT', priceINR: 33500 },        // ~$350
  { name: 'Holiday Gift', category: 'WANT', priceINR: 3300 },       // ~$35
  { name: 'Bubble Tea', category: 'WANT', priceINR: 530 },          // ~$5.50
  { name: 'New Headphones', category: 'WANT', priceINR: 5700 },     // ~$60
  { name: 'Amusement Park', category: 'WANT', priceINR: 4300 },     // ~$45

  // SAVE (16 items)
  { name: 'Emergency Fund', category: 'SAVE', priceINR: 10000 },
  { name: 'Retirement Fund', category: 'SAVE', priceINR: 5000 },
  { name: 'College Savings', category: 'SAVE', priceINR: 5000 },
  { name: 'Holiday Fund', category: 'SAVE', priceINR: 2000 },
  { name: 'Stock Portfolio', category: 'SAVE', priceINR: 3000 },
  { name: 'Rainy Day Jar', category: 'SAVE', priceINR: 500 },
  { name: 'House Downpayment', category: 'SAVE', priceINR: 20000 },
  { name: 'Savings Account', category: 'SAVE', priceINR: 2000 },
  { name: 'Mutual Funds', category: 'SAVE', priceINR: 3000 },
  { name: 'Charity Donation', category: 'SAVE', priceINR: 300 },
  { name: 'Crypto Wallet', category: 'SAVE', priceINR: 500 },
  { name: 'Passive Income', category: 'SAVE', priceINR: 2500 },
  { name: 'Goal Completion', category: 'SAVE', priceINR: 8000 },
  { name: 'Fixed Deposit', category: 'SAVE', priceINR: 5000 },
  { name: 'Gold Savings', category: 'SAVE', priceINR: 2000 },
  { name: 'SIP Investment', category: 'SAVE', priceINR: 1000 },
];
