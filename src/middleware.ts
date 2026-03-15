import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Middleware for route protection and default redirects.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Isolation: Prevent discovery of admin routes
  if (pathname.startsWith('/admin')) {
    const isAdminCookie = request.cookies.get('spendxp_admin_session');
    if (!isAdminCookie) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // 2. Default Redirect for Root
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/games/:path*', 
    '/parent/:path*', 
    '/onboarding/:path*', 
    '/admin/:path*',
    '/login', 
    '/signup',
    '/dashboard/:path*'
  ],
};
