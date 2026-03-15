/**
 * @fileOverview Utility functions for money formatting and scaling.
 */

import { CurrencyOption, SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/config/currency';

/**
 * Approximate fixed exchange rates for educational purposes.
 * SpendXP does not provide real-time financial data.
 */
const RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0095,
  EUR: 0.011,
  AED: 0.044,
  SGD: 0.016,
  AUD: 0.018,
  CAD: 0.016,
};

/**
 * Scales an INR amount to a target currency based on fixed educational rates.
 */
export function scaleAmount(inrAmount: number, targetCurrencyCode: string): number {
  const rate = RATES[targetCurrencyCode] ?? 1;
  return inrAmount * rate;
}

/**
 * Formats a numeric value as currency based on the provided option.
 */
export function formatCurrency(value: number, option: CurrencyOption = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat(option.locale, {
    style: 'currency',
    currency: option.code,
    minimumFractionDigits: option.decimalPlaces,
    maximumFractionDigits: option.decimalPlaces,
  }).format(value);
}

/**
 * Formats a value using compact notation (e.g. 1.2M, 40K).
 */
export function formatCompact(value: number, option: CurrencyOption = DEFAULT_CURRENCY): string {
  const formatted = new Intl.NumberFormat(option.locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);

  // For some locales, Intl compact notation doesn't include the currency symbol
  // We manually prepend/append if needed, or just use the symbol
  if (!formatted.includes(option.symbol)) {
    return option.symbolPosition === 'before' 
      ? `${option.symbol}${formatted}` 
      : `${formatted} ${option.symbol}`;
  }
  
  return formatted;
}
