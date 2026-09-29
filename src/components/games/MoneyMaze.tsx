'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAgeAdapt } from '@/lib/ageAdaptProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { XPWallet } from '@/components/XPWallet';
import {
  Puzzle, TrendingUp, ShieldAlert, Landmark, Building2, Wallet,
  ArrowDownUp, Trophy, RefreshCcw, Sparkles, Info, CheckCircle2, X, BookOpen, Target,
  ChevronUp, ChevronDown, Flame, Snowflake
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameTutorial, GameTutorialModal, HowToPlayButton } from '@/components/games/GameTutorial';
import { ConceptBreakdown } from '@/components/ConceptBreakdown';

const MONEY_MAZE_TUTORIAL_STEPS = [
  'Debt Domino: drag the debts into your preferred payoff order, most urgent at the top.',
  'Try to match a real strategy — Avalanche pays the highest interest rate first, Snowball pays the smallest balance first.',
  'Portfolio Builder: answer 5 quick questions about your risk comfort and goals instead.',
  'Based on your answers, you\'ll get a recommended split across cash, bonds, stocks and property.',
  'Neither mode has a timer — take your time and think it through before committing.',
];

type GameMode = 'DEBT' | 'PORTFOLIO';

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

interface DebtScenario {
  label: string;
  description: string;
  debts: DebtItem[];
}

interface Allocation {
  cash: number;
  bonds: number;
  stocks: number;
  property: number;
}

// ─── Debt Scenarios ───────────────────────────────────────────────────────────

const DEBT_SCENARIOS_JUNIOR: DebtScenario[] = [
  {
    label: 'School Life',
    description: 'You owe money from school activities. Drag to put the most urgent one at the top.',
    debts: [
      { id: '1', name: 'Borrowed from Friend', balance: 50, rate: 0, minPayment: 10 },
      { id: '2', name: 'Library Fine (overdue book)', balance: 20, rate: 0, minPayment: 20 },
      { id: '3', name: 'App Store Credits', balance: 100, rate: 0, minPayment: 30 },
    ],
  },
  {
    label: 'Pocket Money Crunch',
    description: 'You borrowed from family and friends. Put the most important repayment first.',
    debts: [
      { id: '1', name: 'Cousin (birthday gift loan)', balance: 200, rate: 0, minPayment: 50 },
      { id: '2', name: 'Subscription overdue', balance: 30, rate: 0, minPayment: 30 },
      { id: '3', name: 'School club fee', balance: 80, rate: 0, minPayment: 20 },
    ],
  },
  {
    label: 'Weekend Binge',
    description: 'You spent more than you had. Prioritise repayments wisely.',
    debts: [
      { id: '1', name: 'Snacks (borrowed from sibling)', balance: 60, rate: 0, minPayment: 20 },
      { id: '2', name: 'Online game loot box', balance: 150, rate: 0, minPayment: 50 },
      { id: '3', name: 'Comic books (owe classmate)', balance: 40, rate: 0, minPayment: 10 },
    ],
  },
];

const DEBT_SCENARIOS_TEEN: DebtScenario[] = [
  {
    label: 'Student Life',
    description: 'Drag debts into the smartest payoff order (Avalanche = highest rate first, Snowball = lowest balance first).',
    debts: [
      { id: '1', name: 'Credit Card', balance: 12000, rate: 36, minPayment: 500 },
      { id: '2', name: 'Education Loan', balance: 150000, rate: 9, minPayment: 2000 },
      { id: '3', name: 'Phone EMI', balance: 8000, rate: 14, minPayment: 800 },
      { id: '4', name: 'Friend Loan (0% interest)', balance: 2000, rate: 0, minPayment: 500 },
    ],
  },
  {
    label: 'First Job Debt',
    description: 'You just started working. Sort these by optimal payoff strategy.',
    debts: [
      { id: '1', name: 'Credit Card A (36% APR)', balance: 8000, rate: 36, minPayment: 400 },
      { id: '2', name: 'Bike Loan', balance: 25000, rate: 12, minPayment: 1200 },
      { id: '3', name: 'Personal Loan', balance: 30000, rate: 18, minPayment: 1500 },
      { id: '4', name: 'Medical Expense', balance: 5000, rate: 0, minPayment: 1000 },
    ],
  },
  {
    label: 'Lifestyle Inflation',
    description: 'Overspent on lifestyle upgrades. Order these to minimise total interest paid.',
    debts: [
      { id: '1', name: 'Buy Now Pay Later (Snapmint)', balance: 4000, rate: 24, minPayment: 500 },
      { id: '2', name: 'Laptop EMI', balance: 18000, rate: 0, minPayment: 1500 },
      { id: '3', name: 'Credit Card B', balance: 6000, rate: 40, minPayment: 300 },
      { id: '4', name: 'Gym Membership (overdue)', balance: 3000, rate: 0, minPayment: 3000 },
    ],
  },
];

