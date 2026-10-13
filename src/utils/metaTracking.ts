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

export const getMetaCookie = (name: string) => {
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

  // Capture fbclid and auto-generate _fbc if missing (handles ad blockers and Safari ITP)
  if (name === '_fbc' && !val) {
    let fbclid: string | null = null;
    let fbclidTs: string | null = null;
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        fbclid = urlParams.get('fbclid');
        if (fbclid) {
          fbclidTs = Date.now().toString();
          sessionStorage.setItem('meta_fbclid', fbclid);
          sessionStorage.setItem('meta_fbclid_ts', fbclidTs);
        } else {
          fbclid = sessionStorage.getItem('meta_fbclid');
          fbclidTs = sessionStorage.getItem('meta_fbclid_ts');
        }
      }
    } catch (e) {
      // ignore
    }
    if (fbclid) {
      const creationTs = fbclidTs || Date.now().toString();
      val = `fb.1.${creationTs}.${fbclid}`;
      document.cookie = `_fbc=${val}; path=/; max-age=7776000; SameSite=Lax`; // 90 days expiration
    }
  }
  return val;
};

export const initMetaCookies = () => {
  if (typeof window === 'undefined') return;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    if (fbclid) {
      sessionStorage.setItem('meta_fbclid', fbclid);
      const now = Date.now().toString();
      sessionStorage.setItem('meta_fbclid_ts', now);
      document.cookie = `_fbc=fb.1.${now}.${fbclid}; path=/; max-age=7776000; SameSite=Lax`;
    }
    const testCode = urlParams.get('test_event_code');
    if (testCode) {
      sessionStorage.setItem('meta_test_event_code', testCode);
    }
    getMetaCookie('_fbp');
    getMetaCookie('_fbc');
  } catch (e) {
    // ignore
  }
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
      const fbp = getMetaCookie('_fbp');
      const fbc = getMetaCookie('_fbc');
      
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