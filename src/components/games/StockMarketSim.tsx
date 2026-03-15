'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { STOCK_COMPANIES, NEWS_HEADLINES, StockCompany, NewsHeadline } from '@/data/stockMarketData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XPWallet } from '@/components/XPWallet';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Trophy, 
  Info, 
  Newspaper,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';

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
  const [history, setHistory] = useState<Record<string, number[]>>(() => Object.fromEntries(companies.map(c => [c.symbol, [c.startPrice]])));
  const [currentHeadline, setCurrentHeadline] = useState<NewsHeadline | null>(null);
  const [tradeModal, setTradeModal] = useState<{ type: 'buy' | 'sell', stock: StockCompany } | null>(null);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = ageGroup === 'junior' ? 5000 : 3000;
    const timer = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        const nextHistory = { ...history };
        companies.forEach(company => {
          const volFactor = company.volatility === 'high' ? 0.14 : company.volatility === 'medium' ? 0.07 : 0.03;
          let multiplier = 1 + (Math.random() - 0.48) * volFactor;
          if (currentHeadline && currentHeadline.ticker === company.symbol) multiplier *= currentHeadline.multiplier;
          next[company.symbol] = Number(Math.max(1, prev[company.symbol] * multiplier).toFixed(2));
          nextHistory[company.symbol] = [...(nextHistory[company.symbol] || []), next[company.symbol]].slice(-10);
        });
        setHistory(nextHistory);
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [gameState, ageGroup, companies, currentHeadline, history]);

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
            <div className="text-center font-black text-6xl text-emerald-600">${(cash + Object.entries(portfolio).reduce((acc, [s, q]) => acc + q * prices[s], 0)).toFixed(2)}</div>
            <Button onClick={onExit} className="w-full h-14 font-bold text-lg">Return to Hub</Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-5"><XPWallet /></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-center border-none shadow-sm"><div className="text-[10px] font-black uppercase text-slate-400">Cash</div><div className="text-xl font-black text-primary">${cash.toFixed(2)}</div></Card>
        <Card className="p-4 flex flex-col items-center border-none shadow-sm bg-primary text-white"><div className="text-[10px] font-black uppercase text-white/60">Day</div><div className="text-xl font-black">{currentRound} / 5</div></Card>
      </div>
      {currentHeadline && <div className="bg-amber-100 p-4 rounded-xl flex items-center gap-4"><Newspaper className="h-6 w-6 text-amber-500" /><div className="font-bold text-amber-900">{currentHeadline.headline}</div></div>}
      <div className="space-y-3">
        {companies.map(c => (
          <Card key={c.symbol} className="p-4 border-none shadow-sm flex items-center justify-between">
            <div className="font-bold">{c.name} ({c.symbol})</div>
            <div className="flex items-center gap-4">
              <div className="text-lg font-black">${prices[c.symbol]}</div>
              <Button size="sm" onClick={() => setTradeModal({ type: 'buy', stock: c })}>Buy</Button>
              <Button size="sm" variant="outline" disabled={!portfolio[c.symbol]} onClick={() => setTradeModal({ type: 'sell', stock: c })}>Sell</Button>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={!!tradeModal} onOpenChange={() => setTradeModal(null)}>
        <DialogContent><DialogHeader><DialogTitle className="capitalize">{tradeModal?.type} {tradeModal?.stock.name}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">{[1, 5, 10].map(v => <Button key={v} variant="outline" onClick={() => handleTrade(v)}>{v} Shares</Button>)}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
