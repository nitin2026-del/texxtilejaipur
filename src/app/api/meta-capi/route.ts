import { NextResponse } from 'next/server';
import crypto from 'crypto';

const hashMeta = (val?: string) => {
  if (!val) return undefined;
  return crypto.createHash('sha256').update(val).digest('hex');
};

const normStr = (val?: string) => val ? val.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : undefined;
const normEmail = (val?: string) => val ? val.trim().toLowerCase() : undefined;
const normPhone = (val?: string) => val ? val.replace(/\D/g, '') : undefined;
const normCountry = (val?: string) => {
  if (!val) return undefined;
  const c = val.trim().toLowerCase();
  if (c === 'united states' || c === 'usa') return 'us';
  if (c === 'india' || c === 'ind') return 'in';
  if (c === 'united kingdom' || c === 'uk') return 'gb';
  if (c === 'australia') return 'au';
  if (c === 'canada') return 'ca';
  return c.length === 2 ? c : c.substring(0, 2);
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventData, eventId, url, userAgent, fbp, fbc, userData } = body;
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    const PIXEL_ID = '2857970634559091';
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
          custom_data: eventData
        }
      ]
    };

    const response = await fetch('https://graph.facebook.com/v19.0/' + PIXEL_ID + '/events?access_token=' + ACCESS_TOKEN, {
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