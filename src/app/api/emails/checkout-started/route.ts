import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email, items, total } = await req.json();

    if (!email || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing email or items' }, { status: 400 });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ error: 'SMTP not configured' }, { status: 500 });
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

    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; font-size: 14px; color: #333;">
          ${item.name} <span style="color: #888;">x${item.quantity}</span>
        </td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Textile Jaipur" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `We saved your cart! 🛒 | Textile Jaipur`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fffdf7; border: 1px solid #e8dfc8;">
          <div style="background: #1a1a1a; padding: 30px 40px; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px;">TEXTILE JAIPUR</h1>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 8px;">Your items are waiting!</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px; font-family: Arial, sans-serif;">
              Hi there! We noticed you started checking out but didn't finish. 
              We've saved your beautifully handcrafted items for you.
            </p>
            <h3 style="font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px; font-family: Arial, sans-serif;">In Your Cart</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              ${itemsHtml}
            </table>
            
            <div style="text-align: center;">
              <a href="https://www.textilejaipur.com" style="display: inline-block; background: #d4af37; color: #1a1a1a; text-decoration: none; padding: 14px 36px; font-weight: bold; font-size: 14px; letter-spacing: 1px; font-family: Arial, sans-serif; border-radius: 3px;">
                COMPLETE MY ORDER
              </a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Checkout started email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