const DEBT_SCENARIOS_SENIOR = DEBT_SCENARIOS_TEEN.concat([
  {
    label: 'Housing & Lifestyle',
    description: 'Working professional debt portfolio. What is the optimal payoff sequence?',
    debts: [
      { id: '1', name: 'Home Loan', balance: 2500000, rate: 8.5, minPayment: 22000 },
      { id: '2', name: 'Credit Card (premium)', balance: 80000, rate: 40, minPayment: 4000 },
      { id: '3', name: 'Car Loan', balance: 400000, rate: 10, minPayment: 8000 },
      { id: '4', name: 'Education Loan (self)', balance: 600000, rate: 7.5, minPayment: 6000 },
    ],
  },
  {
    label: 'Debt Consolidation',
    description: 'You have fragmented debts. Which order minimises lifetime interest?',
    debts: [
      { id: '1', name: 'Credit Card 1 (HDFC)', balance: 50000, rate: 42, minPayment: 2500 },
      { id: '2', name: 'Credit Card 2 (Axis)', balance: 30000, rate: 36, minPayment: 1500 },
      { id: '3', name: 'Personal Loan', balance: 200000, rate: 16, minPayment: 5000 },
      { id: '4', name: 'Vehicle Loan', balance: 150000, rate: 11, minPayment: 3500 },
    ],
  },
]);

// ─── Portfolio Glossary ───────────────────────────────────────────────────────

const GLOSSARY = [
  { term: 'Diversification', def: 'Spreading investments across different asset types to reduce risk. "Don\'t put all eggs in one basket."' },
  { term: 'Risk Tolerance', def: 'How comfortable you are with the possibility of losing money in exchange for higher returns.' },
  { term: 'Asset Class', def: 'A group of investments with similar characteristics. Main classes: cash, bonds, stocks, property.' },
  { term: 'Bonds', def: 'Loans you give to companies or governments. They pay fixed interest. Lower risk, lower return.' },
  { term: 'Stocks (Equity)', def: 'Ownership shares in companies. Higher return potential but also higher risk and price swings.' },
  { term: 'Liquidity', def: 'How quickly you can convert an asset to cash. Cash is most liquid; property is least.' },
  { term: 'SIP', def: 'Systematic Investment Plan — investing a fixed amount regularly (e.g. monthly) regardless of market conditions.' },
  { term: 'Rebalancing', def: 'Adjusting your portfolio back to target percentages when market movements cause drift.' },
];

// ─── Risk Assessment Questions ────────────────────────────────────────────────

interface RiskAnswer { q: number; a: number }

const RISK_QUESTIONS = [
  {
    q: 'How long can you leave money invested without needing it?',
    opts: ['Less than 1 year', '1–3 years', '3–7 years', 'More than 7 years'],
    scores: [1, 2, 3, 4],
  },
  {
    q: 'If your investment dropped 30% in 3 months, you would:',
    opts: ['Sell everything', 'Sell some and wait', 'Do nothing', 'Buy more'],
    scores: [1, 2, 3, 4],
  },
  {
    q: 'What is your primary financial goal?',
    opts: ['Protect capital at all costs', 'Steady income with low risk', 'Long-term wealth growth', 'Maximum returns, accepting high risk'],
    scores: [1, 2, 3, 4],
  },
  {
    q: 'How stable is your income?',
    opts: ['Very uncertain', 'Somewhat uncertain', 'Stable', 'Very stable with multiple sources'],
    scores: [1, 2, 3, 4],
  },
  {
    q: 'What matters most to you?',
    opts: ['Sleeping soundly (safety first)', 'Modest returns with little worry', 'Growing wealth over time', 'Maximum growth, I can handle volatility'],
    scores: [1, 2, 3, 4],
  },
];

