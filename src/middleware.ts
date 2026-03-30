import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/onboarding',
  '/verify-email',
  '/consent',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
];

function isPublicPathname(pathname: string): boolean {
  return publicPaths.some((path) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

/**
 * @fileOverview Enterprise-grade middleware for route protection, HTTPS enforcement, and security headers.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protocol = request.headers.get('x-forwarded-proto') || 'http';

  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && protocol !== 'https') {
    const httpsUrl = request.url.replace('http://', 'https://');
    return NextResponse.redirect(httpsUrl);
  }

  // Apply security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );

  // Route protection
  if (isPublicPathname(pathname)) {
    return response;
  }

  // Auth protection for dashboard and profile
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
    const sessionCookie = request.cookies.get('spendxp_session');
    if (!sessionCookie) {
      // Preserve returnTo URL for post-login redirect (using 'next' param as requested)
      const url = new URL('/login', request.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === '/login') {
    const sessionCookie = request.cookies.get('spendxp_session');
    if (sessionCookie) {
      // Get 'next' parameter for post-login redirect, default to dashboard
      const nextUrl = new URL(request.url).searchParams.get('next') || '/dashboard';
      
      // Validate same-origin to prevent open redirects
      const nextUrlObj = new URL(nextUrl, request.url);
      if (nextUrlObj.origin === request.nextUrl.origin) {
        return NextResponse.redirect(new URL(nextUrl, request.url));
      }
      // Fallback to dashboard if invalid origin
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (pathname.startsWith('/admin')) {
    const isAdminCookie = request.cookies.get('spendxp_admin_session');
    if (!isAdminCookie) {
      return new NextResponse(null, { status: 404 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/onboarding/:path*',
    '/verify-email',
    '/verify-email/:path*',
    '/consent',
    '/consent/:path*',
    '/games/:path*',
    '/parent/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
  ],
};
