/**
 * SpendXP Analytics
 *
 * Thin wrapper around Firebase Analytics that:
 *  - Only initialises on the client (SSR-safe)
 *  - Gracefully skips logging if measurementId isn't set yet
 *  - Exports typed helper functions for every core event
 *
 * HOW TO ADD YOUR MEASUREMENT ID:
 *  1. Firebase Console → Project Settings → Your Apps → Web App → measurementId
 *  2. Copy it into NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID in .env.local
 *  3. Update src/firebase/config.ts to read from that env var, OR paste it directly.
 */

import type { Analytics, EventParams } from 'firebase/analytics';

let _analytics: Analytics | null = null;
let _initAttempted = false;

async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null; // SSR guard
  if (_initAttempted) return _analytics;
  _initAttempted = true;

  try {
    const { getApps, getApp } = await import('firebase/app');
    const { isSupported, getAnalytics, initializeAnalytics } = await import('firebase/analytics');

    const supported = await isSupported();
    if (!supported) return null;

    const apps = getApps();
    if (!apps.length) return null;

    const app = getApp();
    const { firebaseConfig } = await import('@/firebase/config');

    if (!firebaseConfig.measurementId) {
      // measurementId not configured yet — analytics will be a no-op until set
      return null;
    }

    try {
      _analytics = getAnalytics(app);
    } catch {
      _analytics = initializeAnalytics(app, { config: { send_page_view: true } });
    }
    return _analytics;
  } catch (err) {
    console.warn('[SpendXP] Analytics init failed (non-fatal):', err);
    return null;
  }
}

async function logEvent(name: string, params?: EventParams & Record<string, unknown>) {
  try {
    const instance = await getAnalyticsInstance();
    if (!instance) return;
    const { logEvent: fbLogEvent } = await import('firebase/analytics');
    fbLogEvent(instance, name, params as EventParams);
  } catch (err) {
    console.warn(`[SpendXP] Analytics.logEvent(${name}) failed:`, err);
  }
}

// ─── Typed event helpers ──────────────────────────────────────────────────────

/** Called when the user starts a quest / case file */
export function trackQuestStarted(params: { questId: string; questTitle: string; difficulty: string }) {
  logEvent('quest_started', params);
}

/** Called when the user completes a quest / case file */
export function trackQuestCompleted(params: { questId: string; questTitle: string; xpEarned: number }) {
  logEvent('quest_completed', params);
}

/** Called every time a game session ends (win, lose, or exit) */
export function trackGamePlayed(params: { gameId: string; score: number; xpEarned: number; isDaily?: boolean }) {
  logEvent('game_played', params);
}

/** Called when the user's streak resets to 0 */
export function trackStreakBroken(params: { previousStreak: number; userId?: string }) {
  logEvent('streak_broken', params);
}

/** Called when the user advances to a new rank in the Order of the Golden Ledger */
export function trackRankUp(params: { newRank: string; totalXP: number }) {
  logEvent('rank_up', params);
}

/** Called when the user completes the first-run onboarding */
export function trackOnboardingCompleted(params: { ageGroup: string; country?: string }) {
  logEvent('onboarding_completed', params);
}

/** Called when the user views the upgrade/paywall screen */
export function trackUpgradeViewed(params: { source: string }) {
  logEvent('upgrade_viewed', params);
}

/** Called when the user completes a Pro purchase */
export function trackPurchaseCompleted(params: { plan: string; amount?: number; currency?: string }) {
  logEvent('purchase_completed', params);
}

/** Screen view — called on each major page mount */
export function trackScreenView(params: { screen_name: string; screen_class?: string }) {
  logEvent('screen_view', params);
}
