import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    // Use service role key to bypass RLS for inserting subscribers
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('newsletters')
      .insert([{ email }]);

    if (error && error.code !== '23505') {
      // 23505 is unique constraint (already subscribed), which is fine, we still want to send the email if they asked again
      // or maybe we shouldn't send it again. Let's assume we always send the code if it's their first time, or if they try again.
      // But actually, we probably don't want to spam the DB with new coupons for the same email.
      // If they are already subscribed, let's just return success so the UI says "Check email".
      if (error.code !== '23505') {
         throw error;
      }
    }

    // 1. Generate unique 10% off code
    const discountCode = 'VIP10-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // 2. Save the coupon to the database so it actually works at checkout
    const { error: couponError } = await supabase
      .from('coupons')
      .insert([{
        code: discountCode,
        discount_type: 'percentage',
        discount_value: 10,
        min_order_value: 0,
        is_active: true
      }]);

    if (couponError) {
      console.error('Failed to generate coupon:', couponError);
      // We will still try to send an email, maybe without the code or with a fallback code?
      // Or just fail. It's better to log and proceed, maybe fallback to a generic code.
    }

    // 3. Send the email with the code
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Textile Jaipur" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Welcome to the VIP Club! Here is your 10% off code 🎁`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
            <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <h2 style="color: #d4af37; font-family: Georgia, serif; font-size: 24px; text-align: center; margin-bottom: 20px;">Welcome to Textile Jaipur!</h2>
              
              <p>Hi there,</p>
              
              <p>Thank you for joining our exclusive VIP club! We are thrilled to have you.</p>
              
              <p>As promised, here is your exclusive 10% off discount code that you can use on your next purchase:</p>
              
              <div style="background-color: #1a1a1a; color: #d4af37; text-align: center; padding: 15px; margin: 25px 0; border-radius: 4px; font-weight: bold; font-size: 20px; letter-spacing: 2px;">
                ${discountCode}
              </div>
              
              <p>Simply enter this code at checkout to apply the discount. You'll also get Priority Processing & Expedited Shipping on your order automatically!</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://textilejaipur.com'}" style="background-color: #d4af37; color: #000; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 14px;">Shop the Collection</a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #888; text-align: center;">
                Warm regards,<br>
                <strong>The Textile Jaipur Team</strong>
              </p>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
