'use client';

/**
 * SpendXP Native Bridge
 *
 * Thin abstraction over Capacitor plugins.
 * Every function is safe to call in a browser — it no-ops silently
 * when Capacitor is not available (web preview, Vercel).
 *
 * Import from here rather than importing Capacitor plugins directly
 * so that tree-shaking removes all native code from non-mobile builds.
 */

// ─── Platform detection ────────────────────────────────────────────────────

let _isNative: boolean | null = null;

/**
 * True when running inside a Capacitor native shell (iOS or Android).
 *
 * IMPORTANT: Do NOT cache on web until Capacitor bridge has fully initialised.
 * window.Capacitor may not be set during the first React render, so we only
 * cache a `true` result — a `false` result is re-evaluated on every call until
 * Capacitor confirms native context or SSR rules it out permanently.
 */
export function isNative(): boolean {
  if (_isNative === true) return true; // once native, always native — safe to cache
  if (typeof window === 'undefined') return false; // SSR: never native, don't cache
  const native = !!(window as any).Capacitor?.isNativePlatform?.();
  if (native) _isNative = true; // only cache the affirmative
  return native;
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  const cap = (window as any).Capacitor;
  if (!cap?.isNativePlatform?.()) return 'web';
  return cap.getPlatform?.() ?? 'web';
}

// ─── Haptics ───────────────────────────────────────────────────────────────

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback. No-ops on web.
 * Pair with every correct/wrong answer in games.
 */
export async function haptic(style: HapticStyle = 'light'): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    switch (style) {
      case 'light':   await Haptics.impact({ style: ImpactStyle.Light }); break;
      case 'medium':  await Haptics.impact({ style: ImpactStyle.Medium }); break;
      case 'heavy':   await Haptics.impact({ style: ImpactStyle.Heavy }); break;
      case 'success': await Haptics.notification({ type: NotificationType.Success }); break;
      case 'warning': await Haptics.notification({ type: NotificationType.Warning }); break;
      case 'error':   await Haptics.notification({ type: NotificationType.Error }); break;
    }
  } catch {
    // Plugin not installed — safe to ignore
  }
}

// ─── Status bar ────────────────────────────────────────────────────────────

/** Set status bar to match SpendXP's dark primary colour. */
export async function initStatusBar(): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1A1F2E' });
    await StatusBar.show();
  } catch { /* ignore */ }
}

// ─── Splash screen ─────────────────────────────────────────────────────────

/** Call once the app is fully loaded and hydrated. */
export async function hideSplash(): Promise<void> {
  if (!isNative()) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch { /* ignore */ }
}

// ─── Push notifications ────────────────────────────────────────────────────

export interface PushSetupResult {
  token: string | null;
  permission: 'granted' | 'denied' | 'prompt';
}

/**
 * Request push notification permission and return the FCM token.
 * Call this after the user is signed in, not on app launch.
 */
export async function setupPushNotifications(
  onMessage: (data: Record<string, string>) => void
): Promise<PushSetupResult> {
  if (!isNative()) return { token: null, permission: 'prompt' };

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // Check current permission
    const { receive } = await PushNotifications.checkPermissions();
    let permission: 'granted' | 'denied' | 'prompt' = receive as any;

    if (receive !== 'granted') {
      const result = await PushNotifications.requestPermissions();
      permission = result.receive as any;
      if (result.receive !== 'granted') {
        return { token: null, permission: 'denied' };
      }
    }

    await PushNotifications.register();

    return new Promise((resolve) => {
      let resolved = false;

      PushNotifications.addListener('registration', (token) => {
        if (!resolved) {
          resolved = true;
          resolve({ token: token.value, permission: 'granted' });
        }
      });

      PushNotifications.addListener('registrationError', () => {
        if (!resolved) {
          resolved = true;
          resolve({ token: null, permission: 'granted' });
        }
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        onMessage(notification.data ?? {});
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        onMessage(action.notification.data ?? {});
      });

      // Timeout fallback
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve({ token: null, permission: 'granted' });
        }
      }, 8000);
    });
  } catch {
    return { token: null, permission: 'prompt' };
  }
}

// ─── Native share ──────────────────────────────────────────────────────────

export interface ShareOptions {
  title: string;
  text: string;
  url?: string;
}

