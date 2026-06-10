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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Fetch order items using order_number
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, status')
      .eq('order_number', orderId)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: itemsData, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('id, quantity, price_at_time, products(name, id)')
      .eq('order_id', orderData.id);

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 });
    }

    return NextResponse.json({ order: orderData, items: itemsData }, { status: 200 });

  } catch (error) {
    console.error('Error fetching order items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, items, reason } = await req.json();

    if (!orderId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // We fetch the order by order_number
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status, shipping_addresses(full_name)')
      .eq('order_number', orderId)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status to return_requested
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'return_requested' })
      .eq('id', orderData.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to process return request' }, { status: 500 });
    }

    // Send confirmation email
    let finalEmail = '';
    if (orderData.user_id) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(orderData.user_id);
      if (userData?.user?.email) {
        finalEmail = userData.user.email;
      }
    }
    
    if (finalEmail) {
      const mailer = await getTransporter();
      const finalName = (orderData.shipping_addresses as any)?.full_name || 'Customer';
      
      const emailHtml = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 8px;">
          <h1 style="color: #d4af37; text-align: center; font-family: serif;">Textile Jaipur</h1>
          <h2 style="text-align: center;">Return Request Confirmed</h2>
          <p>Hi ${finalName},</p>
          <p>We've successfully received your return request for order <strong>${orderId}</strong>.</p>
          <p>Our support team will review your request and send you a prepaid return shipping label along with further instructions within 24 hours.</p>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
            Thank you, Textile Jaipur Support
          </p>
        </div>
      `;

      await mailer.sendMail({
        from: '"Textile Jaipur Returns" <' + process.env.SMTP_USER + '>',
        to: finalEmail,
        subject: `Return Request Confirmed - ${orderId}`,
        html: emailHtml,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error processing return:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
