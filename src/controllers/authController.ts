import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserProfile, UserProfileSchema } from '@/types/user';

// Simple in-memory user store for now
const users: UserProfile[] = [];

class AuthController {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateSignupData(data: any): string[] {
    const errors: string[] = [];

    if (!data.email || !this.validateEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.age || isNaN(data.age) || data.age < 1 || data.age > 120) {
      errors.push('Valid age (1-120) is required');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (data.password !== data.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  }

  static validateLoginData(data: any): string[] {
    const errors: string[] = [];

    if (!data.email || !this.validateEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.password) {
      errors.push('Password is required');
    }

    return errors;
  }

  static async signup(request: NextRequest): Promise<NextResponse> {
    try {
      let body;
      try {
        body = await request.json();
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
      
      const { email, age, password, confirmPassword, displayName } = body;

      // Validate input
      const validationErrors = this.validateSignupData({ email, age, password, confirmPassword });
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationErrors },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }

      // Generate salt and hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create complete user profile
      const now = new Date().toISOString();
      const sanitizedEmail = email.toLowerCase().trim();
      const sanitizedDisplayName = displayName?.trim() || sanitizedEmail.split('@')[0];

      const userProfile: UserProfile = {
        id: sanitizedEmail,
        email: sanitizedEmail,
        displayName: sanitizedDisplayName,
        age: parseInt(age),

        passwordHash,
        passwordSalt: salt,

        createdAt: now,
        updatedAt: now,
        lastPasswordChange: now,

        emailVerified: false,

        failedLoginAttempts: 0,
        accountLocked: false,

        loginHistory: [],

        securityQuestions: [],

        refreshTokens: [],

        childUids: [],

        role: "user"
      };

      // Validate with Zod schema
      const validationResult = UserProfileSchema.safeParse(userProfile);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Invalid user profile', details: validationResult.error },
          { status: 400 }
        );
      }

      users.push(userProfile);

      // Generate simple token
      const token = Buffer.from(`${userProfile.id}:${userProfile.email}`).toString('base64');

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        user: {
          id: userProfile.id,
          email: userProfile.email,
          displayName: userProfile.displayName,
          age: userProfile.age,
          createdAt: userProfile.createdAt
        },
        token
      }, { status: 201 });

    } catch (error: any) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async login(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { email, password } = body;
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Validate input
      const validationErrors = this.validateLoginData({ email, password });
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationErrors },
          { status: 400 }
        );
      }

      // Find user
      const user = users.find(u => u.email === email);
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Check if account is locked
      if (user.accountLocked) {
        return NextResponse.json(
          { error: 'Account locked due to too many failed attempts' },
          { status: 423 }
        );
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      const now = new Date().toISOString();

      if (passwordValid) {
        // Reset failed attempts on successful login
        user.failedLoginAttempts = 0;
        user.updatedAt = now;

        // Add to login history
        user.loginHistory.push({
          timestamp: now,
          ip,
          userAgent,
          success: true
        });

        return NextResponse.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            age: user.age,
            createdAt: user.createdAt
          },
          token: Buffer.from(`${user.id}:${user.email}`).toString('base64')
        }, { status: 200 });
      } else {
        // Increment failed attempts
        user.failedLoginAttempts += 1;
        user.updatedAt = now;

        // Add to login history
        user.loginHistory.push({
          timestamp: now,
          ip,
          userAgent,
          success: false
        });

        // Lock account after 5 failed attempts
        if (user.failedLoginAttempts >= 5) {
          user.accountLocked = true;
          return NextResponse.json(
            { error: 'Account locked due to too many failed attempts' },
            { status: 423 }
          );
        }

        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

    } catch (error: any) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async getProfile(request: NextRequest & { user?: any }): Promise<NextResponse> {
    try {
      const user = request.user; // Set by middleware
      if (!user) {
        return NextResponse.json(
          { error: 'User not authenticated' },
          { status: 401 }
        );
      }

      // Find user in memory
      const userData = users.find(u => u.id === user.id);
      if (!userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          age: userData.age,
          createdAt: userData.createdAt
        }
      }, { status: 200 });

    } catch (error: any) {
      console.error('Profile error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}

export default AuthController;
