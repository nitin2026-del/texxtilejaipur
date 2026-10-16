import { v4 as uuidv4 } from 'uuid';

const PIXEL_ID = '1045219725239327';

export interface MetaUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

const getTestEventCode = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCode = urlParams.get('test_event_code');
    if (urlCode) {
      sessionStorage.setItem('meta_test_event_code', urlCode);
      localStorage.setItem('meta_test_event_code', urlCode);
      return urlCode;
    }
    return sessionStorage.getItem('meta_test_event_code') || localStorage.getItem('meta_test_event_code') || undefined;
  } catch (e) {
    return undefined;
  }
};

export const saveMetaUserData = (data?: MetaUserData) => {
  if (typeof window === 'undefined' || !data) return;
  try {
    const existingRaw = localStorage.getItem('meta_user_data');
    const existing: MetaUserData = existingRaw ? JSON.parse(existingRaw) : {};
    const merged: MetaUserData = {
      email: data.email?.trim().toLowerCase() || existing.email,
      phone: data.phone?.replace(/\D/g, '') || existing.phone,
      firstName: data.firstName?.trim().toLowerCase() || existing.firstName,
      lastName: data.lastName?.trim().toLowerCase() || existing.lastName,
      city: data.city?.trim().toLowerCase() || existing.city,
      state: data.state?.trim().toLowerCase() || existing.state,
      zip: data.zip?.trim().toLowerCase() || existing.zip,
      country: data.country?.trim().toLowerCase() || existing.country,
    };
    // Remove undefined keys
    Object.keys(merged).forEach((k) => {
      if (!merged[k as keyof MetaUserData]) delete merged[k as keyof MetaUserData];
    });
    if (Object.keys(merged).length > 0) {
      localStorage.setItem('meta_user_data', JSON.stringify(merged));
    }
  } catch (e) {
    // ignore storage errors
  }
};

export const getStoredMetaUserData = (override?: MetaUserData): MetaUserData | undefined => {
  if (typeof window === 'undefined') return override;
  try {
    if (override) saveMetaUserData(override);
    const existingRaw = localStorage.getItem('meta_user_data');
    const existing: MetaUserData = existingRaw ? JSON.parse(existingRaw) : {};
    const merged: MetaUserData = {
      ...existing,
      ...(override ? Object.fromEntries(Object.entries(override).filter(([_, v]) => Boolean(v))) : {})
    };
    return Object.keys(merged).length > 0 ? merged : undefined;
  } catch (e) {
    return override;
  }
};

export const getMetaCookie = (name: string) => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  let val = match ? match[2] : undefined;
  
  // Auto-generate or restore _fbp from localStorage to guarantee 100% continuity across tabs/ITP
  if (name === '_fbp') {
    if (!val) {
      try {
        val = localStorage.getItem('meta_fbp') || sessionStorage.getItem('meta_fbp') || undefined;
      } catch (e) {}
    }
    if (!val) {
      const time = Date.now();
      const random = Math.floor(Math.random() * 1000000000);
      val = `fb.1.${time}.${random}`;
    }
    document.cookie = `_fbp=${val}; path=/; max-age=7776000; SameSite=Lax`;
    try {
      localStorage.setItem('meta_fbp', val);
      sessionStorage.setItem('meta_fbp', val);
    } catch (e) {}
  }

  // Capture fbclid and auto-generate/restore _fbc without mutating existing creation timestamp
  if (name === '_fbc') {
    let urlFbclid: string | null = null;
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        urlFbclid = urlParams.get('fbclid');
      }
    } catch (e) {}

    if (urlFbclid) {
      // If current cookie or stored _fbc already matches this exact fbclid, keep its original creation timestamp!
      let existingFbc = val;
      if (!existingFbc) {
        try {
          existingFbc = localStorage.getItem('meta_fbc') || sessionStorage.getItem('meta_fbc') || undefined;
        } catch (e) {}
      }
      if (existingFbc && existingFbc.endsWith(`.${urlFbclid}`)) {
        val = existingFbc;
      } else {
        const now = Date.now().toString();
        val = `fb.1.${now}.${urlFbclid}`;
        try {
          localStorage.setItem('meta_fbclid', urlFbclid);
          localStorage.setItem('meta_fbclid_ts', now);
          sessionStorage.setItem('meta_fbclid', urlFbclid);
          sessionStorage.setItem('meta_fbclid_ts', now);
        } catch (e) {}
      }
      document.cookie = `_fbc=${val}; path=/; max-age=7776000; SameSite=Lax`;
      try {
        localStorage.setItem('meta_fbc', val);
        sessionStorage.setItem('meta_fbc', val);
      } catch (e) {}
    } else if (!val) {
      try {
        const storedFbc = localStorage.getItem('meta_fbc') || sessionStorage.getItem('meta_fbc');
        if (storedFbc) {
          val = storedFbc;
        } else {
          const fbclid = localStorage.getItem('meta_fbclid') || sessionStorage.getItem('meta_fbclid');
          const fbclidTs = localStorage.getItem('meta_fbclid_ts') || sessionStorage.getItem('meta_fbclid_ts');
          if (fbclid) {
            val = `fb.1.${fbclidTs || Date.now().toString()}.${fbclid}`;
          }
        }
        if (val) {
          document.cookie = `_fbc=${val}; path=/; max-age=7776000; SameSite=Lax`;
        }
      } catch (e) {}
    } else {
      // Cookie exists in document.cookie; back it up to localStorage/sessionStorage
      try {
        localStorage.setItem('meta_fbc', val);
        sessionStorage.setItem('meta_fbc', val);
      } catch (e) {}
    }
  }
  return val;
};

export const initMetaCookies = () => {
  if (typeof window === 'undefined') return;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const testCode = urlParams.get('test_event_code');
    if (testCode) {
      sessionStorage.setItem('meta_test_event_code', testCode);
      localStorage.setItem('meta_test_event_code', testCode);
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
  userData?: MetaUserData,
  skipBrowserPixel: boolean = false
) => {
  const id = eventId || uuidv4();
  const mergedUserData = getStoredMetaUserData(userData);
  
  // 1. Send via Browser Pixel (with Manual Advanced Matching when userData is available)
  if (!skipBrowserPixel && typeof window !== 'undefined' && (window as any).fbq) {
    try {
      if (mergedUserData && Object.keys(mergedUserData).length > 0) {
        const advancedMatching: Record<string, string> = {};
        if (mergedUserData.email) advancedMatching.em = mergedUserData.email.trim().toLowerCase();
        if (mergedUserData.phone) advancedMatching.ph = mergedUserData.phone.replace(/\D/g, '');
        if (mergedUserData.firstName) advancedMatching.fn = mergedUserData.firstName.trim().toLowerCase();
        if (mergedUserData.lastName) advancedMatching.ln = mergedUserData.lastName.trim().toLowerCase();
        if (mergedUserData.city) advancedMatching.ct = mergedUserData.city.trim().toLowerCase();
        if (mergedUserData.state) advancedMatching.st = mergedUserData.state.trim().toLowerCase();
        if (mergedUserData.zip) advancedMatching.zp = mergedUserData.zip.trim().toLowerCase();
        if (mergedUserData.country) advancedMatching.country = mergedUserData.country.trim().toLowerCase().substring(0, 2);
        (window as any).fbq('init', PIXEL_ID, advancedMatching);
      }
    } catch (e) {}
    console.log('[Meta Pixel] Firing ' + eventName, eventData);
    (window as any).fbq('track', eventName, eventData, { eventID: id });
  } else if (!skipBrowserPixel && typeof window !== 'undefined') {
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
          userData: mergedUserData,
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