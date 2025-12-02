/**
 * Validación de variables de entorno
 * Falla en build time si faltan variables críticas
 */

const requiredEnvVars = {
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL,
  TO_EMAIL: process.env.TO_EMAIL,

  // HubSpot
  HUBSPOT_ACCESS_TOKEN: process.env.HUBSPOT_ACCESS_TOKEN,
  HUBSPOT_CLIENT_SECRET: process.env.HUBSPOT_CLIENT_SECRET,

  // Meta Pixel
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  META_PIXEL_ACCESS_TOKEN: process.env.META_PIXEL_ACCESS_TOKEN,

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

/**
 * Valida que todas las variables de entorno requeridas estén presentes
 * Solo se ejecuta en build time o cuando se importa explícitamente
 */
export function validateEnv() {
  if (process.env.NODE_ENV === 'production') {
    const missing: string[] = [];

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        `Please check your .env.local file or environment configuration.`
      );
    }
  }
}

/**
 * Getters type-safe para variables de entorno
 */
export const env = {
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  },

  // Resend
  resend: {
    apiKey: process.env.RESEND_API_KEY!,
    fromEmail: process.env.FROM_EMAIL || 'Integrity Clean Solutions <info@pay.integritycleansolutions.com>',
    toEmail: process.env.TO_EMAIL || 'info@integritycleansolutions.com',
  },

  // HubSpot
  hubspot: {
    accessToken: process.env.HUBSPOT_ACCESS_TOKEN!,
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
    webhookVerificationEnabled: process.env.ENABLE_HUBSPOT_WEBHOOK_VERIFICATION !== 'false',
  },

  // Meta
  meta: {
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
    accessToken: process.env.META_PIXEL_ACCESS_TOKEN || '',
    testEventCode: process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE || '',
  },

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },

  // General
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;
