import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCookieFromHeader, saveAdClickToVault } from '@/lib/metaVault';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * POST /api/orders/attribution
 *
 * Called immediately after order creation (shipping form submit) to save
 * the customer's Meta _fbc / _fbp cookies into the payments table.
 *
 * This is the EARLIEST possible capture point — before the customer clicks PayPal.
 * It ensures that even if the customer leaves and returns 1-2 days later on a
 * different browser/device (iOS ITP wipes cookies), we still have their ad-click
 * fbc in the DB so handlePaymentSuccess can recover it and credit the Meta ad.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, attrJson, action, fbc, fbp, email, phone, landingUrl } = body;

    const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const clientIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : undefined;
    const headerUa = req.headers.get('user-agent') || undefined;
    const cookieHeader = req.headers.get('cookie');
    const cookieFbp = getCookieFromHeader(cookieHeader, '_fbp');
    const cookieFbc = getCookieFromHeader(cookieHeader, '_fbc');
    const cookieLanding = getCookieFromHeader(cookieHeader, '_tj_landing');

    // Early checkout form blur vault sync (before an orderId even exists!)
    if (action === 'vault') {
      const resolvedFbc = fbc || cookieFbc;
      const resolvedFbp = fbp || cookieFbp;
      if (resolvedFbc) {
        await saveAdClickToVault(supabaseAdmin, {
          fbc: resolvedFbc,
          fbp: resolvedFbp,
          email,
          phone,
          landingUrl: landingUrl || cookieLanding,
          clientIp,
          userAgent: headerUa,
        });
      }
      return NextResponse.json({ ok: true, vaulted: Boolean(resolvedFbc) });
    }

    if (!orderId || !attrJson) {
      return NextResponse.json({ ok: false, error: 'Missing orderId or attrJson' }, { status: 400 });
    }

    let enrichedAttrJson = attrJson;
    try {
      const parsed = JSON.parse(attrJson);
      const finalFbc = parsed.fbc || cookieFbc;
      const finalFbp = parsed.fbp || cookieFbp;
      const finalUrl = parsed.eventSourceUrl || cookieLanding;
      enrichedAttrJson = JSON.stringify({
        ...parsed,
        fbc: finalFbc,
        fbp: finalFbp,
        eventSourceUrl: finalUrl,
        clientIp: parsed.clientIp || clientIp,
        userAgent: parsed.userAgent || headerUa
      });
      if (finalFbc) {
        saveAdClickToVault(supabaseAdmin, {
          fbc: finalFbc,
          fbp: finalFbp,
          email: parsed.email,
          phone: parsed.phone,
          landingUrl: finalUrl,
          clientIp: parsed.clientIp || clientIp,
          userAgent: parsed.userAgent || headerUa,
        }).catch(() => {});
      }
    } catch {}

    // Verify the order exists before writing anything
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, payment_status')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
    }

    // Don't overwrite attribution on already-paid orders
    if (order.payment_status === 'paid' || order.payment_status === 'completed') {
      return NextResponse.json({ ok: true, skipped: 'already_paid' });
    }

    // Check if we already have an attribution record for this order
    // Note: status='pending' + gateway='attribution' is used because the payments table
    // has a CHECK constraint limiting status to known values (pending/completed/failed/etc.)
    const { data: existing } = await supabaseAdmin
      .from('payments')
      .select('id, razorpay_order_id')
      .eq('order_id', orderId)
      .eq('gateway', 'attribution')
      .maybeSingle();

    if (existing) {
      // Merge so we never lose fbc, fbp, clientIp, or an ad landing eventSourceUrl
      try {
        const existingMeta = JSON.parse(existing.razorpay_order_id || '{}');
        const newMeta = JSON.parse(enrichedAttrJson);
        const mergedMeta = {
          ...existingMeta,
          ...newMeta,
          fbc: existingMeta.fbc || newMeta.fbc,
          fbp: existingMeta.fbp || newMeta.fbp,
          clientIp: existingMeta.clientIp || newMeta.clientIp,
          userAgent: existingMeta.userAgent || newMeta.userAgent,
          eventSourceUrl: (existingMeta.eventSourceUrl && (existingMeta.eventSourceUrl.includes('fbclid=') || existingMeta.eventSourceUrl.includes('utm_')))
            ? existingMeta.eventSourceUrl
            : (newMeta.eventSourceUrl || existingMeta.eventSourceUrl)
        };
        await supabaseAdmin
          .from('payments')
          .update({ razorpay_order_id: JSON.stringify(mergedMeta) })
          .eq('id', existing.id);
      } catch { /* ignore parse errors */ }
      return NextResponse.json({ ok: true, updated: true });
    }

    // Insert a new attribution-only record
    // status='pending' because the DB has a CHECK constraint on status values
    // gateway='attribution' is how we distinguish this from a real PayPal payment attempt
    const { error: insertErr } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: orderId,
        gateway: 'attribution',
        provider: 'paypal',
        provider_transaction_id: `attr_${orderId}`,
        amount: 0,
        currency: 'USD',
        status: 'pending',          // must be 'pending' due to DB CHECK constraint
        razorpay_order_id: enrichedAttrJson // stores fbc/fbp JSON (reusing this TEXT column)
      });

    if (insertErr) {
      console.error('[attribution] Insert failed:', insertErr);
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, saved: true });
  } catch (err: any) {
    console.error('[attribution] Error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
