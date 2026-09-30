'use client';

import { useEffect } from 'react';
import {
  isNative,
  getPlatform,
  initStatusBar,
  hideSplash,
  setupPushNotifications,
  scheduleStreakReminder,
  onNetworkChange,
  onAppResume,
  onAndroidBack,
  disableServiceWorkerIfNative,
} from '@/lib/native';

interface UseNativeInitOptions {
  /** Firebase uid — needed to save push token. Pass null if not signed in. */
  uid: string | null;
  /** Current streak count — used to personalise the local reminder message. */
  streak?: number;
  /** User's chosen daily reminder time (24-hour, local device time). Defaults to 19:00. */
  reminderHour?: number;
  reminderMinute?: number;
  /** Called when network connectivity changes. */
  onNetworkChange?: (connected: boolean) => void;
  /** Called when user taps a push notification. */
  onPushMessage?: (data: Record<string, string>) => void;
  /** Called when app returns from background. */
  onResume?: () => void;
}

/**
 * Initialises all Capacitor native features on mount.
 * Safe to call on web — every function no-ops when not in native shell.
 */
export function useNativeInit({
  uid,
  streak = 0,
  reminderHour = 19,
  reminderMinute = 0,
  onNetworkChange: onNetChange,
  onPushMessage,
  onResume,
}: UseNativeInitOptions) {
  // ── Service worker teardown (must run first — see native.ts) ───────────
  useEffect(() => {
    // TEMP INSTRUMENTATION (2026-09-30): logs real on-device timings so we
    // stop guessing at the app-open lag. Read via chrome://inspect while
    // the phone is USB-connected — do NOT leave this in past the next
    // diagnosis round, remove once the lag is confirmed fixed or the real
    // cause is found.
    if (isNative()) console.time('[perf] sw-teardown');
    disableServiceWorkerIfNative().then(() => {
      if (isNative()) console.timeEnd('[perf] sw-teardown');
    });
  }, []);

  // ── Status bar + splash ────────────────────────────────────────────────
  // FIX (2026-09-30): this used to wait a flat, unconditional 400ms after
  // mount before hiding the splash screen — every single launch, regardless
  // of device speed or network. That was pure padding: this effect already
  // only fires after React has committed and painted RootLayoutContent, so
  // "give React a beat to hydrate" was already true by the time we got here.
  // Down to a single animation frame (~16ms) so the splash comes down as
  // soon as the real content is actually on screen instead of on a fixed
  // clock. If a real flash-of-unstyled-content reappears, that's a separate,
  // measurable problem — do not put the 400ms back as a blind fix.
  useEffect(() => {
    if (!isNative()) return;
    initStatusBar();
    console.time('[perf] splash-to-hide');
    const raf = requestAnimationFrame(() => {
      hideSplash();
      console.timeEnd('[perf] splash-to-hide');
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── FCM push notifications (server-to-device) ──────────────────────────
  useEffect(() => {
    if (!uid || !isNative()) return;

    setupPushNotifications(onPushMessage ?? (() => {})).then(async ({ token }) => {
      if (!token) return;
      try {
        await fetch('/api/push-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid,
            token,
            platform: getPlatform(),
          }),
        });
      } catch {
        // Non-fatal — push token will be registered on next launch
      }
    });
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Local streak reminder (device-scheduled, no server needed) ────────
  // Reschedules every time the user opens the app, or changes their
  // reminder time in Profile, so the streak count and timing stay fresh.
  // Defaults to 7 PM local time if the user hasn't set their own.
  useEffect(() => {
    if (!uid || !isNative()) return;
    scheduleStreakReminder(streak, reminderHour, reminderMinute);
  }, [uid, streak, reminderHour, reminderMinute]);

  // ── Network status ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!onNetChange) return;
    let cleanup = () => {};
    onNetworkChange(onNetChange).then((fn) => { cleanup = fn; });
    return () => cleanup();
  }, [onNetChange]);

  // ── App resume ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!onResume) return;
    let cleanup = () => {};
    onAppResume(onResume).then((fn) => { cleanup = fn; });
    return () => cleanup();
  }, [onResume]);

  // ── Android back button ────────────────────────────────────────────────
  useEffect(() => {
    if (getPlatform() !== 'android') return;
    let cleanup = () => {};
    // Default: allow default browser/OS back behaviour
    onAndroidBack(() => false).then((fn) => { cleanup = fn; });
    return () => cleanup();
  }, []);
}
