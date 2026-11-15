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
    let existingRaw: string | null = null;
    try { existingRaw = localStorage.getItem('meta_user_data'); } catch (e) {}
    if (!existingRaw) {
      try { existingRaw = sessionStorage.getItem('meta_user_data'); } catch (e) {}
    }
    const existing: MetaUserData = existingRaw ? JSON.parse(existingRaw) : ((window as any).__META_USER_DATA || {});
    const merged: MetaUserData = {
      email: (data.email && !/@(domain\.com|example\.com|test\.com|invalid\.com)$/i.test(data.email.trim()) ? data.email.trim().toLowerCase() : undefined) || existing.email,
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
      (window as any).__META_USER_DATA = merged;
      const serialized = JSON.stringify(merged);
      try { localStorage.setItem('meta_user_data', serialized); } catch (e) {}
      try { sessionStorage.setItem('meta_user_data', serialized); } catch (e) {}
    }
  } catch (e) {
    // ignore storage errors
  }
};

export const getStoredMetaUserData = (override?: MetaUserData): MetaUserData | undefined => {
  if (typeof window === 'undefined') return override;
  try {
    if (override) saveMetaUserData(override);
    let existingRaw: string | null = null;
    try { existingRaw = localStorage.getItem('meta_user_data'); } catch (e) {}
    if (!existingRaw) {
      try { existingRaw = sessionStorage.getItem('meta_user_data'); } catch (e) {}
    }
    const existing: MetaUserData = existingRaw ? JSON.parse(existingRaw) : ((window as any).__META_USER_DATA || {});
    const merged: MetaUserData = {
      ...existing,
      ...(override ? Object.fromEntries(Object.entries(override).filter(([_, v]) => Boolean(v))) : {})
    };
    return Object.keys(merged).length > 0 ? merged : undefined;
  } catch (e) {
    return override;
  }
};

const readBestCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  try {
    const parts = (document.cookie || '').split(';');
    let best: string | undefined;
    let bestTs = -1;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i].trim();
      if (p.startsWith(name + '=')) {
        const v = p.substring(name.length + 1);
        const segs = v.split('.');
        const ts = segs.length >= 3 ? Number(segs[2]) : 0;
        if (!best || (ts && ts >= bestTs)) {
          best = v;
          if (ts) bestTs = ts;
        }
      }
    }
    return best;
  } catch {
    return undefined;
  }
};

const writeCookieBothDomains = (name: string, val: string) => {
  if (typeof document === 'undefined') return;
  try { document.cookie = `${name}=${val}; path=/; max-age=7776000; SameSite=Lax`; } catch (e) {}
  try {
    if (typeof window !== 'undefined' && window.location?.hostname?.includes('textilejaipur.com')) {
      document.cookie = `${name}=${val}; domain=.textilejaipur.com; path=/; max-age=7776000; SameSite=Lax`;
    }
  } catch (e) {}
};

