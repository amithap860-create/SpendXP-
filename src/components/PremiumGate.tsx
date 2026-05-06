'use client';

import { cn } from '@/lib/utils';
import { PREMIUM_FEATURES, type PremiumFeature } from '@/config/premium';
import { usePremium } from '@/hooks/usePremium';

interface PremiumGateProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  /** Visual style of the lock overlay */
  variant?: 'blur' | 'card';
  className?: string;
}

/**
 * Wraps any content that requires a premium subscription.
 * Free users see a blurred/locked version with an upgrade prompt.
 * Premium users see the content normally.
 */
export function PremiumGate({ feature, children, variant = 'blur', className }: PremiumGateProps) {
  const { canAccess, isPremium } = usePremium();

  // Premium users — render content directly
  if (canAccess(feature)) {
    return <>{children}</>;
  }

  const info = PREMIUM_FEATURES[feature];

  if (variant === 'card') {
    return (
      <div className={cn('relative rounded-3xl overflow-hidden', className)}>
        {/* Blurred content behind */}
        <div className="pointer-events-none select-none opacity-40 blur-sm">
          {children}
        </div>
        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl mb-3">
            {info.icon}
          </div>
          <div className="text-xs font-black uppercase tracking-widest text-primary mb-1">Premium Feature</div>
          <h3 className="text-lg font-black text-slate-900 mb-1">{info.label}</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4 max-w-[220px]">{info.description}</p>
          <button
            onClick={() => window.location.href = '/upgrade'}
            className="h-10 px-6 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            🔓 Unlock — $4.99/mo
          </button>
        </div>
      </div>
    );
  }

  // Default: blur variant — inline lock badge
  return (
    <div className={cn('relative group cursor-pointer', className)} onClick={() => window.location.href = '/upgrade'}>
      <div className="pointer-events-none select-none opacity-30 blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-[260px]">
          <span className="text-xl">{info.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-primary">Premium</div>
            <div className="text-sm font-black text-slate-900 truncate">{info.label}</div>
          </div>
          <div className="text-slate-400 text-lg">🔒</div>
        </div>
      </div>
    </div>
  );
}

/**
 * A small premium badge — use next to nav items or feature names to signal premium.
 */
export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200',
      className
    )}>
      ✨ Premium
    </span>
  );
}
