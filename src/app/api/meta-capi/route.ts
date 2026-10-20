import { NextResponse } from 'next/server';
import crypto from 'crypto';

const hashMeta = (val?: string) => {
  if (!val) return undefined;
  return crypto.createHash('sha256').update(val).digest('hex');
};

const normStr = (val?: string) => val ? val.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') : undefined;
const normEmail = (val?: string) => val ? val.trim().toLowerCase() : undefined;
const normPhone = (val?: string) => val ? val.replace(/\D/g, '') : undefined;

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

const normCountry = (val?: string) => {
  if (!val) return undefined;
  const c = val.trim().toLowerCase();
  if (COUNTRY_CODE_MAP[c]) return COUNTRY_CODE_MAP[c];
  return c.length === 2 ? c : c.substring(0, 2);
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

const getPhoneHashes = (phone?: string, country?: string): string[] | undefined => {
  const digits = normPhone(phone);
  if (!digits) return undefined;
  const cleaned = digits.replace(/^00+/, '');
  const iso = normCountry(country);
  const dial = iso ? COUNTRY_DIAL_MAP[iso] : undefined;
  const candidates = new Set<string>();
  if (dial) {
    const withoutTrunkZero = cleaned.replace(/^0+/, '');
    if (!withoutTrunkZero.startsWith(dial) || (dial === '1' && withoutTrunkZero.length === 10)) {
      candidates.add(`${dial}${withoutTrunkZero}`);
    }
  }
  candidates.add(cleaned);
  const hashes = Array.from(candidates).map(p => hashMeta(p)).filter(Boolean) as string[];
  return hashes.length > 0 ? hashes : undefined;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventData, eventId, url, userAgent, fbp, fbc, userData, testEventCode } = body;
    const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const clientIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : undefined;

    const ALLOWED_EVENTS = ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo', 'Search', 'Lead', 'Contact'];
    if (!ALLOWED_EVENTS.includes(eventName)) {
      if (eventName === 'Purchase') {
        return NextResponse.json({ success: true, message: 'Purchase handled server-side' }, { status: 200 });
      }
      return NextResponse.json({ success: false, error: 'Invalid event name' }, { status: 400 });
    }

    const PIXEL_ID = process.env.META_PIXEL_ID || '1045219725239327';
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

    if (!ACCESS_TOKEN) {
      console.warn('META_ACCESS_TOKEN missing');
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 500 });
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: url,
          action_source: 'website',
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
            fbp: fbp || undefined,
            fbc: fbc || undefined,
            // Meta best practice: Never send PII (email, phone, name) on PageView events.
            // Sending emails on repeated PageViews triggers the "duplicate client Emails" warning in Meta Diagnostics.
            ...(eventName !== 'PageView' ? {
              em: hashMeta(normEmail(userData?.email)) ? [hashMeta(normEmail(userData?.email))] : undefined,
              ph: getPhoneHashes(userData?.phone, userData?.country),
              fn: hashMeta(normStr(userData?.firstName)) ? [hashMeta(normStr(userData?.firstName))] : undefined,
              ln: hashMeta(normStr(userData?.lastName)) ? [hashMeta(normStr(userData?.lastName))] : undefined,
              ct: hashMeta(normStr(userData?.city)) ? [hashMeta(normStr(userData?.city))] : undefined,
              st: hashMeta(normStr(userData?.state)) ? [hashMeta(normStr(userData?.state))] : undefined,
              zp: hashMeta(normStr(userData?.zip)) ? [hashMeta(normStr(userData?.zip))] : undefined,
              country: hashMeta(normCountry(userData?.country)) ? [hashMeta(normCountry(userData?.country))] : undefined
            } : {})
          },
          custom_data: eventData ? {
            ...eventData,
            ...(eventData.value !== undefined ? { value: Number((Number(eventData.value) || 0).toFixed(2)) } : {}),
            ...(eventData.currency ? { currency: String(eventData.currency).toUpperCase() } : {})
          } : undefined
        }
      ],
      ...(testEventCode ? { test_event_code: testEventCode } : {})
    };

    const response = await fetch('https://graph.facebook.com/v21.0/' + PIXEL_ID + '/events?access_token=' + ACCESS_TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('CAPI Error:', result);
      return NextResponse.json({ success: false, error: result }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('CAPI Handler Error:', error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}