'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useAnalyticsConsent } from '@/hooks/useAnalytics';
import { analyticsConfig } from '@/lib/analytics/config';
import { captureGoogleAdsAttribution } from '@/lib/analytics/google-ads';

const GOOGLE_ADS_TAG_ID = analyticsConfig.googleAds.tagId;

export function GoogleAdsTag(): React.ReactElement | null {
  const { hasConsent, isLoading } = useAnalyticsConsent();
  const canLoad = analyticsConfig.environment.isDevelopment || hasConsent;

  useEffect(() => {
    if (!isLoading && canLoad) {
      captureGoogleAdsAttribution();
    }
  }, [canLoad, isLoading]);

  if (isLoading || !canLoad || !GOOGLE_ADS_TAG_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="google-ads-gtag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_TAG_ID}`}
      />
      <Script
        id="google-ads-gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_TAG_ID}');
          `,
        }}
      />
    </>
  );
}
