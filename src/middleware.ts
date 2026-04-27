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
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https://www.google.com https://*.firebaseapp.com",
      "frame-ancestors 'none'",
      "worker-src 'self' blob:",
    ].join('; ')
  );

  // Route protection — public paths pass through immediately.
  // Dashboard and game pages are protected client-side via AuthContext so that
  // Firebase Auth state (which is client-only) can be the gate. Middleware
  // cannot verify Firebase ID tokens without the Admin SDK, so cookie-based
  // blocking was always wrong and caused a permanent redirect loop.
  if (isPublicPathname(pathname)) {
    return response;
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
