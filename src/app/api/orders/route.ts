import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a server-side Supabase client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, total_inr, display_currency, total_display_currency, user_id, shipping_address } = body;

    const authHeader = req.headers.get('Authorization');
    let supabaseClient = supabaseAdmin;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
          global: {
            headers: { Authorization: `Bearer ${token}` }
          }
        }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let addressId = null;

    // 1. Check or Insert Shipping Address if provided
    if (shipping_address) {
      // Deduplicate address
      let query = supabaseClient
        .from('shipping_addresses')
        .select('id')
        .eq('full_name', shipping_address.full_name)
        .eq('address_line1', shipping_address.address_line1)
        .eq('city', shipping_address.city)
        .eq('state', shipping_address.state)
        .eq('postal_code', shipping_address.postal_code)
        .eq('country', shipping_address.country)
        .limit(1);

      if (user_id) {
        query = query.eq('user_id', user_id);
      } else {
        query = query.is('user_id', null);
      }

      const { data: existingAddress } = await query.maybeSingle();

      if (existingAddress) {
        addressId = existingAddress.id;
      } else {
        const { data: addressData, error: addressError } = await supabaseClient
          .from('shipping_addresses')
          .insert({
            user_id: user_id || null,
            full_name: shipping_address.full_name,
            address_line1: shipping_address.address_line1,
            address_line2: shipping_address.address_line2,
            city: shipping_address.city,
            state: shipping_address.state,
            postal_code: shipping_address.postal_code,
            country: shipping_address.country,
            phone: shipping_address.phone
          })
          .select('id')
          .single();
          
        if (addressError) {
          console.error('Failed to create address:', addressError);
          return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
        }
        addressId = addressData.id;
      }
    }

    // 2. Create the order
    const orderNumber = 'TJ-' + Math.floor(100000 + Math.random() * 900000);
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user_id || null,
        shipping_address_id: addressId,
        order_number: orderNumber,
        total: total_inr,
        subtotal: total_inr,
        display_currency: display_currency || 'USD',
        total_display: total_display_currency || null,
        status: 'pending',
        payment_status: 'unpaid',
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // 3. Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price_inr
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Failed to insert order items:', itemsError);
      // Clean up the orphaned order to avoid ghost orders
      await supabaseClient.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Failed to save order items. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error('API Error /orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
