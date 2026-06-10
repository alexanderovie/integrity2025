import { analyticsConfig } from './config';

const ATTRIBUTION_STORAGE_KEY = 'integrity_google_ads_attribution';
const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid'] as const;

type GoogleClickIdKey = (typeof CLICK_ID_KEYS)[number];

export type GoogleAdsAttribution = Partial<Record<GoogleClickIdKey, string>> & {
  capturedAt: string;
  landingPage: string;
  referrer: string;
};

type GoogleAdsConversionOptions = {
  sendTo: string;
  value?: number;
  currency?: string;
};

type WindowWithGoogleAds = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

const optionalText = (value: string | null): string | undefined => {
  const normalized = value?.trim();
  return normalized || undefined;
};

const parseStoredAttribution = (value: string | null): GoogleAdsAttribution | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<GoogleAdsAttribution>;
    const hasClickId = CLICK_ID_KEYS.some((key) => Boolean(parsed[key]));

    if (
      hasClickId &&
      typeof parsed.capturedAt === 'string' &&
      typeof parsed.landingPage === 'string' &&
      typeof parsed.referrer === 'string'
    ) {
      return parsed as GoogleAdsAttribution;
    }
  } catch {
    return null;
  }

  return null;
};

export function captureGoogleAdsAttribution(): GoogleAdsAttribution | null {
  if (typeof window === 'undefined') return null;

  const url = new URL(window.location.href);
  const clickIds = CLICK_ID_KEYS.reduce<Partial<Record<GoogleClickIdKey, string>>>(
    (accumulator, key) => {
      const value = optionalText(url.searchParams.get(key));
      if (value) {
        accumulator[key] = value;
      }
      return accumulator;
    },
    {},
  );

  if (!CLICK_ID_KEYS.some((key) => Boolean(clickIds[key]))) {
    return getStoredGoogleAdsAttribution();
  }

  const attribution: GoogleAdsAttribution = {
    ...clickIds,
    capturedAt: new Date().toISOString(),
    landingPage: window.location.href,
    referrer: document.referrer || '',
  };

  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    return attribution;
  }

  return attribution;
}

export function getStoredGoogleAdsAttribution(): GoogleAdsAttribution | null {
  if (typeof window === 'undefined') return null;

  try {
    return parseStoredAttribution(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function trackGoogleAdsConversion({
  sendTo,
  value = 1,
  currency = 'USD',
}: GoogleAdsConversionOptions): boolean {
  if (typeof window === 'undefined') return false;

  const googleWindow = window as WindowWithGoogleAds;
  if (!googleWindow.gtag) return false;

  googleWindow.gtag('event', 'conversion', {
    send_to: sendTo,
    value,
    currency,
  });

  return true;
}

export function trackQuoteFormSubmittedConversion(): boolean {
  return trackGoogleAdsConversion({
    sendTo: analyticsConfig.googleAds.quoteFormConversionSendTo,
    value: 1,
    currency: 'USD',
  });
}
