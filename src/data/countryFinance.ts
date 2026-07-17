/**
 * @fileOverview Real-world financial institutions and vocabulary per country,
 * used to make FinIQ Quiz (and future lesson/quest content) tell the truth
 * about the actual system a user lives under — not just swap a currency symbol.
 *
 * Every entry below was verified against a live web search on 2026-07-17.
 * Two honesty notes worth keeping if this file is ever extended:
 *
 * 1. Sudan (SD) shares USD in src/config/currency.ts's CURRENCIES lookup
 *    (Sudan's real currency is the Sudanese Pound, SDG — not modeled in this
 *    app yet). That's a pre-existing gap in the currency config, not this
 *    file's problem to silently paper over — flagged here so nobody assumes
 *    the USD entry means "Sudan uses dollars."
 * 2. Sudan does not have a mature, widely-known consumer credit bureau/score
 *    system comparable to CIBIL/FICO/Sesame Credit. Rather than invent one,
 *    creditSystem for SD describes the real (less standardized) situation.
 */

import { AgeGroup } from '@/lib/ageAdapt';

export type CountryCode = 'IN' | 'US' | 'GB' | 'CN' | 'JP' | 'RU' | 'ZA' | 'SD';

export type CountryFinance = {
  code: CountryCode;
  /** Government body that collects income tax */
  taxAuthority: string;
  /** Name of the consumption tax added to purchases, and whether it's shown
   *  included in the sticker price or added at checkout */
  consumptionTax: { name: string; addedAtCheckout: boolean };
  /** Consumer credit scoring system */
  creditSystem: { name: string; range?: string };
  /** Main stock market index */
  stockIndex: { name: string; exchange: string };
  /** Common retirement/pension savings vehicle */
  retirementAccount: string;
  /** Annual wage/tax certificate an employer issues */
  taxForm: string;
};

export const COUNTRY_FINANCE: Record<CountryCode, CountryFinance> = {
  IN: {
    code: 'IN',
    taxAuthority: 'Income Tax Department',
    consumptionTax: { name: 'GST', addedAtCheckout: false },
    creditSystem: { name: 'CIBIL Score', range: '300–900' },
    stockIndex: { name: 'Nifty 50', exchange: 'NSE' },
    retirementAccount: 'NPS (National Pension System) / EPF',
    taxForm: 'Form 16',
  },
  US: {
    code: 'US',
    taxAuthority: 'IRS (Internal Revenue Service)',
    consumptionTax: { name: 'Sales Tax', addedAtCheckout: true },
    creditSystem: { name: 'FICO Score', range: '300–850' },
    stockIndex: { name: 'S&P 500', exchange: 'NYSE/Nasdaq' },
    retirementAccount: '401(k)',
    taxForm: 'W-2',
  },
  GB: {
    code: 'GB',
    taxAuthority: 'HMRC (His Majesty\'s Revenue and Customs)',
    consumptionTax: { name: 'VAT', addedAtCheckout: false },
    creditSystem: { name: 'Credit Score (Experian/Equifax)', range: '0–999' },
    stockIndex: { name: 'FTSE 100', exchange: 'London Stock Exchange' },
    retirementAccount: 'Workplace Pension / ISA',
    taxForm: 'P60',
  },
  CN: {
    code: 'CN',
    taxAuthority: 'State Taxation Administration',
    consumptionTax: { name: 'VAT (增值税)', addedAtCheckout: false },
    creditSystem: { name: 'Sesame Credit (via Alipay)', range: '350–950' },
    stockIndex: { name: 'Shanghai Composite', exchange: 'Shanghai Stock Exchange' },
    retirementAccount: 'Basic Pension Insurance',
    taxForm: 'Individual Income Tax Withholding Certificate',
  },
  JP: {
    code: 'JP',
    taxAuthority: 'National Tax Agency (国税庁)',
    consumptionTax: { name: 'Consumption Tax (消費税)', addedAtCheckout: false },
    creditSystem: { name: 'Credit history via JICC/CIC bureaus (no single FICO-style score)' },
    stockIndex: { name: 'Nikkei 225', exchange: 'Tokyo Stock Exchange' },
    retirementAccount: 'Kōsei Nenkin (Employees\' Pension) / iDeCo',
    taxForm: 'Gensen Choshuhyo (源泉徴収票)',
  },
  RU: {
    code: 'RU',
    taxAuthority: 'Federal Tax Service (FNS)',
    consumptionTax: { name: 'VAT (НДС)', addedAtCheckout: false },
    creditSystem: { name: 'Credit Score via NBKI (National Bureau of Credit Histories)' },
    stockIndex: { name: 'MOEX Russia Index', exchange: 'Moscow Exchange' },
    retirementAccount: 'State Pension (Social Fund of Russia)',
    taxForm: '2-NDFL certificate',
  },
  ZA: {
    code: 'ZA',
    taxAuthority: 'SARS (South African Revenue Service)',
    consumptionTax: { name: 'VAT', addedAtCheckout: false },
    creditSystem: { name: 'Credit Score (TransUnion/Experian)', range: '0–999' },
    stockIndex: { name: 'JSE Top 40', exchange: 'Johannesburg Stock Exchange' },
    retirementAccount: 'Retirement Annuity / Pension Fund',
    taxForm: 'IRP5',
  },
  SD: {
    code: 'SD',
    taxAuthority: 'Sudan Taxation Chamber',
    consumptionTax: { name: 'VAT', addedAtCheckout: false },
    // Honest gap, not a fabricated bureau name — Sudan's banking sector does not
    // have a mature, widely-known consumer credit-scoring bureau like the other
    // 7 countries here. Banks assess history directly rather than via a score.
    creditSystem: { name: 'Assessed directly by banks (no unified national credit bureau)' },
    stockIndex: { name: 'Khartoum Stock Exchange', exchange: 'KSE' },
    retirementAccount: 'National Pension Fund',
    taxForm: 'Annual salary certificate from employer',
  },
};

export function getCountryFinance(countryCode: string): CountryFinance {
  return COUNTRY_FINANCE[countryCode as CountryCode] ?? COUNTRY_FINANCE.IN;
}
