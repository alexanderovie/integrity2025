/**
 * Environment Variables - Type-Safe Access
 *
 * Enterprise-grade secrets management following patterns from:
 * - Stripe: Type-safe env access
 * - Vercel: Environment variable validation
 * - Linear: Runtime validation
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const apiKey = env.resendApiKey;
 */

/**
 * Validates that required environment variables are present
 * Throws error if any are missing (fail fast)
 */
function validateEnv(): void {
  const required = [
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ] as const;

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file or platform secrets (Vercel/GitHub).`
    );
  }
}

/**
 * Type-safe environment variables access
 *
 * All secrets are validated at module load time.
 * If any required secret is missing, the app will fail fast with a clear error.
 */
export const env = {
  // Resend (Email)
  resendApiKey: process.env.RESEND_API_KEY!,

  // Stripe (Payments)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',

  // HubSpot (CRM) - Optional
  hubspotAccessToken: process.env.HUBSPOT_ACCESS_TOKEN || '',

  // App Configuration
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Node Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Optional: Database
  databaseUrl: process.env.DATABASE_URL,

  // Optional: Redis
  redisUrl: process.env.REDIS_URL,

  // Optional: Analytics
  gaId: process.env.NEXT_PUBLIC_GA_ID,
} as const;

// Validate on module load (only in production/server)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  validateEnv();
}

// Type exports for better DX
export type Env = typeof env;
