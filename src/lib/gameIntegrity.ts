/**
 * Client-safe game integrity utilities.
 * Uses only Web Crypto API (crypto.subtle) and standard browser APIs.
 * Safe to import in 'use client' components.
 */

// Game State Integrity — uses Web Crypto (available in browser + edge)
export async function hashGameState(state: object): Promise<string> {
  const msgUint8 = new TextEncoder().encode(JSON.stringify(state));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Developer Tools Detection
export function detectDevTools(): boolean {
  const threshold = 160;
  const start = performance.now();

  debugger;

  const end = performance.now();
  return end - start > threshold;
}
