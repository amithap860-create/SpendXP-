'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdapt';
import { STOCK_COMPANIES, NEWS_HEADLINES, StockCompany, NewsHeadline } from '@/data/stockMarketData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  BarChart3, 
  Clock, 
  ArrowRight,
  RefreshCcw,
  Trophy,
  Zap,
  Info,
  Newspaper
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';

const ROUND_TIME = 20; // 20 seconds per day
const PRICE_TICK = 3; // price updates every 3s (5s for junior)

export function StockMarketSim({ onExit }: { onExit: () => void }) {
  const { ageGroup } = useAgeAdapt();
  
  const startingCash = useMemo(() => {
    if (ageGroup === 'junior') return 100;
    if (ageGroup === 'senior') return 5000;
    return 1000;
  }, [ageGroup]);

  const companies = useMemo(() => {
    if (ageGroup === 'junior') return STOCK_COMPANIES.slice(0, 3);
    return STOCK_COMPANIES;
  }, [ageGroup]);

  const gameConfig = useMemo(() => ({
    gameName: 'stockMarketSim' as const,
    totalRounds: 5,
    timePerRound: ROUND_TIME,
    livesEnabled: false,
    xpPerWin: 200,
    xpPerCorrectAnswer: 0,
  }), []);

  const {
    gameState,
    currentRound,
    timeLeft,
    startGame,
    nextRound,
    endGame
  } = useGameEngine(gameConfig);

  // Local Game State
  const [cash, setCash] = useState(startingCash);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>(() => 
    Object.fromEntries(companies.map(c => [c.symbol, c.startPrice]))
  );
  const [history, setHistory] = useState<Record<string, number[]>>(() => 
    Object.fromEntries(companies.map(c => [c.symbol, [c.startPrice]]))
  );
  const [currentHeadline, setCurrentHeadline] = useState<NewsHeadline | null>(null);
  const [tradeModal, setTradeModal] = useState<{ type: 'buy' | 'sell', stock: StockCompany } | null>(null);
  const [transactions, setTransactions] = useState(0);

  // Price Engine
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = ageGroup === 'junior' ? 5000 : 3000;
    const timer = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        const nextHistory = { ...history };

        companies.forEach(company => {
          const currentPrice = prev[company.symbol];
          const volFactor = company.volatility === 'high' ? 0.14 : company.volatility === 'medium' ? 0.07 : 0.03;
          
          // formula: currentPrice * (1 + (Math.random() - 0.48) * volFactor)
          let multiplier = 1 + (Math.random() - 0.48) * volFactor;
          
          // Apply headline effect if this stock is featured
          if (currentHeadline && currentHeadline.ticker === company.symbol) {
            multiplier *= currentHeadline.multiplier;
          }

          let newPrice = currentPrice * multiplier;
          newPrice = Math.max(1, Math.min(newPrice, company.startPrice * 10)); // bounds

          next[company.symbol] = Number(newPrice.toFixed(2));
          
          const h = nextHistory[company.symbol] || [];
          nextHistory[company.symbol] = [...h, next[company.symbol]].slice(-10);
        });

        setHistory(nextHistory);
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [gameState, ageGroup, companies, currentHeadline, history]);

  // Day Progression
  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft === 0) {
      if (currentRound < 5) {
        // Start next day
        const availableHeadlines = NEWS_HEADLINES.filter(h => companies.some(c => c.symbol === h.ticker));
        setCurrentHeadline(availableHeadlines[Math.floor(Math.random() * availableHeadlines.length)]);
        nextRound();
      } else {
        finishGame();
      }
    }
  }, [timeLeft, gameState, currentRound, companies, nextRound]);

  const finishGame = async () => {
    const totalValue = cash + Object.entries(portfolio).reduce((acc, [symbol, shares]) => acc + shares * prices[symbol], 0);
    const profit = totalValue - startingCash;
    const profitPct = (profit / startingCash) * 100;
    const bonusXp = Math.max(0, Math.round(profitPct * 3));
    
    await endGame(bonusXp);
  };

  const handleTrade = (qty: number) => {
    if (!tradeModal) return;
    const { type, stock } = tradeModal;
    const price = prices[stock.symbol];
    const total = qty * price;

    if (type === 'buy') {
      if (cash >= total) {
        setCash(prev => prev - total);
        setPortfolio(prev => ({ ...prev, [stock.symbol]: (prev[stock.symbol] || 0) + qty }));
        setTransactions(prev => prev + 1);
      }
    } else {
      const owned = portfolio[stock.symbol] || 0;
      if (owned >= qty) {
        setCash(prev => prev + total);
        setPortfolio(prev => ({ ...prev, [stock.symbol]: owned - qty }));
        setTransactions(prev => prev + 1);
      }
    }
    setTradeModal(null);
  };

  const portfolioValue = Object.entries(portfolio).reduce((acc, [symbol, shares]) => acc + shares * prices[symbol], 0);
  const totalValue = cash + portfolioValue;
  const pnl = totalValue - startingCash;
  const pnlPct = (pnl / startingCash) * 100;

  if (gameState === 'IDLE') {
    return (
      <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className="bg-primary p-10 text-white text-center">
          <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-12 w-12" />
          </div>
          <CardTitle className="text-4xl font-black mb-2">STOCK SIMULATOR</CardTitle>
          <CardDescription className="text-primary-foreground/80 text-lg">
            You have ${startingCash} virtual cash. Trade 5 simulated days. Buy low, sell high!
          </CardDescription>
        </div>
        <CardContent className="p-10 space-y-8">
          <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
            <h4 className="font-bold flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4" /> Market Briefing
            </h4>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Days last 20 seconds. Day 5 is the final bell.</li>
              <li>• Prices update live every few seconds.</li>
              <li>• {ageGroup === 'junior' ? 'Watch the prices go up and down.' : 'Watch for Breaking News headlines that impact specific stocks!'}</li>
            </ul>
          </div>
          <Button onClick={startGame} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl">
            START TRADING
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'COUNTDOWN') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-9xl font-black text-primary animate-ping">3</div>
        <p className="mt-8 text-2xl font-bold text-slate-400 uppercase tracking-widest">Opening Bell...</p>
      </div>
    );
  }

  if (gameState === 'RESULTS') {
    const isConservative = companies.every(c => c.volatility !== 'high' || (portfolio[c.symbol] || 0) === 0);
    const isDiversified = Object.keys(portfolio).filter(s => portfolio[s] > 0).length >= 3;
    const isDayTrader = transactions > 15;

    let insight = "You made careful choices. Try taking small risks next time!";
    if (isDayTrader) insight = "You traded frequently. While exciting, constant trading often results in higher fees and lower returns in the real world.";
    else if (isConservative) insight = "You played it safe with stable stocks. This is a great way to preserve wealth!";
    else if (!isDiversified) insight = "You put all your eggs in one basket. Diversifying across 3 or more stocks helps protect you if one drops.";

    return (
      <Card className="max-w-3xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className={cn("p-10 text-white text-center", pnl >= 0 ? "bg-emerald-500" : "bg-rose-500")}>
          <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10" />
          </div>
          <CardTitle className="text-4xl font-black mb-2">Market Closed!</CardTitle>
          <p className="text-white/80">Final Portfolio Value: <span className="font-black text-white">${totalValue.toFixed(2)}</span></p>
        </div>
        
        <CardContent className="p-10 space-y-10">
          <div className="text-center">
            <div className={cn("text-7xl font-black", pnl >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
            </div>
            <div className="text-sm font-bold uppercase text-slate-400">Total Profit / Loss ({pnlPct.toFixed(1)}%)</div>
          </div>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-black text-primary mb-1">Strategist Insight</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{insight}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={startGame} className="flex-1 h-14 font-bold">
              <RefreshCcw className="h-4 w-4 mr-2" /> Play Again
            </Button>
            <Button onClick={onExit} className="flex-1 h-14 font-bold text-lg">Back to Hub</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center border-none shadow-sm bg-white">
          <div className="text-[10px] font-black uppercase text-slate-400">Cash</div>
          <div className="text-xl font-black text-primary">${cash.toFixed(2)}</div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center border-none shadow-sm bg-white">
          <div className="text-[10px] font-black uppercase text-slate-400">Portfolio</div>
          <div className="text-xl font-black text-slate-900">${portfolioValue.toFixed(2)}</div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center border-none shadow-sm bg-white">
          <div className="text-[10px] font-black uppercase text-slate-400">P&L</div>
          <div className={cn("text-xl font-black", pnl >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
          </div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center border-none shadow-sm bg-primary text-white">
          <div className="text-[10px] font-black uppercase text-primary-foreground/60">Day</div>
          <div className="text-xl font-black">{currentRound} / 5</div>
        </Card>
      </div>

      {/* Headline Banner */}
      {currentHeadline && (
        <div className="bg-amber-100 border-2 border-amber-200 p-4 rounded-xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
          <div className="h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0">
            <Newspaper className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase text-amber-600">Breaking News</div>
            <div className="font-bold text-amber-900">{currentHeadline.headline}</div>
          </div>
        </div>
      )}

      {/* Market List */}
      <div className="space-y-3">
        {companies.map(company => {
          const price = prices[company.symbol];
          const owned = portfolio[company.symbol] || 0;
          const change = ((price - company.startPrice) / company.startPrice) * 100;
          const points = history[company.symbol] || [company.startPrice];
          
          return (
            <Card key={company.symbol} className="p-4 border-none shadow-sm bg-white hover:bg-slate-50 transition-colors">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 w-full md:w-48 shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                    {company.symbol}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 truncate max-w-[120px]">{company.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{company.sector}</div>
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-between w-full">
                  <div className="text-center md:text-left">
                    <div className="text-lg font-black text-slate-900">${price.toFixed(2)}</div>
                    <div className={cn("text-[10px] font-black", change >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="h-10 w-24 shrink-0 px-2 hidden sm:block">
                    <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                      <path 
                        d={`M ${points.map((p, i) => {
                          const x = (i / (points.length - 1)) * 100;
                          const min = Math.min(...points);
                          const max = Math.max(...points);
                          const range = max - min || 1;
                          const y = 40 - ((p - min) / range) * 30 - 5;
                          return `${x},${y}`;
                        }).join(' L ')}`}
                        fill="none"
                        stroke={change >= 0 ? "#10b981" : "#ef4444"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="flex items-center gap-3">
                    {owned > 0 && (
                      <Badge variant="outline" className="h-8 border-primary/20 text-primary bg-primary/5 px-3">
                        {owned} Shares
                      </Badge>
                    )}
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        className="bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => setTradeModal({ type: 'buy', stock: company })}
                      >
                        Buy
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled={owned === 0}
                        onClick={() => setTradeModal({ type: 'sell', stock: company })}
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Trade Modal */}
      <Dialog open={!!tradeModal} onOpenChange={(open) => !open && setTradeModal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="capitalize">{tradeModal?.type} {tradeModal?.stock.name}</DialogTitle>
            <CardDescription>
              Current Price: <span className="font-bold text-slate-900">${tradeModal && prices[tradeModal.stock.symbol]}</span>
            </CardDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {[1, 5, 10, 'MAX'].map(val => (
              <Button 
                key={val} 
                variant="outline" 
                className="h-12 text-lg font-bold"
                onClick={() => {
                  if (!tradeModal) return;
                  const price = prices[tradeModal.stock.symbol];
                  let qty = typeof val === 'number' ? val : 0;
                  
                  if (val === 'MAX') {
                    if (tradeModal.type === 'buy') {
                      qty = Math.floor(cash / price);
                    } else {
                      qty = portfolio[tradeModal.stock.symbol] || 0;
                    }
                  }
                  
                  if (qty > 0) handleTrade(qty);
                }}
              >
                {val === 'MAX' ? 'All' : `${val} Shares`}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <div className="w-full text-center text-xs text-slate-400">
              {tradeModal?.type === 'buy' ? `Available: $${cash.toFixed(2)}` : `Owned: ${portfolio[tradeModal?.stock.symbol || ''] || 0} Shares`}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
