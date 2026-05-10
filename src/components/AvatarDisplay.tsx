'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { type AvatarConfig } from '@/config/avatars';

interface AvatarDisplayProps {
  avatar: AvatarConfig;
  size?: number;
  className?: string;
  showRing?: boolean;
}

export function AvatarDisplay({ avatar, size = 64, className, showRing }: AvatarDisplayProps) {
  const ringClass = showRing ? avatar.ringColor : '';

  return (
    <div
      className={cn(
        `bg-gradient-to-br ${avatar.bgGradient} rounded-2xl overflow-hidden flex-shrink-0`,
        showRing && `ring-2 ring-offset-2 ${ringClass}`,
        className
      )}
      style={{ width: size, height: size }}
      aria-label={avatar.name}
    >
      <Image
        src={avatar.imagePath}
        alt={avatar.name}
        width={size}
        height={size}
        className="w-full h-full object-contain"
        priority={false}
      />
    </div>
  );
}

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
      <span className="text-[9px] text-slate-400 truncate max-w-[60px] text-center">{avatar.archetype}</span>
      {selected && (
        <span className="text-[9px] font-black uppercase tracking-wider text-primary">Selected</span>
      )}
    </button>
  );
}
