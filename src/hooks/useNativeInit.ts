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
} from '@/lib/native';

interface UseNativeInitOptions {
  /** Firebase uid — needed to save push token. Pass null if not signed in. */
  uid: string | null;
  /** Current streak count — used to personalise the local reminder message. */
  streak?: number;
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
  onNetworkChange: onNetChange,
  onPushMessage,
  onResume,
}: UseNativeInitOptions) {
  // ── Status bar + splash ────────────────────────────────────────────────
  useEffect(() => {
    if (!isNative()) return;
    initStatusBar();
    // Give React a beat to hydrate before hiding splash
    const t = setTimeout(() => hideSplash(), 400);
    return () => clearTimeout(t);
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
  // Reschedules every time the user opens the app so the streak count
  // and timing stay fresh. Fires at 7 PM local time if they haven't
  // completed anything today.
  useEffect(() => {
    if (!uid || !isNative()) return;
    scheduleStreakReminder(streak);
  }, [uid, streak]);

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
