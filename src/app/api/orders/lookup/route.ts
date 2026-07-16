import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, order_number } = body;

    if (!email || !order_number) {
      return NextResponse.json({ error: 'Email and order number are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOrderNumber = order_number.trim().toUpperCase();

    // Look up by guest_email + order_number
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total,
        subtotal,
        created_at,
        tracking_number,
        shipping_provider,
        display_currency,
        shipping_addresses (
          full_name,
          city,
          country
        ),
        order_items (
          quantity,
          price_at_time,
          products (
            name,
            slug
          )
        )
      `)
      .eq('order_number', normalizedOrderNumber)
      .eq('guest_email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('Order lookup error:', error);
      return NextResponse.json({ error: 'Failed to look up order' }, { status: 500 });
    }

    // Also try looking up by authenticated user profile email
    let finalOrder = order;
    if (!finalOrder) {
      // Try matching via auth.users
      const { data: userOrder } = await supabaseAdmin
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_status,
          total,
          subtotal,
          created_at,
          tracking_number,
          shipping_provider,
          display_currency,
          user_id,
          shipping_addresses (
            full_name,
            city,
            country
          ),
          order_items (
            quantity,
            price_at_time,
            products (
              name,
              slug
            )
          )
        `)
        .eq('order_number', normalizedOrderNumber)
        .not('user_id', 'is', null)
        .maybeSingle();

      if (userOrder && userOrder.user_id) {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userOrder.user_id);
        if (authData?.user?.email?.toLowerCase() === normalizedEmail) {
          finalOrder = userOrder;
        }
      }
    }

    if (!finalOrder) {
      return NextResponse.json({ error: 'No order found with that email and order number. Please check and try again.' }, { status: 404 });
    }

    return NextResponse.json({ order: finalOrder }, { status: 200 });
  } catch (err: any) {
    console.error('Order lookup API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
