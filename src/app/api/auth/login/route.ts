import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SecurityUtils } from '@/lib/security';
import { emailService } from '@/lib/email';
import { checkRateLimit, loginRateLimiter } from '@/lib/rateLimiting';
import { UserProfile, LoginAttempt } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, loginRateLimiter);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = SecurityUtils.sanitizeInput(email.toLowerCase());

    // Get user from database
    const userDoc = await getDoc(doc(db, 'users', sanitizedEmail));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = userDoc.data() as UserProfile;

    // Check if account is active
    if (!user.accountActive) {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Check if account is locked
    if (user.accountLocked && user.accountLockedUntil) {
      const now = new Date();
      if (now < user.accountLockedUntil.toDate()) {
        return NextResponse.json(
          { 
            error: 'Account is temporarily locked due to too many failed login attempts',
            lockedUntil: user.accountLockedUntil.toDate()
          },
          { status: 423 }
        );
      }
    }

    // Verify password
    const isPasswordValid = await SecurityUtils.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = SecurityUtils.shouldLockAccount(failedAttempts, user.lastFailedLogin?.toDate() || null);
      
      const updateData: any = {
        failedLoginAttempts: failedAttempts,
        lastFailedLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (shouldLock) {
        updateData.accountLocked = true;
        updateData.accountLockedUntil = SecurityUtils.calculateLockoutExpiration();
      }

      // Add failed login attempt to history
      const loginAttempt: LoginAttempt = {
        timestamp: serverTimestamp() as any,
        ip: SecurityUtils.extractIP(request),
        userAgent: SecurityUtils.extractUserAgent(request),
        success: false
      };

      await updateDoc(doc(db, 'users', sanitizedEmail), {
        ...updateData,
        loginHistory: arrayUnion(loginAttempt)
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address before logging in' },
        { status: 403 }
      );
    }

    // Successful login - reset failed attempts
    const loginAttempt: LoginAttempt = {
      timestamp: serverTimestamp() as any,
      ip: SecurityUtils.extractIP(request),
      userAgent: SecurityUtils.extractUserAgent(request),
      success: true,
      location: await SecurityUtils.getLocationFromIP(SecurityUtils.extractIP(request))
    };

    await updateDoc(doc(db, 'users', sanitizedEmail), {
      failedLoginAttempts: 0,
      accountLocked: false,
      accountLockedUntil: null,
      lastLoginAt: serverTimestamp(),
      lastLoginIP: SecurityUtils.extractIP(request),
      loginHistory: arrayUnion(loginAttempt),
      updatedAt: serverTimestamp()
    });

    // Send login confirmation email
    const emailSent = await emailService.sendLoginConfirmation(
      sanitizedEmail,
      user.displayName,
      new Date(),
      SecurityUtils.extractIP(request),
      loginAttempt.location || 'Unknown Location'
    );

    if (!emailSent) {
      console.error('Failed to send login confirmation email');
      // Don't fail the login, but log the error
    }

    // Return user data (excluding sensitive information)
    const { passwordHash, passwordSalt, securityQuestions, refreshTokens, ...safeUserData } = user;

    return NextResponse.json({
      success: true,
      user: safeUserData,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
