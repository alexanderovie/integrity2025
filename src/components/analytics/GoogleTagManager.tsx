/**
 * Google Tag Manager Component
 * Optimized with lazyOnload strategy
 * Updated: 2025 - Future-proof architecture
 */

'use client';

import Script from 'next/script';
import { analyticsConfig } from '@/lib/analytics/config';
import { useAnalyticsConsent } from '@/hooks/useAnalytics';

const GTM_ID = analyticsConfig.gtm.containerId;

/**
 * GTM with async consent check
 * Loads after main content for optimal performance
 */
export function GoogleTagManager() {
  const { hasConsent, isLoading } = useAnalyticsConsent();

  // Don't load if still loading or no consent
  if (isLoading || !hasConsent || !GTM_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="gtm"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}

/**
 * Push to GTM Data Layer
 */
export function pushToDataLayer(data: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    if (dataLayer) {
      dataLayer.push(data);
    }
  }
}
