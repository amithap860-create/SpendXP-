import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SecurityUtils } from '@/lib/security';
import { emailService } from '@/lib/email';
import { checkRateLimit, passwordResetRateLimiter } from '@/lib/rateLimiting';
import { UserProfile, PasswordResetRequest } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(passwordResetRateLimiter, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = SecurityUtils.sanitizeInput(email.toLowerCase());

    // Get user from database
    const userDoc = await getDoc(doc(db, 'users', sanitizedEmail));
    if (!userDoc.exists()) {
      // Always return success to prevent email enumeration attacks
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    const user = userDoc.data() as UserProfile;

    // Check if account is active
    if (!user.accountActive) {
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Generate password reset token
    const { token: resetToken, expires: tokenExpires } = SecurityUtils.generatePasswordResetToken();

    // Create password reset request record
    const resetRequest: PasswordResetRequest = {
      id: SecurityUtils.generateSecureToken(16),
      email: sanitizedEmail,
      token: resetToken,
      expiresAt: tokenExpires as any,
      createdAt: serverTimestamp() as any,
      used: false,
      ipAddress: SecurityUtils.extractIP(request),
      userAgent: SecurityUtils.extractUserAgent(request)
    };

    // Save password reset request
    await setDoc(doc(db, 'passwordResets', resetRequest.id), resetRequest);

    // Send password reset email
    const emailSent = await emailService.sendPasswordReset(
      sanitizedEmail,
      resetToken,
      user.displayName
    );

    if (!emailSent) {
      console.error('Failed to send password reset email');
      // Don't reveal the error to the user
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
      resetId: resetRequest.id // Include this for the reset page to validate
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
