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

    // Free order validation: If total is > 0, this route is invalid without JaiCoins
    const orderTotalInr = order.total || 0;
    if (orderTotalInr > 0) {
      return NextResponse.json({ error: 'Order is not free. Please pay the remaining balance.' }, { status: 403 });
    }

    // Centralized success handler
    await handlePaymentSuccess(orderId, supabaseAdmin);

    // Record the zero-amount payment
    await supabaseAdmin
      .from('payments')
      .insert({
        order_id: orderId,
        gateway: 'free',
        amount: 0,
        currency: 'USD',
        status: 'completed'
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Free order API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
