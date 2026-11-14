import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  getCookieFromHeader,
  buildMetaSetCookieHeaders,
  saveAdClickToVault,
  lookupAdClickFromVault,
} from '@/lib/metaVault';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const hashMeta = (val?: string) => {
  if (!val) return undefined;
  return crypto.createHash('sha256').update(val).digest('hex');
};

const normStr = (val?: string) => val ? val.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') : undefined;
const normZip = (val?: string) => {
  if (!val) return undefined;
  const trimmed = val.trim();
  const base = /^\d{5}-\d{4}$/.test(trimmed) ? trimmed.split('-')[0] : trimmed;
  return normStr(base);
};
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
    const { eventName, eventData, eventId, url, landingUrl, userAgent, fbp, fbc, userData, testEventCode } = body;
    const uaToCheck = String(userAgent || req.headers.get('user-agent') || '');
    if (/googlebot|bingbot|yandexbot|baiduspider|duckduckbot|slurp|applebot|facebookexternalhit|meta-externalagent|facebot|twitterbot|linkedinbot|pinterestbot|ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|perplexitybot|headlesschrome|phantomjs|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|statuscake/i.test(uaToCheck)) {
      return NextResponse.json({ success: true, skipped: 'bot' }, { status: 200 });
    }
    if (typeof url === 'string') {
      try {
        const parsedPath = new URL(url).pathname;
        if (parsedPath.startsWith('/admin')) {
          return NextResponse.json({ success: true, skipped: 'admin' }, { status: 200 });
        }
        if ((parsedPath.startsWith('/track') || parsedPath.startsWith('/returns/process') || parsedPath.startsWith('/dashboard')) && eventName !== 'PageView') {
          return NextResponse.json({ success: true, skipped: 'non-conversion-page' }, { status: 200 });
        }
        if (eventName === 'ViewContent' && !parsedPath.startsWith('/product/')) {
          return NextResponse.json({ success: true, skipped: 'invalid-viewcontent-path' }, { status: 200 });
        }
      } catch {}
    }
    if ((eventName === 'ViewContent' || eventName === 'AddToCart' || eventName === 'InitiateCheckout' || eventName === 'AddPaymentInfo') && (!Array.isArray(eventData?.content_ids) || eventData.content_ids.length === 0)) {
      return NextResponse.json({ success: true, skipped: 'missing-content-ids' }, { status: 200 });
    }
    const rawIp =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-vercel-forwarded-for') ||
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip');
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

    const cookieHeader = req.headers.get('cookie');
    const cookieFbp = getCookieFromHeader(cookieHeader, '_fbp');
    const cookieFbc = getCookieFromHeader(cookieHeader, '_fbc');
    const cookieLanding = getCookieFromHeader(cookieHeader, '_tj_landing');

    let resolvedFbp: string | undefined = fbp || cookieFbp || undefined;
    let resolvedFbc: string | undefined = fbc || cookieFbc || undefined;
    const effectiveLandingUrl: string | undefined = landingUrl || cookieLanding || undefined;

    if (!resolvedFbc) {
      for (const candidateUrl of [url, effectiveLandingUrl]) {
        if (typeof candidateUrl === 'string' && candidateUrl) {
          try {
            const parsedUrl = new URL(candidateUrl);
            const urlFbclid = parsedUrl.searchParams.get('fbclid') || (candidateUrl.match(/[\?&#]fbclid=([^&#]+)/)?.[1]);
            if (urlFbclid) {
              resolvedFbc = `fb.1.${Date.now()}.${decodeURIComponent(urlFbclid)}`;
              break;
            }
          } catch {}
        }
      }
    }

    // Persist Meta session in the Server-Side Ad Click Vault (both when _fbc is present AND when
    // iOS ATT / EU DMA stripped fbclid inside Facebook/Instagram In-App Browser or UTM campaign links)
    const isMetaAppOrUtm =
      Boolean(resolvedFbc) ||
      /FBAN|FBAV|FBIOS|Instagram|MetaIAB/i.test(uaToCheck) ||
      Boolean((effectiveLandingUrl || url || '').match(/fbclid=|utm_source=|utm_campaign=|utm_id=/i));

    if (isMetaAppOrUtm && (resolvedFbc || resolvedFbp)) {
      saveAdClickToVault(supabaseAdmin, {
        fbc: resolvedFbc,
        fbp: resolvedFbp,
        email: userData?.email,
        phone: userData?.phone,
        landingUrl: effectiveLandingUrl || url,
        clientIp,
        userAgent: uaToCheck,
      }).catch(() => {});
    }
    if (!resolvedFbc && eventName !== 'PageView' && (resolvedFbp || userData?.email || userData?.phone)) {
      // Returning visitor on a funnel event (ViewContent / AddToCart / InitiateCheckout / AddPaymentInfo):
      // check if they had a Day-1 ad click in the Server Vault!
      const vaultHit = await lookupAdClickFromVault(supabaseAdmin, {
        fbp: resolvedFbp,
        emails: [userData?.email],
        phone: userData?.phone,
      });
      if (vaultHit?.fbc) {
        resolvedFbc = vaultHit.fbc;
      }
      if (!resolvedFbp && vaultHit?.fbp) {
        resolvedFbp = vaultHit.fbp;
      }
    }

    const externalIdHashes = Array.from(
      new Set([hashMeta(resolvedFbp), hashMeta(normEmail(userData?.email))].filter(Boolean) as string[])
    );

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
            client_user_agent: userAgent || uaToCheck,
            fbp: resolvedFbp,
            fbc: resolvedFbc,
            // Meta best practice: Never send PII (email, phone, name) on PageView events.
            // Sending emails on repeated PageViews triggers the "duplicate client Emails" warning in Meta Diagnostics.
            ...(eventName !== 'PageView' ? {
              em: hashMeta(normEmail(userData?.email)) ? [hashMeta(normEmail(userData?.email))] : undefined,
              ph: getPhoneHashes(userData?.phone, userData?.country),
              fn: hashMeta(normStr(userData?.firstName)) ? [hashMeta(normStr(userData?.firstName))] : undefined,
              ln: hashMeta(normStr(userData?.lastName)) ? [hashMeta(normStr(userData?.lastName))] : undefined,
              ct: hashMeta(normStr(userData?.city)) ? [hashMeta(normStr(userData?.city))] : undefined,
              st: hashMeta(normStr(userData?.state)) ? [hashMeta(normStr(userData?.state))] : undefined,
              zp: hashMeta(normZip(userData?.zip)) ? [hashMeta(normZip(userData?.zip))] : undefined,
              country: hashMeta(normCountry(userData?.country)) ? [hashMeta(normCountry(userData?.country))] : undefined,
              external_id: externalIdHashes.length > 0 ? externalIdHashes : undefined
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

    const res = NextResponse.json({ success: true, result });
    const setCookies = buildMetaSetCookieHeaders(req.headers.get('host'), {
      fbc: resolvedFbc,
      fbp: resolvedFbp,
      landingUrl: effectiveLandingUrl && (effectiveLandingUrl.includes('fbclid=') || effectiveLandingUrl.includes('utm_')) ? effectiveLandingUrl : undefined,
    });
    for (const c of setCookies) {
      res.headers.append('Set-Cookie', c);
    }
    return res;
  } catch (error: any) {
    console.error('CAPI Handler Error:', error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}