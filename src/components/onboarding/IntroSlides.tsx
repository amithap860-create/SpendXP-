'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface IntroSlide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  body: string;
  accentColor: string;
  bgColor: string;
}

const SLIDES: IntroSlide[] = [
  {
    id: 'welcome',
    emoji: '⚖️',
    title: 'Welcome to SpendXP',
    subtitle: 'Order of the Golden Ledger',
    body: 'You\'ve just been recruited into a secret order that fights financial chaos. Your mission: master money before money masters you.',
    accentColor: 'text-primary',
    bgColor: 'from-slate-900 to-slate-800',
  },
  {
    id: 'what-is',
    emoji: '🗂️',
    title: 'Real Skills. Real Scenarios.',
    subtitle: 'Not another boring finance app',
    body: 'SpendXP teaches you budgeting, investing, credit, and saving through Case Files — real-world money challenges that level you up as you solve them.',
    accentColor: 'text-emerald-400',
    bgColor: 'from-slate-800 to-slate-900',
  },
  {
    id: 'how-it-works',
    emoji: '🎮',
    title: 'Play. Earn. Level Up.',
    subtitle: 'Three ways to grow',
    body: 'Complete Case Files → earn XP → climb ranks from Apprentice to Legend. Play arcade games to test your skills. Join daily challenges to compete with others.',
    accentColor: 'text-amber-400',
    bgColor: 'from-slate-900 to-slate-800',
  },
  {
    id: 'get-started',
    emoji: '🚀',
    title: 'Your Journey Starts Now',
    subtitle: 'First mission is waiting',
    body: 'Your first Case File is ready. It takes under 5 minutes and earns you XP toward your first rank. The Gray Fog won\'t clear itself.',
    accentColor: 'text-rose-400',
    bgColor: 'from-slate-800 to-slate-900',
  },
];

interface IntroSlidesProps {
  onComplete: () => void;
}

export function IntroSlides({ onComplete }: IntroSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  const isLast = currentSlide === SLIDES.length - 1;
  const slide = SLIDES[currentSlide];

  function goNext() {
    if (animating) return;
    if (isLast) {
      onComplete();
      return;
    }
    setAnimating(true);
    setTimeout(() => {
      setCurrentSlide(prev => prev + 1);
      setAnimating(false);
    }, 200);
  }

  function goTo(index: number) {
    if (animating || index === currentSlide) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setAnimating(false);
    }, 200);
  }

  // Allow swipe gestures
  useEffect(() => {
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && !isLast) goNext();
        else if (diff < 0 && currentSlide > 0) goTo(currentSlide - 1);
      }
    };
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [currentSlide, isLast]);

  return (
    <div className={cn(
      'fixed inset-0 z-[9999] flex flex-col bg-gradient-to-br transition-all duration-500',
      slide.bgColor
    )}>
      {/* Skip button */}
      <div className="flex justify-end p-5">
        <button
          onClick={onComplete}
          className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors px-3 py-2"
        >
          Skip →
        </button>
      </div>

      {/* Slide content */}
      <div className={cn(
        'flex-1 flex flex-col items-center justify-center px-8 text-center transition-opacity duration-200',
        animating ? 'opacity-0' : 'opacity-100'
      )}>
        {/* Big emoji */}
        <div className="text-7xl md:text-8xl mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
          {slide.emoji}
        </div>

        {/* Subtitle label */}
        <div className={cn('text-[10px] font-black uppercase tracking-widest mb-3', slide.accentColor)}>
          {slide.subtitle}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5 max-w-sm">
          {slide.title}
        </h1>

        {/* Body */}
        <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xs md:max-w-sm font-medium">
          {slide.body}
        </p>
      </div>

      {/* Bottom: dots + CTA */}
      <div className="p-8 space-y-6">
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'rounded-full transition-all duration-300',
                i === currentSlide
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-slate-600 hover:bg-slate-400'
              )}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={goNext}
          className={cn(
            'w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest transition-all',
            isLast
              ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30'
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
          )}
        >
          {isLast ? '⚔️ Begin My Mission' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
