import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { createClient } from '@supabase/supabase-js';

// Initialize PayPal with LIVE credentials
const clientId = process.env.PAYPAL_CLIENT_ID || '';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
const environment = new paypal.core.LiveEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, paypalOrderId, orderId, amount, currency, landingPage } = body;

    if (action === 'capture') {
      if (!paypalOrderId || !orderId) {
        return NextResponse.json({ error: 'Missing required parameters for capture' }, { status: 400 });
      }

      // Capture the PayPal order
      const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
      request.requestBody({});
      const response = await client.execute(request);

      // Check if capture was successful
      const status = response.result.status;
      if (status !== 'COMPLETED') {
        throw new Error(`PayPal payment not completed: ${status}`);
      }

      // Update the order payment status in Supabase to paid
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', orderId);

      // Update payment record in payments table
      await supabaseAdmin
        .from('payments')
        .update({ status: 'succeeded', raw_response: response.result })
        .eq('order_id', orderId)
        .eq('gateway', 'paypal');

      return NextResponse.json({ success: true, status }, { status: 200 });
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
          return_url: `${siteUrl}/dashboard?payment=success&order_id=${orderId}`,
          cancel_url: `${siteUrl}/?payment=cancelled`,
          brand_name: 'Textile Jaipur',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          landing_page: landingPage === 'BILLING' ? 'BILLING' : 'LOGIN'
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
