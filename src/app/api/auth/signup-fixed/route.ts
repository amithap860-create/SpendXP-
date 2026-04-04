import { NextRequest, NextResponse } from 'next/server';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SecurityUtils } from '@/lib/security';
import { emailService } from '@/lib/email';
import { checkRateLimit, signupRateLimiter } from '@/lib/rateLimiting';
import { UserProfile } from '@/types/auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    console.log('[AUTH] Starting signup process');
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit(signupRateLimiter, request);
    if (!rateLimitResult.allowed) {
      console.log('[AUTH] Rate limit exceeded');
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, password, displayName, age, confirmPassword } = await request.json();
    console.log('[AUTH] Received signup request for email:', email);

    // Input validation
    if (!email || !password || !displayName || !age || !confirmPassword) {
      console.log('[AUTH] Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[AUTH] Invalid email format');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 8 || ageNum > 20) {
      console.log('[AUTH] Invalid age:', ageNum);
      return NextResponse.json(
        { error: 'Age must be between 8 and 20' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      console.log('[AUTH] Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      console.log('[AUTH] Passwords do not match');
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = SecurityUtils.sanitizeInput(email.toLowerCase().trim());
    const sanitizedDisplayName = SecurityUtils.sanitizeInput(displayName.trim());

    // Check if user already exists
    console.log('[AUTH] Checking if user exists:', sanitizedEmail);
    const userDoc = await getDoc(doc(db, 'users', sanitizedEmail));
    if (userDoc.exists()) {
      console.log('[AUTH] User already exists:', sanitizedEmail);
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password using bcrypt
    console.log('[AUTH] Hashing password');
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate JWT token
    console.log('[AUTH] Generating JWT token');
    const token = jwt.sign(
      { 
        email: sanitizedEmail, 
        displayName: sanitizedDisplayName,
        age: ageNum 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create user profile
    const userProfile: UserProfile = {
      id: sanitizedEmail,
      email: sanitizedEmail,
      displayName: sanitizedDisplayName,
      age: ageNum,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
      
      // Security fields
      emailVerified: false,
      
      // Password security
      passwordHash,
      failedLoginAttempts: 0,
      accountLocked: false,
      
      // Login tracking
      loginHistory: [],
      
      // Account status
      accountActive: true,
      
      // Profile data
      balance: 0,
      xp: 0,
      level: 1,
      currency: 'INR',
      savingsCurrent: 0,
      savingsGoal: 1000,
      isParent: false,
      childUids: []
    };

    // Save user to database
    console.log('[AUTH] Saving user to database');
    await setDoc(doc(db, 'users', sanitizedEmail), userProfile);
    console.log('[AUTH] User created successfully:', sanitizedEmail);

    // Send verification email (optional - don't fail signup if email fails)
    try {
      console.log('[AUTH] Sending verification email');
      await emailService.sendEmailVerification(
        sanitizedEmail,
        token,
        sanitizedDisplayName
      );
      console.log('[AUTH] Verification email sent');
    } catch (emailError) {
      console.error('[AUTH] Failed to send verification email:', emailError);
      // Don't fail the signup, just log the error
    }

    console.log('[AUTH] Signup completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: sanitizedEmail,
        email: sanitizedEmail,
        displayName: sanitizedDisplayName,
        age: ageNum,
        emailVerified: false
      }
    });

  } catch (error) {
    console.error('[AUTH] Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
