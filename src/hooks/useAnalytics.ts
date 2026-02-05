/**
 * useAnalytics Hook
 * React hook for analytics consent and tracking
 * Updated: 2025 - Optimized for performance
 */

import { useEffect, useState, useCallback } from 'react';
import {
  getMarketingConsent,
  setMarketingConsent,
  canLoadAnalytics,
  onConsentChange,
  ConsentStatus,
} from '@/lib/analytics';

/**
 * Hook for managing analytics consent
 * Returns current consent status and setter
 */
export function useAnalyticsConsent() {
  const [consent, setConsent] = useState<ConsentStatus>('loading');

  useEffect(() => {
    // Get initial consent
    getMarketingConsent().then(({ status }) => {
      setConsent(status);
    });

    // Subscribe to changes
    const unsubscribe = onConsentChange((newStatus) => {
      setConsent(newStatus);
    });

    return unsubscribe;
  }, []);

  const updateConsent = useCallback(async (status: '0' | '1') => {
    await setMarketingConsent(status);
    setConsent(status);
  }, []);

  return {
    consent,
    hasConsent: consent === '1',
    isLoading: consent === 'loading',
    setConsent: updateConsent,
  };
}

/**
 * Hook for conditional analytics loading
 * Returns true if analytics should load
 */
export function useCanLoadAnalytics() {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    canLoadAnalytics().then(setCanLoad);
  }, []);

  return canLoad;
}

/**
 * Hook for page view tracking
 * Auto-tracks on mount and route changes
 */
export function usePageTracking(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    import('@/lib/analytics').then(({ initAnalytics, canLoadAnalytics }) => {
      canLoadAnalytics().then((canLoad) => {
        if (canLoad) {
          initAnalytics();
        }
      });
    });
  }, [enabled]);
}
