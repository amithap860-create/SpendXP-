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
import { useGameTutorial, GameTutorialModal, HowToPlayButton } from '@/components/games/GameTutorial';
import { ConceptBreakdown } from '@/components/ConceptBreakdown';

const SPARKLINE_LEN = 20; // points of history to show

const STOCK_SIM_TUTORIAL_STEPS = [
  'Each "day" is a timed round. Prices update on their own — watch the sparkline and the up/down arrow next to each stock.',
  'A news headline appears between days and moves one specific stock\'s price — read it before you trade.',
  'Tap Buy on a stock, then pick how many shares to buy with your available cash.',
  'Own shares already? Tap Sell the same way to cash out before the price drops.',
  'When the timer hits zero the day ends automatically — you don\'t need to do anything to move on.',
  'After 5 days, your Cash + Portfolio value becomes your final score. Diversifying across stocks lowers your risk.',
];

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
  const tutorial = useGameTutorial('stockMarketSim');
  const startingCash = useMemo(() => ageGroup === 'junior' ? 100 : ageGroup === 'senior' ? 5000 : 1000, [ageGroup]);
  const companies = useMemo(() => ageGroup === 'junior' ? STOCK_COMPANIES.slice(0, 3) : STOCK_COMPANIES, [ageGroup]);
  // UPDATED (2026-09-30): user feedback — days were flying by in ~10-35s,
  // too fast to actually read the headline and make a considered trade.
  // Bumped to a flat 90s (1.5 min) per day for every age group, per explicit
  // request. (Previously scaled 20-35s by age group; kept flat here since
  // the ask was for a slower pace across the board, not age-tiered.)
  const ROUND_TIME = 90;

  const gameConfig = useMemo(() => ({
    gameName: 'stockMarketSim' as const,
    totalRounds: 5,
    timePerRound: ROUND_TIME,
    livesEnabled: false,
    xpPerWin: 200,
    xpPerCorrectAnswer: 0,
  }), [ROUND_TIME]);

  const { gameState, currentRound, timeLeft, startGame, nextRound, endGame } = useGameEngine(gameConfig);

  const [cash, setCash] = useState(startingCash);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  // FIX (2026-09-30): "what should correct feedback look like" pass. This sim
  // deliberately has no per-trade "correct answer" — prices move on
  // randomized volatility + news, so no one (including us) can say in
  // advance whether a buy was right. What IS a fact, not a prediction, is
  // what a SALE actually returned relative to what you paid. avgCost tracks
  // a running weighted-average cost basis per symbol so a sell can show a
  // real, honest gain/loss — feedback on what happened, not a verdict on
  // what you should have known beforehand.
  const [avgCost, setAvgCost] = useState<Record<string, number>>({});
  const [realizedPL, setRealizedPL] = useState(0);
  // `tone` distinguishes a buy (neutral — no correct/wrong judgment, just a
  // confirmation something happened) from a sell (a real gain/loss fact).
  const [tradePop, setTradePop] = useState<{ text: string; tone: 'correct' | 'wrong' | 'neutral'; key: number } | null>(null);
  // FIX (2026-09-30): this game never showed which lesson it ties back to,
  // same gap as MoneyMaze — 'investing-basics' is already tagged with
  // 'stockMarketSim' in its relatedActivityIds, just never wired in.
  const [showBreakdown, setShowBreakdown] = useState(true);
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
  // NOTE (2026-09): this used to have `prices` in its dependency array, so
  // this effect tore down and recreated the setInterval on every single
  // price tick (every 3-5s) instead of once per game/round — needless churn,
  // and on a slower Android WebView repeated interval teardown/creation like
  // this can visibly stutter the round. It also updated priceHistory from
  // the *stale* `prices` closure variable (the value from the last render,
  // not the value just computed a few lines above), so the sparkline lagged
  // a tick behind the actual price. Both are fixed by computing the new
  // price history from the same `next` snapshot the price update just
  // produced, inside the same functional setState — no need to read `prices`
  // from the outer closure or list it as a dependency at all.
  // FIX (2026-09-30): `currentHeadline` used to stay in this effect's
  // dependency array and get re-applied by EVERY tick (every 3-5s) for as
  // long as that headline stayed on screen — a whole day, ~5-10 ticks. A
  // single "positive" headline (e.g. multiplier 1.15) compounded 1.15 to
  // the power of every tick that day, so prices could blow up into the
  // trillions well before day 5. News should move a price ONCE, the moment
  // it breaks — not keep shoving it in the same direction every few seconds
  // for the rest of the day. The one-time jump now happens where the
  // headline is chosen (below); this interval only does small random
  // day-to-day drift.
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = ageGroup === 'junior' ? 5000 : 3000;
    const timer = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        companies.forEach(company => {
          const volFactor = company.volatility === 'high' ? 0.14 : company.volatility === 'medium' ? 0.07 : 0.03;
          const multiplier = 1 + (Math.random() - 0.48) * volFactor;
          next[company.symbol] = Number(Math.max(1, prev[company.symbol] * multiplier).toFixed(2));
        });
        setPriceHistory(prevHist => {
          const nextHist = { ...prevHist };
          companies.forEach(c => {
            const h = prevHist[c.symbol] || [];
            nextHist[c.symbol] = [...h, next[c.symbol]].slice(-SPARKLINE_LEN);
          });
          return nextHist;
        });
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [gameState, ageGroup, companies]);

  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft === 0) {
      if (currentRound < 5) {
        const headline = NEWS_HEADLINES[Math.floor(Math.random() * NEWS_HEADLINES.length)];
        setCurrentHeadline(headline);
        // Apply the news impact ONCE, right now, instead of letting the
        // ticking interval reapply it every few seconds for the whole day.
        setPrices(prev => {
          const current = prev[headline.ticker];
          if (current === undefined) return prev;
          const next = { ...prev, [headline.ticker]: Number(Math.max(1, current * headline.multiplier).toFixed(2)) };
          setPriceHistory(prevHist => {
            const h = prevHist[headline.ticker] || [];
            return { ...prevHist, [headline.ticker]: [...h, next[headline.ticker]].slice(-SPARKLINE_LEN) };
          });
          return next;
        });
        nextRound();
      } else {
        // NOTE (2026-09-something): on the final round, this used to call
        // endGame() with no argument. The 200 xpPerWin bonus is only ever
        // added inside the NEXT_ROUND reducer case when currentRound reaches
        // totalRounds — but nextRound() is never dispatched on the last
        // round (this branch calls endGame() instead), so that code path
        // was unreachable and XP stayed at 0 for every playthrough. Passing
        // xpPerWin directly into endGame()'s finalXpBonus param fixes it —
        // same mechanism MoneyMaze already uses for its win case.
        endGame(gameConfig.xpPerWin);
      }
    }
  }, [timeLeft, gameState, currentRound, nextRound, endGame, gameConfig.xpPerWin]);

  const handleTrade = (qty: number) => {
    if (!tradeModal) return;
    const symbol = tradeModal.stock.symbol;
    const price = prices[symbol];
    if (tradeModal.type === 'buy' && cash >= qty * price) {
      setCash(prev => prev - qty * price);
      const prevQty = portfolio[symbol] || 0;
      const prevCost = avgCost[symbol] || 0;
      // Weighted-average cost basis: buying more at a different price shifts
      // the average, same as any real brokerage statement would show it.
      const newQty = prevQty + qty;
      const newAvgCost = newQty > 0 ? (prevCost * prevQty + price * qty) / newQty : price;
      setAvgCost(prev => ({ ...prev, [symbol]: newAvgCost }));
      setPortfolio(prev => ({ ...prev, [symbol]: newQty }));
      // FIX (2026-09-30): buying gave zero visual feedback — only selling did
      // (the gain/loss pop). That asymmetry read as "did my tap even work?"
      // Neutral tone on purpose: buying isn't right or wrong at the moment
      // it happens, just confirmed.
      setTradePop({ text: `Bought ${qty} ${tradeModal.stock.symbol}`, tone: 'neutral', key: Date.now() });
    } else if (tradeModal.type === 'sell' && (portfolio[symbol] || 0) >= qty) {
      setCash(prev => prev + qty * price);
      setPortfolio(prev => ({ ...prev, [symbol]: (prev[symbol] || 0) - qty }));
      // Realized gain/loss on exactly the shares being sold, vs. what was
      // actually paid for them — a fact, shown as it happens, not a guess.
      const gain = (price - (avgCost[symbol] || price)) * qty;
      setRealizedPL(prev => prev + gain);
      setTradePop({ text: `${gain >= 0 ? '+' : '−'}$${Math.abs(gain).toFixed(2)}`, tone: gain >= 0 ? 'correct' : 'wrong', key: Date.now() });
    }
    setTradeModal(null);
  };

  // Auto-dismiss the trade pop — it's a momentary flourish, not a persistent
  // banner, and nothing else in this screen clears it (unlike the quiz,
  // there's no "next question" transition to hook the reset onto).
  useEffect(() => {
    if (!tradePop) return;
    const t = setTimeout(() => setTradePop(null), 1400);
    return () => clearTimeout(t);
  }, [tradePop]);

  const portfolioValue = Object.entries(portfolio).reduce((acc, [s, q]) => acc + q * prices[s], 0);
  const totalWealth = cash + portfolioValue;

  // ─── Concept Brief ──────────────────────────────────────────────────────────

  if (showBreakdown) {
    return (
      <ConceptBreakdown
        breakdownId="investing-basics"
        ageGroup={ageGroup}
        activityType="game"
        activityTitle="Stock Simulator"
        fogEnemyId="market_madness"
        onContinue={() => setShowBreakdown(false)}
      />
    );
  }

  // ─── Personality quiz flow ─────────────────────────────────────────────────

  if (personalityStep !== null && personalityStep !== -1) {
    const q = PERSONALITY_QUESTIONS[personalityStep];
    return (
      <Card className="max-w-xl mx-auto border-none shadow-2xl bg-card overflow-hidden">
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
              className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all font-bold text-foreground min-h-[52px]"
            >
              {opt}
            </button>
          ))}
          <button onClick={() => setPersonalityStep(-1)} className="text-xs text-muted-foreground hover:underline w-full text-center pt-2">Skip personalization</button>
        </CardContent>
      </Card>
    );
  }

  // ─── IDLE ──────────────────────────────────────────────────────────────────

  if (gameState === 'IDLE') return (
    <>
    <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-card overflow-hidden">
      <div className="bg-primary p-10 text-white text-center relative">
        <HowToPlayButton onClick={tutorial.reopen} />
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
        <div className="bg-muted border-b px-6 py-4 space-y-3 text-sm">
          <div className="font-black text-foreground flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> Investing Basics</div>
          <ul className="space-y-2 text-muted-foreground text-xs list-none">
            <li><span className="font-bold text-primary">Buy low, sell high</span> — buy when price is down, sell after it rises.</li>
            <li><span className="font-bold text-[#2E7D5A]">Diversify</span> — spread money across multiple stocks to reduce risk.</li>
            <li><span className="font-bold text-blue-700">News matters</span> — headlines change stock prices. Read them carefully each day.</li>
            <li><span className="font-bold text-primary">Volatility</span> — high-volatility stocks swing more. Higher risk = higher potential reward.</li>
            <li><span className="font-bold text-rose-700">Never invest what you can&apos;t afford to lose</span> — markets can go down.</li>
          </ul>
          <p className="text-muted-foreground text-xs">In this simulator: each &quot;day&quot; is {ROUND_TIME} seconds. News headlines appear between days and affect specific stocks.</p>
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
    <GameTutorialModal
      open={tutorial.open}
      onClose={tutorial.dismiss}
      title="Stock Simulator"
      steps={STOCK_SIM_TUTORIAL_STEPS}
    />
    </>
  );

  // ─── RESULTS ───────────────────────────────────────────────────────────────

  if (gameState === 'RESULTS') return (
    <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-7">
        <Card className="border-none shadow-2xl bg-card overflow-hidden">
          <div className="bg-primary p-10 text-white text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4" />
            <CardTitle className="text-4xl font-black mb-2">Market Closed!</CardTitle>
            <p className="text-[#A8D5BC] text-lg">Starting capital: ${startingCash.toFixed(2)}</p>
          </div>
          <CardContent className="p-10 space-y-6">
            <div className="text-center">
              <div className={cn("text-6xl font-black mb-1", totalWealth >= startingCash ? 'text-cat-correct' : 'text-cat-wrong')}>
                ${totalWealth.toFixed(2)}
              </div>
              <div className={cn("text-sm font-bold", totalWealth >= startingCash ? 'text-cat-correct' : 'text-cat-wrong')}>
                {totalWealth >= startingCash ? '+' : ''}{((totalWealth - startingCash) / startingCash * 100).toFixed(1)}% return
              </div>
            </div>

            {/* FIX (2026-09-30): "what should correct feel like" pass. There's no
                real market index simulated here, so the only honest baseline to
                compare against is the one already implicit in this game: cash
                that was never traded doesn't grow or shrink on its own. Making
                that comparison explicit — instead of leaving the % return to
                imply a vague sense of "good" or "bad" — is a more honest
                teaching moment than a fabricated benchmark would be. */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted p-4 text-center">
                <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">If you'd never traded</div>
                <div className="text-xl font-black text-foreground">${startingCash.toFixed(2)}</div>
              </div>
              <div className={cn("rounded-xl p-4 text-center", realizedPL >= 0 ? "bg-cat-correct/10" : "bg-cat-wrong/10")}>
                <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Realized from trades</div>
                <div className={cn("text-xl font-black", realizedPL >= 0 ? "text-cat-correct" : "text-cat-wrong")}>
                  {realizedPL >= 0 ? '+' : '−'}${Math.abs(realizedPL).toFixed(2)}
                </div>
              </div>
            </div>
            {Object.values(portfolio).some(q => q > 0) && (
              <p className="text-[11px] text-muted-foreground text-center -mt-2">
                "Realized" only counts shares you actually sold — any stock you're still holding is a paper gain or loss until you sell it too.
              </p>
            )}

            <p className="text-xs text-muted-foreground text-center bg-muted rounded-xl p-3">
              {totalWealth > startingCash * 1.1
                ? 'Excellent! You beat doing nothing by a wide margin. Diversifying and reading news headlines made the difference.'
                : totalWealth >= startingCash
                ? 'Positive return! Keep studying the patterns — timing your buys matters.'
                : 'Lost money this round — that\'s part of learning. Watch for news headlines and diversify next time.'}
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
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Realized gain/loss pop on sell — a fact about what just happened,
            not a judgment on the trade decision itself. See handleTrade. */}
        {tradePop && (
          <div key={tradePop.key} className={cn(
            "xp-pop-anim absolute left-1/2 -translate-x-1/2 -top-2 pointer-events-none font-black text-base md:text-xl z-10 whitespace-nowrap",
            tradePop.tone === 'correct' ? "text-cat-correct" : tradePop.tone === 'wrong' ? "text-cat-wrong" : "text-muted-foreground"
          )}>
            {tradePop.text}
          </div>
        )}
        <Card className="p-3 md:p-4 flex flex-col items-center border-none shadow-sm">
          <div className="text-[10px] md:text-xs font-black uppercase text-muted-foreground">Cash</div>
          <div className="text-lg md:text-xl font-black text-primary">${cash.toFixed(2)}</div>
        </Card>
        <Card className="p-3 md:p-4 flex flex-col items-center border-none shadow-sm bg-primary text-white">
          <div className="text-[10px] md:text-xs font-black uppercase text-white/60">Day</div>
          <div className="text-lg md:text-xl font-black">{currentRound} / 5</div>
        </Card>
        <Card className="p-3 md:p-4 flex flex-col items-center border-none shadow-sm">
          <div className="text-[10px] md:text-xs font-black uppercase text-muted-foreground">Portfolio</div>
          <div className="text-lg md:text-xl font-black text-primary">${portfolioValue.toFixed(2)}</div>
        </Card>
        {/* FIX (2026-09-30): fixed light-hex bg (#E8F5EE/rose-50) + fixed slate-400
            text didn't adapt to dark mode — now cat-correct/cat-wrong tokens. */}
        <Card className={cn("p-3 md:p-4 flex flex-col items-center border-none shadow-sm", totalWealth >= startingCash ? 'bg-cat-correct/10' : 'bg-cat-wrong/10')}>
          <div className="text-[10px] md:text-xs font-black uppercase text-muted-foreground">Total</div>
          <div className={cn("text-lg md:text-xl font-black", totalWealth >= startingCash ? 'text-cat-correct' : 'text-cat-wrong')}>${totalWealth.toFixed(2)}</div>
        </Card>
      </div>

      {/* FIX (2026-09-30): user feedback — the flow wasn't clear ("what am I
          even supposed to do, when, where"). This game has no fixed turns —
          prices move on their own and you can trade whenever you want, which
          is unusual compared to every other game in the app. Spelling that
          out in one line, always visible during play, instead of only in the
          optional How To Play modal. */}
      <p className="text-[11px] md:text-xs text-muted-foreground text-center font-medium">
        Prices update on their own — trade any stock whenever you want. Day {currentRound} ends automatically when the timer runs out.
      </p>

      {/* Timer bar */}
      <div className="h-2 w-full bg-border rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-1000", timeLeft > 12 ? "bg-primary" : timeLeft > 6 ? "bg-cat-want" : "bg-cat-wrong")}
          style={{ width: `${(timeLeft / ROUND_TIME) * 100}%` }}
        />
      </div>

      {currentHeadline && (
        // FIX (2026-09-30): the headline text names a company informally
        // ("SolarRise wins a contract") but never explicitly ties it to the
        // stock card it just moved — a player has to guess the connection.
        // Also fixed light-hex bg/text that didn't adapt to dark mode.
        <div className="bg-cat-correct/10 p-4 rounded-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-top-2">
          <Newspaper className="h-5 w-5 md:h-6 md:w-6 text-cat-correct shrink-0" />
          <div className="min-w-0">
            <div className="text-xs md:text-sm font-bold text-foreground leading-tight">{currentHeadline.headline}</div>
            {(() => {
              const affected = companies.find(c => c.symbol === currentHeadline.ticker);
              return affected ? (
                <div className="text-[10px] font-black uppercase tracking-widest text-cat-correct mt-1">
                  Affects: {affected.name} ({affected.symbol})
                </div>
              ) : null;
            })()}
          </div>
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
            <Card key={c.symbol} className={cn("p-3 md:p-4 border-2 shadow-sm bg-card", isRecommended ? 'border-[#A8D5BC]' : 'border-transparent')}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-black text-sm md:text-base text-foreground truncate">{c.name}</div>
                    {isRecommended && <Star className="h-3 w-3 text-primary shrink-0" />}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">{c.symbol} · {c.volatility} risk{ownedQty > 0 ? ` · ${ownedQty} owned` : ''}</div>
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
                <div key={s} className="flex justify-between items-center p-4 bg-muted rounded-xl border">
                  <div><div className="font-black text-foreground">{s}</div><div className="text-[10px] uppercase font-bold text-muted-foreground">{q} Shares</div></div>
                  <div className="font-black text-primary">${(q * prices[s]).toFixed(2)}</div>
                </div>
              ))}
              {Object.values(portfolio).every(v => v === 0) && <p className="text-center text-muted-foreground italic">No stocks owned yet.</p>}
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
          <p className="text-sm text-muted-foreground">Current price: <span className="font-black text-primary">${tradeModal ? prices[tradeModal.stock.symbol] : 0}</span></p>
          <div className="grid grid-cols-2 gap-3 py-4">
            {[1, 5, 10, 20].map(v => (
              <Button key={v} variant="outline" className="h-14 font-black min-h-[44px]" onClick={() => handleTrade(v)}>
                {v} Share{v > 1 ? 's' : ''} — ${tradeModal ? (v * prices[tradeModal.stock.symbol]).toFixed(2) : 0}
              </Button>
            ))}
          </div>
          <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available Cash: ${cash.toFixed(2)}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
