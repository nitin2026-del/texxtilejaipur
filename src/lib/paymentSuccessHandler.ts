import { SupabaseClient } from '@supabase/supabase-js';
import { generateInvoiceBuffer } from './invoiceGenerator';
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

// Meta's default click attribution window is 7 days, so only recover click IDs created within that window.
const FBC_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

const getFbcCreationMs = (fbc?: string): number | undefined => {
  const parts = fbc?.split('.');
  const ts = parts && parts.length >= 4 ? Number(parts[2]) : NaN;
  return Number.isFinite(ts) ? ts : undefined;
};

/**
 * Cross-browser / cross-device fbc bridge.
 * When a buyer clicks a Meta ad in the Facebook/Instagram in-app browser (where fbc exists) and later
 * completes the purchase in Chrome or on another device (where fbc does not exist), recover the ad click ID
 * from that same customer's earlier checkout session — matched by email, phone, or account (never by IP alone,
 * because mobile carriers share IPs across many users).
 */
export async function recoverFbcFromPriorSessions(
  supabaseAdmin: SupabaseClient,
  currentOrderId: string,
  opts: { emails: string[]; phone?: string; userId?: string }
): Promise<string | undefined> {
  try {
    const sinceIso = new Date(Date.now() - FBC_LOOKBACK_MS).toISOString();
    const orderIds = new Set<string>();

    const emails = Array.from(new Set(
      opts.emails.filter(Boolean).flatMap(e => [e.trim(), e.trim().toLowerCase()])
    ));
    if (emails.length > 0) {
      const { data } = await supabaseAdmin
        .from('orders').select('id').in('guest_email', emails).gte('created_at', sinceIso).limit(50);
      data?.forEach((r: any) => orderIds.add(r.id));
    }

    if (opts.userId) {
      const { data } = await supabaseAdmin
        .from('orders').select('id').eq('user_id', opts.userId).gte('created_at', sinceIso).limit(50);
      data?.forEach((r: any) => orderIds.add(r.id));
    }

    // Compare the last 9 digits so "+61 481 180 816", "0481180816" and "61481180816" all match
    const phoneTail = (normPhone(opts.phone) || '').slice(-9);
    if (phoneTail.length >= 8) {
      const { data: addrs } = await supabaseAdmin
        .from('shipping_addresses').select('id, phone').gte('created_at', sinceIso).limit(2000);
      const addrIds = (addrs || [])
        .filter((a: any) => (normPhone(a.phone) || '').slice(-9) === phoneTail)
        .map((a: any) => a.id);
      if (addrIds.length > 0) {
        const { data } = await supabaseAdmin
          .from('orders').select('id').in('shipping_address_id', addrIds).gte('created_at', sinceIso).limit(50);
        data?.forEach((r: any) => orderIds.add(r.id));
      }
    }

    orderIds.delete(currentOrderId);
    if (orderIds.size === 0) return undefined;

    const { data: priorPayments } = await supabaseAdmin
      .from('payments')
      .select('razorpay_order_id, created_at')
      .in('order_id', Array.from(orderIds))
      .order('created_at', { ascending: false })
      .limit(50);

    for (const p of priorPayments || []) {
      try {
        const meta = JSON.parse(p.razorpay_order_id || '{}');
        const createdMs = getFbcCreationMs(meta?.fbc);
        if (meta?.fbc && createdMs && Date.now() - createdMs <= FBC_LOOKBACK_MS) {
          return meta.fbc as string;
        }
      } catch {
        // not a JSON attribution record
      }
    }
  } catch (err) {
    console.error('[CAPI] fbc recovery lookup failed:', err);
  }
  return undefined;
}

