'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

/* ── Inline SVG icons — no emoji ── */

const SvgScale = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3v22M4 25h20" strokeWidth="1.8"/>
    <path d="M14 6L8 14h12L14 6z" strokeWidth="1.6"/>
    <circle cx="8" cy="14" r="3.5" strokeWidth="1.6"/>
    <circle cx="20" cy="14" r="3.5" strokeWidth="1.6"/>
  </svg>
);

const SvgFolder = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 8a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z" strokeWidth="1.7"/>
    <path d="M7 13h10M7 16h6" strokeWidth="1.5"/>
  </svg>
);

const SvgBolt = () => (
  <svg width="24" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2z" strokeWidth="1.7"/>
  </svg>
);

const SvgController = () => (
  <svg width="28" height="24" viewBox="0 0 28 22" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="24" height="16" rx="5" strokeWidth="1.7"/>
    <path d="M9 7v6M6 10h6" strokeWidth="1.7"/>
    <circle cx="20" cy="9" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="23" cy="9" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);

const SvgCalculator = () => (
  <svg width="22" height="26" viewBox="0 0 22 26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1" width="20" height="24" rx="3" strokeWidth="1.7"/>
    <rect x="4" y="4" width="14" height="6" rx="1.5" strokeWidth="1.4"/>
    <circle cx="6" cy="17" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="11" cy="17" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="17" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="6" cy="21.5" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="11" cy="21.5" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="21.5" r="1.3" fill="currentColor" stroke="none"/>
  </svg>
);

const STEPS = [
  {
    icon: <SvgScale />,
    title: 'Welcome to the Order',
    body: 'You\'ve joined the Order of the Golden Ledger — a secret society of financial detectives protecting SpendCity from the Gray Fog. Every lesson you learn is a real skill you keep for life.',
  },
  {
    icon: <SvgFolder />,
    title: 'Case Files = Quests',
    body: 'Open a Case File from the Quests page. Read the scenario, make financial decisions, and see how your choices play out. Each case teaches a real money skill.',
  },
  {
    icon: <SvgBolt />,
    title: 'Earn XP, Rise in Rank',
    body: 'Every correct decision, completed lesson, and game played earns XP. XP unlocks new ranks — from Apprentice to Legend — and opens new districts of SpendCity to defend.',
  },
  {
    icon: <SvgController />,
    title: 'The Arcade',
    body: 'Head to Games for Budget Blitz, FinIQ Quiz, Stock Market Sim, and more. Play daily to keep your streak alive and earn bonus XP. Short sessions, real knowledge.',
  },
  {
    icon: <SvgCalculator />,
    title: 'Financial Tools',
    body: 'The Tools section has real calculators — SIP, EMI, compound interest, savings goals. Use them to plan your actual money, not just virtual XP.',
  },
];

const STORAGE_KEY = 'spendxp_how_to_play_seen';

interface HowToPlayModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function HowToPlayModal({ forceOpen = false, onClose }: HowToPlayModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setStep(0);
      return;
    }
    // Show on first visit only
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const timer = setTimeout(() => setOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable
    }
  }, [forceOpen]);

  const handleClose = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setOpen(false);
    onClose?.();
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handleClose();
  };

  const handlePrev = () => setStep(s => Math.max(0, s - 1));

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(15,20,30,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#1A1F2E] px-6 pt-6 pb-8 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Step icon */}
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-[#4EA07A]">
            {current.icon}
          </div>

          {/* Step indicators */}
          <div className="flex gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  flex: i === step ? 2 : 1,
                  background: i <= step ? '#2E7D5A' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>

          <h2 className="text-lg font-black text-white leading-tight">{current.title}</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-sm text-slate-600 leading-relaxed mb-6">{current.body}</p>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 h-12 rounded-xl font-black text-sm uppercase tracking-widest transition-colors text-white flex items-center justify-center gap-2"
              style={{ background: '#2E7D5A' }}
            >
              {isLast ? 'Start Playing' : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={handleClose}
              className="w-full mt-3 text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-1"
            >
              Skip tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
