import crypto from 'crypto';

interface UserData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
}

interface CustomData {
  currency: string;
  value: number;
  content_ids?: string[];
  contents?: any[];
  content_type?: string;
  num_items?: number;
}

interface MetaEventParams {
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  userData: UserData;
  customData: CustomData;
  testEventCode?: string;
}

/**
 * Normalizes and hashes data according to Meta's strict Conversions API rules.
 * Uses SHA-256 for all PII.
 */
function hashData(val?: string): string | undefined {
  if (!val) return undefined;
  const normalized = val.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Specifically normalizes phone numbers (numbers only, including country code).
 */
function hashPhone(val?: string): string | undefined {
  if (!val) return undefined;
  const numbersOnly = val.replace(/\D/g, '');
  if (!numbersOnly) return undefined;
  return crypto.createHash('sha256').update(numbersOnly).digest('hex');
}

/**
 * Sends a server-side event to the Meta Conversions API.
 * Uses environment variables: META_PIXEL_ID and META_ACCESS_TOKEN.
 * Guaranteed non-blocking (swallows exceptions to protect checkout).
 */
export async function sendMetaConversionsApiEvent({
  eventName,
  eventId,
  eventSourceUrl,
  userData,
  customData,
  testEventCode,
}: MetaEventParams): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('[Meta CAPI] Missing META_PIXEL_ID or META_ACCESS_TOKEN. Skipping server-side event.');
    return;
  }

  try {
    const unixTimestamp = Math.floor(Date.now() / 1000);

    const hashedUserData = {
      em: hashData(userData.email) ? [hashData(userData.email)] : undefined,
      ph: hashPhone(userData.phone) ? [hashPhone(userData.phone)] : undefined,
      fn: hashData(userData.first_name) ? [hashData(userData.first_name)] : undefined,
      ln: hashData(userData.last_name) ? [hashData(userData.last_name)] : undefined,
      ct: hashData(userData.city) ? [hashData(userData.city)] : undefined,
      st: hashData(userData.state) ? [hashData(userData.state)] : undefined,
      country: hashData(userData.country) ? [hashData(userData.country)] : undefined,
      zp: hashData(userData.zip) ? [hashData(userData.zip)] : undefined,
      client_ip_address: userData.client_ip_address || undefined,
      client_user_agent: userData.client_user_agent || undefined,
      fbp: userData.fbp || undefined,
      fbc: userData.fbc || undefined,
    };

    // Clean undefined fields to avoid Meta API errors
    const cleanUserData = Object.fromEntries(
      Object.entries(hashedUserData).filter(([_, v]) => v !== undefined)
    );

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: unixTimestamp,
          action_source: 'website',
          event_source_url: eventSourceUrl,
          event_id: eventId,
          user_data: cleanUserData,
          custom_data: customData,
        },
      ],
      ...(testEventCode ? { test_event_code: testEventCode } : {}),
    };

    const apiUrl = `https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`[Meta CAPI] Failed to send ${eventName} event:`, result);
    } else {
      console.log(`[Meta CAPI] Successfully sent ${eventName} event (event_id: ${eventId}). Events received:`, result.events_received);
    }
  } catch (error) {
    // We catch and log all errors so we never crash the main checkout flow!
    console.error(`[Meta CAPI] Unexpected error sending ${eventName} event:`, error);
  }
}
