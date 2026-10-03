import { v4 as uuidv4 } from 'uuid';

const getTestEventCode = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCode = urlParams.get('test_event_code');
    if (urlCode) {
      sessionStorage.setItem('meta_test_event_code', urlCode);
      return urlCode;
    }
    return sessionStorage.getItem('meta_test_event_code') || undefined;
  } catch (e) {
    return undefined;
  }
};

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  let val = match ? match[2] : undefined;
  
  // Auto-generate _fbp if missing to guarantee 100% CAPI coverage on first page load
  if (name === '_fbp' && !val) {
    const time = Date.now();
    const random = Math.floor(Math.random() * 1000000000);
    val = `fb.1.${time}.${random}`;
    document.cookie = `_fbp=${val}; path=/; max-age=7776000; SameSite=Lax`; // 90 days expiration
  }
  return val;
};

export const trackMetaEvent = async (
  eventName: string,
  eventData: Record<string, unknown> = {},
  eventId?: string,
  skipCapi: boolean = false,
  userData?: { email?: string; phone?: string; firstName?: string; lastName?: string; city?: string; state?: string; zip?: string; country?: string }
) => {
  const id = eventId || uuidv4();
  
  // 1. Send via Browser Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    console.log('[Meta Pixel] Firing ' + eventName, eventData);
    (window as any).fbq('track', eventName, eventData, { eventID: id });
  } else if (typeof window !== 'undefined') {
    console.warn('[Meta Pixel] fbq not found for ' + eventName);
  }

  // 2. Send via Server CAPI (by calling our internal API)
  if (typeof window !== 'undefined' && !skipCapi) {
    try {
      const fbp = getCookie('_fbp');
      const fbc = getCookie('_fbc');
      
      await fetch('/api/meta-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          eventData,
          eventId: id,
          url: window.location.href,
          userAgent: navigator.userAgent,
          fbp,
          fbc,
          userData,
          testEventCode: getTestEventCode()
        }),
        keepalive: true
      });
    } catch (err) {
      console.error('CAPI forwarding failed', err);
    }
  }
  
  return id;
};