/**
 * Next.js Instrumentation Configuration
 * 
 * This file configures OpenTelemetry for production monitoring.
 * Only runs in Node.js runtime, not during edge functions or client-side.
 */

// Ensure this only runs in Node.js environment
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    // Set environment variables to avoid Jaeger exporter issues
    process.env.OTEL_TRACE_EXPORTER = 'otlp';
    
    console.log('[SpendXP] OpenTelemetry environment configured');
  } catch (error) {
    console.warn('[SpendXP] Failed to configure OpenTelemetry:', error);
  }
}

export async function register() {
  // This function is required by Next.js instrumentation
  // Configuration is handled above to ensure it runs before any other code
}
