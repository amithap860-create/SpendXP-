import { z } from 'zod';

export interface SecurityQuestion {
  id: string;
  question: string;
  answer?: string;
}

export interface LoginRecord {
  timestamp: string;
  ip: string;
  userAgent: string;
  success: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  age?: number;

  passwordHash: string;
  passwordSalt: string;

  createdAt: string;
  updatedAt: string;
  lastPasswordChange: string;

  emailVerified: boolean;

  failedLoginAttempts: number;
  accountLocked: boolean;

  loginHistory: LoginRecord[];

  securityQuestions: SecurityQuestion[];

  refreshTokens: string[];

  childUids: string[];

  role?: "user" | "parent" | "child" | "admin";

  // Additional fields from existing implementations
  uid?: string;
  birthYear?: number;
  // Written directly by onboarding (onboarding/page.tsx) and the Profile
  // page's age-edit flow (profile/page.tsx) — was already a real Firestore
  // field, just never declared here. profile/page.tsx already reads this
  // directly to show "Junior/Teen/Senior (age range)" on the Profile screen.
  ageGroup?: 'junior' | 'teen' | 'senior';
  country?: string;
  currency?: string;
  balance?: number;
  savingsGoal?: number;
  savingsCurrent?: number;
  liabilities?: number;
  xp?: number;
  level?: number;
  onboardingComplete?: boolean;
}

// Zod schema for runtime validation
export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  passwordHash: z.string(),
  passwordSalt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastPasswordChange: z.string(),
  emailVerified: z.boolean(),
  failedLoginAttempts: z.number(),
  accountLocked: z.boolean(),
  loginHistory: z.array(z.any()),
  securityQuestions: z.array(z.any()),
  refreshTokens: z.array(z.string()),
  childUids: z.array(z.string()),
  role: z.enum(["user", "parent", "child", "admin"]).optional(),
  age: z.number().optional(),
  uid: z.string().optional(),
  birthYear: z.number().optional(),
  ageGroup: z.enum(['junior', 'teen', 'senior']).optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
  balance: z.number().optional(),
  savingsGoal: z.number().optional(),
  savingsCurrent: z.number().optional(),
  liabilities: z.number().optional(),
  xp: z.number().optional(),
  level: z.number().optional(),
  onboardingComplete: z.boolean().optional()
});
