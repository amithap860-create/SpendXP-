'use client';

import { useEffect } from 'react';

/**
 * @fileOverview Passive security component that prevents console-based attacks.
 */
export function ConsoleGuard() {
  useEffect(() => {
    // 1. Console Warning Deterrent
    console.log(
      '%cStop!',
      'color: red; font-size: 48px; font-weight: bold; -webkit-text-stroke: 1px black;'
    );
    console.log(
      '%cThis is a browser feature for developers. If someone told you to paste something here, they are trying to steal your account or cheat in SpendXP games.',
      'font-size: 16px; color: #1e293b; font-family: sans-serif;'
    );

    // 2. Self-destruct helper if needed
    (window as any).spendxp_integrity = 'active';
  }, []);

  return null;
}
