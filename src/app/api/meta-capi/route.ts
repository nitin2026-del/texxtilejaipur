import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventData, eventId, url, userAgent } = body;
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
            client_user_agent: userAgent
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
  } catch (error) {
    console.error('CAPI Handler Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
