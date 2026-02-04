'use client';

import { useSyncExternalStore } from 'react';

const CONSENT_COOKIE = 'ics_consent_marketing';
const CONSENT_EVENT = 'marketing-consent-updated';

const readConsent = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setMarketingConsent = (value: '1' | '0'): void => {
  const maxAge = 60 * 60 * 24 * 180;
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
  window.dispatchEvent(new Event(CONSENT_EVENT));
};

const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
};

export const useMarketingConsent = (): string | null => {
  return useSyncExternalStore(subscribe, readConsent, () => null);
};
