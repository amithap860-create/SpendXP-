/**
 * @fileOverview Data definitions for the Stock Market Simulation game.
 */

export interface StockCompany {
  symbol: string;
  name: string;
  sector: string;
  startPrice: number;
  volatility: 'low' | 'medium' | 'high';
  description: string;
  /** Only offered to the Senior (17-20) age group — extra companies for
   *  older players who asked for more to choose from. Juniors and teens
   *  never see these, nor headlines about them. */
  seniorOnly?: boolean;
}

export interface NewsHeadline {
  id: string;
  ticker: string;
  headline: string;
  multiplier: number;
}

export const STOCK_COMPANIES: StockCompany[] = [
  { 
    symbol: 'SRE', 
    name: 'SolarRise Energy', 
    sector: 'Clean Energy', 
    startPrice: 45.00, 
    volatility: 'medium', 
    description: 'A leader in solar panel tech with growing government backing.' 
  },
  { 
    symbol: 'MMR', 
    name: 'MegaMart Retail', 
    sector: 'Retail', 
    startPrice: 150.00, 
    volatility: 'low', 
    description: 'The world\'s largest physical retailer with steady dividend growth.' 
  },
  { 
    symbol: 'CVT', 
    name: 'CryptoVault Inc', 
    sector: 'Fintech', 
    startPrice: 12.50, 
    volatility: 'high', 
    description: 'A digital asset platform where prices can skyrocket or crash in minutes.' 
  },
  { 
    symbol: 'HFC', 
    name: 'HealthFirst Corp', 
    sector: 'Healthcare', 
    startPrice: 85.00, 
    volatility: 'low', 
    description: 'Providing essential medical services regardless of economic cycles.' 
  },
  { 
    symbol: 'TNS', 
    name: 'TechNova Systems', 
    sector: 'Technology', 
    startPrice: 210.00, 
    volatility: 'medium', 
    description: 'Innovating in AI and cloud infrastructure for enterprise clients.' 
  },
  { 
    symbol: 'FCC', 
    name: 'FoodChain Co', 
    sector: 'Consumer Staples', 
    startPrice: 32.00, 
    volatility: 'low', 
    description: 'Supplying affordable food to millions of homes every day.'
  },
  // ── Senior (17-20) only ──────────────────────────────────────────────────
  {
    symbol: 'AGB',
    name: 'Apex Global Bank',
    sector: 'Banking',
    startPrice: 120.00,
    volatility: 'low',
    description: 'A large bank earning steadily from loans and fees — sensitive to interest-rate news.',
    seniorOnly: true,
  },
  {
    symbol: 'VDM',
    name: 'VoltDrive Motors',
    sector: 'Electric Vehicles',
    startPrice: 68.00,
    volatility: 'high',
    description: 'A fast-growing EV maker: big upside if it scales, big losses if production stumbles.',
    seniorOnly: true,
  },
  {
    symbol: 'SWM',
    name: 'StreamWave Media',
    sector: 'Entertainment',
    startPrice: 28.00,
    volatility: 'medium',
    description: 'A streaming platform whose price follows subscriber growth and content hits.',
    seniorOnly: true,
  },
];

export const NEWS_HEADLINES: NewsHeadline[] = [
  { id: '1', ticker: 'SRE', headline: 'SolarRise wins $2B government contract', multiplier: 1.15 },
  { id: '2', ticker: 'MMR', headline: 'MegaMart CEO resigns unexpectedly', multiplier: 0.88 },
  { id: '3', ticker: 'CVT', headline: 'CryptoVault hacked, funds at risk', multiplier: 0.72 },
  { id: '4', ticker: 'HFC', headline: 'HealthFirst vaccine approved by FDA', multiplier: 1.18 },
  { id: '5', ticker: 'TNS', headline: 'TechNova reveals secret AI project', multiplier: 1.12 },
  { id: '6', ticker: 'FCC', headline: 'FoodChain profits dip due to supply costs', multiplier: 0.92 },
  { id: '7', ticker: 'SRE', headline: 'Cloudy weather reduces solar efficiency forecasts', multiplier: 0.90 },
  { id: '8', ticker: 'MMR', headline: 'Record holiday sales for MegaMart stores', multiplier: 1.08 },
  { id: '9', ticker: 'CVT', headline: 'Major country adopts digital assets', multiplier: 1.25 },
  { id: '10', ticker: 'HFC', headline: 'Lawsuit filed against HealthFirst clinic', multiplier: 0.85 },
  { id: '11', ticker: 'TNS', headline: 'TechNova servers suffer massive outage', multiplier: 0.82 },
  { id: '12', ticker: 'FCC', headline: 'FoodChain acquires organic farm competitor', multiplier: 1.06 },
  { id: '13', ticker: 'SRE', headline: 'New battery storage breakthough for SRE', multiplier: 1.14 },
  { id: '14', ticker: 'MMR', headline: 'MegaMart launches same-day drone delivery', multiplier: 1.05 },
  { id: '15', ticker: 'CVT', headline: 'New regulations restrict crypto trading', multiplier: 0.78 },
  { id: '16', ticker: 'HFC', headline: 'HealthFirst expands to 10 new countries', multiplier: 1.10 },
  { id: '17', ticker: 'TNS', headline: 'Competitor steals TechNova market share', multiplier: 0.89 },
  { id: '18', ticker: 'FCC', headline: 'Food shortage fears drive up FCC prices', multiplier: 1.07 },
  { id: '19', ticker: 'SRE', headline: 'Global climate pact boosts energy stocks', multiplier: 1.09 },
  { id: '20', ticker: 'CVT', headline: 'Social media celebrity tweets about CVT', multiplier: 1.20 },
  // Senior-only companies (see seniorOnly above)
  { id: '21', ticker: 'AGB', headline: 'Central bank raises interest rates, widening bank lending margins', multiplier: 1.09 },
  { id: '22', ticker: 'AGB', headline: 'Apex Global Bank hit by surge in loan defaults', multiplier: 0.86 },
  { id: '23', ticker: 'VDM', headline: 'VoltDrive beats delivery targets, orders double', multiplier: 1.22 },
  { id: '24', ticker: 'VDM', headline: 'VoltDrive recalls 40,000 cars over battery fault', multiplier: 0.76 },
  { id: '25', ticker: 'SWM', headline: 'StreamWave original series becomes a global hit', multiplier: 1.16 },
  { id: '26', ticker: 'SWM', headline: 'StreamWave loses subscribers after price hike', multiplier: 0.88 },
];
