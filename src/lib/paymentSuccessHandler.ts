import { SupabaseClient } from '@supabase/supabase-js';
import { generateInvoiceBuffer } from './invoiceGenerator';
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
    skipCapi?: boolean;
    isWebhook?: boolean;
  }
) {
  try {
    // 0. Idempotency Check: Don't process fulfillment if already completed, but allow attribution updates if metadata is present
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('payment_status')
      .eq('id', orderId)
      .single();

    const isAlreadyPaid = existingOrder?.payment_status === 'paid' || existingOrder?.payment_status === 'completed';
    if (isAlreadyPaid && !metaData?.fbp && !metaData?.fbc && !metaData?.clientIp) {
      console.log(`[handlePaymentSuccess] Order ${orderId} is already processed. Skipping duplicate fulfillment.`);
      return { success: true };
    }

    // 1. Standardize Order Status (only if not already paid)
    let order: any = null;
    if (!isAlreadyPaid) {
      const { data: updatedOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'paid', status: 'processing' })
        .eq('id', orderId)
        .select('*, shipping_addresses(*)')
        .single();

      if (orderError) {
        console.error(`[handlePaymentSuccess] Failed to update order ${orderId}:`, orderError);
        throw new Error(`Failed to update order status: ${orderError.message}`);
      }
      order = updatedOrder;
    } else {
      const { data: fetchedOrder } = await supabaseAdmin
        .from('orders')
        .select('*, shipping_addresses(*)')
        .eq('id', orderId)
        .single();
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

    // Check if CAPI was already sent for this order
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id, raw_response')
      .eq('order_id', orderId)
      .maybeSingle();

    const capiAlreadySent = !!(existingPayment?.raw_response as any)?.meta_capi_sent;

    if (process.env.META_ACCESS_TOKEN && !shouldSkipCapi && !capiAlreadySent) {
      try {
        const testCode = metaData?.testEventCode || process.env.META_TEST_EVENT_CODE;
        const payload = {
          data: [{
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            event_id: orderId,
            event_source_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://textilejaipur.com',
            action_source: 'website',
            user_data: {
              em: hashMeta(normEmail(userEmail)) ? [hashMeta(normEmail(userEmail))] : undefined,
              ph: hashMeta(normPhone(userPhone)) ? [hashMeta(normPhone(userPhone))] : undefined,
              fn: hashMeta(normStr(firstName)) ? [hashMeta(normStr(firstName))] : undefined,
              ln: hashMeta(normStr(lastName)) ? [hashMeta(normStr(lastName))] : undefined,
              ct: hashMeta(normStr(userCity)) ? [hashMeta(normStr(userCity))] : undefined,
              st: hashMeta(normStr(userState)) ? [hashMeta(normStr(userState))] : undefined,
              zp: hashMeta(normStr(userZip)) ? [hashMeta(normStr(userZip))] : undefined,
              country: hashMeta(normCountry(userCountry)) ? [hashMeta(normCountry(userCountry))] : undefined,
              external_id: hashMeta(order?.user_id) ? [hashMeta(order?.user_id)] : undefined,
              fbp: metaData?.fbp,
              fbc: metaData?.fbc,
              client_ip_address: typeof metaData?.clientIp === 'string' ? metaData.clientIp.split(',')[0].trim() : undefined,
              client_user_agent: metaData?.userAgent
            },
            custom_data: {
              currency: (metaData?.trackingCurrency || order?.display_currency || 'USD').toUpperCase(),
              value: Number((metaData?.trackingAmount || Number(order?.total_display_currency) || order?.total || 0).toFixed(2)),
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
        } else if (existingPayment?.id) {
          const currentRaw = (existingPayment.raw_response as any) || {};
          await supabaseAdmin
            .from('payments')
            .update({
              raw_response: {
                ...currentRaw,
                meta_capi_sent: true,
                meta_capi_timestamp: new Date().toISOString()
              }
            })
            .eq('id', existingPayment.id);
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
