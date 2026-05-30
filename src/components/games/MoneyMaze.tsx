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
  ArrowDownUp, Trophy, RefreshCcw, Sparkles, Info, CheckCircle2, X, BookOpen, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const gameConfig = useMemo(() => ({
    gameName: 'moneyMaze' as const,
    totalRounds: 1,
    livesEnabled: false,
    xpPerWin: 250,
    xpPerCorrectAnswer: 50,
  }), []);

  const { gameState, xpEarned, startGame, endGame } = useGameEngine(gameConfig);

  // Debt state
  const debtScenarios = ageGroup === 'junior' ? DEBT_SCENARIOS_JUNIOR : ageGroup === 'senior' ? DEBT_SCENARIOS_SENIOR : DEBT_SCENARIOS_TEEN;
  const [scenarioIdx] = useState(() => Math.floor(Math.random() * debtScenarios.length));
  const scenario = debtScenarios[scenarioIdx];
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [debtResult, setDebtResult] = useState<{ method: 'AVALANCHE' | 'SNOWBALL' | 'NONE'; saved: string } | null>(null);

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

  // Start debt mode
  const startDebt = () => {
    const s = debtScenarios[scenarioIdx];
    setDebts([...s.debts].sort(() => Math.random() - 0.5));
    setSelectedMode('DEBT');
    startGame();
  };

  const handleMove = (fromIdx: number, toIdx: number) => {
    const next = [...debts];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setDebts(next);
  };

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
        lines.push(`⚠️ Goal mismatch: "${goalTarget}" requires growth, but your risk profile is Conservative. Consider stepping up to at least Moderate.`);
      }
    }

    setPortfolioFeedback(lines.join('\n\n'));
    await endGame();
  };

  // ─── Risk Assessment ────────────────────────────────────────────────────────

  if (selectedMode === 'PORTFOLIO' && riskStep !== null && riskStep >= 0) {
    const q = RISK_QUESTIONS[riskStep];
    return (
      <Card className="max-w-xl mx-auto border-none shadow-2xl bg-white overflow-hidden">
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
              className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-[#4EA07A] hover:bg-[#E8F5EE] transition-all font-bold text-slate-800 min-h-[52px]"
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
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
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
              <p className="text-xs text-slate-400 mt-2">Scenario: <span className="font-bold">{scenario.label}</span></p>
            </CardHeader>
          </Card>
          <Card
            className="hover:shadow-2xl cursor-pointer border-none border-t-4 border-t-emerald-500 transition-shadow"
            onClick={() => { setSelectedMode('PORTFOLIO'); setRiskStep(0); startGame(); }}
          >
            <div className="h-2 bg-primary rounded-t-xl" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2"><TrendingUp className="h-6 w-6 text-primary" /><CardTitle>Portfolio Builder</CardTitle></div>
              <CardDescription>Answer 5 science-backed questions to discover your risk profile, then build your ideal portfolio.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // ─── RESULTS ───────────────────────────────────────────────────────────────

  if (gameState === 'RESULTS') {
    return (
      <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-7">
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <div className="bg-primary p-10 text-white text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4" />
              <CardTitle className="text-4xl font-black mb-2">Mission Complete!</CardTitle>
              <p className="text-[#E8F5EE] text-xl">+{xpEarned} XP earned</p>
            </div>
            <CardContent className="p-8 space-y-6">
              {selectedMode === 'DEBT' && debtResult && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge className={cn("text-sm px-4 py-1 font-black", debtResult.method === 'AVALANCHE' ? 'bg-[#C8E8D8] text-primary' : debtResult.method === 'SNOWBALL' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700')}>
                      {debtResult.method === 'AVALANCHE' ? '🔥 Avalanche Strategy' : debtResult.method === 'SNOWBALL' ? '❄️ Snowball Strategy' : 'Custom Order'}
                    </Badge>
                  </div>
                  <p className="font-black text-lg text-center text-primary">{debtResult.saved}</p>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 space-y-2">
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
                    <div className={cn("text-5xl font-black mb-1", portfolioScore >= 75 ? 'text-primary' : portfolioScore >= 50 ? 'text-[#2E7D5A]' : 'text-rose-600')}>
                      {portfolioScore}%
                    </div>
                    <div className="text-slate-500 text-sm">alignment with your risk profile</div>
                    {riskProfile && <Badge className={cn("mt-2 font-black", riskProfile.color)}>{riskProfile.label} Investor</Badge>}
                  </div>
                  {portfolioFeedback && (
                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-line">
                      {portfolioFeedback}
                    </div>
                  )}
                  {riskProfile && (
                    <div className="text-xs text-slate-500 bg-blue-50 rounded-xl p-3">
                      <strong>Your ideal allocation:</strong> Cash {riskProfile.recommended.cash}% · Bonds {riskProfile.recommended.bonds}% · Stocks {riskProfile.recommended.stocks}% · Property {riskProfile.recommended.property}%
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => {
                  setSelectedMode(null);
                  setRiskStep(null);
                  setRiskAnswers([]);
                  setRiskProfile(null);
                  setPortfolioScore(null);
                  setPortfolioFeedback('');
                  setDebtResult(null);  // clear stale debt result so it doesn't bleed into next session
                  startGame();
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
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="bg-rose-600 p-6 text-white">
            <CardTitle className="text-2xl font-black mb-1">Debt Domino — {scenario.label}</CardTitle>
            <p className="text-rose-100 text-sm">{scenario.description}</p>
          </div>
          <CardContent className="p-6 space-y-3">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Drag to reorder — most urgent first</p>
            {debts.map((debt, idx) => (
              <div
                key={debt.id}
                draggable
                onDragStart={() => setDraggedIdx(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedIdx !== null && draggedIdx !== idx) {
                    handleMove(draggedIdx, idx);
                    setDraggedIdx(idx);
                  }
                }}
                className="p-4 rounded-xl border-2 border-slate-100 flex items-center gap-4 bg-white shadow-sm cursor-grab active:cursor-grabbing hover:border-primary transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-sm shrink-0">{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{debt.name}</div>
                  <div className="text-xs text-slate-400">Balance: ₹{debt.balance.toLocaleString('en-IN')} · Min payment: ₹{debt.minPayment}</div>
                </div>
                <div className={cn("font-black text-sm shrink-0", debt.rate > 20 ? 'text-rose-600' : debt.rate > 0 ? 'text-[#2E7D5A]' : 'text-slate-400')}>
                  {debt.rate > 0 ? `${debt.rate}% APR` : '0% interest'}
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
        <div className={cn("bg-white border-2 rounded-xl p-4 flex items-start gap-3", riskProfile.label === 'Conservative' ? 'border-blue-200' : riskProfile.label === 'Moderate' ? 'border-[#A8D5BC]' : 'border-[#A8D5BC]')}>
          <Info className={cn("h-4 w-4 shrink-0 mt-0.5", riskProfile.color)} />
          <div>
            <div className={cn("font-black text-sm", riskProfile.color)}>{riskProfile.label} Investor</div>
            <p className="text-xs text-slate-600 mt-0.5">{riskProfile.desc}</p>
            <p className="text-xs text-slate-400 mt-1">
              Recommended: Cash {riskProfile.recommended.cash}% · Bonds {riskProfile.recommended.bonds}% · Stocks {riskProfile.recommended.stocks}% · Property {riskProfile.recommended.property}%
            </p>
          </div>
        </div>
      )}

      <Card className="border-none shadow-xl bg-white overflow-hidden">
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
                  <span className="text-slate-500">{allocation[k]}%</span>
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
                    <Icon className="h-4 w-4 text-slate-600" />
                    <span className="font-bold capitalize">{meta.label}</span>
                    <span className="text-xs text-slate-400">{meta.desc}</span>
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
