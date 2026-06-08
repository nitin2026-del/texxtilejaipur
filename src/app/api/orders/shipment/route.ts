import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Use real SMTP credentials from environment variables
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { orderId, trackingNumber, status, shippingProvider, customerEmail, customerName } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Update the order in the database
    const { error: updateError, data: orderData } = await supabaseAdmin
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        status: status
      })
      .eq('id', orderId)
      .select('user_id, shipping_addresses(full_name)');

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    const singleOrderData = orderData?.[0];

    let finalEmail = customerEmail;
    let finalName = customerName || (singleOrderData?.shipping_addresses as any)?.full_name;

    if (!finalEmail && singleOrderData?.user_id) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(singleOrderData.user_id);
      if (userData?.user?.email) {
        finalEmail = userData.user.email;
      }
    }

    // 2. If a tracking number is provided and status is shipped/delivered, send an email
    let emailPreviewUrl = '';
    if (trackingNumber && finalEmail && (status === 'shipped' || status === 'delivered')) {
      const mailer = await getTransporter();
      
      const emailHtml = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 8px;">
          <h1 style="color: #d4af37; text-align: center; font-family: serif;">Textile Jaipur</h1>
          <h2 style="text-align: center;">Your Order is on the way!</h2>
          <p>Hi ${finalName || 'Valued Customer'},</p>
          <p>Great news! Your luxury handcrafted order <strong>#${orderId.slice(0, 8)}</strong> has been shipped via <strong>${(shippingProvider || 'Courier').toUpperCase()}</strong>.</p>
          <div style="background: #111; border: 1px solid #333; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
            <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Tracking Number</p>
            <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; font-family: monospace; color: #d4af37;">${trackingNumber}</p>
          </div>
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://textilejaipur.com'}/track" style="display: inline-block; background: #d4af37; color: #000; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 4px;">Track Package Online</a>
          </p>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
            Thank you for choosing Textile Jaipur for your export needs.
          </p>
        </div>
      `;

      const info = await mailer.sendMail({
        from: `"Textile Jaipur Dispatch" <${process.env.SMTP_USER}>`,
        to: finalEmail,
        subject: `Your Textile Jaipur Order has Shipped! (${trackingNumber})`,
        html: emailHtml,
      });

      emailPreviewUrl = 'sent';
    }

    return NextResponse.json({ 
      success: true, 
      emailSent: !!emailPreviewUrl,
      previewUrl: emailPreviewUrl 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Shipment API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update shipment' }, { status: 500 });
  }
}
