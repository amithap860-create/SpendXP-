'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdaptProvider';
import { STOCK_COMPANIES, NEWS_HEADLINES, StockCompany, NewsHeadline } from '@/data/stockMarketData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XPWallet } from '@/components/XPWallet';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Trophy,
  Newspaper,
  Wallet,
  ChevronUp,
  Info,
  X,
  Star,
  ArrowRight,
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
const SPARKLINE_LEN = 20; // points of history to show

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ history, color }: { history: number[]; color: string }) {
  if (history.length < 2) return null;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Personalization quiz ─────────────────────────────────────────────────────

interface PersonalityResult {
  riskTolerance: 'low' | 'medium' | 'high';
  patience: 'short' | 'medium' | 'long';
  interest: 'tech' | 'consumer' | 'finance';
}

const PERSONALITY_QUESTIONS = [
  {
    q: 'If your investment dropped 20% in a week, what would you do?',
    opts: ['Sell everything — I hate losses', 'Hold and wait', 'Buy more — dip is an opportunity!'],
    keys: ['low', 'medium', 'high'] as const,
    field: 'riskTolerance' as const,
  },
  {
    q: 'How long are you willing to wait for profits?',
    opts: ['Days at most', 'A few weeks', 'Months or years'],
    keys: ['short', 'medium', 'long'] as const,
    field: 'patience' as const,
  },
  {
    q: 'Which sector excites you most?',
    opts: ['Tech & apps', 'Everyday products & food', 'Banking & finance'],
    keys: ['tech', 'consumer', 'finance'] as const,
    field: 'interest' as const,
  },
];

function getRecommendedSymbols(r: PersonalityResult, companies: StockCompany[]): string[] {
  const recs: string[] = [];
  companies.forEach(c => {
    // Risk matching
    if (r.riskTolerance === 'low' && c.volatility === 'low') recs.push(c.symbol);
    if (r.riskTolerance === 'medium' && c.volatility === 'medium') recs.push(c.symbol);
    if (r.riskTolerance === 'high' && c.volatility === 'high') recs.push(c.symbol);
  });
  // If nothing matched, just recommend first two
  return recs.length ? recs : companies.slice(0, 2).map(c => c.symbol);
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
  const [prices, setPrices] = useState<Record<string, number>>(
    () => Object.fromEntries(companies.map(c => [c.symbol, c.startPrice]))
  );
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>(
    () => Object.fromEntries(companies.map(c => [c.symbol, [c.startPrice]]))
  );
  const [currentHeadline, setCurrentHeadline] = useState<NewsHeadline | null>(null);
  const [tradeModal, setTradeModal] = useState<{ type: 'buy' | 'sell'; stock: StockCompany } | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Personalization state
  const [personalityStep, setPersonalityStep] = useState<number | null>(null); // null = not started, -1 = done
  const [personalityAnswers, setPersonalityAnswers] = useState<Partial<PersonalityResult>>({});
  const [personality, setPersonality] = useState<PersonalityResult | null>(null);
  const [recommendedSymbols, setRecommendedSymbols] = useState<string[]>([]);

  useEffect(() => {
    if (personality) {
      setRecommendedSymbols(getRecommendedSymbols(personality, companies));
    }
  }, [personality, companies]);

  // Price updates + history tracking
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
      // Track history (keep last SPARKLINE_LEN points)
      setPriceHistory(prev => {
        const next = { ...prev };
        companies.forEach(c => {
          const h = prev[c.symbol] || [];
          next[c.symbol] = [...h, prices[c.symbol]].slice(-SPARKLINE_LEN);
        });
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [gameState, ageGroup, companies, currentHeadline, prices]);

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

  // ─── Personality quiz flow ─────────────────────────────────────────────────

  if (personalityStep !== null && personalityStep !== -1) {
    const q = PERSONALITY_QUESTIONS[personalityStep];
    return (
      <Card className="max-w-xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
        <div className="bg-primary p-6 text-white">
          <div className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">Question {personalityStep + 1} of {PERSONALITY_QUESTIONS.length}</div>
          <p className="text-xl font-bold leading-snug">{q.q}</p>
        </div>
        <CardContent className="p-6 space-y-3">
          {q.opts.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                const ans = { ...personalityAnswers, [q.field]: q.keys[i] };
                setPersonalityAnswers(ans);
                if (personalityStep + 1 >= PERSONALITY_QUESTIONS.length) {
                  setPersonality(ans as PersonalityResult);
                  setPersonalityStep(-1);
                } else {
                  setPersonalityStep(personalityStep + 1);
                }
              }}
              className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all font-bold text-slate-800 min-h-[52px]"
            >
              {opt}
            </button>
          ))}
          <button onClick={() => setPersonalityStep(-1)} className="text-xs text-slate-400 hover:underline w-full text-center pt-2">Skip personalization</button>
        </CardContent>
      </Card>
    );
  }

  // ─── IDLE ──────────────────────────────────────────────────────────────────

  if (gameState === 'IDLE') return (
    <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
      <div className="bg-primary p-10 text-white text-center relative">
        <button
          onClick={() => setShowInfo(v => !v)}
          className="absolute top-4 right-4 h-8 w-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
          aria-label="About investing"
        >
          <Info className="h-4 w-4" />
        </button>
        <BarChart3 className="h-12 w-12 mx-auto mb-6" />
        <CardTitle className="text-4xl font-black mb-2">STOCK SIMULATOR</CardTitle>
        <p className="text-primary-foreground/80 text-base">Trade 5 days. Beat the market.</p>
      </div>

      {showInfo && (
        <div className="bg-slate-50 border-b px-6 py-4 space-y-3 text-sm">
          <div className="font-black text-slate-800 flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> Investing Basics</div>
          <ul className="space-y-2 text-slate-600 text-xs list-none">
            <li><span className="font-bold text-primary">Buy low, sell high</span> — buy when price is down, sell after it rises.</li>
            <li><span className="font-bold text-[#2E7D5A]">Diversify</span> — spread money across multiple stocks to reduce risk.</li>
            <li><span className="font-bold text-blue-700">News matters</span> — headlines change stock prices. Read them carefully each day.</li>
            <li><span className="font-bold text-primary">Volatility</span> — high-volatility stocks swing more. Higher risk = higher potential reward.</li>
            <li><span className="font-bold text-rose-700">Never invest what you can&apos;t afford to lose</span> — markets can go down.</li>
          </ul>
          <p className="text-slate-400 text-xs">In this simulator: each &quot;day&quot; is 20 seconds. News headlines appear between days and affect specific stocks.</p>
        </div>
      )}

      {personality && (
        <div className="bg-[#E8F5EE] border-b px-6 py-3 flex items-center gap-3">
          <Star className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs font-bold text-[#1A4035]">
            Based on your profile, focus on: <span className="font-black">{recommendedSymbols.join(', ')}</span> — they match your risk tolerance.
          </p>
        </div>
      )}

      <CardContent className="p-6 md:p-10 space-y-4">
        {!personality && (
          <Button
            variant="outline"
            onClick={() => setPersonalityStep(0)}
            className="w-full h-12 gap-2 font-bold border-2"
          >
            <Star className="h-4 w-4" /> Personalize my stock picks (3 quick questions)
          </Button>
        )}
        <Button onClick={startGame} className="w-full h-14 md:h-16 text-xl font-black rounded-2xl shadow-xl min-h-[44px]">
          START TRADING
        </Button>
      </CardContent>
    </Card>
  );

  // ─── RESULTS ───────────────────────────────────────────────────────────────

  if (gameState === 'RESULTS') return (
    <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-7">
        <Card className="border-none shadow-2xl bg-white overflow-hidden">
          <div className="bg-primary p-10 text-white text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4" />
            <CardTitle className="text-4xl font-black mb-2">Market Closed!</CardTitle>
            <p className="text-[#A8D5BC] text-lg">Starting capital: ${startingCash.toFixed(2)}</p>
          </div>
          <CardContent className="p-10 space-y-6">
            <div className="text-center">
              <div className={cn("text-6xl font-black mb-1", totalWealth >= startingCash ? 'text-primary' : 'text-rose-600')}>
                ${totalWealth.toFixed(2)}
              </div>
              <div className={cn("text-sm font-bold", totalWealth >= startingCash ? 'text-primary' : 'text-rose-600')}>
                {totalWealth >= startingCash ? '+' : ''}{((totalWealth - startingCash) / startingCash * 100).toFixed(1)}% return
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center bg-slate-50 rounded-xl p-3">
              {totalWealth > startingCash * 1.1
                ? '🎯 Excellent! You beat the market. Diversifying and reading news headlines made the difference.'
                : totalWealth >= startingCash
                ? '👍 Positive return! Keep studying the patterns — timing your buys matters.'
                : '📚 Lost money this round — that\'s part of learning. Watch for news headlines and diversify next time.'}
            </p>
            <Button onClick={onExit} className="w-full h-14 font-bold text-lg min-h-[44px]">Return to Hub</Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-5"><XPWallet /></div>
    </div>
  );

  // ─── PLAYING ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-3 md:p-4 flex flex-col items-center border-none shadow-sm">
          <div className="text-[9px] md:text-[10px] font-black uppercase text-slate-400">Cash</div>
          <div className="text-lg md:text-xl font-black text-primary">${cash.toFixed(2)}</div>
        </Card>
        <Card className="p-3 md:p-4 flex flex-col items-center border-none shadow-sm bg-primary text-white">
          <div className="text-[9px] md:text-[10px] font-black uppercase text-white/60">Day</div>
          <div className="text-lg md:text-xl font-black">{currentRound} / 5</div>
        </Card>
        <Card className="p-3 md:p-4 flex flex-col items-center border-none shadow-sm">
          <div className="text-[9px] md:text-[10px] font-black uppercase text-slate-400">Portfolio</div>
          <div className="text-lg md:text-xl font-black text-primary">${portfolioValue.toFixed(2)}</div>
        </Card>
        <Card className={cn("p-3 md:p-4 flex flex-col items-center border-none shadow-sm", totalWealth >= startingCash ? 'bg-[#E8F5EE]' : 'bg-rose-50')}>
          <div className="text-[9px] md:text-[10px] font-black uppercase text-slate-400">Total</div>
          <div className={cn("text-lg md:text-xl font-black", totalWealth >= startingCash ? 'text-primary' : 'text-rose-700')}>${totalWealth.toFixed(2)}</div>
        </Card>
      </div>

      {/* Timer bar */}
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-1000", timeLeft > 12 ? "bg-primary" : timeLeft > 6 ? "bg-[#E8F5EE]0" : "bg-rose-500")}
          style={{ width: `${(timeLeft / ROUND_TIME) * 100}%` }}
        />
      </div>

      {currentHeadline && (
        <div className="bg-[#C8E8D8] p-4 rounded-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-top-2">
          <Newspaper className="h-5 w-5 md:h-6 md:w-6 text-[#2E7D5A] shrink-0" />
          <div className="text-xs md:text-sm font-bold text-[#1A1F2E] leading-tight">{currentHeadline.headline}</div>
        </div>
      )}

      <div className="space-y-3">
        {companies.map(c => {
          const history = priceHistory[c.symbol] || [];
          const prevPrice = history.length > 1 ? history[history.length - 2] : c.startPrice;
          const currentPrice = prices[c.symbol];
          const isUp = currentPrice >= prevPrice;
          const isRecommended = recommendedSymbols.includes(c.symbol);
          const ownedQty = portfolio[c.symbol] || 0;

          return (
            <Card key={c.symbol} className={cn("p-3 md:p-4 border-2 shadow-sm bg-white", isRecommended ? 'border-[#A8D5BC]' : 'border-transparent')}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-black text-sm md:text-base text-slate-900 truncate">{c.name}</div>
                    {isRecommended && <Star className="h-3 w-3 text-primary shrink-0" />}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{c.symbol} · {c.volatility} risk{ownedQty > 0 ? ` · ${ownedQty} owned` : ''}</div>
                </div>
                {/* Sparkline */}
                <div className="mx-3 hidden sm:block">
                  <Sparkline history={history} color={isUp ? '#10b981' : '#ef4444'} />
                </div>
                <div className="flex items-center gap-3 md:gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-base md:text-lg font-black text-primary">${currentPrice}</div>
                    <div className={cn("text-[10px] font-bold flex items-center justify-end gap-0.5", isUp ? 'text-primary' : 'text-rose-600')}>
                      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex gap-1 md:gap-2">
                    <Button size="sm" className="h-11 px-3 md:px-4" onClick={() => setTradeModal({ type: 'buy', stock: c })}>Buy</Button>
                    <Button size="sm" variant="outline" className="h-11 px-3 md:px-4" disabled={!ownedQty} onClick={() => setTradeModal({ type: 'sell', stock: c })}>Sell</Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Mobile portfolio sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full min-h-[44px] gap-2 font-black uppercase text-[10px] tracking-widest">
              <Wallet className="h-4 w-4" /> View Portfolio <ChevronUp className="h-3 w-3" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60dvh] rounded-t-3xl border-none">
            <SheetHeader><SheetTitle className="text-2xl font-black">Portfolio: ${portfolioValue.toFixed(2)}</SheetTitle></SheetHeader>
            <div className="py-6 space-y-4">
              {Object.entries(portfolio).map(([s, q]) => q > 0 && (
                <div key={s} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border">
                  <div><div className="font-black text-slate-900">{s}</div><div className="text-[10px] uppercase font-bold text-slate-400">{q} Shares</div></div>
                  <div className="font-black text-primary">${(q * prices[s]).toFixed(2)}</div>
                </div>
              ))}
              {Object.values(portfolio).every(v => v === 0) && <p className="text-center text-slate-400 italic">No stocks owned yet.</p>}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Dialog open={!!tradeModal} onOpenChange={() => setTradeModal(null)}>
        <DialogContent className="max-w-[calc(100vw-32px)] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="capitalize text-2xl font-black">
              {tradeModal?.type} {tradeModal?.stock.name}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Current price: <span className="font-black text-primary">${tradeModal ? prices[tradeModal.stock.symbol] : 0}</span></p>
          <div className="grid grid-cols-2 gap-3 py-4">
            {[1, 5, 10, 20].map(v => (
              <Button key={v} variant="outline" className="h-14 font-black min-h-[44px]" onClick={() => handleTrade(v)}>
                {v} Share{v > 1 ? 's' : ''} — ${tradeModal ? (v * prices[tradeModal.stock.symbol]).toFixed(2) : 0}
              </Button>
            ))}
          </div>
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Cash: ${cash.toFixed(2)}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
