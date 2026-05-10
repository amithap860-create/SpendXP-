import type { CapacitorConfig } from '@capacitor/cli';

/**
 * SpendXP — Capacitor Configuration
 *
 * Architecture: Remote URL (server.url) pointing to the Vercel deployment.
 * The native shell loads the live web app and adds genuine native capabilities
 * on top: push notifications, haptics, status bar, deep links, splash screen.
 *
 * UPDATE server.url to your actual Vercel domain before building.
 */

const config: CapacitorConfig = {
  appId: 'com.spendxp.app',
  appName: 'SpendXP',

  // Points to the public/ folder as a static fallback.
  // The live app is served from server.url below.
  webDir: 'public',

  server: {
    // ⚠️  Replace with your actual Vercel URL (no trailing slash)
    url: 'https://spendxp.vercel.app',
    cleartext: false,
    androidScheme: 'https',
    // Allow the native bridge to work across the remote domain
    allowNavigation: [
      'spendxp.vercel.app',
      '*.firebaseapp.com',
      '*.googleapis.com',
    ],
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#1A1F2E',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#C8A84B',
    },

    StatusBar: {
      style: 'Dark',
      backgroundColor: '#1A1F2E',
      overlaysWebView: false,
    },

    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },

    // LocalNotifications for streak reminders (no server needed)
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#C8A84B',
      sound: 'beep.wav',
    },
  },

  ios: {
    // Handles the notch / dynamic island safe areas
    contentInset: 'always',
    backgroundColor: '#1A1F2E',
    // Allow HTTP for local dev, HTTPS only in prod
    allowsLinkPreview: false,
    handleApplicationNotifications: false, // We handle push ourselves
    preferredContentMode: 'mobile',
  },

  android: {
    backgroundColor: '#1A1F2E',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // Set true for debug builds only
    initialFocus: true,
    // Ensures bottom nav doesn't overlap system gesture bar
    appendUserAgent: 'SpendXP-Android',
  },
};

export default config;
