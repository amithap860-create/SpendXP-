import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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
    
    // Check for common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password cannot contain common words');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Security question hashing
  static async hashSecurityAnswer(answer: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(answer.toLowerCase().trim(), salt);
  }

  static async verifySecurityAnswer(answer: string, hashedAnswer: string): Promise<boolean> {
    return await bcrypt.compare(answer.toLowerCase().trim(), hashedAnswer);
  }

  // Generate secure tokens
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate email verification token
  static generateEmailVerificationToken(): { token: string; expires: Date } {
    const token = this.generateSecureToken(32);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return { token, expires };
  }

  // Generate password reset token
  static generatePasswordResetToken(): { token: string; expires: Date } {
    const token = this.generateSecureToken(32);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return { token, expires };
  }

  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  // Rate limiting key generator
  static generateRateLimitKey(identifier: string, action: string): string {
    return `rate_limit:${action}:${identifier}`;
  }

  // Check if account should be locked
  static shouldLockAccount(failedAttempts: number, lastFailed: Date | null): boolean {
    if (failedAttempts < 5) return false;
    
    if (!lastFailed) return true;
    
    const lockoutDuration = 30 * 60 * 1000; // 30 minutes
    const timeSinceLastFailed = Date.now() - lastFailed.getTime();
    
    return timeSinceLastFailed < lockoutDuration;
  }

  // Calculate lockout expiration
  static calculateLockoutExpiration(): Date {
    return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
  }

  // Validate security questions
  static validateSecurityQuestions(questions: SecurityQuestion[]): boolean {
    if (questions.length !== 2) return false;
    
    const validQuestions = [
      "What is your mother's maiden name?",
      "What city were you born in?",
      "What was your first pet's name?",
      "What elementary school did you attend?",
      "What is your favorite teacher's name?",
      "What street did you grow up on?"
    ];
    
    return questions.every(q => 
      validQuestions.includes(q.question) && 
      q.hashedAnswer.length > 0
    );
  }

  // Extract IP from request
  static extractIP(request: any): string {
    return request.headers['x-forwarded-for']?.split(',')[0] ||
           request.headers['x-real-ip'] ||
           request.connection?.remoteAddress ||
           request.ip ||
           'unknown';
  }

  // Extract user agent from request
  static extractUserAgent(request: any): string {
    return request.headers['user-agent'] || 'unknown';
  }

  // Get location from IP (basic implementation)
  static async getLocationFromIP(ip: string): Promise<string> {
    // In production, you'd use a service like ip-api.com or MaxMind
    // For now, return a generic location
    return 'Unknown Location';
  }
}