function getRiskProfile(total: number): { label: string; recommended: Allocation; color: string; desc: string } {
  if (total <= 8) return {
    label: 'Conservative',
    recommended: { cash: 40, bonds: 35, stocks: 15, property: 10 },
    color: 'text-blue-600',
    desc: 'You prioritise safety. A heavy cash and bond allocation protects capital, even if returns are modest.',
  };
  if (total <= 13) return {
    label: 'Moderate',
    recommended: { cash: 20, bonds: 30, stocks: 35, property: 15 },
    color: 'text-[#2E7D5A]',
    desc: 'You balance growth and safety. A mixed portfolio captures market gains without excessive risk.',
  };
  if (total <= 17) return {
    label: 'Growth',
    recommended: { cash: 10, bonds: 20, stocks: 50, property: 20 },
    color: 'text-primary',
    desc: 'You\'re comfortable with ups and downs for better long-term returns. Stock-heavy works for you.',
  };
  return {
    label: 'Aggressive',
    recommended: { cash: 5, bonds: 10, stocks: 65, property: 20 },
    color: 'text-rose-600',
    desc: 'You seek maximum growth and tolerate high volatility. This is only suitable with a long time horizon.',
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MoneyMaze({ onExit }: { onExit: () => void }) {
  const { ageGroup } = useAgeAdapt();
  const tutorial = useGameTutorial('moneyMaze');
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const gameConfig = useMemo(() => ({
    gameName: 'moneyMaze' as const,
    totalRounds: 1,
    livesEnabled: false,
    xpPerWin: 250,
    xpPerCorrectAnswer: 50,
  }), []);

  const { gameState, startGame, endGame } = useGameEngine(gameConfig);

  // Debt state
  const debtScenarios = ageGroup === 'junior' ? DEBT_SCENARIOS_JUNIOR : ageGroup === 'senior' ? DEBT_SCENARIOS_SENIOR : DEBT_SCENARIOS_TEEN;
  const [scenarioIdx] = useState(() => Math.floor(Math.random() * debtScenarios.length));
  const scenario = debtScenarios[scenarioIdx];
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [debtResult, setDebtResult] = useState<{ method: 'AVALANCHE' | 'SNOWBALL' | 'NONE'; saved: string } | null>(null);
  // FIX (2026-09-30): the results screen was showing useGameEngine's
  // `xpEarned` state, which is only ever incremented by CORRECT_ANSWER
  // dispatches or the NEXT_ROUND reducer case — neither of which this game
  // ever triggers (Debt Domino and Portfolio Builder both call endGame()
  // directly with a one-off bonus, never correctAnswer()/nextRound()). So
  // xpEarned stayed 0 forever regardless of what was actually awarded,
  // showing "+0 XP earned" even after a perfect Avalanche match that DID
  // award XP server-side. Tracking the real awarded amount locally so the
  // screen shows what actually happened.
  const [xpAwarded, setXpAwarded] = useState<number>(0);

  // Portfolio state
  const [riskStep, setRiskStep] = useState<number | null>(null); // null = not started, -1 = done
  const [riskAnswers, setRiskAnswers] = useState<RiskAnswer[]>([]);
  const [riskProfile, setRiskProfile] = useState<ReturnType<typeof getRiskProfile> | null>(null);
  const [allocation, setAllocation] = useState<Allocation>({ cash: 40, bonds: 30, stocks: 20, property: 10 });
  const [portfolioScore, setPortfolioScore] = useState<number | null>(null);
  const [portfolioFeedback, setPortfolioFeedback] = useState<string>('');
  const [showGlossary, setShowGlossary] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [goalTarget, setGoalTarget] = useState('');
  // FIX (2026-09-30): neither mode in this game ever showed which lesson it
  // ties back to before play — unlike FinIQQuiz/BudgetBlitz, which both open
  // on a ConceptBreakdown brief. The content already existed and was even
  // pre-tagged for this ('emi-and-debt' already lists 'moneyMaze-debt' in its
  // relatedActivityIds, and 'investing-basics' lists 'stockMarketSim') — it
  // just was never wired into the component. Mode selection now shows the
  // brief before startGame() actually fires.
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Start debt mode
  const startDebt = () => {
    const s = debtScenarios[scenarioIdx];
    setDebts([...s.debts].sort(() => Math.random() - 0.5));
    setSelectedMode('DEBT');
    setShowBreakdown(true);
  };

  // FIX (2026-09-30): "Try Another" used to reset selectedMode to null and
  // call startGame(). startGame() immediately moves the shared game engine
  // past 'IDLE' (into COUNTDOWN/PLAYING) — but with selectedMode null, NONE
  // of this component's render branches matched anymore (not the IDLE mode
  // picker, since gameState wasn't IDLE; not DEBT, since selectedMode wasn't
  // 'DEBT'), so it fell all the way through to this file's last, unguarded
  // return statement — which is the Portfolio Builder allocation screen.
  // That happened regardless of which mode you'd actually just played,
  // which is why finishing Debt Domino and hitting "Try Another" always
  // landed on Portfolio Builder. These two retry functions restart the SAME
  // mode that was just played, keeping selectedMode intact so the correct
  // render branch matches. They also skip re-showing the concept brief on a
  // replay — you've already seen it, same behavior as FinIQQuiz's "Try Again".
  const retryDebt = () => {
    const s = debtScenarios[scenarioIdx];
    setDebts([...s.debts].sort(() => Math.random() - 0.5));
    setDebtResult(null);
    setXpAwarded(0);
    startGame();
  };

  const retryPortfolio = () => {
    setRiskStep(0);
    setRiskAnswers([]);
    setRiskProfile(null);
    setAllocation({ cash: 40, bonds: 30, stocks: 20, property: 10 });
    setPortfolioScore(null);
    setPortfolioFeedback('');
    setXpAwarded(0);
    startGame();
  };

  const handleMove = (fromIdx: number, toIdx: number) => {
    const next = [...debts];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setDebts(next);
  };

  // FIX (2026-09-30): "what should correct feel like" pass — this game had a
  // real correct answer (Avalanche or Snowball order) but ZERO feedback
  // while actually dragging, only a verdict at the very end. Rather than
  // inventing a new scoring heuristic that could disagree with the strategy
  // check below, this measures the SAME thing checkDebtStrategy checks —
  // pairwise concordance with a strict rate-descending (Avalanche) or
  // balance-ascending (Snowball) order — just as a live percentage instead
  // of a final pass/fail. It mathematically reaches 100% on exactly the same
  // orderings checkDebtStrategy would call a match, so the live meter can
  // never contradict the final verdict.
  const strategyMatch = useMemo(() => {
    if (debts.length < 2) return { avalanche: 100, snowball: 100 };
    let avalanchePairs = 0, snowballPairs = 0, totalPairs = 0;
    for (let i = 0; i < debts.length; i++) {
      for (let j = i + 1; j < debts.length; j++) {
        totalPairs++;
        if (debts[i].rate >= debts[j].rate) avalanchePairs++;
        if (debts[i].balance <= debts[j].balance) snowballPairs++;
      }
    }
    return {
      avalanche: Math.round((avalanchePairs / totalPairs) * 100),
      snowball: Math.round((snowballPairs / totalPairs) * 100),
    };
  }, [debts]);

  const checkDebtStrategy = async () => {
    const isAvalanche = debts.every((d, i) => i === 0 || debts[i - 1].rate >= d.rate);
    const isSnowball = debts.every((d, i) => i === 0 || debts[i - 1].balance <= d.balance);
    const method: 'AVALANCHE' | 'SNOWBALL' | 'NONE' = isAvalanche ? 'AVALANCHE' : isSnowball ? 'SNOWBALL' : 'NONE';
    const savedEst = method === 'AVALANCHE'
      ? `₹${Math.round(debts.reduce((a, d) => a + d.balance * (d.rate / 100), 0) * 0.15).toLocaleString('en-IN')} in interest`
      : method === 'SNOWBALL'
      ? `${debts.length - 1} debts cleared faster (momentum method)`
      : '₹0 extra saved — try Avalanche or Snowball order for real results';
    setDebtResult({ method, saved: savedEst });
    // Only award bonus XP for a correct strategy — 'NONE' gets base end-game XP only
    const bonusXp = method === 'AVALANCHE' ? 250 : method === 'SNOWBALL' ? 200 : 0;
    setXpAwarded(bonusXp);
    await endGame(bonusXp);
  };

  const updateAllocation = (key: keyof Allocation, value: number) => {
    const others = (Object.keys(allocation) as (keyof Allocation)[]).filter(k => k !== key);
    const currentSumOfOthers = others.reduce((acc, k) => acc + allocation[k], 0);
    const remaining = 100 - value;
    const newAllocation = { ...allocation, [key]: value };

    if (currentSumOfOthers === 0) {
      // All other sliders are at 0 — distribute remaining evenly
      const share = Math.floor(remaining / others.length);
      others.forEach((k, i) => {
        newAllocation[k] = i === others.length - 1 ? remaining - share * (others.length - 1) : share;
      });
    } else {
      // Proportionally redistribute remaining across other sliders
      others.forEach(k => {
        newAllocation[k] = Math.max(0, Math.round((allocation[k] / currentSumOfOthers) * remaining));
      });
    }

    // Clamp and ensure exact total = 100 (fix rounding drift on cash as anchor)
    const sum = Object.values(newAllocation).reduce((a, b) => a + b, 0);
    if (sum !== 100) newAllocation.cash = Math.max(0, newAllocation.cash + (100 - sum));
    setAllocation(newAllocation);
  };

  const checkPortfolio = async () => {
    const targets = riskProfile?.recommended || { cash: 30, bonds: 30, stocks: 35, property: 5 };
    let totalDiff = 0;
    (Object.keys(targets) as (keyof Allocation)[]).forEach(k => { totalDiff += Math.abs(allocation[k] - targets[k]); });
    const s = Math.max(0, 100 - totalDiff);
    setPortfolioScore(s);

    // Generate detailed feedback
    const lines: string[] = [];
    if (allocation.cash > (targets.cash + 15)) lines.push(`Too much cash (${allocation.cash}%). Cash loses value to inflation over time. Target: ~${targets.cash}%.`);
    if (allocation.stocks < (targets.stocks - 15)) lines.push(`Stocks too low (${allocation.stocks}%). Your risk profile supports ${targets.stocks}% in equities for better growth.`);
    if (allocation.bonds < (targets.bonds - 10)) lines.push(`Bonds underweighted. They provide stability — target ${targets.bonds}%.`);
    if (allocation.property > 30) lines.push('Property >30% creates illiquidity risk — hard to sell fast in emergencies.');
    if (lines.length === 0) lines.push('Well balanced! Your allocation closely matches your risk profile.');

    // Check goal alignment
    if (goalTarget && riskProfile) {
      const isGrowthGoal = /retire|house|car|abroad|wealth|crore|lakh/i.test(goalTarget);
      if (isGrowthGoal && riskProfile.label === 'Conservative') {
        lines.push(`Goal mismatch: "${goalTarget}" requires growth, but your risk profile is Conservative. Consider stepping up to at least Moderate.`);
      }
    }

    setPortfolioFeedback(lines.join('\n\n'));
    // FIX (2026-09-30): this called endGame() with NO bonus argument at all —
    // meaning Portfolio Builder awarded exactly 0 XP every single time,
    // regardless of getting a perfect 100% risk-aligned allocation. Debt
    // Domino already scored its bonus XP off the quality of the answer
    // (250/200/0); Portfolio Builder needs the same treatment instead of a
    // flat zero every playthrough.
    const bonusXp = s >= 90 ? 250 : s >= 75 ? 150 : s >= 50 ? 75 : 0;
    setXpAwarded(bonusXp);
    await endGame(bonusXp);
  };

  // ─── Concept Brief ──────────────────────────────────────────────────────────

  if (showBreakdown && selectedMode) {
    return (
      <ConceptBreakdown
        breakdownId={selectedMode === 'DEBT' ? 'emi-and-debt' : 'investing-basics'}
        ageGroup={ageGroup}
        activityType="game"
        activityTitle={selectedMode === 'DEBT' ? 'Debt Domino' : 'Portfolio Builder'}
        fogEnemyId={selectedMode === 'DEBT' ? 'debt_web' : 'market_madness'}
        onContinue={() => {
          setShowBreakdown(false);
          if (selectedMode === 'DEBT') {
            startGame();
          } else {
            setRiskStep(0);
            startGame();
          }
        }}
      />
    );
  }

  // ─── Risk Assessment ────────────────────────────────────────────────────────

  if (selectedMode === 'PORTFOLIO' && riskStep !== null && riskStep >= 0) {
    const q = RISK_QUESTIONS[riskStep];
    return (
      <Card className="max-w-xl mx-auto border-none shadow-2xl bg-card overflow-hidden">
        <div className="bg-primary p-6 text-white">
          <div className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">Risk Profile · {riskStep + 1} of {RISK_QUESTIONS.length}</div>
          <p className="text-xl font-bold leading-snug">{q.q}</p>
        </div>
        <CardContent className="p-6 space-y-3">
          {q.opts.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                const updated = [...riskAnswers, { q: riskStep, a: q.scores[i] }];
                setRiskAnswers(updated);
                if (riskStep + 1 >= RISK_QUESTIONS.length) {
                  const total = updated.reduce((acc, r) => acc + r.a, 0);
                  const profile = getRiskProfile(total);
                  setRiskProfile(profile);
                  setAllocation(profile.recommended);
                  setRiskStep(-1);
                } else {
                  setRiskStep(riskStep + 1);
                }
              }}
              className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-[#4EA07A] hover:bg-[#E8F5EE] transition-all font-bold text-foreground min-h-[52px]"
            >
              {opt}
            </button>
          ))}
        </CardContent>
      </Card>
    );
  }

  // ─── IDLE / Mode Select ────────────────────────────────────────────────────

  if (gameState === 'IDLE' && !selectedMode) {
    return (
      <>
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center relative">
          <HowToPlayButton onClick={tutorial.reopen} position="right" variant="onLight" />
          <Puzzle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-4xl font-black text-primary mb-2">Money Maze</h2>
          <p className="text-muted-foreground text-lg">Choose a strategy puzzle to master your finances.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-2xl cursor-pointer border-none border-t-4 border-t-rose-500 transition-shadow" onClick={startDebt}>
            <div className="h-2 bg-rose-500 rounded-t-xl" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2"><ShieldAlert className="h-6 w-6 text-rose-500" /><CardTitle>Debt Domino</CardTitle></div>
              <CardDescription>Drag debts into the smartest payoff order. Master Avalanche vs Snowball strategy.</CardDescription>
              <p className="text-xs text-muted-foreground mt-2">Scenario: <span className="font-bold">{scenario.label}</span></p>
            </CardHeader>
          </Card>
          <Card
            className="hover:shadow-2xl cursor-pointer border-none border-t-4 border-t-emerald-500 transition-shadow"
            onClick={() => { setSelectedMode('PORTFOLIO'); setShowBreakdown(true); }}
          >
            <div className="h-2 bg-primary rounded-t-xl" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2"><TrendingUp className="h-6 w-6 text-primary" /><CardTitle>Portfolio Builder</CardTitle></div>
              <CardDescription>Answer 5 science-backed questions to discover your risk profile, then build your ideal portfolio.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
      <GameTutorialModal
        open={tutorial.open}
        onClose={tutorial.dismiss}
        title="Money Maze"
        steps={MONEY_MAZE_TUTORIAL_STEPS}
      />
      </>
    );
  }

  // ─── RESULTS ───────────────────────────────────────────────────────────────

  if (gameState === 'RESULTS') {
    return (
      <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-7">
          <Card className="border-none shadow-2xl bg-card overflow-hidden">
            <div className="bg-primary p-10 text-white text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4" />
              <CardTitle className="text-4xl font-black mb-2">Mission Complete!</CardTitle>
              <p className="text-[#E8F5EE] text-xl">+{xpAwarded} XP earned</p>
            </div>
            <CardContent className="p-8 space-y-6">
              {selectedMode === 'DEBT' && debtResult && (
                <div className="space-y-4">
                  {/* FIX (2026-09-30): fixed light-hex/blue-100 badges didn't adapt to
                      dark mode, and used raw emoji instead of icons. Now uses
                      cat-correct (Avalanche) / cat-save (Snowball, fittingly cool-toned)
                      / cat-wrong (no match) — the same tokens the live meter above uses,
                      so the verdict visually confirms what the meter was already showing. */}
                  <div className="text-center">
                    <Badge className={cn("text-sm px-4 py-1 font-black gap-1.5", debtResult.method === 'AVALANCHE' ? 'bg-cat-correct/15 text-cat-correct' : debtResult.method === 'SNOWBALL' ? 'bg-cat-save/15 text-cat-save' : 'bg-cat-wrong/10 text-cat-wrong')}>
                      {debtResult.method === 'AVALANCHE' ? <><Flame className="h-3.5 w-3.5" />Avalanche Strategy</> : debtResult.method === 'SNOWBALL' ? <><Snowflake className="h-3.5 w-3.5" />Snowball Strategy</> : 'Custom Order'}
                    </Badge>
                  </div>
                  <p className={cn("font-black text-lg text-center", debtResult.method !== 'NONE' ? 'text-cat-correct' : 'text-muted-foreground')}>{debtResult.saved}</p>
                  <div className="bg-muted rounded-xl p-4 text-sm text-foreground space-y-2">
                    {debtResult.method === 'AVALANCHE'
                      ? <><p><strong>Avalanche</strong> = pay highest interest rate first. Mathematically saves the most money.</p><p>Best for: People who are motivated by saving the maximum amount.</p></>
                      : debtResult.method === 'SNOWBALL'
                      ? <><p><strong>Snowball</strong> = pay smallest balance first. Gets you quick wins to stay motivated.</p><p>Best for: People who need momentum and psychological wins.</p></>
                      : <p>Neither the optimal Avalanche nor Snowball order was chosen. Try again to see how much you can save!</p>
                    }
                  </div>
                </div>
              )}
              {selectedMode === 'PORTFOLIO' && portfolioScore !== null && (
                <div className="space-y-4">
                  <div className="text-center">
                    {/* FIX (2026-09-30): the >=75 and >=50 branches resolved to the
                        exact same sage color (text-primary and text-[#2E7D5A] are
                        the same hex), so the 3-tier scoring never actually looked
                        3-tier. Now uses cat-correct/cat-want/cat-wrong for a real
                        visual gradient, and it's dark-mode safe. */}
                    <div className={cn("text-5xl font-black mb-1", portfolioScore >= 75 ? 'text-cat-correct' : portfolioScore >= 50 ? 'text-cat-want' : 'text-cat-wrong')}>
                      {portfolioScore}%
                    </div>
                    <div className="text-muted-foreground text-sm">alignment with your risk profile</div>
                    {riskProfile && <Badge className={cn("mt-2 font-black", riskProfile.color)}>{riskProfile.label} Investor</Badge>}
                  </div>
                  {portfolioFeedback && (
                    <div className="bg-muted rounded-xl p-4 text-sm text-foreground whitespace-pre-line">
                      {portfolioFeedback}
                    </div>
                  )}
                  {riskProfile && (
                    <div className="text-xs text-muted-foreground bg-muted rounded-xl p-3">
                      <strong>Your ideal allocation:</strong> Cash {riskProfile.recommended.cash}% · Bonds {riskProfile.recommended.bonds}% · Stocks {riskProfile.recommended.stocks}% · Property {riskProfile.recommended.property}%
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => {
                  if (selectedMode === 'DEBT') retryDebt();
                  else if (selectedMode === 'PORTFOLIO') retryPortfolio();
                }} className="flex-1 h-14 font-bold">
                  Try Another
                </Button>
                <Button onClick={onExit} className="flex-1 h-14 font-bold text-lg">Back to Hub</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-5"><XPWallet /></div>
      </div>
    );
  }

  // ─── PLAYING: Debt Mode ────────────────────────────────────────────────────

  if (selectedMode === 'DEBT') {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="border-none shadow-xl bg-card overflow-hidden">
          <div className="bg-rose-600 p-6 text-white">
            <CardTitle className="text-2xl font-black mb-1">Debt Domino — {scenario.label}</CardTitle>
            <p className="text-rose-100 text-sm">{scenario.description}</p>
          </div>
          <CardContent className="p-6 space-y-3">
            {/*
              FIX (2026-09-26): this list used HTML5 native drag-and-drop
              (draggable + onDragStart/onDragOver). That API only fires from
              mouse events — it has no touch equivalent on mobile browsers or
              WebViews (which is what the Capacitor app actually runs in), so
              on a real phone dragging never worked at all. Replaced with
              Up/Down buttons, which use plain onClick and work identically
              on every device, touch or mouse.
            */}
            {/* FIX (2026-09-30): live feedback while dragging — previously this
                screen gave no signal at all until "Confirm Priority Order" was
                clicked. Shows how close the CURRENT arrangement is to each
                named strategy, updating on every move. */}
            <div className="mb-5 p-3 rounded-xl bg-muted border border-border grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                  <span className="flex items-center gap-1 text-cat-correct"><Flame className="h-3 w-3" />Avalanche</span>
                  <span className={cn(strategyMatch.avalanche === 100 ? "text-cat-correct" : "text-muted-foreground")}>{strategyMatch.avalanche}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-cat-correct transition-all duration-300" style={{ width: `${strategyMatch.avalanche}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                  <span className="flex items-center gap-1 text-cat-save"><Snowflake className="h-3 w-3" />Snowball</span>
                  <span className={cn(strategyMatch.snowball === 100 ? "text-cat-save" : "text-muted-foreground")}>{strategyMatch.snowball}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-cat-save transition-all duration-300" style={{ width: `${strategyMatch.snowball}%` }} />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-4">Reorder — most urgent first</p>
            {/* FIX (2026-09-30): the old single-row layout crammed a number
                circle, the debt name, balance/min-payment text, an APR badge,
                AND up/down buttons into one flex row — on a real phone width
                there wasn't enough room left for the name, so it got cut off
                with "..." (e.g. "Friend L…", "Education …"), hiding exactly
                the info the player needs to make this decision. Restructured
                into two rows: the name now gets the full card width and wraps
                instead of truncating; balance/min-payment/APR moved to a
                second row underneath. */}
            {debts.map((debt, idx) => (
              <div
                key={debt.id}
                className="p-4 rounded-xl border-2 border-border bg-card shadow-sm hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-black text-sm shrink-0">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground leading-snug">{debt.name}</div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                      <span className="text-xs text-muted-foreground">Balance: ₹{debt.balance.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-muted-foreground">· Min: ₹{debt.minPayment}</span>
                      <span className={cn("font-black text-xs", debt.rate > 20 ? 'text-cat-wrong' : debt.rate > 0 ? 'text-cat-correct' : 'text-muted-foreground')}>
                        {debt.rate > 0 ? `${debt.rate}% APR` : '0% interest'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, idx - 1)}
                      className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary hover:text-primary"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={idx === debts.length - 1}
                      onClick={() => handleMove(idx, idx + 1)}
                      className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary hover:text-primary"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <Button className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-700 mt-4" onClick={checkDebtStrategy}>
              Confirm Priority Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── PLAYING: Portfolio Mode ───────────────────────────────────────────────

  const ASSET_META = {
    cash:     { icon: Wallet,    label: 'Cash',     color: 'bg-slate-500',  desc: 'Safest. Loses value to inflation over time. Good for emergencies.' },
    bonds:    { icon: Landmark,  label: 'Bonds',    color: 'bg-blue-500',   desc: 'Fixed interest payments. Lower risk. Steady income.' },
    stocks:   { icon: TrendingUp,label: 'Stocks',   color: 'bg-primary',desc: 'Ownership in companies. Higher risk, higher long-term return.' },
    property: { icon: Building2, label: 'Property', color: 'bg-secondary',  desc: 'Real estate. Good hedge against inflation but hard to liquidate.' },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Goals + Glossary toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowGlossary(v => !v)}>
            <BookOpen className="h-3 w-3" /> Glossary
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowGoals(v => !v)}>
            <Target className="h-3 w-3" /> Goals
          </Button>
        </div>
        {riskProfile && (
          <Badge className={cn("font-black text-xs", riskProfile.color)}>
            {riskProfile.label} Profile
          </Badge>
        )}
      </div>

      {/* Glossary panel */}
      {showGlossary && (
        <Card className="border-2 border-blue-100 bg-blue-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-black text-slate-800 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Key Terms</div>
            <button onClick={() => setShowGlossary(false)}><X className="h-4 w-4 text-slate-400" /></button>
          </div>
          <div className="grid gap-2 text-xs">
            {GLOSSARY.map(g => (
              <div key={g.term} className="flex gap-2">
                <span className="font-black text-primary w-28 shrink-0">{g.term}</span>
                <span className="text-slate-600">{g.def}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Goals panel */}
      {showGoals && (
        <Card className="border-2 border-[#C8E8D8] bg-[#E8F5EE]/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-black text-slate-800 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> My Portfolio Goal</div>
            <button onClick={() => setShowGoals(false)}><X className="h-4 w-4 text-slate-400" /></button>
          </div>
          <p className="text-xs text-slate-500 mb-2">What are you investing for? This helps check if your allocation matches your goal.</p>
          <input
            type="text"
            value={goalTarget}
            onChange={e => setGoalTarget(e.target.value)}
            placeholder="e.g. Retire at 45, buy a house, child's education..."
            className="w-full border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </Card>
      )}

      {/* Risk profile card */}
      {riskProfile && (
        <div className={cn("bg-card border-2 rounded-xl p-4 flex items-start gap-3", riskProfile.label === 'Conservative' ? 'border-blue-200' : riskProfile.label === 'Moderate' ? 'border-[#A8D5BC]' : 'border-[#A8D5BC]')}>
          <Info className={cn("h-4 w-4 shrink-0 mt-0.5", riskProfile.color)} />
          <div>
            <div className={cn("font-black text-sm", riskProfile.color)}>{riskProfile.label} Investor</div>
            <p className="text-xs text-muted-foreground mt-0.5">{riskProfile.desc}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: Cash {riskProfile.recommended.cash}% · Bonds {riskProfile.recommended.bonds}% · Stocks {riskProfile.recommended.stocks}% · Property {riskProfile.recommended.property}%
            </p>
          </div>
        </div>
      )}

      <Card className="border-none shadow-xl bg-card overflow-hidden">
        <div className="bg-primary p-6 text-white">
          <CardTitle className="text-2xl font-black">Portfolio Builder</CardTitle>
          <p className="text-[#C8E8D8] text-sm mt-1">Allocate 100% across four asset classes. All sliders are linked — total always equals 100%.</p>
        </div>
        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Pie chart preview */}
          <div className="flex items-center gap-6">
            <svg viewBox="0 0 32 32" className="w-20 h-20 rotate-[-90deg] shrink-0">
              {(() => {
                const segments = [
                  { key: 'cash', color: '#64748b' },
                  { key: 'bonds', color: '#3b82f6' },
                  { key: 'stocks', color: '#10b981' },
                  { key: 'property', color: '#f59e0b' },
                ];
                let offset = 0;
                return segments.map(seg => {
                  const val = allocation[seg.key as keyof Allocation];
                  const el = (
                    <circle key={seg.key} r="16" cx="16" cy="16" fill="transparent"
                      stroke={seg.color} strokeWidth="32"
                      strokeDasharray={`${val} 100`} strokeDashoffset={`-${offset}`} />
                  );
                  offset += val;
                  return el;
                });
              })()}
            </svg>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {(Object.keys(allocation) as (keyof Allocation)[]).map(k => (
                <div key={k} className="flex items-center gap-1.5">
                  <div className={cn("h-2 w-2 rounded-full shrink-0", ASSET_META[k].color)} />
                  <span className="font-bold capitalize">{k}</span>
                  <span className="text-muted-foreground">{allocation[k]}%</span>
                </div>
              ))}
            </div>
          </div>

          {(Object.keys(allocation) as (keyof Allocation)[]).map(key => {
            const meta = ASSET_META[key];
            const Icon = meta.icon;
            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold capitalize">{meta.label}</span>
                    <span className="text-xs text-muted-foreground">{meta.desc}</span>
                  </div>
                  <span className="font-black text-primary w-10 text-right">{allocation[key]}%</span>
                </div>
                <Slider
                  value={[allocation[key]]}
                  max={100}
                  step={5}
                  onValueChange={([val]) => updateAllocation(key, val)}
                />
              </div>
            );
          })}

          <Button className="w-full h-14 text-lg bg-primary hover:bg-emerald-700" onClick={checkPortfolio}>
            Lock Allocation &amp; Score
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
