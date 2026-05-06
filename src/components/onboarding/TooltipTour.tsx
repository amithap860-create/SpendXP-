'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface TourStep {
  id: string;
  targetId: string;        // HTML element ID to highlight
  title: string;
  body: string;
  emoji: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'storyline',
    targetId: 'tour-storyline',
    title: 'Your Mission Brief',
    body: 'This is your Order rank card. It shows your current rank, XP progress, active threat, and mission objective. It updates as you earn XP.',
    emoji: '⚖️',
    position: 'bottom',
  },
  {
    id: 'stats',
    targetId: 'tour-stats',
    title: 'Your Field Stats',
    body: 'Track your streak, games played, virtual savings, and lessons completed. Every number here reflects real financial decisions you\'ve practiced.',
    emoji: '📊',
    position: 'bottom',
  },
  {
    id: 'quests-nav',
    targetId: 'tour-quests',
    title: 'Case Files (Quests)',
    body: 'These are your missions. Each Case File walks you through a real financial scenario — rent, salary, credit, investments. Complete them to earn XP.',
    emoji: '🗂️',
    position: 'top',
  },
  {
    id: 'games-nav',
    targetId: 'tour-games',
    title: 'The Arcade',
    body: 'Three free games to test your skills. Budget Blitz, FinIQ Quiz, and Money Maze are open. Stock Market Sim and Credit Builder unlock with premium.',
    emoji: '🎮',
    position: 'top',
  },
  {
    id: 'profile-nav',
    targetId: 'tour-profile',
    title: 'Your Profile',
    body: 'Set your country and currency, change your avatar, track your badges, and see your full progress history here.',
    emoji: '👤',
    position: 'top',
  },
];

interface TooltipTourProps {
  onComplete: () => void;
}

interface TooltipPos {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TooltipTour({ onComplete }: TooltipTourProps) {
  const [step, setStep] = useState(0);
  const [targetPos, setTargetPos] = useState<TooltipPos | null>(null);
  const [visible, setVisible] = useState(false);

  const currentStep = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  useEffect(() => {
    // Small delay to let DOM settle
    const timeout = setTimeout(() => {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetPos({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        // Scroll element into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setVisible(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [step, currentStep.targetId]);

  function next() {
    setVisible(false);
    setTimeout(() => {
      if (isLast) {
        onComplete();
      } else {
        setStep(prev => prev + 1);
      }
    }, 150);
  }

  function skip() {
    onComplete();
  }

  if (!targetPos) return null;

  // Calculate tooltip position
  const tooltipWidth = 280;
  const gap = 12;
  let tooltipTop = 0;
  let tooltipLeft = 0;

  switch (currentStep.position) {
    case 'bottom':
      tooltipTop = targetPos.top + targetPos.height + gap;
      tooltipLeft = Math.max(8, Math.min(
        targetPos.left + targetPos.width / 2 - tooltipWidth / 2,
        window.innerWidth - tooltipWidth - 8
      ));
      break;
    case 'top':
      tooltipTop = targetPos.top - gap - 160; // approx tooltip height
      tooltipLeft = Math.max(8, Math.min(
        targetPos.left + targetPos.width / 2 - tooltipWidth / 2,
        window.innerWidth - tooltipWidth - 8
      ));
      break;
    default:
      tooltipTop = targetPos.top;
      tooltipLeft = targetPos.left + targetPos.width + gap;
  }

  return (
    <>
      {/* Dark overlay with cutout for target element */}
      <div className="fixed inset-0 z-[9000] pointer-events-none">
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={targetPos.left - 6}
                y={targetPos.top - 6}
                width={targetPos.width + 12}
                height={targetPos.height + 12}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.6)"
            mask="url(#tour-mask)"
          />
        </svg>
      </div>

      {/* Highlight ring on target */}
      <div
        className="fixed z-[9001] rounded-xl ring-2 ring-primary ring-offset-2 pointer-events-none transition-all duration-300"
        style={{
          top: targetPos.top - 6,
          left: targetPos.left - 6,
          width: targetPos.width + 12,
          height: targetPos.height + 12,
        }}
      />

      {/* Tooltip card */}
      <div
        className={cn(
          'fixed z-[9002] bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 transition-all duration-150',
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipWidth,
        }}
      >
        {/* Step counter */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === step ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-slate-200'
                )}
              />
            ))}
          </div>
          <button
            onClick={skip}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">{currentStep.emoji}</span>
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-1">{currentStep.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{currentStep.body}</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={next}
          className="w-full h-9 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors"
        >
          {isLast ? '✅ Got it!' : 'Next →'}
        </button>
      </div>
    </>
  );
}
