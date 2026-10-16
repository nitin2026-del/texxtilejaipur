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
            em: hashMeta(normEmail(userData?.email)) ? [hashMeta(normEmail(userData?.email))] : undefined,
            ph: hashMeta(normPhone(userData?.phone)) ? [hashMeta(normPhone(userData?.phone))] : undefined,
            fn: hashMeta(normStr(userData?.firstName)) ? [hashMeta(normStr(userData?.firstName))] : undefined,
            ln: hashMeta(normStr(userData?.lastName)) ? [hashMeta(normStr(userData?.lastName))] : undefined,
            ct: hashMeta(normStr(userData?.city)) ? [hashMeta(normStr(userData?.city))] : undefined,
            st: hashMeta(normStr(userData?.state)) ? [hashMeta(normStr(userData?.state))] : undefined,
            zp: hashMeta(normStr(userData?.zip)) ? [hashMeta(normStr(userData?.zip))] : undefined,
            country: hashMeta(normCountry(userData?.country)) ? [hashMeta(normCountry(userData?.country))] : undefined
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