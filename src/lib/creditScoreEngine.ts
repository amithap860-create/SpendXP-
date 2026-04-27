'use client';

/**
 * @fileOverview Logic for calculating and mutating credit score factors.
 */

export type CreditFactor = {
  id: string;
  name: string;
  weight: number;        // percentage weight (35, 30, 15, 10, 10)
  currentValue: number;  // 0–100
  description: string;
};

export const INITIAL_FACTORS: CreditFactor[] = [
  { id: 'history', name: 'Payment History', weight: 35, currentValue: 50, description: 'On-time payments' },
  { id: 'utilisation', name: 'Credit Utilisation', weight: 30, currentValue: 40, description: 'Balance vs limit' },
  { id: 'length', name: 'History Length', weight: 15, currentValue: 30, description: 'Age of accounts' },
  { id: 'mix', name: 'Credit Mix', weight: 10, currentValue: 20, description: 'Types of credit' },
  { id: 'inquiries', name: 'New Inquiries', weight: 10, currentValue: 80, description: 'Recent applications' },
];

/**
 * Calculates weighted score mapped to 300–850 range.
 */
export function calculateScore(factors: CreditFactor[]): number {
  const totalWeightedHealth = factors.reduce((acc, f) => acc + (f.currentValue * (f.weight / 100)), 0);
  // Map 0-100 health to 300-850 range
  // Score = 300 + (Health * 5.5)
  return Math.round(300 + (totalWeightedHealth * 5.5));
}

/**
 * Returns the band label and color for a given score.
 */
export function getScoreBand(score: number) {
  if (score < 580) return { label: 'Poor', color: 'text-rose-600', bg: 'bg-rose-100' };
  if (score < 670) return { label: 'Fair', color: 'text-[#4EA07A]', bg: 'bg-[#E8F5EE]' };
  if (score < 740) return { label: 'Good', color: 'text-[#2E7D5A]', bg: 'bg-[#C8E8D8]' };
  if (score < 800) return { label: 'Very Good', color: 'text-primary', bg: 'bg-[#C8E8D8]' };
  return { label: 'Exceptional', color: 'text-primary', bg: 'bg-[#C8E8D8]' };
}

/**
 * Returns simplified bands for Junior users.
 */
export function getJuniorBand(score: number) {
  if (score < 600) return { label: 'Needs Work', color: 'text-rose-600', bg: 'bg-rose-100' };
  if (score < 720) return { label: 'Getting There', color: 'text-[#2E7D5A]', bg: 'bg-[#C8E8D8]' };
  return { label: 'Great!', color: 'text-primary', bg: 'bg-[#C8E8D8]' };
}

/**
 * Mutates factors based on effect object.
 */
export function applyEffect(factors: CreditFactor[], effect: Record<string, number>): CreditFactor[] {
  return factors.map(f => {
    if (effect[f.id]) {
      return { ...f, currentValue: Math.min(100, Math.max(0, f.currentValue + effect[f.id])) };
    }
    // Length of history naturally increases slightly if not negatively impacted
    if (f.id === 'length') {
      return { ...f, currentValue: Math.min(100, f.currentValue + 1) };
    }
    return f;
  });
}
