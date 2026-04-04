import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    console.log('[HEALTH] Starting authentication system health check');
    const healthResults: any = {
      timestamp: new Date().toISOString(),
      status: 'checking',
      checks: {}
    };

    // Check 1: Database connection
    try {
      const testDoc = doc(db, 'health', 'test');
      await setDoc(testDoc, { 
        test: true, 
        timestamp: serverTimestamp() 
      });
      
      const verifyDoc = await getDoc(testDoc);
      if (verifyDoc.exists()) {
        healthResults.checks.database = {
          status: 'pass',
          message: 'Database connection successful'
        };
      } else {
        healthResults.checks.database = {
          status: 'fail',
          message: 'Database write/read test failed'
        };
      }
    } catch (dbError: any) {
      healthResults.checks.database = {
        status: 'fail',
        message: `Database connection failed: ${dbError?.message || dbError}`
      };
    }

    // Check 2: Users table structure
    try {
      const testUserDoc = doc(db, 'users', 'health-test@example.com');
      const testUser = {
        id: 'health-test@example.com',
        email: 'health-test@example.com',
        displayName: 'Health Test User',
        age: 16,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: false,
        passwordHash: await bcrypt.hash('testpassword123', await bcrypt.genSalt(12)),
        failedLoginAttempts: 0,
        accountLocked: false,
        loginHistory: [],
        accountActive: true,
        balance: 0,
        xp: 0,
        level: 1,
        currency: 'INR',
        savingsCurrent: 0,
        savingsGoal: 1000,
        isParent: false,
        childUids: []
      };

      await setDoc(testUserDoc, testUser);
      const verifyUser = await getDoc(testUserDoc);
      
      if (verifyUser.exists()) {
        const userData = verifyUser.data();
        const requiredFields = ['id', 'email', 'displayName', 'age', 'passwordHash', 'createdAt', 'updatedAt', 'emailVerified', 'failedLoginAttempts', 'accountLocked', 'loginHistory', 'accountActive', 'balance', 'xp', 'level', 'currency', 'savingsCurrent', 'savingsGoal', 'isParent', 'childUids'];
        const missingFields = requiredFields.filter(field => !(field in userData));
        
        if (missingFields.length === 0) {
          healthResults.checks.usersTable = {
            status: 'pass',
            message: 'Users table structure is correct'
          };
        } else {
          healthResults.checks.usersTable = {
            status: 'fail',
            message: `Missing fields in users table: ${missingFields.join(', ')}`
          };
        }
      } else {
        healthResults.checks.usersTable = {
          status: 'fail',
          message: 'Cannot create/read user documents'
        };
      }
    } catch (tableError: any) {
      healthResults.checks.usersTable = {
        status: 'fail',
        message: `Users table check failed: ${tableError?.message || tableError}`
      };
    }

    // Check 3: Password hashing
    try {
      const testPassword = 'testpassword123';
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(testPassword, salt);
      const isValid = await bcrypt.compare(testPassword, hash);
      
      if (isValid) {
        healthResults.checks.passwordHashing = {
          status: 'pass',
          message: 'Password hashing and verification working'
        };
      } else {
        healthResults.checks.passwordHashing = {
          status: 'fail',
          message: 'Password hashing/verification failed'
        };
      }
    } catch (hashError: any) {
      healthResults.checks.passwordHashing = {
        status: 'fail',
        message: `Password hashing failed: ${hashError?.message || hashError}`
      };
    }

    // Check 4: JWT generation
    try {
      const testPayload = { email: 'test@example.com', displayName: 'Test User' };
      const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '7d' });
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded && (decoded as any).email === 'test@example.com') {
        healthResults.checks.jwtGeneration = {
          status: 'pass',
          message: 'JWT generation and verification working'
        };
      } else {
        healthResults.checks.jwtGeneration = {
          status: 'fail',
          message: 'JWT generation/verification failed'
        };
      }
    } catch (jwtError: any) {
      healthResults.checks.jwtGeneration = {
        status: 'fail',
        message: `JWT generation failed: ${jwtError?.message || jwtError}`
      };
    }

    // Check 5: Signup route availability
    try {
      const signupResponse = await fetch(`${request.nextUrl.origin}/api/auth/signup-fixed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'health-test@example.com',
          password: 'testpassword123',
          displayName: 'Health Test User',
          age: '16',
          confirmPassword: 'testpassword123'
        })
      });

      if (signupResponse.ok) {
        healthResults.checks.signupRoute = {
          status: 'pass',
          message: 'Signup route is accessible and working'
        };
      } else {
        const errorData = await signupResponse.text();
        healthResults.checks.signupRoute = {
          status: 'fail',
          message: `Signup route error: ${errorData}`
        };
      }
    } catch (signupError: any) {
      healthResults.checks.signupRoute = {
        status: 'fail',
        message: `Signup route check failed: ${signupError?.message || signupError}`
      };
    }

    // Check 6: Login route availability
    try {
      // First create a test user
      const testEmail = 'health-login-test@example.com';
      const testPassword = 'testpassword123';
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(testPassword, salt);
      
      await setDoc(doc(db, 'users', testEmail), {
        id: testEmail,
        email: testEmail,
        displayName: 'Health Login Test',
        age: 16,
        passwordHash: hash,
        accountActive: true,
        emailVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        failedLoginAttempts: 0,
        accountLocked: false,
        loginHistory: [],
        balance: 0,
        xp: 0,
        level: 1,
        currency: 'INR',
        savingsCurrent: 0,
        savingsGoal: 1000,
        isParent: false,
        childUids: []
      });

      // Now test login
      const loginResponse = await fetch(`${request.nextUrl.origin}/api/auth/login-fixed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        if (loginData.success && loginData.token) {
          healthResults.checks.loginRoute = {
            status: 'pass',
            message: 'Login route is accessible and working'
          };
        } else {
          healthResults.checks.loginRoute = {
            status: 'fail',
            message: 'Login route returned invalid response'
          };
        }
      } else {
        const errorData = await loginResponse.text();
        healthResults.checks.loginRoute = {
          status: 'fail',
          message: `Login route error: ${errorData}`
        };
      }
    } catch (loginError: any) {
      healthResults.checks.loginRoute = {
        status: 'fail',
        message: `Login route check failed: ${loginError?.message || loginError}`
      };
    }

    // Determine overall health
    const allChecks = Object.values(healthResults.checks);
    const failedChecks = allChecks.filter((check: any) => check.status === 'fail');
    
    if (failedChecks.length === 0) {
      healthResults.status = 'healthy';
      healthResults.overall = 'All authentication systems are working correctly';
    } else {
      healthResults.status = 'unhealthy';
      healthResults.overall = `${failedChecks.length} authentication system(s) have issues`;
    }

    console.log('[HEALTH] Health check completed:', healthResults.status);
    return NextResponse.json(healthResults);

  } catch (error: any) {
    console.error('[HEALTH] Health check failed:', error);
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: 'Health check system failed',
      message: error?.message || error
    }, { status: 500 });
  }
}
