// Placeholder account lockout for compatibility
export const isAccountLocked = async (db?: any, email?: string) => false;
export const lockAccount = async () => {};
export const unlockAccount = async () => {};
export const checkLockout = async (db?: any, email?: string) => ({ locked: false, minutesLeft: 0 });
