/**
 * @fileOverview Session security logic including fingerprinting and validation.
 */

export type SessionFingerprint = {
  userAgent: string;
  language: string;
  timezone: string;
  createdAt: number;
};

/**
 * Captures a unique fingerprint of the current browser session.
 */
export function captureFingerprint(): SessionFingerprint {
  if (typeof window === 'undefined') {
    return { userAgent: '', language: '', timezone: '', createdAt: Date.now() };
  }

  return {
    userAgent: window.navigator.userAgent,
    language: window.navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: Date.now(),
  };
}

/**
 * Validates a stored fingerprint against the current environment.
 * Detects if a session token has been moved to a different browser or machine.
 */
export function validateFingerprint(stored: SessionFingerprint | null): boolean {
  if (!stored) return true;

  const current = captureFingerprint();

  // Screen width is excluded as users frequently resize windows
  // We check User Agent and Timezone as primary indicators of session travel
  const isMatch =
    current.userAgent === stored.userAgent &&
    current.timezone === stored.timezone;

  return isMatch;
}
