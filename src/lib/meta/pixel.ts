/**
 * Meta Pixel Configuration
 * Standard implementation for Next.js 15
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
export const META_PIXEL_ACCESS_TOKEN = process.env.META_PIXEL_ACCESS_TOKEN || '';
export const META_TEST_EVENT_CODE = process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE || '';

/**
 * Check if Pixel is properly configured
 */
export function isPixelConfigured(): boolean {
  return Boolean(META_PIXEL_ID);
}

/**
 * Check if we're in test mode
 */
export function isTestMode(): boolean {
  return Boolean(META_TEST_EVENT_CODE);
}

/**
 * Standard Meta Pixel events
 */
export enum MetaPixelEvent {
  PageView = 'PageView',
  ViewContent = 'ViewContent',
  Search = 'Search',
  AddToCart = 'AddToCart',
  InitiateCheckout = 'InitiateCheckout',
  AddPaymentInfo = 'AddPaymentInfo',
  Purchase = 'Purchase',
  Lead = 'Lead',
  CompleteRegistration = 'CompleteRegistration',
  Contact = 'Contact',
  Schedule = 'Schedule',
  FindLocation = 'FindLocation',
}

/**
 * User data for Conversions API
 */
export interface MetaUserData {
  client_ip_address?: string;
  client_user_agent?: string;
  em?: string; // email (hashed)
  ph?: string; // phone (hashed)
  fn?: string; // first name (hashed)
  ln?: string; // last name (hashed)
  external_id?: string;
  fbp?: string; // Facebook browser ID
  fbc?: string; // Facebook click ID
}

/**
 * Custom data for events
 */
export interface MetaCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  contents?: Array<{
    id: string;
    quantity?: number;
    item_price?: number;
  }>;
  num_items?: number;
  search_string?: string;
  status?: boolean;
}

/**
 * Event payload for Conversions API
 */
export interface MetaEventPayload {
  event_name: string;
  event_time: number;
  action_source: 'website' | 'app' | 'phone_call' | 'email' | 'chat' | 'other';
  user_data: MetaUserData;
  custom_data?: MetaCustomData;
  event_source_url?: string;
  event_id?: string;
  test_event_code?: string;
}

/**
 * Send event to Meta Conversions API
 */
export async function sendMetaEvent(
  eventName: MetaPixelEvent | string,
  userData: MetaUserData,
  customData?: MetaCustomData,
  options?: {
    eventId?: string;
    eventSourceUrl?: string;
    testMode?: boolean;
  }
): Promise<{ success: boolean; fbtrace_id?: string; error?: string }> {
  if (!META_PIXEL_ID || !META_PIXEL_ACCESS_TOKEN) {
    console.warn('Meta Pixel not configured');
    return { success: false, error: 'Pixel not configured' };
  }

  const payload: MetaEventPayload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    user_data: userData,
    custom_data: customData,
    event_id: options?.eventId,
    event_source_url: options?.eventSourceUrl,
  };

  // Add test event code if in test mode
  if (options?.testMode || isTestMode()) {
    payload.test_event_code = META_TEST_EVENT_CODE;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${META_PIXEL_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [payload],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta Pixel API error:', data);
      return {
        success: false,
        error: data.error?.message || 'Unknown error',
        fbtrace_id: data.fbtrace_id,
      };
    }

    return {
      success: true,
      fbtrace_id: data.fbtrace_id,
    };
  } catch (error) {
    console.error('Meta Pixel send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Hash function for PII (SHA-256)
 * Meta requires hashed user data
 */
export async function hashUserData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
