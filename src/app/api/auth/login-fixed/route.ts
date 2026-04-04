import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SecurityUtils } from '@/lib/security';
import { checkRateLimit, loginRateLimiter } from '@/lib/rateLimiting';
import { UserProfile } from '@/types/auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    console.log('[AUTH] Starting login process');
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit(loginRateLimiter, request);
    if (!rateLimitResult.allowed) {
      console.log('[AUTH] Rate limit exceeded');
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();
    console.log('[AUTH] Received login request for email:', email);

    // Input validation
    if (!email || !password) {
      console.log('[AUTH] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = SecurityUtils.sanitizeInput(email.toLowerCase().trim());

    // Get user from database
    console.log('[AUTH] Looking up user:', sanitizedEmail);
    const userDoc = await getDoc(doc(db, 'users', sanitizedEmail));
    if (!userDoc.exists()) {
      console.log('[AUTH] User not found:', sanitizedEmail);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = userDoc.data() as UserProfile;

    // Check if account is active
    if (!user.accountActive) {
      console.log('[AUTH] Account not active:', sanitizedEmail);
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Check if account is locked
    if (user.accountLocked) {
      console.log('[AUTH] Account locked:', sanitizedEmail);
      return NextResponse.json(
        { error: 'Account is temporarily locked due to too many failed login attempts' },
        { status: 423 }
      );
    }

    // Verify password
    console.log('[AUTH] Verifying password');
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.log('[AUTH] Invalid password for:', sanitizedEmail);
      
      // Increment failed login attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const shouldLock = failedAttempts >= 5;
      
      const updateData: any = {
        failedLoginAttempts: failedAttempts,
        lastFailedLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (shouldLock) {
        updateData.accountLocked = true;
        console.log('[AUTH] Account locked due to too many failed attempts:', sanitizedEmail);
      }

      await updateDoc(doc(db, 'users', sanitizedEmail), updateData);

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Successful login - reset failed attempts
    console.log('[AUTH] Login successful for:', sanitizedEmail);
    await updateDoc(doc(db, 'users', sanitizedEmail), {
      failedLoginAttempts: 0,
      accountLocked: false,
      lastLoginAt: serverTimestamp(),
      lastLoginIP: SecurityUtils.extractIP(request),
      loginHistory: [...(user.loginHistory || []), {
        timestamp: serverTimestamp(),
        ip: SecurityUtils.extractIP(request),
        userAgent: SecurityUtils.extractUserAgent(request),
        success: true
      }],
      updatedAt: serverTimestamp()
    });

    // Generate JWT token
    console.log('[AUTH] Generating JWT token');
    const token = jwt.sign(
      { 
        email: sanitizedEmail, 
        displayName: user.displayName,
        age: user.age,
        id: user.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('[AUTH] Login completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        age: user.age,
        emailVerified: user.emailVerified,
        balance: user.balance,
        xp: user.xp,
        level: user.level
      }
    });

  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
