'use client';

/**
 * Checks if an error is a Firestore permission error.
 */
export function isPermissionsError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('Missing or insufficient') ||
     (error as any).code === 'permission-denied')
  );
}

/**
 * Handles Firestore permission errors gracefully.
 */
export function handlePermissionsError(
  error: unknown,
  context: string
): void {
  if (isPermissionsError(error)) {
    console.error(
      `[SpendXP] Firestore permission denied in ${context}.`,
      'Check firestore.rules and ensure user is signed in.',
      error
    );
    // Graceful failure - do not crash the UI
    return;
  }
  throw error; // Rethrow non-permission errors
}