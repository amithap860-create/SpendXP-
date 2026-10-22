import type { NextConfig } from 'next';

// PWA/service worker fully disabled as of 2026-08-24. Across one debugging
// session it was traced as the root cause of: the native app failing to
// reopen, currency preferences appearing stuck after a deploy (stale cached
// JS), and a client-side crash on /profile caused by a Workbox "no-response"
// error on the web build. Its only benefit was letting someone install
// spendxp.vercel.app as an offline-capable browser PWA — not a real
// distribution channel for this app (Play Store / App Store are). Native
// already had the service worker torn out separately in src/lib/native.ts
// (disableServiceWorkerIfNative) as a safety net for existing installs;
// this stops a new one from ever being generated again, for web or native.
// @ducanh2912/next-pwa removed 2026-10-22 (security pass 2): it was already
// `disable: true` (see above) and only pulled in vulnerable build-time deps.

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()',
  },
  // NOTE: src/middleware.ts sets its OWN Content-Security-Policy on every
  // request, and its value is what the browser actually receives — this one
  // gets silently overridden for page routes. Discovered 2026-08-24 after
  // this CSP's Razorpay allowance never actually took effect. Keep both in
  // sync if either changes, or better, consolidate into one source later.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://apis.google.com",
      "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://api.razorpay.com",
      "connect-src 'self' https://*.razorpay.com https://*.googleapis.com https://*.google.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "img-src 'self' data: blob: https://*.razorpay.com https://*.googleusercontent.com",
      "style-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
      "font-src 'self' data:",
    ].join('; '),
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  compress: true,
  images: {
    formats: ['image/webp'],
    deviceSizes: [360, 414, 768, 1024, 1280],
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.googleusercontent.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'firebase', '@firebase/app', '@firebase/auth',
      '@firebase/firestore', '@firebase/app-check',
      'lucide-react', 'date-fns',
    ],
  },
  webpack: (config: any, { isServer }: any) => {
    if (isServer) {
      config.externals.push({
        '@opentelemetry/exporter-jaeger': 'commonjs @opentelemetry/exporter-jaeger',
      });
    }
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@opentelemetry/exporter-jaeger': false,
      '@opentelemetry/sdk-node': false,
    };
    return config;
  },
  serverExternalPackages: [
    'firebase-admin', '@google-cloud/firestore',
    '@opentelemetry/sdk-node', '@opentelemetry/exporter-jaeger',
  ],
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ];
  },
};

export default nextConfig;
