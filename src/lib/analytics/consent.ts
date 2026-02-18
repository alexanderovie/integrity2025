/**
 * Async Consent Management
 * Non-blocking consent check for optimal PageSpeed
 * Updated: 2025 - Async-first approach
 */

import { analyticsConfig } from './config';

const CONSENT_KEY = 'integrity_consent_marketing';

export type ConsentStatus = '0' | '1' | 'loading';

interface ConsentResponse {
  status: ConsentStatus;
  isCached: boolean;
}

/**
 * Get consent status - async, non-blocking
 * Returns cached value immediately if available
 * Falls back to '0' without waiting for server
 */
export async function getMarketingConsent(): Promise<ConsentResponse> {
  if (typeof window === 'undefined') {
    return { status: '0', isCached: false };
  }

  // Check cache first (sync, instant)
  const cached = localStorage.getItem(CONSENT_KEY);
  if (cached === '0' || cached === '1') {
    return { status: cached as ConsentStatus, isCached: true };
  }

  // No cached value, return '0' immediately (don't block)
  // Background fetch can update this later
  void fetchConsentFromServer();

  return { status: '0', isCached: false };
}

/**
 * Fetch consent from server - runs in background
 * Updates localStorage when response arrives
 */
async function fetchConsentFromServer(): Promise<void> {
  try {
    const response = await fetch('/api/consent');
    if (response.ok) {
      const data = await response.json();
      if (data.marketing === '0' || data.marketing === '1') {
        localStorage.setItem(CONSENT_KEY, data.marketing);
        // Dispatch event for components listening
        window.dispatchEvent(
          new CustomEvent('consentUpdate', { detail: { marketing: data.marketing } })
        );
      }
    }
  } catch {
    // Silent fail - consent remains '0'
  }
}

/**
 * Set marketing consent
 * Call this when user accepts/rejects cookies
 */
export async function setMarketingConsent(status: '0' | '1'): Promise<void> {
  if (typeof window === 'undefined') return;

  localStorage.setItem(CONSENT_KEY, status);
  window.dispatchEvent(
    new CustomEvent('consentUpdate', { detail: { marketing: status } })
  );

  // Sync with server
  try {
    await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketing: status }),
    });
  } catch {
    // Silent fail - localStorage is source of truth
  }
}

/**
 * Check if analytics can load
 * True if consent is '1' and in production
 */
export async function canLoadAnalytics(): Promise<boolean> {
  const { status, isCached } = await getMarketingConsent();

  // In development, allow loading even without consent
  if (analyticsConfig.environment.isDevelopment) {
    return true;
  }

  return status === '1' && isCached;
}

/**
 * Subscribe to consent changes
 * Returns unsubscribe function
 */
export function onConsentChange(
  callback: (status: ConsentStatus) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ marketing: ConsentStatus }>;
    callback(customEvent.detail.marketing);
  };

  window.addEventListener('consentUpdate', handler);

  // Also check current value
  getMarketingConsent().then(({ status }) => callback(status));

  return () => {
    window.removeEventListener('consentUpdate', handler);
  };
}
