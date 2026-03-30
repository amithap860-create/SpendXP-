import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Check if adminAuth is available
    if (!adminAuth) {
      return NextResponse.json({ error: 'Firebase Admin SDK not initialized' }, { status: 500 });
    }

    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 });
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
    }

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('spendxp_session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('[SpendXP] Session creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Clear the session cookie even if adminAuth is not available
    const response = NextResponse.json({ success: true });
    response.cookies.set('spendxp_session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('[SpendXP] Session deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
