/**
 * Analytics Loader Component
 * Centralized loader for all analytics scripts
 * Updated: 2025 - Optimized for PageSpeed
 */

'use client';

import { useAnalyticsConsent } from '@/hooks/useAnalytics';
import { MetaPixel } from './MetaPixel';
import { HubSpotScript } from './HubSpot';
import { GoogleTagManager } from './GoogleTagManager';

/**
 * Central Analytics Loader
 * Conditionally loads all analytics based on consent
 * All scripts use non-blocking strategies
 */
export function AnalyticsLoader() {
  const { hasConsent } = useAnalyticsConsent();

  // No loading indicator - silent loading
  // This prevents CLS and layout shifts

  return (
    <>
      {hasConsent && (
        <>
          <GoogleTagManager />
          <MetaPixel />
          <HubSpotScript />
        </>
      )}
    </>
  );
}

/**
 * Analytics Provider Wrapper
 * For use with React Context if needed
 */
export function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
