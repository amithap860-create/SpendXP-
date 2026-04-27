/**
 * @fileOverview Utility functions for money formatting and scaling.
 * All rates are fixed and approximate — for educational simulation only.
 * SpendXP does not provide real-time financial data.
 */

import { CurrencyOption, CURRENCIES, DEFAULT_CURRENCY } from '@/config/currency';

/**
 * Approximate fixed exchange rates relative to INR = 1.
 * Updated periodically for rough accuracy; not for real financial decisions.
 */
const RATES_FROM_INR: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0094,
  CNY: 0.087,
  JPY: 1.82,
  RUB: 1.10,
  ZAR: 0.22,
  // Legacy currencies kept for backward compatibility
  EUR: 0.011,
  AED: 0.044,
  SGD: 0.016,
  AUD: 0.018,
  CAD: 0.016,
};

/**
 * Scales an INR base amount to the target currency using fixed educational rates.
 */
export function scaleAmount(inrAmount: number, targetCurrencyCode: string): number {
  const rate = RATES_FROM_INR[targetCurrencyCode] ?? 1;
  return Math.round(inrAmount * rate * 100) / 100;
}

/**
 * Formats a numeric value as currency based on the provided CurrencyOption.
 */
export function formatCurrency(value: number, option: CurrencyOption = DEFAULT_CURRENCY): string {
  try {
    return new Intl.NumberFormat(option.locale, {
      style: 'currency',
      currency: option.code,
      minimumFractionDigits: option.decimalPlaces,
      maximumFractionDigits: option.decimalPlaces,
    }).format(value);
  } catch {
    // Fallback if locale/currency not supported by runtime
    const rounded = option.decimalPlaces === 0 ? Math.round(value) : value.toFixed(option.decimalPlaces);
    return option.symbolPosition === 'before'
      ? `${option.symbol}${rounded}`
      : `${rounded} ${option.symbol}`;
  }
}

/**
 * Formats a value using compact notation (e.g. 1.2M, 40K).
 */
export function formatCompact(value: number, option: CurrencyOption = DEFAULT_CURRENCY): string {
  try {
    const formatted = new Intl.NumberFormat(option.locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(value);

    // Intl compact doesn't always include currency symbol — prepend/append manually
    if (!formatted.includes(option.symbol)) {
      return option.symbolPosition === 'before'
        ? `${option.symbol}${formatted}`
        : `${formatted} ${option.symbol}`;
    }
    return formatted;
  } catch {
    return formatCurrency(value, option);
  }
}
