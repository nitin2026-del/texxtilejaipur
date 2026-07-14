import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, customerName, orderNumber, orderId, items, totalDisplay, currency, shippingAddress } = body;

    if (!email || !orderNumber) {
      return NextResponse.json({ success: false, message: 'Missing email or order number' }, { status: 400 });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP not configured — skipping confirmation email');
      return NextResponse.json({ success: false, message: 'SMTP not configured' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const firstName = customerName ? customerName.split(' ')[0] : 'there';
    const siteUrl = 'https://www.textilejaipur.com';
    const trackingUrl = `${siteUrl}/track-order?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`;

    const currencySymbols: Record<string, string> = {
      INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', AUD: 'A$', NZD: 'NZ$', CAD: 'C$'
    };
    const symbol = currencySymbols[currency] || '₹';

    const itemsHtml = (items || []).map((item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; font-size: 14px; color: #333;">
          ${item.name} <span style="color: #888;">x${item.quantity}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; font-size: 14px; color: #333; text-align: right;">
          ${symbol}${(item.price_inr * item.quantity).toLocaleString()}
        </td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from: `"Textile Jaipur" <${process.env.SMTP_USER}>`,
      to: email,
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
                <td style="padding: 14px 0 0; font-size: 15px; font-weight: bold; color: #d4af37; text-align: right;">${totalDisplay}</td>
              </tr>
            </table>

            <!-- Shipping -->
            ${shippingAddress ? `
            <div style="margin-bottom: 28px;">
              <h3 style="font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; font-family: Arial, sans-serif;">Shipping To</h3>
              <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0; font-family: Arial, sans-serif;">
                ${shippingAddress.full_name}<br/>
                ${shippingAddress.address_line1}${shippingAddress.address_line2 ? ', ' + shippingAddress.address_line2 : ''}<br/>
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}<br/>
                ${shippingAddress.country}
              </p>
            </div>
            ` : ''}

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
              Questions? Reply to this email or contact us at <a href="mailto:support@textilejaipur.com" style="color: #d4af37;">support@textilejaipur.com</a>
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
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to send order confirmation email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
