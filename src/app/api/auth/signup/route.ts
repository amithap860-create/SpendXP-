import { NextRequest, NextResponse } from 'next/server';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SecurityUtils } from '@/lib/security';
import { emailService } from '@/lib/email';
import { checkRateLimit, signupRateLimiter } from '@/lib/rateLimiting';
import { UserProfile, SecurityQuestion } from '@/types/auth';

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was your first pet's name?",
  "What elementary school did you attend?",
  "What is your favorite teacher's name?",
  "What street did you grow up on?"
];

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(signupRateLimiter, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, password, displayName, isParent, securityQuestions } = await request.json();

    // Input validation
    if (!email || !password || !displayName || !securityQuestions) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = SecurityUtils.sanitizeInput(email.toLowerCase());
    const sanitizedDisplayName = SecurityUtils.sanitizeInput(displayName);

    // Validate password strength
    const passwordValidation = SecurityUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet security requirements', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Validate security questions
    if (!Array.isArray(securityQuestions) || securityQuestions.length !== 2) {
      return NextResponse.json(
        { error: 'Exactly 2 security questions are required' },
        { status: 400 }
      );
    }

    // Validate each security question
    const validatedSecurityQuestions: SecurityQuestion[] = [];
    for (const sq of securityQuestions) {
      if (!sq.question || !sq.answer) {
        return NextResponse.json(
          { error: 'Each security question must have a question and answer' },
          { status: 400 }
        );
      }

      if (!SECURITY_QUESTIONS.includes(sq.question)) {
        return NextResponse.json(
          { error: 'Invalid security question selected' },
          { status: 400 }
        );
      }

      const hashedAnswer = await SecurityUtils.hashSecurityAnswer(sq.answer);
      validatedSecurityQuestions.push({
        question: sq.question,
        hashedAnswer
      });
    }

    // Check if user already exists
    const userDoc = await getDoc(doc(db, 'users', sanitizedEmail));
    if (userDoc.exists()) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const { hash: passwordHash, salt: passwordSalt } = await SecurityUtils.hashPassword(password);

    // Generate email verification token
    const { token: emailToken, expires: tokenExpires } = SecurityUtils.generateEmailVerificationToken();

    // Create user profile
    const userProfile: UserProfile = {
      id: sanitizedEmail,
      email: sanitizedEmail,
      displayName: sanitizedDisplayName,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
      
      // Security fields
      emailVerified: false,
      emailVerificationToken: emailToken,
      emailVerificationExpires: tokenExpires as any,
      
      // Password security
      passwordHash,
      passwordSalt,
      failedLoginAttempts: 0,
      accountLocked: false,
      
      // Security questions
      securityQuestions: validatedSecurityQuestions,
      
      // Login tracking
      loginHistory: [],
      
      // Account status
      accountActive: true,
      
      // Session management
      refreshTokens: [],
      lastPasswordChange: serverTimestamp() as any,
      
      // Profile data
      balance: 0,
      xp: 0,
      level: 1,
      currency: 'USD',
      savingsCurrent: 0,
      savingsGoal: 1000,
      isParent: isParent || false,
      childUids: []
    };

    // Save user to database
    await setDoc(doc(db, 'users', sanitizedEmail), userProfile);

    // Send verification email
    const emailSent = await emailService.sendEmailVerification(
      sanitizedEmail,
      emailToken,
      sanitizedDisplayName
    );

    if (!emailSent) {
      console.error('Failed to send verification email');
      // Don't fail the signup, but log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      requiresEmailVerification: true
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve available security questions
export async function GET() {
  return NextResponse.json({
    securityQuestions: SECURITY_QUESTIONS
  });
}
