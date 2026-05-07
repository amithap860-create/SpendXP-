'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { type AvatarConfig } from '@/config/avatars';

interface AvatarDisplayProps {
  avatar: AvatarConfig;
  size?: number;            // px — applied to width & height
  className?: string;
  showRing?: boolean;       // apply ringColor when selected
}

/**
 * Renders an avatar character.
 *
 * Priority:
 *   1. avatar.imagePath image (PNG from /public/avatars/{id}.png)
 *   2. Fallback: coloured circle with avatar.fallbackInitial
 *
 * To add real avatar art: place a 200×200 PNG at /public/avatars/{id}.png
 * and it will be picked up automatically — no code change needed.
 */
export function AvatarDisplay({ avatar, size = 64, className, showRing }: AvatarDisplayProps) {
  const [imgError, setImgError] = useState(false);

  const ringClass = showRing ? avatar.ringColor : '';

  if (!imgError) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden flex-shrink-0',
          showRing && `ring-2 ring-offset-2 ${ringClass}`,
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={avatar.imagePath}
          alt={avatar.name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setImgError(true)}
          priority={size >= 80}
        />
      </div>
    );
  }

  // Fallback — coloured gradient circle with initial
  return (
    <div
      className={cn(
        `bg-gradient-to-br ${avatar.bgGradient} rounded-full flex items-center justify-center flex-shrink-0 select-none`,
        showRing && `ring-2 ring-offset-2 ${ringClass}`,
        className
      )}
      style={{ width: size, height: size }}
      aria-label={avatar.name}
    >
      <span
        className="font-black text-white leading-none"
        style={{ fontSize: Math.round(size * 0.38) }}
      >
        {avatar.fallbackInitial}
      </span>
    </div>
  );
}

/**
 * Compact avatar selector card — used in onboarding / profile avatar picker.
 */
export function AvatarPickerCard({
  avatar,
  selected,
  onSelect,
}: {
  avatar: AvatarConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all',
        selected
          ? `border-primary bg-primary/5 ring-2 ring-offset-1 ${avatar.ringColor}`
          : 'border-slate-100 hover:border-slate-300 bg-white'
      )}
    >
      <AvatarDisplay avatar={avatar} size={56} />
      <span className="text-[11px] font-black text-slate-700 truncate max-w-[60px]">{avatar.name}</span>
      {selected && (
        <span className="text-[9px] font-black uppercase tracking-wider text-primary">Selected</span>
      )}
    </button>
  );
}