const extractFbclidFromUrl = (rawUrl?: string | null): string | null => {
  if (!rawUrl) return null;
  try {
    const u = new URL(rawUrl, 'https://www.textilejaipur.com');
    const fromParam = u.searchParams.get('fbclid');
    if (fromParam) return fromParam;
  } catch {}
  const m = rawUrl.match(/[\?&#]fbclid=([^&#]+)/);
  if (m && m[1]) {
    try { return decodeURIComponent(m[1]); } catch { return m[1]; }
  }
  return null;
};

export const getMetaCookie = (name: string) => {
  if (typeof document === 'undefined') return undefined;
  let val = readBestCookie(name);
  
  // Auto-generate or restore _fbp from localStorage to guarantee 100% continuity across tabs/ITP
  if (name === '_fbp') {
    if (!val && typeof window !== 'undefined' && (window as any).__META_FBP) {
      val = (window as any).__META_FBP;
    }
    if (!val) {
      try {
        val = localStorage.getItem('meta_fbp') || undefined;
      } catch (e) {}
    }
    if (!val) {
      try {
        val = sessionStorage.getItem('meta_fbp') || undefined;
      } catch (e) {}
    }
    if (!val) {
      const time = Date.now();
      const random = Math.floor(Math.random() * 1000000000);
      val = `fb.1.${time}.${random}`;
    }
    writeCookieBothDomains('_fbp', val);
    if (typeof window !== 'undefined') (window as any).__META_FBP = val;
    try { localStorage.setItem('meta_fbp', val); } catch (e) {}
    try { sessionStorage.setItem('meta_fbp', val); } catch (e) {}
  }

  // Capture fbclid and auto-generate/restore _fbc without mutating existing creation timestamp
  if (name === '_fbc') {
    let urlFbclid: string | null = null;
    try {
      if (typeof window !== 'undefined') {
        urlFbclid = extractFbclidFromUrl(window.location.href);
        if (!urlFbclid) {
          let storedLanding: string | null = (window as any).__META_LANDING_URL || null;
          if (!storedLanding) {
            try { storedLanding = sessionStorage.getItem('meta_landing_url'); } catch (e) {}
          }
          if (!storedLanding) {
            try { storedLanding = localStorage.getItem('meta_landing_url'); } catch (e) {}
          }
          urlFbclid = extractFbclidFromUrl(storedLanding);
        }
      }
    } catch (e) {}

    if (urlFbclid) {
      // If current cookie or stored _fbc already matches this exact fbclid, keep its original creation timestamp!
      let existingFbc = val || (typeof window !== 'undefined' ? (window as any).__META_FBC : undefined);
      if (!existingFbc) {
        try { existingFbc = localStorage.getItem('meta_fbc') || undefined; } catch (e) {}
      }
      if (!existingFbc) {
        try { existingFbc = sessionStorage.getItem('meta_fbc') || undefined; } catch (e) {}
      }
      if (existingFbc && existingFbc.endsWith(`.${urlFbclid}`)) {
        val = existingFbc;
      } else {
        const now = Date.now().toString();
        val = `fb.1.${now}.${urlFbclid}`;
        try { localStorage.setItem('meta_fbclid', urlFbclid); localStorage.setItem('meta_fbclid_ts', now); } catch (e) {}
        try { sessionStorage.setItem('meta_fbclid', urlFbclid); sessionStorage.setItem('meta_fbclid_ts', now); } catch (e) {}
      }
      if (val) {
        writeCookieBothDomains('_fbc', val);
        if (typeof window !== 'undefined') (window as any).__META_FBC = val;
        try { localStorage.setItem('meta_fbc', val); } catch (e) {}
        try { sessionStorage.setItem('meta_fbc', val); } catch (e) {}
      }
    } else if (!val) {
      if (typeof window !== 'undefined' && (window as any).__META_FBC) {
        val = (window as any).__META_FBC;
      }
      if (!val) {
        try { val = localStorage.getItem('meta_fbc') || undefined; } catch (e) {}
      }
      if (!val) {
        try { val = sessionStorage.getItem('meta_fbc') || undefined; } catch (e) {}
      }
      if (!val) {
        let fbclid: string | null = null;
        let fbclidTs: string | null = null;
        try { fbclid = localStorage.getItem('meta_fbclid'); fbclidTs = localStorage.getItem('meta_fbclid_ts'); } catch (e) {}
        if (!fbclid) {
          try { fbclid = sessionStorage.getItem('meta_fbclid'); fbclidTs = sessionStorage.getItem('meta_fbclid_ts'); } catch (e) {}
        }
        if (fbclid) {
          val = `fb.1.${fbclidTs || Date.now().toString()}.${fbclid}`;
        }
      }
      if (val) {
        writeCookieBothDomains('_fbc', val);
        if (typeof window !== 'undefined') (window as any).__META_FBC = val;
      }
    } else {
      // Cookie exists in document.cookie; synchronize both domains and back up to localStorage/sessionStorage
      writeCookieBothDomains('_fbc', val);
      if (typeof window !== 'undefined') (window as any).__META_FBC = val;
      try { localStorage.setItem('meta_fbc', val); } catch (e) {}
      try { sessionStorage.setItem('meta_fbc', val); } catch (e) {}
    }
  }
  return val;
};

export const getMetaLandingUrl = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const href = window.location.href;
    const params = new URLSearchParams(window.location.search);
    const isPaymentReturn = params.has('payment') || window.location.pathname.startsWith('/payment/');
    const hasAdParams = !isPaymentReturn && (params.has('fbclid') || /[\?&#]fbclid=/.test(href) || params.has('utm_source') || params.has('utm_campaign') || params.has('utm_content') || params.has('utm_id'));
    if (hasAdParams) {
      (window as any).__META_LANDING_URL = href;
      try { localStorage.setItem('meta_landing_url', href); } catch (e) {}
      try { sessionStorage.setItem('meta_landing_url', href); } catch (e) {}
      writeCookieBothDomains('_tj_landing', encodeURIComponent(href));
      return href;
    }
    let stored: string | null = null;
    try { stored = sessionStorage.getItem('meta_landing_url'); } catch (e) {}
    if (!stored) {
      try { stored = localStorage.getItem('meta_landing_url'); } catch (e) {}
    }
    if (!stored) {
      const cookieLanding = readBestCookie('_tj_landing');
      if (cookieLanding) {
        try { stored = decodeURIComponent(cookieLanding); } catch { stored = cookieLanding; }
      }
    }
    return stored || (window as any).__META_LANDING_URL || href;
  } catch (e) {
    return typeof window !== 'undefined' ? window.location.href : undefined;
  }
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
    getMetaLandingUrl();
    getMetaCookie('_fbp');
    getMetaCookie('_fbc');
  } catch (e) {
    // ignore
  }
};

const COUNTRY_CODE_MAP: Record<string, string> = {
  'united states': 'us', 'usa': 'us', 'united states of america': 'us',
  'united kingdom': 'gb', 'uk': 'gb', 'great britain': 'gb', 'england': 'gb', 'scotland': 'gb', 'wales': 'gb',
  'india': 'in', 'ind': 'in',
  'australia': 'au', 'aus': 'au',
  'canada': 'ca', 'can': 'ca',
  'germany': 'de', 'deutschland': 'de',
  'france': 'fr',
  'italy': 'it', 'italia': 'it',
  'spain': 'es', 'espana': 'es', 'españa': 'es',
  'netherlands': 'nl', 'holland': 'nl', 'the netherlands': 'nl',
  'belgium': 'be',
  'switzerland': 'ch',
  'austria': 'at',
  'sweden': 'se',
  'norway': 'no',
  'denmark': 'dk',
  'finland': 'fi',
  'ireland': 'ie', 'republic of ireland': 'ie',
  'portugal': 'pt',
  'greece': 'gr',
  'poland': 'pl',
  'hungary': 'hu',
  'czech republic': 'cz', 'czechia': 'cz',
  'romania': 'ro',
  'croatia': 'hr',
  'slovenia': 'si',
  'slovakia': 'sk',
  'bulgaria': 'bg',
  'luxembourg': 'lu',
  'malta': 'mt',
  'cyprus': 'cy',
  'estonia': 'ee',
  'latvia': 'lv',
  'lithuania': 'lt',
  'iceland': 'is',
  'mexico': 'mx', 'méxico': 'mx',
  'brazil': 'br', 'brasil': 'br',
  'argentina': 'ar',
  'chile': 'cl',
  'colombia': 'co',
  'peru': 'pe',
  'new zealand': 'nz',
  'united arab emirates': 'ae', 'uae': 'ae', 'dubai': 'ae',
  'saudi arabia': 'sa',
  'qatar': 'qa',
  'kuwait': 'kw',
  'bahrain': 'bh',
  'oman': 'om',
  'israel': 'il',
  'turkey': 'tr', 'türkiye': 'tr',
  'singapore': 'sg',
  'hong kong': 'hk',
  'japan': 'jp',
  'south korea': 'kr', 'korea': 'kr',
  'taiwan': 'tw',
  'malaysia': 'my',
  'thailand': 'th',
  'indonesia': 'id',
  'philippines': 'ph',
  'vietnam': 'vn',
  'south africa': 'za',
};

const COUNTRY_DIAL_MAP: Record<string, string> = {
  us: '1', ca: '1', gb: '44', in: '91', au: '61', nz: '64',
  de: '49', fr: '33', it: '39', es: '34', nl: '31', be: '32',
  ch: '41', at: '43', se: '46', no: '47', dk: '45', fi: '358',
  ie: '353', pt: '351', gr: '30', pl: '48', hu: '36', cz: '420',
  ro: '40', hr: '385', si: '386', sk: '421', bg: '359', lu: '352',
  mt: '356', cy: '357', ee: '372', lv: '371', lt: '370', is: '354',
  mx: '52', br: '55', ar: '54', cl: '56', co: '57', pe: '51',
  ae: '971', sa: '966', qa: '974', kw: '965', bh: '973', om: '968',
  il: '972', tr: '90', sg: '65', hk: '852', jp: '81', kr: '82',
  tw: '886', my: '60', th: '66', id: '62', ph: '63', vn: '84', za: '27'
};

const normAdvStr = (val?: string) =>
  val ? val.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';

const normAdvZip = (val?: string) => {
  if (!val) return '';
  const trimmed = val.trim();
  // Meta requires US 9-digit ZIP+4 codes (e.g. 10001-1234) to use only the 5-digit primary ZIP
  const base = /^\d{5}-\d{4}$/.test(trimmed) ? trimmed.split('-')[0] : trimmed;
  return normAdvStr(base);
};

const normAdvCountry = (val?: string) => {
  if (!val) return '';
  const c = val.trim().toLowerCase();
  if (COUNTRY_CODE_MAP[c]) return COUNTRY_CODE_MAP[c];
  return c.length === 2 ? c : c.substring(0, 2);
};

const normAdvPhone = (phone?: string, country?: string) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '').replace(/^00+/, '');
  if (!digits) return '';
  const iso = normAdvCountry(country);
  const dial = iso ? COUNTRY_DIAL_MAP[iso] : undefined;
  if (dial) {
    const withoutTrunkZero = digits.replace(/^0+/, '');
    if (!withoutTrunkZero.startsWith(dial) || (dial === '1' && withoutTrunkZero.length === 10)) {
      return `${dial}${withoutTrunkZero}`;
    }
  }
  return digits;
};

