'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

type Answer = 'yes' | 'no' | null;

interface Question {
  id: number;
  label: string;
  teaser: string;
  yesExplanation: string;
  noExplanation: string;
  lynchQuote: string;
}

const LYNCH_QUESTIONS: Question[] = [
  {
    id: 1,
    label: 'Can you explain what it does in one sentence?',
    teaser: '"What does this company do to make money?"',
    yesExplanation: "Good start. You understand the business model. This is the foundation — if you can't explain it simply, you can't evaluate it accurately.",
    noExplanation: "Red flag. Lynch says if you can't explain it simply, you don't understand it. Go back and read the company's annual report or investor presentation before proceeding.",
    lynchQuote: 'Lynch: "Never invest in any idea you can\'t illustrate with a crayon."',
  },
  {
    id: 2,
    label: 'Can you name the specific reason it is growing?',
    teaser: '"Why is it growing? (not just \'the sector is hot\')"',
    yesExplanation: "Solid. You know the company's specific edge — a product, market position, or structural advantage that others don't have. This is what creates durable returns.",
    noExplanation: "Weak thesis. 'Sector is hot' or 'everyone's buying it' is not a reason. Find the company-specific driver — new product, geographic expansion, regulatory moat, or network effect.",
    lynchQuote: 'Lynch: "Know what you own and know why you own it."',
  },
  {
    id: 3,
    label: 'Is the PEG ratio below 1?',
    teaser: '"What are you paying per unit of growth?" (PEG = P/E ÷ growth rate)',
    yesExplanation: "Potentially attractive pricing. PEG < 1 means you may be paying less than the growth justifies — a Lynch favourite. Cross-check with free cash flow to confirm.",
    noExplanation: "You're paying a premium. PEG > 1 isn't automatically bad — high-quality compounders can deserve it — but you need very strong conviction on sustained growth. Ask yourself: what happens if growth slows by half?",
    lynchQuote: 'Lynch: "The P/E ratio of any company that\'s fairly priced will equal its growth rate."',
  },
  {
    id: 4,
    label: 'Is the promoter buying with their own money?',
    teaser: '"Are insiders (founders/management) buying their own shares?"',
    yesExplanation: "Strong conviction signal. Promoters know their business better than any analyst. Spending real personal money on shares means they see genuine undervaluation or believe deeply in future growth.",
    noExplanation: "Not necessarily a dealbreaker — but note the absence. Check if promoters are selling (a negative signal) or if their stake has been flat for years. Insider alignment matters more at higher valuations.",
    lynchQuote: 'Lynch: "Insiders might sell their shares for any number of reasons, but they buy them for only one: they think the price will rise."',
  },
];

function ScoreBadge({ score }: { score: number }) {
  if (score === 4) return (
    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center space-y-1">
      <div className="text-3xl">🔍</div>
      <p className="text-emerald-800 font-black text-base">Strong Research Candidate</p>
      <p className="text-emerald-700 text-xs leading-relaxed">All 4 Lynch checks pass. This stock earns a place on your research shortlist — not your buy list. Now read the annual report, understand the risks, and size your position carefully.</p>
    </div>
  );
  if (score === 3) return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 text-center space-y-1">
      <div className="text-3xl">⚠️</div>
      <p className="text-amber-800 font-black text-base">Promising but Incomplete</p>
      <p className="text-amber-700 text-xs leading-relaxed">3 of 4 checks pass. Investigate the gap before proceeding. Lynch's framework works best when all 4 are satisfied — each unanswered question is a risk you're holding.</p>
    </div>
  );
  if (score === 2) return (
    <div className="rounded-2xl bg-orange-50 border border-orange-200 p-5 text-center space-y-1">
      <div className="text-3xl">🚧</div>
      <p className="text-orange-800 font-black text-base">Too Many Gaps</p>
      <p className="text-orange-700 text-xs leading-relaxed">Only 2 checks pass. This stock needs more research before it deserves your attention — or your money. Go back to basics.</p>
    </div>
  );
  return (
    <div className="rounded-2xl bg-red-50 border border-red-200 p-5 text-center space-y-1">
      <div className="text-3xl">❌</div>
      <p className="text-red-800 font-black text-base">Avoid for Now</p>
      <p className="text-red-700 text-xs leading-relaxed">Fewer than 2 checks pass. Lynch's filter eliminates 95% of stocks for a reason. Move on — there are better candidates out there.</p>
    </div>
  );
}