/** Share via native OS share sheet. Falls back to Web Share API on browsers. */
export async function nativeShare(opts: ShareOptions): Promise<void> {
  if (isNative()) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title: opts.title, text: opts.text, url: opts.url, dialogTitle: opts.title });
      return;
    } catch { /* fall through to web */ }
  }
  // Web Share API fallback
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: opts.title, text: opts.text, url: opts.url });
      return;
    } catch { /* user cancelled */ }
  }
  // Last resort: copy to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(`${opts.text} ${opts.url ?? ''}`);
  }
}

// ─── Network ───────────────────────────────────────────────────────────────

export async function isOnline(): Promise<boolean> {
  if (!isNative()) return typeof navigator !== 'undefined' ? navigator.onLine : true;
  try {
    const { Network } = await import('@capacitor/network');
    const status = await Network.getStatus();
    return status.connected;
  } catch {
    return navigator.onLine;
  }
}

export async function onNetworkChange(
  callback: (connected: boolean) => void
): Promise<() => void> {
  if (!isNative()) {
    const online = () => callback(true);
    const offline = () => callback(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }
  try {
    const { Network } = await import('@capacitor/network');
    const handle = await Network.addListener('networkStatusChange', (s) => callback(s.connected));
    return () => handle.remove();
  } catch {
    return () => {};
  }
}

// ─── App lifecycle ─────────────────────────────────────────────────────────

/** Listen for the app coming back to foreground (e.g. after push tap). */
export async function onAppResume(callback: () => void): Promise<() => void> {
  if (!isNative()) return () => {};
  try {
    const { App } = await import('@capacitor/app');
    const handle = await App.addListener('appStateChange', (state) => {
      if (state.isActive) callback();
    });
    return () => handle.remove();
  } catch {
    return () => {};
  }
}

/** Handle Android hardware back button. Return true to prevent default (exit). */
export async function onAndroidBack(callback: () => boolean): Promise<() => void> {
  if (getPlatform() !== 'android') return () => {};
  try {
    const { App } = await import('@capacitor/app');
    const handle = await App.addListener('backButton', ({ canGoBack }) => {
      if (!callback()) {
        if (canGoBack) history.back();
        else App.exitApp();
      }
    });
    return () => handle.remove();
  } catch {
    return () => {};
  }
}

// ─── Local notifications (streak reminder) ─────────────────────────────────

const STREAK_NOTIF_ID = 1001;

/**
 * Schedules a daily local notification at 7 PM local time to remind the user
 * to maintain their streak. Safe to call on every app open — cancels the
 * previous schedule first so we don't stack duplicates.
 *
 * Pass streak=0 to cancel notifications (e.g. after the user completes a quest).
 */
export async function scheduleStreakReminder(streak: number): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    // Always cancel the existing schedule first to avoid duplicates
    await LocalNotifications.cancel({ notifications: [{ id: STREAK_NOTIF_ID }] });

    if (streak <= 0) return; // No active streak or not yet loaded — don't schedule

    // Request permission if not already granted
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
      const { display: granted } = await LocalNotifications.requestPermissions();
      if (granted !== 'granted') return;
    }

    // Schedule at 7 PM today; if it's already past 7 PM, schedule for tomorrow
    const now = new Date();
    const target = new Date(now);
    target.setHours(19, 0, 0, 0);
    if (target <= now) {
      target.setDate(target.getDate() + 1); // Tomorrow 7 PM
    }

    const title = streak > 1
      ? `🔥 ${streak}-day streak at risk!`
      : '⚡ Start your streak today';
    const body = streak > 1
      ? 'Complete a quest or game before midnight to keep your streak alive.'
      : 'Jump in for 5 minutes — your first streak day is waiting.';

    await LocalNotifications.schedule({
      notifications: [
        {
          id: STREAK_NOTIF_ID,
          title,
          body,
          schedule: { at: target, repeats: false },
          sound: 'default',
          smallIcon: 'ic_stat_icon',
          actionTypeId: 'OPEN_APP',
          extra: { screen: '/dashboard', type: 'streak_reminder' },
        },
      ],
    });
  } catch {
    // Plugin not installed or permissions unavailable — fail silently
  }
}

/**
 * Cancels the streak reminder (call after the user completes their daily activity).
 */
export async function cancelStreakReminder(): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: [{ id: STREAK_NOTIF_ID }] });
  } catch { /* ignore */ }
}
