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
        const zp = normAdvStr(mergedUserData.zip);
        if (zp) advancedMatching.zp = zp;
        const countryIso = normAdvCountry(mergedUserData.country);
        if (countryIso) advancedMatching.country = countryIso;
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