export const trackMetaEvent = async (
  eventName: string,
  eventData: Record<string, unknown> = {},
  eventId?: string,
  skipCapi: boolean = false,
  userData?: MetaUserData,
  skipBrowserPixel: boolean = false
) => {
  if (typeof window !== 'undefined') {
    const ua = navigator?.userAgent || '';
    if (navigator?.webdriver || /googlebot|bingbot|yandexbot|baiduspider|duckduckbot|slurp|applebot|facebookexternalhit|meta-externalagent|facebot|twitterbot|linkedinbot|pinterestbot|ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|perplexitybot|headlesschrome|phantomjs|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|statuscake/i.test(ua)) {
      return;
    }
    const p = window.location?.pathname || '';
    if (p.startsWith('/admin')) return;
    if ((p.startsWith('/track') || p.startsWith('/returns/process') || p.startsWith('/dashboard')) && eventName !== 'PageView') return;
    if (eventName === 'ViewContent' && !p.startsWith('/product/')) return;
    if ((eventName === 'ViewContent' || eventName === 'AddToCart' || eventName === 'InitiateCheckout' || eventName === 'AddPaymentInfo') && (!Array.isArray(eventData?.content_ids) || eventData.content_ids.length === 0)) return;
  }
  const id = eventId || uuidv4();
  // Do not attach persistent user PII (like email/phone) to generic PageView events.
  // Sending stored emails across multiple PageViews triggers Meta's "duplicate client Emails" diagnostics warning.
  const mergedUserData = eventName === 'PageView' ? undefined : getStoredMetaUserData(userData);
  
  // 1. Send via Browser Pixel (with Manual Advanced Matching when userData is available)
  if (!skipBrowserPixel && typeof window !== 'undefined' && (window as any).fbq) {
    try {
      if (mergedUserData && Object.keys(mergedUserData).length > 0) {
        const advancedMatching: Record<string, string> = {};
        if (mergedUserData.email) advancedMatching.em = mergedUserData.email.trim().toLowerCase();
        const ph = normAdvPhone(mergedUserData.phone, mergedUserData.country);
        if (ph) advancedMatching.ph = ph;
        const fn = normAdvStr(mergedUserData.firstName);
        if (fn) advancedMatching.fn = fn;
        const ln = normAdvStr(mergedUserData.lastName);
        if (ln) advancedMatching.ln = ln;
        const ct = normAdvStr(mergedUserData.city);
        if (ct) advancedMatching.ct = ct;
        const st = normAdvStr(mergedUserData.state);
        if (st) advancedMatching.st = st;
        const zp = normAdvZip(mergedUserData.zip);
        if (zp) advancedMatching.zp = zp;
        const countryIso = normAdvCountry(mergedUserData.country);
        if (countryIso) advancedMatching.country = countryIso;
        const fbpForExt = getMetaCookie('_fbp');
        if (fbpForExt) advancedMatching.external_id = fbpForExt;
        (window as any).fbq('set', 'autoConfig', false, PIXEL_ID);
        (window as any).fbq('init', PIXEL_ID, advancedMatching);
      }
    } catch (e) {}
    console.log('[Meta Pixel] Firing ' + eventName, eventData);
    try { (window as any).__ALLOW_META_TRACK = true; (window as any).fbq('track', eventName, eventData, { eventID: id }); } finally { (window as any).__ALLOW_META_TRACK = false; }
    try { if (eventName !== 'PageView' && typeof (window as any).clarity === 'function') { (window as any).clarity('event', 'Meta_' + eventName); (window as any).clarity('set', 'meta_event', eventName); } } catch (e) {}
  } else if (!skipBrowserPixel && typeof window !== 'undefined') {
    console.warn('[Meta Pixel] fbq not found for ' + eventName);
  }

  // 2. Send via Server CAPI (by calling our internal API)
  if (typeof window !== 'undefined' && !skipCapi) {
    try {
      const fbp = getMetaCookie('_fbp');
      const fbc = getMetaCookie('_fbc');
      const landingUrl = getMetaLandingUrl();
      
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          eventData,
          eventId: id,
          url: window.location.href,
          landingUrl,
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