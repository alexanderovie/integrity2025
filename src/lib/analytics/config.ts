/**
 * Analytics Configuration
 * Centralized environment variables for third-party scripts
 * Updated: 2025 - Future-proof configuration
 */

export const analyticsConfig = {
  // Meta Pixel
  meta: {
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
    isConfigured: () => Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID),
  },

  // Google Tag Manager
  gtm: {
    containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || 'GTM-5TF5L8PQ',
    isConfigured: () => Boolean(process.env.NEXT_PUBLIC_GTM_CONTAINER_ID),
  },

  // Google Ads
  googleAds: {
    tagId: process.env.NEXT_PUBLIC_GOOGLE_ADS_TAG_ID || 'AW-18004402142',
    quoteFormConversionSendTo:
      process.env.NEXT_PUBLIC_GOOGLE_ADS_QUOTE_FORM_CONVERSION_SEND_TO ||
      'AW-18004402142/Tx05CKP7-bscEN6_lYlD',
    isConfigured: () =>
      Boolean(
        process.env.NEXT_PUBLIC_GOOGLE_ADS_TAG_ID ||
          process.env.NEXT_PUBLIC_GOOGLE_ADS_QUOTE_FORM_CONVERSION_SEND_TO,
      ),
  },

  // HubSpot
  hubspot: {
    portalId: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || '50745627',
    isConfigured: () => Boolean(process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID),
  },

  // Environment
  environment: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
  },
} as const;

export type AnalyticsConfig = typeof analyticsConfig;
