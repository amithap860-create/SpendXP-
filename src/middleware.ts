import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Middleware for route protection.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Basic redirection logic
  // Detailed checks happen in AuthGuard or on the pages themselves 
  // since true auth state is client-side with Firebase.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/games/:path*', 
    '/parent/:path*', 
    '/onboarding/:path*', 
    '/login', 
    '/signup'
  ],
};
