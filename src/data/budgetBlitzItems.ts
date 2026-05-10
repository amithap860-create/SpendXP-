/**
 * @fileOverview Data definitions for the Budget Blitz game.
 * Contains a variety of financial items categorized as NEED, WANT, or SAVE.
 */

export type BudgetCategory = 'NEED' | 'WANT' | 'SAVE';

export interface BudgetItem {
  name: string;
  category: BudgetCategory;
  basePrice: 'small' | 'medium' | 'large';
}

export const budgetBlitzItems: BudgetItem[] = [
  // NEEDS (15 items)
  { name: 'Monthly Rent', category: 'NEED', basePrice: 'large' },
  { name: 'Weekly Groceries', category: 'NEED', basePrice: 'medium' },
  { name: 'Bus Pass', category: 'NEED', basePrice: 'small' },
  { name: 'Electricity Bill', category: 'NEED', basePrice: 'medium' },
  { name: 'Water Utility', category: 'NEED', basePrice: 'small' },
  { name: 'Health Insurance', category: 'NEED', basePrice: 'medium' },
  { name: 'Basic Toiletries', category: 'NEED', basePrice: 'small' },
  { name: 'School Supplies', category: 'NEED', basePrice: 'small' },
  { name: 'Home Internet', category: 'NEED', basePrice: 'medium' },
  { name: 'Mobile Phone Plan', category: 'NEED', basePrice: 'small' },
  { name: 'Car Insurance', category: 'NEED', basePrice: 'medium' },
  { name: 'Emergency Repairs', category: 'NEED', basePrice: 'large' },
  { name: 'Heating Bill', category: 'NEED', basePrice: 'medium' },
  { name: 'Doctor Visit', category: 'NEED', basePrice: 'small' },
  { name: 'Prescription Medicine', category: 'NEED', basePrice: 'small' },

  // WANTS (16 items)
  { name: 'New Sneakers', category: 'WANT', basePrice: 'medium' },
  { name: 'Concert Ticket', category: 'WANT', basePrice: 'medium' },
  { name: 'Video Game Console', category: 'WANT', basePrice: 'large' },
  { name: 'Movie Streaming', category: 'WANT', basePrice: 'small' },
  { name: 'Ice Cream Sundae', category: 'WANT', basePrice: 'small' },
  { name: 'Cinema Ticket', category: 'WANT', basePrice: 'small' },
  { name: 'Designer Jacket', category: 'WANT', basePrice: 'large' },
  { name: 'Fancy Coffee', category: 'WANT', basePrice: 'small' },
  { name: 'Pizza Delivery', category: 'WANT', basePrice: 'small' },
  { name: 'Gaming Mouse', category: 'WANT', basePrice: 'medium' },
  { name: 'Skateboard', category: 'WANT', basePrice: 'medium' },
  { name: 'VR Headset', category: 'WANT', basePrice: 'large' },
  { name: 'Holiday Gift', category: 'WANT', basePrice: 'medium' },
  { name: 'Bubble Tea', category: 'WANT', basePrice: 'small' },
  { name: 'New Headphones', category: 'WANT', basePrice: 'medium' },
  { name: 'Amusement Park', category: 'WANT', basePrice: 'medium' },

  // SAVE (16 items)
  { name: 'Emergency Fund', category: 'SAVE', basePrice: 'large' },
  { name: 'Retirement Fund', category: 'SAVE', basePrice: 'large' },
  { name: 'College Savings', category: 'SAVE', basePrice: 'large' },
  { name: 'Holiday Fund', category: 'SAVE', basePrice: 'medium' },
  { name: 'Stock Portfolio', category: 'SAVE', basePrice: 'medium' },
  { name: 'Rainy Day Jar', category: 'SAVE', basePrice: 'small' },
  { name: 'House Downpayment', category: 'SAVE', basePrice: 'large' },
  { name: 'Savings Account', category: 'SAVE', basePrice: 'medium' },
  { name: 'Mutual Funds', category: 'SAVE', basePrice: 'medium' },
  { name: 'Charity Donation', category: 'SAVE', basePrice: 'small' },
  { name: 'Crypto Wallet', category: 'SAVE', basePrice: 'small' },
  { name: 'Passive Income', category: 'SAVE', basePrice: 'medium' },
  { name: 'Goal Completion', category: 'SAVE', basePrice: 'large' },
  { name: 'Fixed Deposit', category: 'SAVE', basePrice: 'medium' },
  { name: 'Gold Savings', category: 'SAVE', basePrice: 'medium' },
  { name: 'SIP Investment', category: 'SAVE', basePrice: 'small' },
];
