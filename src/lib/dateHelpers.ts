'use client';

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
  // Midnight IST is 18:30 UTC
  const istMidnight = new Date(now);
  istMidnight.setUTCHours(18, 30, 0, 0);
  
  if (istMidnight <= now) {
    istMidnight.setUTCDate(istMidnight.getUTCDate() + 1);
  }
  
  return istMidnight;
};
