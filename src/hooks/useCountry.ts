'use client';

/**
 * @fileOverview Hook for country-specific content (as opposed to useCurrency,
 * which only handles currency math). Separate on purpose: Sudan shares USD
 * with the US in the currency config, so currencyCode alone can't tell two
 * countries apart. This hook surfaces the actual country the user picked at
 * onboarding, plus the real-world institutions that go with it.
 */

import { useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { getCountryConfig, CountryConfig } from '@/config/currency';
import { getCountryFinance, CountryFinance, CountryCode } from '@/data/countryFinance';

export function useCountry() {
  const authContext = useAuthContext();
  const countryCode = (authContext?.countryCode || 'IN') as CountryCode;

  const countryConfig: CountryConfig = useMemo(
    () => getCountryConfig(countryCode),
    [countryCode]
  );

  const finance: CountryFinance = useMemo(
    () => getCountryFinance(countryCode),
    [countryCode]
  );

  return { countryCode, countryConfig, finance };
}
