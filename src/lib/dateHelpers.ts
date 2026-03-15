'use client';

import { Timestamp } from 'firebase/firestore';

/**
 * @fileOverview Timezone helpers to anchor app events to Indian Standard Time (IST).
 */

export const getISTDateKey = (): string => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
};

export const getNextISTMidnight = (): Date => {
  const now = new Date();
  const istMidnight = new Date(now);
  // Midnight IST is 18:30 UTC
  istMidnight.setUTCHours(18, 30, 0, 0);
  
  if (istMidnight <= now) {
    istMidnight.setUTCDate(istMidnight.getUTCDate() + 1);
  }
  
  return istMidnight;
};

export function formatRelativeTime(timestamp: Timestamp | Date | number | any): string {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Timestamp 
    ? timestamp.toDate() 
    : timestamp instanceof Date 
      ? timestamp 
      : typeof timestamp === 'number' 
        ? new Date(timestamp)
        : timestamp?.toDate ? timestamp.toDate() : new Date();
      
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatCompact(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toString();
}
