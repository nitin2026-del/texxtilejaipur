import { SupabaseClient } from '@supabase/supabase-js';
import { generateInvoiceBuffer } from './invoiceGenerator';

export async function handlePaymentSuccess(orderId: string, supabaseAdmin: SupabaseClient) {
  try {
    // 0. Idempotency Check: Don't process if already completed
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('payment_status')
      .eq('id', orderId)
      .single();

    if (existingOrder?.payment_status === 'paid' || existingOrder?.payment_status === 'completed') {
      console.log(`[handlePaymentSuccess] Order ${orderId} is already processed. Skipping duplicate fulfillment.`);
      return { success: true };
    }

    // 1. Standardize Order Status
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .update({ payment_status: 'paid', status: 'processing' })
      .eq('id', orderId)
      .select('*, shipping_addresses(*)')
      .single();

    if (orderError) {
      console.error(`[handlePaymentSuccess] Failed to update order ${orderId}:`, orderError);
      throw new Error(`Failed to update order status: ${orderError.message}`);
    }

    // 2. Decrement Inventory & Fetch details for PDF
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error(`[handlePaymentSuccess] Failed to fetch items for order ${orderId}:`, itemsError);
    } else if (orderItems && orderItems.length > 0) {
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

        // Calculate new stock (prevent going below 0)
        const newStock = Math.max(0, (product.stock_quantity || 0) - item.quantity);

        // Update product stock
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product_id);

        if (updateError) {
          console.error(`[handlePaymentSuccess] Failed to update stock for product ${item.product_id}:`, updateError);
        }
      }
    }

    // 3 & 4 & 5. WhatsApp & PDF Invoice & Email Notification
    const targetEmail = order?.user_id ? undefined : order?.guest_email;
    const hasEmailToNotify = !!(order?.user_id || targetEmail);

    if (hasEmailToNotify) {
      try {
        let userEmail = targetEmail;
        let userName = 'Valued Customer';

        if (order?.user_id) {
          const { data: authData } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
          const { data: profileData } = await supabaseAdmin.from('profiles').select('full_name').eq('id', order.user_id).single();
          userEmail = authData?.user?.email || targetEmail;
          userName = profileData?.full_name || 'Valued Customer';
        }

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
