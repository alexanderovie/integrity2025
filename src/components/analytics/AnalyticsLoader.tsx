/**
 * Analytics Loader Component
 * Centralized loader for all analytics scripts
 * Updated: 2025 - Optimized for PageSpeed
 */

import { MetaPixel } from './MetaPixel';
import { HubSpotScript } from './HubSpot';
import { GoogleTagManager } from './GoogleTagManager';
import { GoogleAdsTag } from './GoogleAdsTag';

/**
 * Central Analytics Loader
 * Conditionally loads all analytics based on consent
 * All scripts use non-blocking strategies
 */
export function AnalyticsLoader() {
  return (
    <>
      <GoogleAdsTag />
      <GoogleTagManager />
      <MetaPixel />
      <HubSpotScript />
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
