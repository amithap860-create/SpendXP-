import { UserProfile } from '@/types/user';

/**
 * Normalizes a user profile by adding missing fields with safe defaults
 */
export function normalizeUserProfile(user: Partial<UserProfile>): UserProfile {
  const now = new Date().toISOString();
  
  return {
    id: user.id || '',
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'Unknown',
    age: user.age,
    
    passwordHash: user.passwordHash || '',
    passwordSalt: user.passwordSalt || '',
    
    createdAt: user.createdAt || now,
    updatedAt: user.updatedAt || now,
    lastPasswordChange: user.lastPasswordChange || now,
    
    emailVerified: user.emailVerified || false,
    
    failedLoginAttempts: user.failedLoginAttempts || 0,
    accountLocked: user.accountLocked || false,
    
    loginHistory: user.loginHistory || [],
    securityQuestions: user.securityQuestions || [],
    refreshTokens: user.refreshTokens || [],
    childUids: user.childUids || [],
    
    role: user.role || 'user',
    
    // Additional optional fields
    uid: user.uid || user.id,
    birthYear: user.birthYear,
    country: user.country,
    currency: user.currency,
    balance: user.balance,
    savingsGoal: user.savingsGoal,
    savingsCurrent: user.savingsCurrent,
    liabilities: user.liabilities,
    xp: user.xp,
    level: user.level,
    onboardingComplete: user.onboardingComplete
  };
}
