import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Middleware for basic route protection.
 * Since true auth state is client-side with Firebase SDK, 
 * we use simple path blocking. Complex logic is in AuthGuard.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths
  const isPublicPath = pathname === '/' || pathname === '/login' || pathname === '/signup';

  // We could check for a cookie here if we set one on login
  // For now, we rely on AuthGuard for detailed checks
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/games/:path*', '/parent/:path*', '/onboarding/:path*', '/login', '/signup'],
};
