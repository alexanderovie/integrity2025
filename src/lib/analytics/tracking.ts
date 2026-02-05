/**
 * Analytics Tracking Module
 * Centralized tracking functions for all analytics providers
 * Updated: 2025 - Web Worker compatible
 */

import { analyticsConfig } from './config';

// Type definitions for analytics events
export interface TrackingEvent {
  type: string;
  category?: string;
  label?: string;
  value?: number;
  data?: Record<string, unknown>;
}

export interface PageViewData {
  url: string;
  title?: string;
  referrer?: string;
}

// Initialize Web Worker for off-main-thread tracking
let analyticsWorker: Worker | null = null;

function getWorker(): Worker {
  if (typeof window === 'undefined') {
    throw new Error('Worker not available on server');
  }

  if (!analyticsWorker) {
    analyticsWorker = new Worker('/workers/analytics.js', { type: 'module' });
  }

  return analyticsWorker;
}

/**
 * Track page view
 * Sends to all configured analytics providers
 */
export async function trackPageView(data: PageViewData): Promise<void> {
  if (!analyticsConfig.environment.isProduction) {
    console.log('[Analytics] PageView:', data);
    return;
  }

  // Meta Pixel
  if (analyticsConfig.meta.isConfigured() && typeof window !== 'undefined' && (window as unknown as { fbq?: (cmd: string, event: string, data?: unknown) => void }).fbq) {
    (window as unknown as { fbq: (cmd: string, event: string, data?: unknown) => void }).fbq('track', 'PageView', data);
  }

  // Send to worker for async processing
  if (typeof window !== 'undefined') {
    try {
      getWorker().postMessage({ type: 'pageView', data });
    } catch {
      // Fallback: direct tracking if worker fails
      console.debug('[Analytics] Worker unavailable, direct tracking');
    }
  }
}

/**
 * Track custom event
 * Compatible with all analytics providers
 */
export async function trackEvent(event: TrackingEvent): Promise<void> {
  if (!analyticsConfig.environment.isProduction) {
    console.log('[Analytics] Event:', event);
    return;
  }

  // Meta Pixel event
  if (analyticsConfig.meta.isConfigured() && typeof window !== 'undefined') {
    const fbq = (window as unknown as { fbq?: (cmd: string, event: string, data?: unknown) => void }).fbq;
    if (fbq) {
      fbq('track', event.type, {
        category: event.category,
        label: event.label,
        value: event.value,
        ...event.data,
      });
    }
  }

  // Send to worker
  if (typeof window !== 'undefined') {
    try {
      getWorker().postMessage({ type: 'event', data: event });
    } catch {
      console.debug('[Analytics] Worker unavailable');
    }
  }
}

/**
 * Track conversion
 * Shorthand for common conversion events
 */
export async function trackConversion(
  conversionType: 'Lead' | 'Contact' | 'Quote' | 'Schedule' | 'Purchase',
  value?: number
): Promise<void> {
  await trackEvent({
    type: conversionType,
    value,
  });
}

/**
 * Initialize analytics on page load
 * Safe to call multiple times
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Listen for route changes in SPA
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    trackPageView({
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
    });
  };

  // Track initial page view
  trackPageView({
    url: window.location.href,
    title: document.title,
    referrer: document.referrer,
  });
}
