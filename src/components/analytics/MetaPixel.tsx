/**
 * Meta Pixel Component
 * Optimized for PageSpeed with lazyOnload strategy
 * Updated: 2025 - Future-proof architecture
 */

'use client';

import Script from 'next/script';
import { analyticsConfig } from '@/lib/analytics/config';
import { useAnalyticsConsent } from '@/hooks/useAnalytics';

const PIXEL_ID = analyticsConfig.meta.pixelId;

/**
 * Meta Pixel with lazyOnload for optimal PageSpeed
 * Loads only after main content is interactive
 */
export function MetaPixel() {
  const { hasConsent, isLoading } = useAnalyticsConsent();

  // Don't render anything if still loading or no consent
  if (isLoading || !hasConsent || !PIXEL_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Meta Pixel Event Helper
 * Call this to track custom events
 */
export function trackMetaEvent(
  eventName: string,
  eventData?: Record<string, unknown>
) {
  if (typeof window !== 'undefined' && (window as unknown as { fbq?: (cmd: string, event: string, data?: unknown) => void }).fbq) {
    (window as unknown as { fbq: (cmd: string, event: string, data?: unknown) => void }).fbq(
      'track',
      eventName,
      eventData
    );
  }
}
