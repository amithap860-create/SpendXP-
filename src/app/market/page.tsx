import { redirect } from 'next/navigation';

// The Stock Market Simulator lives inside the Games hub
export default function MarketPage() {
  redirect('/games?game=stockMarketSim');
}
