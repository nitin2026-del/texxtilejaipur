import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ success: false, message: 'Missing email or SMTP config' }, { status: 400 });
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
      subject: `Welcome to Textile Jaipur!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
          <h2 style="color: #d4af37;">Welcome to Textile Jaipur!</h2>
          <p>Hi ${firstName},</p>
          <p>Your account has been successfully created with the email: <strong>${email}</strong>.</p>
          <p>You can now log in to track your orders and save your favorite luxury ethnic clothing.</p>
          <p>We are thrilled to have you with us!</p>
          <p>Warm regards,<br><strong>The Textile Jaipur Team</strong></p>
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
