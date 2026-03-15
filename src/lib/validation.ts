
/**
 * @fileOverview Security validation and sanitisation logic for SpendXP.
 */

export function sanitiseString(input: string, maxLength: number): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Strip HTML
    .replace(/javascript:/gi, '') // Strip JS protocol
    .replace(/on\w+\s*=/gi, '') // Strip event handlers
    .replace(/data:/gi, '') // Strip data URIs
    .slice(0, maxLength);
}

export function validateDisplayName(name: string): { valid: boolean; error?: string } {
  const sanitised = sanitiseString(name, 30);
  if (sanitised.length < 2) return { valid: false, error: 'Name too short (min 2 characters)' };
  
  const regex = /^[a-zA-Z0-9 \-_]{2,30}$/;
  if (!regex.test(sanitised)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  
  return { valid: true };
}

export function validateBirthYear(year: number): { valid: boolean; error?: string } {
  if (typeof year !== 'number' || isNaN(year)) return { valid: false, error: 'Invalid birth year' };
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  
  if (age < 8 || age > 20) {
    return { valid: false, error: 'SpendXP is for ages 8 to 20' };
  }
  
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.length > 254) return { valid: false, error: 'Invalid email length' };
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return { valid: false, error: 'Invalid email format' };
  
  return { valid: true };
}

export function validatePassword(password: string): {
  valid: boolean
  error?: string
  strength: 'weak' | 'fair' | 'strong'
} {
  if (!password || password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters.',
      strength: 'weak'
    }
  }
  const hasNumber = /\d/.test(password)
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)
  const hasUpperAndLower =
    /[A-Z]/.test(password) && /[a-z]/.test(password)

  if (!hasNumber || !hasLetter) {
    return {
      valid: false,
      error: 'Password must contain letters and numbers.',
      strength: 'weak'
    }
  }

  const strength =
    hasSpecial && hasUpperAndLower ? 'strong' :
    hasNumber && hasLetter ? 'fair' :
    'weak'

  return { valid: true, strength }
}

export const GAME_MAX_SCORES: Record<string, number> = {
  budgetBlitz: 50000,
  finIQ: 10000,
  moneyMaze: 10000,
  stockMarketSim: 10000000,
  creditScoreBuilder: 850,
  compoundClicker: 10000000,
};

export function validateScore(gameName: string, score: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(score) || score < 0) return { valid: false, error: 'Score must be a positive integer' };
  
  const max = GAME_MAX_SCORES[gameName];
  if (max && score > max) return { valid: false, error: `Score exceeds theoretical maximum for ${gameName}` };
  
  return { valid: true };
}

export function validateXP(xp: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(xp) || xp < 0) return { valid: false, error: 'XP must be a positive integer' };
  if (xp > 1000) return { valid: false, error: 'Suspiciously high XP gain' };
  
  return { valid: true };
}
