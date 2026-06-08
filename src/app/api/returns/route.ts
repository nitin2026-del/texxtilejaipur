import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }
  return transporter;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, email } = await req.json();

    if (!orderId || !email) {
      return NextResponse.json({ error: 'Order ID and email are required' }, { status: 400 });
    }

    // 1. Fetch order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, created_at, shipping_addresses(full_name)')
      .eq('order_number', orderId)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json({ error: 'Order not found. Please check your order number.' }, { status: 404 });
    }

    // 2. Verify Email matches (only if user_id exists)
    if (orderData.user_id) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(orderData.user_id);
      if (userData?.user?.email) {
        if (userData.user.email.toLowerCase() !== email.toLowerCase()) {
          return NextResponse.json({ error: 'The email does not match the order records.' }, { status: 403 });
        }
      }
    }
    
    // For guest users (user_id is null), we accept the email they provide 
    // since order numbers are cryptographically random/unguessable.
    const finalEmail = email;

    // 3. Verify 30-Day Window
    const createdAt = new Date(orderData.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (createdAt < thirtyDaysAgo) {
      return NextResponse.json({ error: 'Order is past the 30-day return window.' }, { status: 400 });
    }

    const finalName = (orderData.shipping_addresses as any)?.full_name || 'Customer';

    // 4. Send Return Link Email
    const mailer = await getTransporter();
      
    const emailHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 8px;">
        <h1 style="color: #d4af37; text-align: center; font-family: serif;">Textile Jaipur</h1>
        <h2 style="text-align: center;">Return Request Initiated</h2>
        <p>Hi ${finalName},</p>
        <p>We received a return request for your order <strong>${orderId}</strong>.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://textilejaipur.com'}/returns/process?order=${orderId}" style="display: inline-block; background: #d4af37; color: #000; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 4px;">Complete Your Return</a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
          Textile Jaipur Support
        </p>
      </div>
    `;

    await mailer.sendMail({
      from: `"Textile Jaipur Support" <${process.env.SMTP_USER}>`,
      to: finalEmail,
      subject: `Your Return Link for Order ${orderId}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Returns API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
