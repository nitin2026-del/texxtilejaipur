import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ success: false, message: 'Missing email or SMTP config' }, { status: 400 });
    }
    if (/@(domain\.com|example\.com|test\.com|invalid\.com)$/i.test(String(email).trim())) {
      return NextResponse.json({ success: true, skipped: 'placeholder-email' }, { status: 200 });
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

    const firstName = name ? name.split(' ')[0] : 'there';

    await transporter.sendMail({
      from: `"Textile Jaipur" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Welcome to Textile Jaipur! ✨`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fffdf7; border: 1px solid #e8dfc8;">
          <!-- Header -->
          <div style="background: #1a1a1a; padding: 30px 40px; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px;">TEXTILE JAIPUR</h1>
            <p style="color: #999; margin: 6px 0 0; font-size: 12px; letter-spacing: 1px; font-family: Arial, sans-serif;">HANDCRAFTED LUXURY FROM RAJASTHAN</p>
          </div>
          <!-- Body -->
          <div style="padding: 40px; font-family: Arial, sans-serif; color: #333; line-height: 1.8;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 16px; font-family: Georgia, serif;">Hello${firstName !== 'there' ? ' ' + firstName : ''}, 👋</h2>
            <p style="font-size: 14px; margin: 0 0 16px;">Thank you for choosing <strong>Textile Jaipur</strong>!</p>
            <p style="font-size: 14px; margin: 0 0 16px;">You're just one step away from owning a truly unique piece of handcrafted fashion.</p>
            <p style="font-size: 14px; margin: 0 0 20px;">Every jacket at Textile Jaipur is thoughtfully handmade by skilled artisans, carrying the beauty of traditional craftsmanship, intricate embroidery and individuality. No two pieces feel quite the same.</p>

            <!-- Trust Points -->
            <div style="background: #f5f0e8; border: 1px solid #e8dfc8; border-radius: 6px; padding: 20px 24px; margin-bottom: 24px;">
              <h3 style="font-size: 14px; color: #1a1a1a; margin: 0 0 14px; font-family: Georgia, serif;">Shop with confidence:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #555; vertical-align: top; width: 24px;">🧵</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #555;"><strong style="color: #333;">Handcrafted with care:</strong> Each piece reflects the skill and dedication of our artisans.</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #555; vertical-align: top;">🌍</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #555;"><strong style="color: #333;">Worldwide Shipping:</strong> We bring our handcrafted creations right to your doorstep.</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #555; vertical-align: top;">↩️</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #555;"><strong style="color: #333;">Easy Returns:</strong> Eligible purchases can be returned within our 7-day return window, subject to our return policy.</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #555; vertical-align: top;">🔒</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #555;"><strong style="color: #333;">Secure Payments:</strong> Your payment is processed through a secure checkout.</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 15px; font-weight: bold; color: #1a1a1a; margin: 0 0 16px; font-family: Georgia, serif;">Your next favourite piece is waiting for you! ✨</p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="https://www.textilejaipur.com" style="display: inline-block; background: #d4af37; color: #1a1a1a; text-decoration: none; padding: 14px 36px; font-weight: bold; font-size: 14px; letter-spacing: 1px; font-family: Arial, sans-serif; border-radius: 3px;">EXPLORE OUR COLLECTION</a>
            </div>

            <p style="font-size: 13px; color: #666; margin: 0 0 8px;">If you have any questions about sizing, delivery or your purchase, simply reply to this email. We're always happy to help.</p>
            <p style="font-size: 13px; color: #666; margin: 0 0 24px;">Thank you for supporting handmade craftsmanship. 🙏</p>

            <!-- Divider -->
            <div style="border-top: 1px solid #e8dfc8; margin: 20px 0;"></div>
            <p style="font-size: 14px; color: #333; margin: 0;">Warm regards,<br><strong>Team Textile Jaipur</strong></p>
            <p style="margin: 4px 0 0;"><a href="https://www.textilejaipur.com" style="color: #d4af37; font-size: 13px; text-decoration: none;">www.textilejaipur.com</a></p>
          </div>
          <!-- Footer -->
          <div style="background: #1a1a1a; padding: 20px 40px; text-align: center;">
            <p style="color: #666; font-size: 11px; margin: 0; font-family: Arial, sans-serif; letter-spacing: 0.5px;">© Textile Jaipur • Handcrafted in Jaipur, Rajasthan, India</p>
          </div>
        </div>
      `
    });

    console.log('Welcome email sent to:', email);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to send welcome email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
