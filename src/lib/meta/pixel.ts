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
 * User data for Conversions API (hashed PII)
 * This is the final format sent to Meta
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
 * Raw user data input (unhashed PII)
 * This is what clients send to the API
 */
export interface MetaUserDataInput {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  external_id?: string;
  fbp?: string;
  fbc?: string;
  // Pre-hashed fields (for advanced use cases)
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
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

  // Prepare request body - test_event_code goes at root level, not in data array
  const requestBody: {
    data: MetaEventPayload[];
    test_event_code?: string;
  } = {
    data: [payload],
  };

  // Add test event code at root level if in test mode
  if (options?.testMode || isTestMode()) {
    requestBody.test_event_code = META_TEST_EVENT_CODE;
  }

  try {
    // Meta Conversions API requiere access_token en query string según documentación oficial
    // NOTA: El token en query string es un riesgo conocido, pero es el método requerido por Meta
    // El token debe mantenerse seguro y nunca loguearse
    const url = `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${META_PIXEL_ACCESS_TOKEN}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

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
 * Meta requires hashed user data according to their latest specifications (2025)
 *
 * @param data - Raw PII data to hash
 * @returns Hexadecimal SHA-256 hash
 */
export async function hashUserData(data: string): Promise<string> {
  if (!data || typeof data !== 'string') {
    throw new Error('Invalid data provided for hashing');
  }

  const encoder = new TextEncoder();
  const normalizedData = data.toLowerCase().trim();
  const dataBuffer = encoder.encode(normalizedData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Transforms raw user data input to MetaUserData format
 * Handles hashing of PII fields according to Meta's requirements
 *
 * This is a scalable, type-safe transformation function that:
 * - Accepts both raw and pre-hashed data
 * - Validates input before processing
 * - Handles errors gracefully
 *
 * @param input - Raw user data from client
 * @param serverData - Server-side data (IP, user agent)
 * @returns Formatted MetaUserData ready for API
 */
export async function transformUserDataToMetaFormat(
  input: MetaUserDataInput | undefined,
  serverData: {
    client_ip_address: string;
    client_user_agent: string;
  }
): Promise<MetaUserData> {
  const metaUserData: MetaUserData = {
    client_ip_address: serverData.client_ip_address,
    client_user_agent: serverData.client_user_agent,
  };

  if (!input) {
    return metaUserData;
  }

  // Process email: hash if raw, use directly if pre-hashed
  if (input.email) {
    try {
      metaUserData.em = await hashUserData(input.email);
    } catch (error) {
      console.warn('[Meta Pixel] Failed to hash email:', error);
    }
  } else if (input.em) {
    // Pre-hashed email provided
    metaUserData.em = input.em;
  }

  // Process phone: hash if raw, use directly if pre-hashed
  if (input.phone) {
    try {
      metaUserData.ph = await hashUserData(input.phone);
    } catch (error) {
      console.warn('[Meta Pixel] Failed to hash phone:', error);
    }
  } else if (input.ph) {
    // Pre-hashed phone provided
    metaUserData.ph = input.ph;
  }

  // Process first name: hash if raw, use directly if pre-hashed
  if (input.first_name) {
    try {
      metaUserData.fn = await hashUserData(input.first_name);
    } catch (error) {
      console.warn('[Meta Pixel] Failed to hash first_name:', error);
    }
  } else if (input.fn) {
    // Pre-hashed first name provided
    metaUserData.fn = input.fn;
  }

  // Process last name: hash if raw, use directly if pre-hashed
  if (input.last_name) {
    try {
      metaUserData.ln = await hashUserData(input.last_name);
    } catch (error) {
      console.warn('[Meta Pixel] Failed to hash last_name:', error);
    }
  } else if (input.ln) {
    // Pre-hashed last name provided
    metaUserData.ln = input.ln;
  }

  // Copy non-PII fields directly
  if (input.external_id) {
    metaUserData.external_id = input.external_id;
  }
  if (input.fbp) {
    metaUserData.fbp = input.fbp;
  }
  if (input.fbc) {
    metaUserData.fbc = input.fbc;
  }

  return metaUserData;
}
