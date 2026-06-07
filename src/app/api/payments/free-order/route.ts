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

    // Deduct JaiCoins from user profile
    const { data: order } = await supabaseAdmin.from('orders').select('user_id').eq('id', orderId).single();
    if (order?.user_id) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('jai_coins').eq('id', order.user_id).single();
      if (profile) {
        const newBalance = Math.max(0, profile.jai_coins - (coinsUsed || 0)) + (coinsEarned || 0);
        await supabaseAdmin.from('profiles').update({ jai_coins: newBalance }).eq('id', order.user_id);
      }
    }

    // Centralized success handler
    await handlePaymentSuccess(orderId, supabaseAdmin);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Free order API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
