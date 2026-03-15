import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Middleware for route protection and admin isolation.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Isolation: Prevent discovery of admin routes
  if (pathname.startsWith('/admin')) {
    // In a real production app, we would verify the session cookie / custom claims here.
    // For this prototype, we simulate a 404 if not authorized.
    const isLocalAdmin = request.cookies.get('spendxp_admin_session');
    if (!isLocalAdmin) {
      return new NextResponse(null, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/games/:path*', 
    '/parent/:path*', 
    '/onboarding/:path*', 
    '/admin/:path*',
    '/login', 
    '/signup'
  ],
};
