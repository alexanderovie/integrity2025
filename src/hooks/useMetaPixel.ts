'use client';

import { useCallback } from 'react';
import { MetaPixelEvent } from '@/lib/meta/pixel';

/**
 * Hook to track Meta Pixel events from client components
 *
 * @example
 * const { trackEvent } = useMetaPixel();
 * trackEvent('Lead', { email: 'user@example.com' });
 */
export function useMetaPixel() {
  const trackEvent = useCallback(
    (
      eventName: MetaPixelEvent | string,
      params?: {
        value?: number;
        currency?: string;
        content_name?: string;
        [key: string]: unknown;
      }
    ) => {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', eventName, params);
      }
    },
    []
  );

  const trackCustomEvent = useCallback(
    (eventName: string, params?: Record<string, unknown>) => {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackCustom', eventName, params);
      }
    },
    []
  );

  return {
    trackEvent,
    trackCustomEvent,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    fbq?: (
      action: 'track' | 'trackCustom' | 'init',
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}
