import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { createClient } from '@supabase/supabase-js';
import { handlePaymentSuccess } from '@/lib/paymentSuccessHandler';

// Initialize PayPal — switches between Sandbox and Live via env variable
const clientId = process.env.PAYPAL_CLIENT_ID || '';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
const isSandbox = process.env.PAYPAL_SANDBOX === 'true';
const environment = isSandbox
  ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
  : new paypal.core.LiveEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing! Falling back to anon key.');
}
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, paypalOrderId, orderId, amount, currency, landingPage, coinsUsed, coinsEarned } = body;

    if (action === 'capture') {
      if (!paypalOrderId || !orderId) {
        return NextResponse.json({ error: 'Missing required parameters for capture' }, { status: 400 });
      }

      let captureStatus = '';
      try {
        // Capture the PayPal order
        const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        request.requestBody({});
        const response = await client.execute(request);
        captureStatus = response.result.status;
      } catch (captureError: any) {
        // If already captured (back button / duplicate request), treat as success
        const isAlreadyCaptured =
          captureError?.statusCode === 422 ||
          JSON.stringify(captureError).includes('ORDER_ALREADY_CAPTURED');
        if (isAlreadyCaptured) {
          captureStatus = 'COMPLETED'; // Already captured — order is paid
        } else {
          throw captureError; // Real error — re-throw
        }
      }

      // Check if capture was successful
      if (captureStatus !== 'COMPLETED') {
        throw new Error(`PayPal payment not completed: ${captureStatus}`);
      }

      // Update payment record in payments table
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .update({ status: 'succeeded' })
        .eq('order_id', orderId)
        .eq('gateway', 'paypal');
        
      if (paymentError) {
        console.error('Failed to update payments table:', paymentError);
        // Don't throw — main order is already marked paid
      }

      // Deduct JaiCoins from user profile if applicable
      const { data: order } = await supabaseAdmin.from('orders').select('user_id').eq('id', orderId).single();
      if (order?.user_id && (coinsUsed > 0 || coinsEarned > 0)) {
        const { data: profile } = await supabaseAdmin.from('profiles').select('jai_coins').eq('id', order.user_id).single();
        if (profile) {
          const newBalance = Math.max(0, profile.jai_coins - (coinsUsed || 0)) + (coinsEarned || 0);
          await supabaseAdmin.from('profiles').update({ jai_coins: newBalance }).eq('id', order.user_id);
        }
      }

      // Centralized success handler
      await handlePaymentSuccess(orderId, supabaseAdmin);

      return NextResponse.json({ success: true, status: captureStatus }, { status: 200 });
    } else {
      // Default: Create PayPal Order
      if (!orderId || !amount || !currency) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://textilejaipur.com';
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderId,
          amount: {
            currency_code: currency.toUpperCase(),
            value: Number(amount).toFixed(2),
          }
        }],
        application_context: {
          return_url: `${siteUrl}/payment/success?order_id=${orderId}`,
          cancel_url: `${siteUrl}/?payment=cancelled`,
          brand_name: 'Textile Jaipur',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          landing_page: landingPage === 'LOGIN' ? 'LOGIN' : 'BILLING'
        }
      });

      const response = await client.execute(request);
      const createdPaypalOrderId = response.result.id;

      // Get the approval URL so the frontend can redirect the user
      const approvalUrl = response.result.links?.find((l: any) => l.rel === 'approve')?.href || '';

      // Update the order in Supabase with the PayPal order ID
      await supabaseAdmin
        .from('orders')
        .update({ payment_intent_id: createdPaypalOrderId, gateway: 'paypal' })
        .eq('id', orderId);

      // Record the payment attempt in the payments table
      await supabaseAdmin
        .from('payments')
        .insert({
          order_id: orderId,
          gateway: 'paypal',
          amount: amount,
          currency: currency,
          status: 'intent_created',
          raw_response: response.result,
        });

      return NextResponse.json({ id: createdPaypalOrderId, approvalUrl }, { status: 200 });
    }
  } catch (error: any) {
    console.error('PayPal API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
