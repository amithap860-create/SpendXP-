'use client';

/**
 * @fileOverview Hook for global currency handling.
 */

import { useMemo, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, CurrencyOption } from '@/config/currency';
import { formatCurrency, formatCompact as libFormatCompact, scaleAmount } from '@/lib/formatCurrency';

export function useCurrency() {
  const authContext = useAuthContext();
  const currencyCode = authContext?.currencyCode || 'INR';

  const activeCurrency: CurrencyOption = useMemo(() => {
    return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || DEFAULT_CURRENCY;
  }, [currencyCode]);

  /**
   * Formats a raw value (assumed to be in the active currency) for display.
   */
  const formatValue = useCallback((amount: number) => {
    return formatCurrency(amount, activeCurrency);
  }, [activeCurrency]);

  /**
   * Scales an INR base amount to the user's currency and formats it.
   */
  const formatINR = useCallback((inrAmount: number) => {
    const scaled = scaleAmount(inrAmount, activeCurrency.code);
    return formatCurrency(scaled, activeCurrency);
  }, [activeCurrency]);

  /**
   * Compact notation for large numbers.
   */
  const formatCompact = useCallback((amount: number) => {
    return libFormatCompact(amount, activeCurrency);
  }, [activeCurrency]);

  /**
   * Bound scaling function for game logic.
   */
  const scaleGameAmount = useCallback((inrAmount: number) => {
    return scaleAmount(inrAmount, activeCurrency.code);
  }, [activeCurrency]);

  return { 
    formatValue, 
    formatINR, 
    formatCompact, 
    scaleGameAmount,
    activeCurrency 
  };
}
