'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { STOCK_COMPANIES, NEWS_HEADLINES, StockCompany, NewsHeadline } from '@/data/stockMarketData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XPWallet } from '@/components/XPWallet';
import { 
  TrendingUp, 
  BarChart3, 
  Trophy, 
  Newspaper,
  Wallet,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const ROUND_TIME = 20;

export function StockMarketSim({ onExit }: { onExit: () => void }) {
  const { ageGroup } = useAgeAdapt();
  const startingCash = useMemo(() => ageGroup === 'junior' ? 100 : ageGroup === 'senior' ? 5000 : 1000, [ageGroup]);
  const companies = useMemo(() => ageGroup === 'junior' ? STOCK_COMPANIES.slice(0, 3) : STOCK_COMPANIES, [ageGroup]);

  const gameConfig = useMemo(() => ({
    gameName: 'stockMarketSim' as const,
    totalRounds: 5,
    timePerRound: ROUND_TIME,
    livesEnabled: false,
    xpPerWin: 200,
    xpPerCorrectAnswer: 0,
  }), []);

  const { gameState, currentRound, timeLeft, startGame, nextRound, endGame } = useGameEngine(gameConfig);

  const [cash, setCash] = useState(startingCash);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>(() => Object.fromEntries(companies.map(c => [c.symbol, c.startPrice])));
  const [currentHeadline, setCurrentHeadline] = useState<NewsHeadline | null>(null);
  const [tradeModal, setTradeModal] = useState<{ type: 'buy' | 'sell', stock: StockCompany } | null>(null);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = ageGroup === 'junior' ? 5000 : 3000;
    const timer = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        companies.forEach(company => {
          const volFactor = company.volatility === 'high' ? 0.14 : company.volatility === 'medium' ? 0.07 : 0.03;
          let multiplier = 1 + (Math.random() - 0.48) * volFactor;
          if (currentHeadline && currentHeadline.ticker === company.symbol) multiplier *= currentHeadline.multiplier;
          next[company.symbol] = Number(Math.max(1, prev[company.symbol] * multiplier).toFixed(2));
        });
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [gameState, ageGroup, companies, currentHeadline]);

  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft === 0) {
      if (currentRound < 5) {
        setCurrentHeadline(NEWS_HEADLINES[Math.floor(Math.random() * NEWS_HEADLINES.length)]);
        nextRound();
      } else endGame();
    }
  }, [timeLeft, gameState, currentRound, nextRound, endGame]);

  const handleTrade = (qty: number) => {
    if (!tradeModal) return;
    const price = prices[tradeModal.stock.symbol];
    if (tradeModal.type === 'buy' && cash >= qty * price) {
      setCash(prev => prev - qty * price);
      setPortfolio(prev => ({ ...prev, [tradeModal.stock.symbol]: (prev[tradeModal.stock.symbol] || 0) + qty }));
    } else if (tradeModal.type === 'sell' && (portfolio[tradeModal.stock.symbol] || 0) >= qty) {
      setCash(prev => prev + qty * price);
      setPortfolio(prev => ({ ...prev, [tradeModal.stock.symbol]: (prev[tradeModal.stock.symbol] || 0) - qty }));
    }
    setTradeModal(null);
  };

  const portfolioValue = Object.entries(portfolio).reduce((acc, [s, q]) => acc + q * prices[s], 0);
  const totalWealth = cash + portfolioValue;

  if (gameState === 'IDLE') return (
    <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
      <div className="bg-primary p-10 text-white text-center"><BarChart3 className="h-12 w-12 mx-auto mb-6" /><CardTitle className="text-4xl font-black mb-2">STOCK SIMULATOR</CardTitle></div>
      <CardContent className="p-10"><Button onClick={startGame} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl">START TRADING</Button></CardContent>
    </Card>
  );

  if (gameState === 'RESULTS') return (
    <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-7">
        <Card className="border-none shadow-2xl bg-white overflow-hidden">
          <div className="bg-emerald-500 p-10 text-white text-center"><Trophy className="h-16 w-16 mx-auto mb-4" /><CardTitle className="text-4xl font-black mb-2">Market Closed!</CardTitle></div>
          <CardContent className="p-10 space-y-8">
            <div className="text-center font-black text-6xl text-emerald-600">${totalWealth.toFixed(2)}</div>
            <Button onClick={onExit} className="w-full h-14 font-bold text-lg">Return to Hub</Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-5"><XPWallet /></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-3 md:p-4 flex flex-col items-center border-none shadow-sm"><div className="text-[9px] md:text-[10px] font-black uppercase text-slate-400">Cash</div><div className="text-lg md:text-xl font-black text-primary">${cash.toFixed(2)}</div></Card>
        <Card className="p-3 md:p-4 flex flex-col items-center border-none shadow-sm bg-primary text-white"><div className="text-[9px] md:text-[10px] font-black uppercase text-white/60">Day</div><div className="text-lg md:text-xl font-black">{currentRound} / 5</div></Card>
        <div className="md:hidden col-span-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full h-full min-h-[44px] gap-2 font-black uppercase text-[10px] tracking-widest"><Wallet className="h-4 w-4" /> View Portfolio <ChevronUp className="h-3 w-3" /></Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60dvh] rounded-t-3xl border-none">
              <SheetHeader><SheetTitle className="text-2xl font-black">Portfolio Value: ${portfolioValue.toFixed(2)}</SheetTitle></SheetHeader>
              <div className="py-6 space-y-4">
                {Object.entries(portfolio).map(([s, q]) => q > 0 && (
                  <div key={s} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border">
                    <div><div className="font-black text-slate-900">{s}</div><div className="text-[10px] uppercase font-bold text-slate-400">{q} Shares</div></div>
                    <div className="font-black text-primary">${(q * prices[s]).toFixed(2)}</div>
                  </div>
                ))}
                {Object.values(portfolio).every(v => v === 0) && <p className="text-center text-slate-400 italic">No stocks owned.</p>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {currentHeadline && (
        <div className="bg-amber-100 p-4 rounded-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-top-2">
          <Newspaper className="h-5 w-5 md:h-6 md:w-6 text-amber-500 shrink-0" />
          <div className="text-xs md:text-sm font-bold text-amber-900 leading-tight">{currentHeadline.headline}</div>
        </div>
      )}

      <div className="space-y-3">
        {companies.map(c => (
          <Card key={c.symbol} className="p-3 md:p-4 border-none shadow-sm flex items-center justify-between bg-white">
            <div>
              <div className="font-black text-sm md:text-base text-slate-900">{c.name}</div>
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">{c.symbol}</div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-base md:text-lg font-black text-primary">${prices[c.symbol]}</div>
              <div className="flex gap-1 md:gap-2">
                <Button size="sm" className="h-9 w-9 md:h-10 md:px-4 p-0 md:w-auto" onClick={() => setTradeModal({ type: 'buy', stock: c })}>Buy</Button>
                <Button size="sm" variant="outline" className="h-9 w-9 md:h-10 md:px-4 p-0 md:w-auto" disabled={!portfolio[c.symbol]} onClick={() => setTradeModal({ type: 'sell', stock: c })}>Sell</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!tradeModal} onOpenChange={() => setTradeModal(null)}>
        <DialogContent className="max-w-[calc(100vw-32px)] rounded-3xl p-6">
          <DialogHeader><DialogTitle className="capitalize text-2xl font-black">{tradeModal?.type} {tradeModal?.stock.name}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-6">
            {[1, 5, 10, 20].map(v => (
              <Button key={v} variant="outline" className="h-14 font-black" onClick={() => handleTrade(v)}>{v} Shares</Button>
            ))}
          </div>
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Cash: ${cash.toFixed(2)}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}