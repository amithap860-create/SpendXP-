
/**
 * @fileOverview Validates presence of required environment variables at startup.
 */

const REQUIRED_PUBLIC_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
];

export function validateEnv() {
  const missing = REQUIRED_PUBLIC_VARS.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    } else {
      console.warn(`[SpendXP Warning] ${msg}`);
    }
  }
}
