'use client';

import Script from 'next/script';

/**
 * HubSpot Script Component
 * Standard implementation for Next.js 16 with App Router
 *
 * This component loads the HubSpot tracking script on the client side
 * following Next.js best practices using the Script component with
 * "afterInteractive" strategy for optimal performance.
 *
 * The script enables HubSpot features like:
 * - Chat widget
 * - Form tracking
 * - Visitor tracking
 * - Lead capture
 *
 * Portal ID: 50745627
 */
export function HubSpotScript() {
  const HUBSPOT_PORTAL_ID = '50745627';

  return (
    <Script
      id="hs-script-loader"
      strategy="afterInteractive"
      src={`//js-na1.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js`}
    />
  );
}
