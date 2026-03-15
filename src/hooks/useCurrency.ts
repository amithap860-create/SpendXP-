'use client';

/**
 * @fileOverview Hook for currency formatting in INR.
 */

export function useCurrency() {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return { formatINR };
}
