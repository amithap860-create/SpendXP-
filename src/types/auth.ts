import { DocumentData, Timestamp } from 'firebase/firestore';

export interface SecurityQuestion {
  question: string;
  hashedAnswer: string;
}

export interface LoginAttempt {
  timestamp: Timestamp;
  ip: string;
  userAgent: string;
  success: boolean;
  location?: string;
}

export interface UserProfile extends DocumentData {
  // Basic info
  id: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Security fields
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Timestamp;
  
  // Password security
  passwordHash: string;
  passwordSalt: string;
  failedLoginAttempts: number;
  lastFailedLogin?: Timestamp;
  accountLocked: boolean;
  accountLockedUntil?: Timestamp;

  // Security questions
  securityQuestions: SecurityQuestion[];

  // Login tracking
  loginHistory: LoginAttempt[];
  lastLoginAt?: Timestamp;
  lastLoginIP?: string;

  // Account status
  accountActive: boolean;
  softDeleteRequested?: Timestamp;
  softDeleteCompleted?: Timestamp;

  // Session management
  refreshTokens: string[];
  lastPasswordChange: Timestamp;

  // Profile data (existing fields)
  balance?: number;
  xp?: number;
  level?: number;
  age?: number;
  ageGroup?: string;
  currency?: string;
  savingsCurrent?: number;
  savingsGoal?: number;
  parentUid?: string;
  childUids?: string[];
  isParent?: boolean;
}

export interface PasswordResetRequest {
  id: string;
  email: string;
  token: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  used: boolean;
  ipAddress: string;
  userAgent: string;
}
