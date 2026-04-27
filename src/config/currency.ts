/**
 * @fileOverview Configuration for all 8 supported countries in SpendXP.
 * PPP-adjusted starting balances ensure every user starts with equivalent
 * purchasing power regardless of their country.
 *
 * Educational note: exchange rates are approximate and fixed for simulation.
 * SpendXP does not provide real-time financial data.
 */

export type CurrencyOption = {
  code: string;
  symbol: string;
  locale: string;
  name: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  useLocalNumberSystem: boolean;
};

export type CountryConfig = {
  code: string;           // ISO 3166-1 alpha-2
  name: string;
  flag: string;           // emoji flag
  currency: CurrencyOption;
  /** Starting virtual balance in local currency — PPP adjusted to ~₹10,000 Indian baseline */
  startingBalance: number;
  /** Typical monthly pocket-money / allowance for a teen in this country (local currency) */
  typicalAllowance: number;
  /** Colour accent used for country badge in the UI */
  accentColor: string;
};

// ─── Currency definitions ────────────────────────────────────────────────────

export const CURRENCIES: Record<string, CurrencyOption> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
    name: 'Indian Rupee',
    symbolPosition: 'before',
    decimalPlaces: 0,
    useLocalNumberSystem: true,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    name: 'US Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2,
    useLocalNumberSystem: false,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    name: 'British Pound',
    symbolPosition: 'before',
    decimalPlaces: 2,
    useLocalNumberSystem: false,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    locale: 'zh-CN',
    name: 'Chinese Yuan',
    symbolPosition: 'before',
    decimalPlaces: 2,
    useLocalNumberSystem: false,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    locale: 'ja-JP',
    name: 'Japanese Yen',
    symbolPosition: 'before',
    decimalPlaces: 0,
    useLocalNumberSystem: false,
  },
  RUB: {
    code: 'RUB',
    symbol: '₽',
    locale: 'ru-RU',
    name: 'Russian Ruble',
    symbolPosition: 'after',
    decimalPlaces: 0,
    useLocalNumberSystem: false,
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    locale: 'en-ZA',
    name: 'South African Rand',
    symbolPosition: 'before',
    decimalPlaces: 2,
    useLocalNumberSystem: false,
  },
};

// ─── Legacy array — kept for backward compatibility ──────────────────────────
export const SUPPORTED_CURRENCIES: CurrencyOption[] = Object.values(CURRENCIES);

export const DEFAULT_CURRENCY = CURRENCIES.INR;

// ─── Country configurations ──────────────────────────────────────────────────

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: CURRENCIES.INR,
    startingBalance: 10_000,       // ₹10,000 — baseline
    typicalAllowance: 500,
    accentColor: '#FF9933',
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: CURRENCIES.USD,
    startingBalance: 120,          // ~$120 PPP equivalent
    typicalAllowance: 20,
    accentColor: '#3C3B6E',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: CURRENCIES.GBP,
    startingBalance: 95,           // ~£95 PPP equivalent
    typicalAllowance: 15,
    accentColor: '#00247D',
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    currency: CURRENCIES.CNY,
    startingBalance: 870,          // ~¥870 CNY PPP equivalent
    typicalAllowance: 100,
    accentColor: '#DE2910',
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    currency: CURRENCIES.JPY,
    startingBalance: 18_000,       // ~¥18,000 JPY PPP equivalent
    typicalAllowance: 3_000,
    accentColor: '#BC002D',
  },
  {
    code: 'RU',
    name: 'Russia',
    flag: '🇷🇺',
    currency: CURRENCIES.RUB,
    startingBalance: 11_000,       // ~₽11,000 RUB PPP equivalent
    typicalAllowance: 1_500,
    accentColor: '#0039A6',
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    currency: CURRENCIES.ZAR,
    startingBalance: 2_200,        // ~R2,200 ZAR PPP equivalent
    typicalAllowance: 300,
    accentColor: '#007A4D',
  },
  {
    code: 'SD',
    name: 'Sudan',
    flag: '🇸🇩',
    currency: CURRENCIES.USD,     // USD fallback
    startingBalance: 120,          // USD equivalent
    typicalAllowance: 20,
    accentColor: '#078930',
  },
];

/** Look up a CountryConfig by ISO country code. Falls back to India. */
export function getCountryConfig(countryCode: string): CountryConfig {
  return COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0];
}

/** Look up a CountryConfig by currency code. Falls back to India. */
export function getCountryByCurrency(currencyCode: string): CountryConfig {
  return COUNTRIES.find(c => c.currency.code === currencyCode) ?? COUNTRIES[0];
}