export function StockResearchChecker() {
  const [stockName, setStockName] = useState('');
  const [answers, setAnswers] = useState<Record<number, Answer>>({ 1: null, 2: null, 3: null, 4: null });
  const [submitted, setSubmitted] = useState(false);

  const score = Object.values(answers).filter(a => a === 'yes').length;
  const allAnswered = Object.values(answers).every(a => a !== null);

  function reset() {
    setStockName('');
    setAnswers({ 1: null, 2: null, 3: null, 4: null });
    setSubmitted(false);
  }

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Based on Peter Lynch's Framework</p>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Answer 4 questions about any stock. Lynch's filter eliminates 95% of listed companies — what's left is your <strong>research shortlist</strong>.
        </p>
      </div>

      {/* Stock name input */}
      {!submitted && (
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Stock or company name</label>
          <input
            type="text"
            value={stockName}
            onChange={e => setStockName(e.target.value)}
            placeholder="e.g. Tata Motors, Zomato, Infosys..."
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}

      {/* Questions */}
      {!submitted ? (
        <div className="space-y-4">
          {LYNCH_QUESTIONS.map(q => (
            <div key={q.id} className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-black flex items-center justify-center mt-0.5">{q.id}</span>
                  <div>
                    <p className="text-sm font-black text-slate-900">{q.label}</p>
                    <p className="text-xs text-slate-500 italic mt-0.5">{q.teaser}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pl-8">
                <button
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 'yes' }))}
                  className={cn(
                    'flex-1 h-9 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                    answers[q.id] === 'yes'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-700'
                  )}
                >
                  ✓ Yes
                </button>
                <button
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 'no' }))}
                  className={cn(
                    'flex-1 h-9 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                    answers[q.id] === 'no'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-600'
                  )}
                >
                  ✗ No
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className="w-full h-11 rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all disabled:opacity-40"
            style={{ background: allAnswered ? '#2E7D5A' : '#94a3b8' }}
          >
            {allAnswered ? `Check ${stockName || 'This Stock'} →` : 'Answer all 4 questions'}
          </button>
        </div>
      ) : (
        /* Results */
        <div className="space-y-4">
          {stockName && (
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Results for <span className="text-slate-900">{stockName}</span>
            </p>
          )}

          {/* Score pill */}
          <div className="flex items-center justify-center gap-2 py-3">
            {[1,2,3,4].map(i => (
              <div
                key={i}
                className={cn(
                  'h-3 flex-1 rounded-full transition-colors',
                  i <= score ? 'bg-emerald-500' : 'bg-slate-200'
                )}
              />
            ))}
          </div>
          <p className="text-center text-xs font-black text-slate-500">{score} / 4 checks passed</p>

          <ScoreBadge score={score} />

          {/* Per-question breakdown */}
          <div className="space-y-3">
            {LYNCH_QUESTIONS.map(q => {
              const ans = answers[q.id];
              return (
                <div
                  key={q.id}
                  className={cn(
                    'rounded-xl p-4 border text-xs space-y-1.5',
                    ans === 'yes' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span>{ans === 'yes' ? '✅' : '❌'}</span>
                    <p className="font-black text-slate-800">{q.label}</p>
                  </div>
                  <p className="text-slate-600 leading-relaxed pl-6">
                    {ans === 'yes' ? q.yesExplanation : q.noExplanation}
                  </p>
                  <p className="text-slate-400 italic pl-6">{q.lynchQuote}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={reset}
            className="w-full h-11 rounded-xl text-sm font-black uppercase tracking-widest border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Check Another Stock
          </button>
        </div>
      )}
    </div>
  );
}
