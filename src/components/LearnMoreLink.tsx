'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearnMoreLinkProps {
  /** Label shown on the link */
  label?: string;
  /** Where to go — can be an in-app route like '/learn' or a full URL */
  href: string;
  /** Short blurb about what the user will learn */
  description?: string;
  /** Visual variant */
  variant?: 'inline' | 'card' | 'chip';
  className?: string;
}

/**
 * Reusable "Learn More" link component.
 * Use this anywhere in the app where a concept is mentioned that deserves
 * deeper reading — in game explanations, quest feedback, lesson bodies, etc.
 *
 * For in-app routes, uses Next.js Link.
 * For external URLs (starting with http), opens in a new tab.
 */
export function LearnMoreLink({ label = 'Learn more', href, description, variant = 'inline', className }: LearnMoreLinkProps) {
  const isExternal = href.startsWith('http');

  const linkProps = isExternal
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  if (variant === 'chip') {
    return (
      <Link
        href={href}
        {...linkProps}
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold',
          'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors',
          className
        )}
      >
        <BookOpen className="h-3 w-3" />
        {label}
        {isExternal ? <ExternalLink className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
      </Link>
    );
  }

  if (variant === 'card') {
    return (
      <Link
        href={href}
        {...linkProps}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl border bg-white hover:shadow-md transition-shadow group',
          className
        )}
      >
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black text-primary">{label}</div>
          {description && <div className="text-[10px] text-slate-500 truncate">{description}</div>}
        </div>
        {isExternal ? (
          <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
        ) : (
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
        )}
      </Link>
    );
  }

  // inline (default)
  return (
    <Link
      href={href}
      {...linkProps}
      className={cn(
        'inline-flex items-center gap-1 text-primary font-bold text-xs underline-offset-2 hover:underline',
        className
      )}
    >
      <BookOpen className="h-3 w-3" />
      {label}
      {isExternal ? <ExternalLink className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
    </Link>
  );
}
