/**
 * @fileOverview Active threat detection and game state integrity checking.
 */

/**
 * Creates a cryptographically secure hash of the game state.
 * Prevents casual DOM/Console manipulation of scores.
 */
export async function hashGameState(state: object): Promise<string> {
  const msgUint8 = new TextEncoder().encode(JSON.stringify(state));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Passive detector for Developer Tools presence.
 * Measures execution time of a debugger statement to infer if the console is open.
 */
export function setupDevToolsDetector(onDetected: (isOpen: boolean) => void) {
  if (typeof window === 'undefined') return () => {};

  const interval = setInterval(() => {
    const start = performance.now();
    // eslint-disable-next-line no-debugger
    debugger; 
    const end = performance.now();

    // If debugger is active, execution takes significantly longer (>100ms)
    if (end - start > 100) {
      onDetected(true);
    } else {
      onDetected(false);
    }
  }, 3000);

  return () => clearInterval(interval);
}
