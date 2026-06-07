import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handlePaymentSuccess } from '@/lib/paymentSuccessHandler';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, coinsUsed, coinsEarned } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch Order to validate it
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('user_id, total, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order already processed' }, { status: 400 });
    }

    let actualCoinsUsed = 0;
    let actualCoinsEarned = 0;

    // Verify JaiCoins and user
    if (order.user_id) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('jai_coins').eq('id', order.user_id).single();
      if (!profile) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }

      // Calculate securely
      const orderTotalInr = order.total || 0;
      actualCoinsUsed = Math.min(profile.jai_coins, orderTotalInr); // Cannot use more coins than order total or what user has
      
      // Calculate how much INR is left to pay
      const remainingTotal = Math.max(0, orderTotalInr - actualCoinsUsed);

      // Free order validation: If remaining total is > 0, this route is invalid
      if (remainingTotal > 0) {
        return NextResponse.json({ error: 'Order is not fully covered by JaiCoins. Please pay the remaining balance.' }, { status: 403 });
      }

      // 5% of effective INR is earned. Since effective INR is 0 for free order, coinsEarned is 0.
      actualCoinsEarned = Math.round(remainingTotal * 0.05);

      // Centralized success handler
      await handlePaymentSuccess(orderId, supabaseAdmin);

      // Deduct JaiCoins from user profile (only deduct what was actually needed)
      const newBalance = Math.max(0, profile.jai_coins - actualCoinsUsed) + actualCoinsEarned;
      await supabaseAdmin.from('profiles').update({ jai_coins: newBalance }).eq('id', order.user_id);
      
    } else {
      // Guest users cannot use JaiCoins, so they cannot have a free order this way
      return NextResponse.json({ error: 'Guest users cannot use JaiCoins' }, { status: 403 });
    }

    // Record the zero-amount payment
    await supabaseAdmin
      .from('payments')
      .insert({
        order_id: orderId,
        gateway: 'jaicoins',
        amount: 0,
        currency: 'USD',
        status: 'succeeded'
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Free order API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
