/**
 * @fileOverview Configuration for supported currencies in SpendXP.
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

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
    name: 'Indian Rupee',
    symbolPosition: 'before',
    decimalPlaces: 0,
    useLocalNumberSystem: true,
  },
  {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    name: 'US Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2,
    useLocalNumberSystem: false,
  },
  {
    code: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    name: 'British Pound',
    symbolPosition: 'before',
    decimalPlaces: 2,
    useLocalNumberSystem: false,
  },
  {
    code: 'EUR',
    symbol: '€',
    locale: 'en-IE',
    name: 'Euro',
    symbolPosition: 'before',
    decimalPlaces: 2,
    useLocalNumberSystem: false,
  },
  {
    code: 'AED',
    symbol: 'د.إ',
    locale: 'ar-AE',
    name: 'UAE Dirham',
    symbolPosition: 'after',
    decimalPlaces: 2,
    useLocalNumberSystem: false,
  },
  {
    code: 'SGD',
    symbol: 'S$',
    locale: 'en-SG',
    name: 'Singapore Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2,
    useLocalNumberSystem: false,
  },
  {
    code: 'AUD',
    symbol: 'A$',
    locale: 'en-AU',
    name: 'Australian Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2,
    useLocalNumberSystem: false,
  },
  {
    code: 'CAD',
    symbol: 'C$',
    locale: 'en-CA',
    name: 'Canadian Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2,
    useLocalNumberSystem: false,
  },
];

export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0];