export async function handlePaymentSuccess(
  orderId: string, 
  supabaseAdmin: SupabaseClient,
  metaData?: { 
    fbp?: string; 
    fbc?: string; 
    clientIp?: string; 
    userAgent?: string; 
    trackingCurrency?: string; 
    trackingAmount?: number;
    testEventCode?: string;
    paypalEmail?: string;
    skipCapi?: boolean;
    isWebhook?: boolean;
  }
) {
  try {
    // 0 & 1. Atomic Compare-and-Swap Order Status Update:
    // Ensures that if PayPal Webhook and Browser /payment/success run at the exact same millisecond,
    // PostgreSQL row-locking guarantees only ONE caller transitions payment_status to 'paid'.
    const { data: claimedOrder } = await supabaseAdmin
      .from('orders')
      .update({ payment_status: 'paid', status: 'processing' })
      .eq('id', orderId)
      .neq('payment_status', 'paid')
      .neq('payment_status', 'completed')
      .select('*, shipping_addresses(*)')
      .maybeSingle();

    const isAlreadyPaid = !claimedOrder;
    if (isAlreadyPaid && !metaData?.fbp && !metaData?.fbc && !metaData?.clientIp) {
      console.log(`[handlePaymentSuccess] Order ${orderId} is already processed. Skipping duplicate fulfillment.`);
      return { success: true };
    }

    let order: any = claimedOrder;
    if (!order) {
      const { data: fetchedOrder, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('*, shipping_addresses(*)')
        .eq('id', orderId)
        .single();
      if (fetchError || !fetchedOrder) {
        throw new Error(`Failed to fetch order ${orderId}: ${fetchError?.message || 'Not found'}`);
      }
      order = fetchedOrder;
    }

    // 2. Decrement Inventory & Fetch details for PDF
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error(`[handlePaymentSuccess] Failed to fetch items for order ${orderId}:`, itemsError);
    } else if (!isAlreadyPaid && orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        if (!item.product_id || !item.quantity) continue;
        
        // Fetch current stock
        const { data: product, error: productError } = await supabaseAdmin
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single();

        if (productError) {
          console.error(`[handlePaymentSuccess] Failed to fetch product ${item.product_id}:`, productError);
          continue;
        }

        // Atomically update product stock via RPC to prevent overselling on concurrent checkouts
        const { error: updateError } = await supabaseAdmin.rpc('decrement_product_stock', {
          prod_id: item.product_id,
          qty: item.quantity
        });

        if (updateError) {
          console.error(`[handlePaymentSuccess] Failed to atomic update stock for product ${item.product_id}:`, updateError);
        }
      }
    }

    // 3 & 4 & 5. WhatsApp & PDF Invoice & Email Notification
    const targetEmail = order?.user_id ? undefined : order?.guest_email;
    const hasEmailToNotify = !!(order?.user_id || targetEmail);

    const addr = (Array.isArray(order?.shipping_addresses) ? order?.shipping_addresses[0] : order?.shipping_addresses) || {};
    let userEmail = targetEmail || order?.guest_email || '';
    let userName = addr?.full_name || 'Valued Customer';
    let userPhone = addr?.phone || '';
    let userCity = addr?.city || '';
    let userState = addr?.state || '';
    let userZip = addr?.postal_code || '';
    let userCountry = addr?.country || '';

    if (order?.user_id) {
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
      const { data: profileData } = await supabaseAdmin.from('profiles').select('full_name').eq('id', order.user_id).single();
      userEmail = authData?.user?.email || userEmail;
      userName = profileData?.full_name || addr?.full_name || userName;
    }

    const nameParts = (userName || '').trim().split(/\s+/);
    const firstName = nameParts[0] && nameParts[0] !== 'Valued' ? nameParts[0] : undefined;
    const lastName = nameParts.length > 1 && nameParts[1] !== 'Customer' ? nameParts.slice(1).join(' ') : undefined;

    // Send Meta CAPI Purchase Event
    const PIXEL_ID = process.env.META_PIXEL_ID || '1045219725239327';
    const shouldSkipCapi = metaData?.skipCapi || false;

    // Check if CAPI was already sent for this order and recover stored browser attribution if called via webhook.
    // Note: payments table uses razorpay_order_id (TEXT column) to store the JSON attribution object.
    //
    // IMPORTANT: Fetch ALL payment attempts for this order (no limit) ordered newest-first.
    // When a customer initiates checkout today but pays 1-2 days later (very common on mobile/iOS),
    // their browser _fbc cookie gets wiped by iOS ITP between sessions. The _fbc was captured in
    // their FIRST payment attempt (when they originally clicked PayPal). We scan ALL attempts so
    // we never lose that ad-click attribution across delayed purchases.
    const { data: allOrderPayments } = await supabaseAdmin
      .from('payments')
      .select('id, razorpay_order_id, status')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    // Most recent REAL payment record (not the attribution placeholder) — used for updating status / CAPI-sent flag
    const existingPayment = (allOrderPayments || []).find(p => p.status !== 'attribution') || allOrderPayments?.[0];
    let storedMeta: any = {};
    if (existingPayment?.razorpay_order_id) {
      try {
        storedMeta = JSON.parse(existingPayment.razorpay_order_id);
      } catch {
        storedMeta = {};
      }
    }
    const capiAlreadySent = !!storedMeta?.meta_capi_sent;

    // Recover _fbc from any PRIOR payment/attribution record on this SAME order.
    // Sources in allOrderPayments (newest-first):
    //   1. 'attribution' record — written at checkout shipping-submit (EARLIEST, even before PayPal click)
    //   2. 'pending' PayPal record — written when customer first clicked PayPal button
    // This covers the ATC → leave → return 1-2 days later scenario where iOS ITP wiped the cookie.
    let recoveredOrderFbc: string | undefined;
    if (!storedMeta?.fbc && !metaData?.fbc) {
      for (const p of (allOrderPayments || [])) {
        try {
          const m = JSON.parse(p.razorpay_order_id || '{}');
          const createdMs = getFbcCreationMs(m?.fbc);
          if (m?.fbc && createdMs && (Date.now() - createdMs) <= FBC_LOOKBACK_MS) {
            recoveredOrderFbc = m.fbc;
            console.log(`[CAPI] Recovered _fbc from prior payment attempt on same order ${orderId}`);
            break;
          }
        } catch { /* not a JSON attribution record */ }
      }
    }

    if (process.env.META_ACCESS_TOKEN && !shouldSkipCapi && !capiAlreadySent) {
      try {
        const resolvedFbp = metaData?.fbp || storedMeta?.fbp || undefined;
        let resolvedFbc: string | undefined = metaData?.fbc || storedMeta?.fbc || recoveredOrderFbc || undefined;
        let fbcRecovered = !!recoveredOrderFbc && !metaData?.fbc && !storedMeta?.fbc;
        if (!resolvedFbc) {
          // Cross-order fallback: look at OTHER orders from same customer within 7 days
          const crossSessionFbc = await recoverFbcFromPriorSessions(supabaseAdmin, orderId, {
            emails: [userEmail, metaData?.paypalEmail || storedMeta?.paypalEmail].filter(Boolean) as string[],
            phone: userPhone,
            userId: order?.user_id || undefined
          });
          if (crossSessionFbc) {
            resolvedFbc = crossSessionFbc;
            fbcRecovered = true;
          }
          if (fbcRecovered) console.log(`[CAPI] Recovered fbc from earlier session for order ${orderId}`);
        }
        const rawIp = metaData?.clientIp || storedMeta?.clientIp;
        const resolvedIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : undefined;
        const resolvedUa = metaData?.userAgent || storedMeta?.userAgent || undefined;
        const resolvedCurrency = (metaData?.trackingCurrency || storedMeta?.trackingCurrency || order?.display_currency || 'USD').toUpperCase();
        const resolvedAmount = Number((metaData?.trackingAmount || storedMeta?.trackingAmount || Number(order?.total_display_currency) || order?.total || 0).toFixed(2));
        const testCode = metaData?.testEventCode || storedMeta?.testEventCode || process.env.META_TEST_EVENT_CODE;
        const resolvedSourceUrl = storedMeta?.eventSourceUrl || `https://www.textilejaipur.com/payment/success?order_id=${orderId}`;

        const emailHashes = Array.from(new Set([
          hashMeta(normEmail(userEmail)),
          hashMeta(normEmail(metaData?.paypalEmail || storedMeta?.paypalEmail))
        ].filter(Boolean) as string[]));

        const payload = {
          data: [{
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            event_id: orderId,
            event_source_url: resolvedSourceUrl,
            action_source: 'website',
            user_data: {
              em: emailHashes.length > 0 ? emailHashes : undefined,
              ph: getPhoneHashes(userPhone, userCountry),
              fn: hashMeta(normStr(firstName)) ? [hashMeta(normStr(firstName))] : undefined,
              ln: hashMeta(normStr(lastName)) ? [hashMeta(normStr(lastName))] : undefined,
              ct: hashMeta(normStr(userCity)) ? [hashMeta(normStr(userCity))] : undefined,
              st: hashMeta(normStr(userState)) ? [hashMeta(normStr(userState))] : undefined,
              zp: hashMeta(normStr(userZip)) ? [hashMeta(normStr(userZip))] : undefined,
              country: hashMeta(normCountry(userCountry)) ? [hashMeta(normCountry(userCountry))] : undefined,
              external_id: hashMeta(order?.user_id || orderId) ? [hashMeta(order?.user_id || orderId)] : undefined,
              fbp: resolvedFbp,
              fbc: resolvedFbc,
              client_ip_address: resolvedIp,
              client_user_agent: resolvedUa
            },
            custom_data: {
              currency: resolvedCurrency,
              value: resolvedAmount,
              content_ids: (orderItems || []).map(item => item.product_id).filter(Boolean),
              contents: (orderItems || []).map(item => ({ id: item.product_id, quantity: item.quantity })),
              content_type: 'product',
              order_id: orderId
            }
          }],
          ...(testCode ? { test_event_code: testCode } : {})
        };

        const capiResponse = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${process.env.META_ACCESS_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!capiResponse.ok) {
          console.error('[CAPI] Purchase event failed:', await capiResponse.text());
        } else {
          const updatedMetaJson = JSON.stringify({
            ...storedMeta,
            fbp: resolvedFbp,
            fbc: resolvedFbc,
            ...(fbcRecovered ? { fbc_recovered: true } : {}),
            clientIp: resolvedIp,
            userAgent: resolvedUa,
            meta_capi_sent: true,
            meta_capi_timestamp: new Date().toISOString()
          });
          if (existingPayment?.id) {
            await supabaseAdmin
              .from('payments')
              .update({
                status: 'completed',
                razorpay_order_id: updatedMetaJson
              })
              .eq('id', existingPayment.id);
          } else {
            await supabaseAdmin
              .from('payments')
              .insert({
                order_id: orderId,
                gateway: 'paypal',
                provider: 'paypal',
                provider_transaction_id: order?.payment_id || orderId,
                amount: resolvedAmount,
                currency: resolvedCurrency,
                status: 'completed',
                razorpay_order_id: updatedMetaJson
              });
          }
        }
      } catch (err) {
        console.error('[CAPI] Error:', err);
      }
    }


    if (!isAlreadyPaid && hasEmailToNotify) {
      try {
        const userData = { email: userEmail, full_name: userName };
        
        // Email & PDF Invoice
        if (userEmail && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          let pdfBuffer: Buffer | null = null;
          const mappedItems = (orderItems || []).map((item: any) => ({
            ...item,
            product_name: item.products?.name
          }));
          try {
            pdfBuffer = await generateInvoiceBuffer(order, mappedItems, { ...userData, email: userEmail });
          } catch (pdfErr) {
            console.error(`[handlePaymentSuccess] Failed to generate PDF for order ${orderId}:`, pdfErr);
          }

          const nodemailer = require('nodemailer');
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          const siteUrl = 'https://www.textilejaipur.com';
          const orderNumber = order.order_number || orderId;
          const trackingUrl = `${siteUrl}/track-order?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(userEmail)}`;
          const firstName = userName ? userName.split(' ')[0] : 'there';
          const currency = order.display_currency || 'INR';
          const currencySymbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', AUD: 'A$', NZD: 'NZ$', CAD: 'C$' };
          const symbol = currencySymbols[currency] || '₹';

          const itemsHtml = mappedItems.map((item: any) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; font-size: 14px; color: #333;">
                ${item.product_name || 'Product'} <span style="color: #888;">x${item.quantity}</span>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; font-size: 14px; color: #333; text-align: right;">
                ${symbol}${(item.price_at_time * item.quantity).toLocaleString()}
              </td>
            </tr>
          `).join('');

          const sa = order.shipping_addresses;
          const shippingHtml = sa ? `
            <div style="margin-bottom: 28px;">
              <h3 style="font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; font-family: Arial, sans-serif;">Shipping To</h3>
              <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0; font-family: Arial, sans-serif;">
                ${sa.full_name || userName}<br/>
                ${sa.address_line1 || ''}${sa.address_line2 ? ', ' + sa.address_line2 : ''}<br/>
                ${sa.city || ''}, ${sa.state || ''} ${sa.postal_code || ''}<br/>
                ${sa.country || ''}
              </p>
            </div>
          ` : '';

          const mailOptions: any = {
            from: `"Textile Jaipur" <${process.env.SMTP_USER}>`,
            to: userEmail,
            bcc: process.env.TRUSTPILOT_INVITE_BCC || 'textilejaipur.com+a774b29729@invite.trustpilot.com',
            subject: `✅ Order Confirmed — ${orderNumber} | Textile Jaipur`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fffdf7; border: 1px solid #e8dfc8;">
                <!-- Header -->
                <div style="background: #1a1a1a; padding: 30px 40px; text-align: center;">
                  <h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px;">TEXTILE JAIPUR</h1>
                  <p style="color: #999; margin: 6px 0 0; font-size: 12px; letter-spacing: 1px; font-family: Arial, sans-serif;">HANDCRAFTED LUXURY FROM RAJASTHAN</p>
                </div>
                <!-- Body -->
                <div style="padding: 40px;">
                  <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 8px;">Thank you, ${firstName}! 🎉</h2>
                  <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px; font-family: Arial, sans-serif;">
                    Your order has been confirmed and our artisans in Jaipur are preparing your beautiful pieces. 
                    You will receive a shipping notification once your package is dispatched.
                  </p>
                  <!-- Order Number -->
                  <div style="background: #f5f0e8; border: 1px solid #e8dfc8; border-radius: 6px; padding: 16px 20px; margin-bottom: 28px;">
                    <p style="margin: 0; font-size: 12px; color: #888; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                    <p style="margin: 4px 0 0; font-size: 22px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px;">${orderNumber}</p>
                  </div>
                  <!-- Items -->
                  <h3 style="font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px; font-family: Arial, sans-serif;">Your Items</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    ${itemsHtml}
                    <tr>
                      <td style="padding: 14px 0 0; font-size: 15px; font-weight: bold; color: #1a1a1a;">Total Paid</td>
                      <td style="padding: 14px 0 0; font-size: 15px; font-weight: bold; color: #d4af37; text-align: right;">${order.total_display_currency || symbol + order.total}</td>
                    </tr>
                  </table>
                  <!-- Shipping -->
                  ${shippingHtml}
                  <!-- Track Button -->
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${trackingUrl}" style="display: inline-block; background: #d4af37; color: #1a1a1a; text-decoration: none; padding: 14px 36px; font-weight: bold; font-size: 14px; letter-spacing: 1px; font-family: Arial, sans-serif; border-radius: 3px;">
                      📦 TRACK MY ORDER
                    </a>
                    <p style="margin: 12px 0 0; font-size: 11px; color: #aaa; font-family: Arial, sans-serif;">
                      Or visit <a href="${siteUrl}/track-order" style="color: #d4af37;">${siteUrl}/track-order</a> and enter your order number: <strong>${orderNumber}</strong>
                    </p>
                  </div>
                  <!-- Divider -->
                  <div style="border-top: 1px solid #e8dfc8; margin: 28px 0;"></div>
                  <p style="font-size: 13px; color: #888; line-height: 1.7; font-family: Arial, sans-serif; margin: 0;">
                    Questions? Reply to this email or contact us at <a href="mailto:textileofrajasthan.info@gmail.com" style="color: #d4af37;">textileofrajasthan.info@gmail.com</a><br/>
                    <em>Your official PDF invoice is attached to this email.</em>
                  </p>
                </div>
                <!-- Footer -->
                <div style="background: #1a1a1a; padding: 20px 40px; text-align: center;">
                  <p style="color: #666; font-size: 11px; margin: 0; font-family: Arial, sans-serif; letter-spacing: 0.5px;">
                    © Textile Jaipur • Handcrafted in Jaipur, Rajasthan, India
                  </p>
                </div>
              </div>
            `
          };

          if (pdfBuffer) {
            mailOptions.attachments = [
              {
                filename: `Invoice_${orderNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ];
          }

          await transporter.sendMail(mailOptions);
          console.log(`[handlePaymentSuccess] Order confirmation email (with PDF) sent to: ${userEmail}`);
        } else {
          console.warn('[handlePaymentSuccess] ⚠️ WARNING: Skipping order confirmation email. Missing SMTP credentials in Environment Variables! Ensure SMTP_HOST, SMTP_USER, and SMTP_PASS are set in Vercel.');
        }
      } catch (err) {
        console.error(`[handlePaymentSuccess] Failed during notification/PDF step:`, err);
      }
    }

    return { success: true };
  } catch (error) {
    console.error(`[handlePaymentSuccess] Error processing order ${orderId}:`, error);
    throw error;
  }
}
