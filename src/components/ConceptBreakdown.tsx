'use client';

import React, { useEffect, useCallback } from 'react';
import { AgeGroup } from '@/lib/ageAdapt';
import { conceptBreakdowns } from '@/data/conceptBreakdowns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

// FIX (2026-09): conceptBreakdowns.ts content is authored inconsistently —
// the 12 core lesson-tied entries (budgeting-basics, emergency-fund, etc.)
// are written almost entirely in hardcoded $ amounts (real-world US/global
// stats), while the 14 quest-specific entries (birthday-loot onward) are
// written in ₹. Neither currency was ever converted for display — an
// Indian user (default INR) was reading raw "$400 phone", "$3,500 offer
// letter" text, and a US-currency user was reading raw "₹500" text. This
// is exactly the "currencies are inconsistent" bug reported.
// Rather than hand-rewriting ~70 dollar figures across the file (real risk
// of breaking the internal math in sentences like "$5,000 trip could be
// $50,000" if done as a rushed find/replace), both symbols are normalized
// at render time using the same fixed educational rate the rest of the app
// already uses (RATES_FROM_INR in formatCurrency.ts, ~₹83.33 = $1).
const USD_TO_INR_RATE = 1 / 0.012; // mirrors RATES_FROM_INR.USD in lib/formatCurrency.ts

interface ConceptBreakdownProps {
  breakdownId: string;
  ageGroup: AgeGroup;
  onContinue: () => void;
  activityTitle: string;
  activityType: 'quest' | 'quiz' | 'game' | 'challenge';
}

export function ConceptBreakdown({
  breakdownId,
  ageGroup,
  onContinue,
  activityTitle,
  activityType
}: ConceptBreakdownProps) {
  const breakdown = conceptBreakdowns.find(b => b.id === breakdownId);
  const { formatINR } = useCurrency();

  /** Converts every ₹N and $N amount in a string to the user's active display currency. */
  const localiseCurrency = useCallback((text: string): string => {
    if (!text) return text;
    let result = text.replace(/₹([\d,]+(?:\.\d+)?)/g, (_, numStr) => {
      const inrValue = parseFloat(numStr.replace(/,/g, ''));
      return formatINR(inrValue);
    });
    result = result.replace(/\$([\d,]+(?:\.\d+)?)/g, (_, numStr) => {
      const usdValue = parseFloat(numStr.replace(/,/g, ''));
      return formatINR(usdValue * USD_TO_INR_RATE);
    });
    return result;
  }, [formatINR]);

  // Defensive fallback for any activity that doesn't have a matching entry
  // in conceptBreakdowns.ts (some still don't — content gap, being filled
  // in separately). Previously this showed a raw "Briefing data missing
  // for: X" debug message to real users with a "Continue Anyway" button —
  // now it just skips the briefing screen entirely and goes straight into
  // the activity, since a missing brief shouldn't block anyone from playing.
  useEffect(() => {
    if (!breakdown) onContinue();
  }, [breakdown, onContinue]);

  if (!breakdown) return null;

  const isSenior = ageGroup === 'senior';
  const hook = isSenior ? breakdown.hook : breakdown.ageAdapted[ageGroup as 'junior' | 'teen']?.hook || breakdown.hook;
  const keyPoints = isSenior ? breakdown.keyPoints : breakdown.ageAdapted[ageGroup as 'junior' | 'teen']?.keyPoints || breakdown.keyPoints;

  return (
    <div className="concept-breakdown-overlay">
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .concept-breakdown-overlay {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: #EEF3FF;
          padding: 24px 20px calc(24px + env(safe-area-inset-bottom, 0px)) 20px;
          animation: slideUp 0.3s ease-out forwards;
          overflow-y: auto;
        }
        .quote-shape {
          position: absolute;
          top: -10px;
          left: -10px;
          width: 32px;
          height: 32px;
          background: #e2e8f0;
          border-radius: 50%;
          opacity: 0.5;
          z-index: 0;
        }
        .thought-bubble-shape {
          display: inline-block;
          width: 14px;
          height: 10px;
          background: #94a3b8;
          border-radius: 50%;
          position: relative;
          margin-right: 8px;
        }
        .thought-bubble-shape::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 2px;
          width: 4px;
          height: 4px;
          background: #94a3b8;
          border-radius: 50%;
        }
      `}</style>

      <header className="mb-8 shrink-0">
        <div className={cn(
          "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 text-white shadow-sm",
          activityType === 'quest' ? "bg-rose-500" :
          activityType === 'quiz' ? "bg-primary" :
          activityType === 'game' ? "bg-blue-500" :
          "bg-secondary"
        )}>
          {activityType === 'challenge' ? 'Daily Challenge' : activityType}
        </div>
        <h1 className="text-[18px] font-bold text-slate-900 leading-tight">{activityTitle}</h1>
        <p className="text-[13px] text-slate-400 font-medium mt-1">Quick concept brief</p>
      </header>

      <div className="space-y-8 flex-1">
        <section className="relative bg-white p-5 pl-6 rounded-xl border-l-[3px] border-primary shadow-sm overflow-hidden">
          <div className="quote-shape" />
          <p className="relative z-10 text-[18px] font-medium text-slate-800 leading-relaxed">
            "{localiseCurrency(hook)}"
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-[13px] font-black uppercase text-slate-400 tracking-widest">What to know</h2>
          <ul className="space-y-4 list-none p-0">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span className="text-[14px] font-medium text-slate-600 leading-relaxed">{localiseCurrency(point)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[#E8F5EE]/40 p-5 rounded-xl border-l-[3px] border-[#2E7D5A]">
          <span className="text-[11px] font-black uppercase text-[#2E7D5A] tracking-widest block mb-1">Real world</span>
          <p className="text-[14px] font-bold text-slate-700 leading-relaxed">
            {localiseCurrency(breakdown.realWorldStat)}
          </p>
          {isSenior && breakdown.ageAdapted.senior.extraStat && (
            <p className="text-[12px] font-medium text-slate-500 mt-3 italic border-t border-[#4EA07A]/10 pt-2">
              Note: {localiseCurrency(breakdown.ageAdapted.senior.extraStat)}
            </p>
          )}
        </section>

        {(ageGroup === 'teen' || ageGroup === 'senior') && (
          <section className="flex items-start gap-2 pt-2">
            <div className="thought-bubble-shape mt-1.5 shrink-0" />
            <p className="text-[13px] font-medium italic text-slate-500 leading-relaxed">
              {localiseCurrency(breakdown.quickQuestion)}
            </p>
          </section>
        )}

        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-widest pt-4">
          ~{breakdown.estimatedReadSeconds} second read
        </div>
      </div>

      <footer className="mt-10 pb-2 space-y-3 shrink-0">
        <Button 
          onClick={onContinue} 
          className="w-full h-[52px] text-lg font-black bg-primary hover:bg-primary-700 shadow-xl shadow-blue-100 rounded-2xl"
          suppressHydrationWarning
        >
          I'm ready — let's go
        </Button>
        <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {activityType === 'quest' ? `Starting: ${activityTitle}` :
           activityType === 'quiz' ? `Starting: ${activityTitle} quiz` :
           activityType === 'game' ? `Playing: ${activityTitle}` :
           "Today's daily challenge"}
        </p>
      </footer>
    </div>
  );
}
