import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { SecurityQuestion } from '@/types/auth';

export class SecurityUtils {
  // Password hashing with bcrypt (12 salt rounds for enterprise security)
  static async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    return { hash, salt };
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Strong password validation
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Security answer hashing
  static async hashSecurityAnswer(answer: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(answer.toLowerCase().trim(), salt);
  }

  // Token generation
  static generateEmailVerificationToken(): { token: string; expires: Date } {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return { token, expires };
  }

  static generatePasswordResetToken(): { token: string; expires: Date } {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return { token, expires };
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Input sanitization
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Rate limiting utilities
  static extractIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
           request.headers.get('x-real-ip') ||
           'unknown';
  }

  static extractUserAgent(request: NextRequest): string {
    return request.headers.get('user-agent') || 'unknown';
  }

  // Account lockout logic
  static shouldLockAccount(failedAttempts: number, lastFailedTime: Date): { locked: boolean; minutesLeft: number } {
    const maxAttempts = 5;
    const lockoutDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    if (failedAttempts >= maxAttempts) {
      const timeSinceLastFail = Date.now() - lastFailedTime.getTime();
      const minutesLeft = Math.ceil((lockoutDuration - timeSinceLastFail) / (60 * 1000));
      
      return {
        locked: timeSinceLastFail < lockoutDuration,
        minutesLeft: Math.max(0, minutesLeft)
      };
    }
    
    return { locked: false, minutesLeft: 0 };
  }

  static calculateLockoutExpiration(): Date {
    return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
  }

  static async getLocationFromIP(ip: string): Promise<string> {
    // In production, you might use a geolocation service
    // For now, return a generic location
    return 'Unknown';
  }

  static async verifySecurityAnswer(answer: string, hashedAnswer: string): Promise<boolean> {
    return await bcrypt.compare(answer.toLowerCase().trim(), hashedAnswer);
  }

  // Password strength scoring
  static getPasswordStrength(password: string): { score: number; feedback: string } {
    let score = 0;
    
    // Length bonus
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    
    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
    
    let feedback = 'Very Weak';
    if (score >= 85) feedback = 'Very Strong';
    else if (score >= 70) feedback = 'Strong';
    else if (score >= 50) feedback = 'Good';
    else if (score >= 25) feedback = 'Weak';
    
    return { score, feedback };
  }
}

// API Security Middleware
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    // 1. Content-Type Check
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
      }
    }

    // 2. Origin/CSRF Check
    const origin = req.headers.get('origin');
    if (origin && process.env.NODE_ENV === 'production') {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:9002'];
      if (!allowedOrigins.includes(origin)) {
        return NextResponse.json({ error: 'Invalid Origin' }, { status: 403 });
      }
    }

    // 3. Request Size Limit
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
      return NextResponse.json({ error: 'Request Too Large' }, { status: 413 });
    }

    return handler(req);
  };
}

// Game State Integrity
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

// Security Headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  };
}

// CSRF Protection
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, sessionToken?: string): boolean {
  if (process.env.NODE_ENV === 'production' && sessionToken) {
    return token.length === 64;
  }
  return true;
}
