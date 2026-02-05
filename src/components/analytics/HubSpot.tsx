/**
 * HubSpot Script Component
 * Optimized with async consent and lazyOnload
 * Updated: 2025 - Future-proof architecture
 */

'use client';

import Script from 'next/script';
import { analyticsConfig } from '@/lib/analytics/config';
import { useAnalyticsConsent } from '@/hooks/useAnalytics';

const HUBSPOT_PORTAL_ID = analyticsConfig.hubspot.portalId;

/**
 * HubSpot with async consent check
 * Uses lazyOnload to avoid blocking main thread
 */
export function HubSpotScript() {
  const { hasConsent, isLoading } = useAnalyticsConsent();

  // Don't load if still loading or no consent
  if (isLoading || !hasConsent || !HUBSPOT_PORTAL_ID) {
    return null;
  }

  return (
    <Script
      id="hs-script-loader"
      strategy="lazyOnload"
      src={`//js-na1.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js`}
      onError={(e) => {
        console.debug('[HubSpot] Failed to load script', e);
      }}
    />
  );
}

/**
 * HubSpot Tracking Call Helper
 * Use for custom tracking events
 */
export function trackHubSpotEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return;

  const _hsq = (window as unknown as { _hsq?: unknown[] })._hsq;
  if (_hsq) {
    if (properties) {
      _hsq.push(['trackEvent', { id: eventName, ...properties }]);
    } else {
      _hsq.push(['trackPageView']);
    }
  }
}

/**
 * Identify HubSpot Contact
 * Call when user provides email/info
 */
export function identifyHubSpotContact(
  email: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return;

  const _hsq = (window as unknown as { _hsq?: unknown[] })._hsq;
  if (_hsq) {
    _hsq.push(['identify', { email, ...properties }]);
  }
}
