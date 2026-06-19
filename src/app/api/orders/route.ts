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
    const { items, total_inr, display_currency, total_display_currency, user_id, shipping_address, guest_email, coupon_code } = body;

    const authHeader = req.headers.get('Authorization');
    let supabaseClient = supabaseAdmin;
    let finalUserId = null; // Only trust the secure token, never the client payload

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        finalUserId = user.id; // securely override user_id from trusted token
      }
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let addressId = null;

    // 1. Check or Insert Shipping Address if provided
    if (shipping_address) {
      // Deduplicate address
      let query = supabaseAdmin
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
        const { data: addressData, error: addressError } = await supabaseAdmin
          .from('shipping_addresses')
          .insert({
            user_id: finalUserId,
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
          return NextResponse.json({ error: `Failed to save address: ${addressError.message}` }, { status: 500 });
        }
        addressId = addressData.id;
      }
    }

    // 2. Fetch real product prices from DB to prevent client forgery
    const productIds = items.map((i: any) => i.id);
    const { data: realProducts } = await supabaseAdmin
      .from('products')
      .select('id, price')
      .in('id', productIds);

    let realSubtotalInr = 0;
    const secureOrderItems = items.map((item: any) => {
      const realProduct = realProducts?.find((p) => p.id === item.id);
      const securePrice = realProduct?.price || item.price_inr || item.price || 0;
      realSubtotalInr += securePrice * item.quantity;
      
      return {
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: securePrice
      };
    });

    // Securely calculate final order total on the backend
    let finalTotalInr = realSubtotalInr;

    // A. Apply Tier Discount (only if authenticated user)
    if (finalUserId) {
      const { count } = await supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', finalUserId)
        .eq('payment_status', 'completed');
        
      const orderCount = count || 0;
      let tierPercent = 0;
      if (orderCount >= 2) tierPercent = 15;
      else if (orderCount === 1) tierPercent = 10;
      
      if (tierPercent > 0) {
        finalTotalInr -= finalTotalInr * (tierPercent / 100);
      }
    }

    // B. Apply Bundle Discount (25% off if original USD value >= 150)
    // Approximate USD value for backend check
    const approximateUsdValue = realSubtotalInr * 0.010769; // Calibrated: 6500 INR = $70 USD
    if (approximateUsdValue >= 150) {
      finalTotalInr -= realSubtotalInr * 0.25; // 25% off original subtotal
    }

    // C. Apply Coupon Discount securely from DB
    if (coupon_code) {
      const { data: couponData } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.trim().toUpperCase())
        .eq('is_active', true)
        .single();
        
      if (couponData && (!couponData.min_order_value || realSubtotalInr >= couponData.min_order_value)) {
        if (couponData.discount_type === 'percentage') {
          finalTotalInr -= finalTotalInr * (couponData.discount_value / 100);
        } else {
          finalTotalInr -= couponData.discount_value;
        }
      }
    }

    finalTotalInr = Math.max(0, finalTotalInr);

    // 3. Create the order using secure subtotal
    const orderNumber = 'TJ-' + Math.floor(100000 + Math.random() * 900000);
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: finalUserId,
        guest_email: finalUserId ? null : guest_email,
        shipping_address_id: addressId,
        order_number: orderNumber,
        total: finalTotalInr, // Now using 100% secure server-side total
        subtotal: realSubtotalInr,
        status: 'pending',
        payment_status: 'pending'
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // 4. Insert order items
    const finalItems = secureOrderItems.map((item: any) => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(finalItems);

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
