import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import jwt from 'jsonwebtoken';
import { UserProfile } from '@/types/auth';

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

function verifyToken(request: NextRequest): { email: string; valid: boolean } {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { email: '', valid: false };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { email: decoded.email, valid: true };
  } catch (error) {
    console.log('[AUTH] Invalid token:', error);
    return { email: '', valid: false };
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[AUTH] Profile access attempt');
    
    // Verify JWT token
    const { email, valid } = verifyToken(request);
    if (!valid) {
      console.log('[AUTH] Invalid token for profile access');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    console.log('[AUTH] Fetching user profile for:', email);
    const userDoc = await getDoc(doc(db, 'users', email));
    if (!userDoc.exists()) {
      console.log('[AUTH] User not found in database:', email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userDoc.data() as UserProfile;

    console.log('[AUTH] Profile access successful for:', email);
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        age: user.age,
        emailVerified: user.emailVerified,
        balance: user.balance,
        xp: user.xp,
        level: user.level,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('[AUTH] Profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
