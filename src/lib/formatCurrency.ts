/**
 * @fileOverview Utility functions for money formatting and scaling.
 * All rates are fixed and approximate — for educational simulation only.
 * SpendXP does not provide real-time financial data.
 */

import { CurrencyOption, CURRENCIES, DEFAULT_CURRENCY } from '@/config/currency';

/**
 * Approximate fixed exchange rates relative to INR = 1.
 * Updated periodically for rough accuracy; not for real financial decisions.
 *
 * UPDATED (2026-09-28): the previous values were stale enough to matter —
 * they implied 1 USD = ₹83.3, but the real rate that day was ~₹96 (the
 * rupee had weakened ~15% since these were last set), and every other
 * currency here was off by a similar or larger margin (GBP was the worst,
 * ~19% off). Since every price shown anywhere in the app (games, tools,
 * dashboard, quests) is stored as an INR number and converted through this
 * one table, a stale rate here doesn't just look wrong in one place — it
 * quietly mis-converts every single displayed amount for any non-INR user.
 * Refreshed against live rates checked via web search on 2026-09-28.
 * These will drift again over time — re-check periodically, they don't
 * need to be exact (this app doesn't do real transactions), just not
 * embarrassingly wrong.
 */
const RATES_FROM_INR: Record<string, number> = {
  INR: 1,
  USD: 0.01042,   // 1 USD ≈ ₹96.0
  GBP: 0.00788,   // 1 GBP ≈ ₹126.8
  CNY: 0.07001,   // 1 CNY ≈ ₹14.28
  JPY: 1.6570,    // 1 JPY ≈ ₹0.6035
  RUB: 0.88460,   // 1 RUB ≈ ₹1.13
  ZAR: 0.17030,   // 1 ZAR ≈ ₹5.87
  // Legacy currencies kept for backward compatibility
  EUR: 0.00917,   // 1 EUR ≈ ₹109.1
  AED: 0.03831,   // 1 AED ≈ ₹26.1
  SGD: 0.01334,   // 1 SGD ≈ ₹75.0
  AUD: 0.01485,   // 1 AUD ≈ ₹67.3
  CAD: 0.01476,   // 1 CAD ≈ ₹67.7
};

/**
 * Scales an INR base amount to the target currency using fixed educational rates.
 */
export function scaleAmount(inrAmount: number, targetCurrencyCode: string): number {
  const rate = RATES_FROM_INR[targetCurrencyCode] ?? 1;
  return Math.round(inrAmount * rate * 100) / 100;
}

/**
 * Converts a raw USD amount to its INR equivalent using the same rate table
 * as everywhere else. Added (2026-09-28) so callers (e.g. ConceptBreakdown.tsx,
 * which was keeping its own separately-hardcoded copy of this exact number)
 * read from the single source of truth instead of drifting out of sync with
 * it the next time these rates get refreshed.
 */
export function usdToInr(usdAmount: number): number {
  return usdAmount / RATES_FROM_INR.USD;
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
