import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SecurityUtils } from '@/lib/security';
import { emailService } from '@/lib/email';
import { UserProfile, PasswordResetRequest } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, securityAnswers, newPassword } = await request.json();

    if (!token || !securityAnswers || !newPassword) {
      return NextResponse.json(
        { error: 'Token, security answers, and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password
    const passwordValidation = SecurityUtils.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'New password does not meet security requirements', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Find the password reset request
    // In production, you'd query by token, but for simplicity we'll assume we have the reset ID
    const { searchParams } = new URL(request.url);
    const resetId = searchParams.get('resetId');

    if (!resetId) {
      return NextResponse.json(
        { error: 'Invalid reset request' },
        { status: 400 }
      );
    }

    const resetDoc = await getDoc(doc(db, 'passwordResets', resetId));
    if (!resetDoc.exists()) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const resetRequest = resetDoc.data() as PasswordResetRequest;

    // Check if token is valid
    if (resetRequest.token !== token) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (resetRequest.expiresAt.toDate() < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Check if token has been used
    if (resetRequest.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      );
    }

    // Get user profile
    const userDoc = await getDoc(doc(db, 'users', resetRequest.email));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userDoc.data() as UserProfile;

    // Verify security answers
    if (securityAnswers.length !== user.securityQuestions.length) {
      return NextResponse.json(
        { error: 'All security questions must be answered' },
        { status: 400 }
      );
    }

    for (let i = 0; i < user.securityQuestions.length; i++) {
      const userQuestion = user.securityQuestions[i];
      const providedAnswer = securityAnswers[i];

      if (!providedAnswer || providedAnswer.trim() === '') {
        return NextResponse.json(
          { error: 'All security questions must be answered' },
          { status: 400 }
        );
      }

      const isAnswerCorrect = await SecurityUtils.verifySecurityAnswer(
        providedAnswer,
        userQuestion.hashedAnswer
      );

      if (!isAnswerCorrect) {
        return NextResponse.json(
          { error: 'One or more security answers are incorrect' },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const { hash: passwordHash, salt: passwordSalt } = await SecurityUtils.hashPassword(newPassword);

    // Update user password
    await updateDoc(doc(db, 'users', resetRequest.email), {
      passwordHash,
      passwordSalt,
      lastPasswordChange: serverTimestamp(),
      failedLoginAttempts: 0,
      accountLocked: false,
      accountLockedUntil: null,
      updatedAt: serverTimestamp()
    });

    // Mark reset request as used
    await updateDoc(doc(db, 'passwordResets', resetId), {
      used: true,
      updatedAt: serverTimestamp()
    });

    // Send password reset confirmation email
    const emailSent = await emailService.sendPasswordResetConfirmation(
      resetRequest.email,
      user.displayName
    );

    if (!emailSent) {
      console.error('Failed to send password reset confirmation email');
      // Don't fail the operation, but log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to validate reset token and show security questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const resetId = searchParams.get('resetId');

    if (!token || !resetId) {
      return NextResponse.json(
        { error: 'Token and reset ID are required' },
        { status: 400 }
      );
    }

    // Find the password reset request
    const resetDoc = await getDoc(doc(db, 'passwordResets', resetId));
    if (!resetDoc.exists()) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const resetRequest = resetDoc.data() as PasswordResetRequest;

    // Check if token is valid
    if (resetRequest.token !== token) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (resetRequest.expiresAt.toDate() < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Check if token has been used
    if (resetRequest.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      );
    }

    // Get user profile to return security questions (without answers)
    const userDoc = await getDoc(doc(db, 'users', resetRequest.email));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userDoc.data() as UserProfile;

    // Return security questions without hashed answers
    const securityQuestions = user.securityQuestions.map(q => ({
      question: q.question
    }));

    return NextResponse.json({
      valid: true,
      securityQuestions,
      email: resetRequest.email // For display purposes
    });

  } catch (error) {
    console.error('Validate reset token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
