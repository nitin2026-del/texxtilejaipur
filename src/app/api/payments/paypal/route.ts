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
        .update({ status: 'completed' })
        .eq('order_id', orderId)
        .eq('gateway', 'paypal');
        
      if (paymentError) {
        console.error('Failed to update payments table:', paymentError);
        // Don't throw — main order is already marked paid
      }

      // Centralized success handler
      await handlePaymentSuccess(orderId, supabaseAdmin);

      // Fetch customer details for Meta Pixel Advanced Matching
      const { data: orderData } = await supabaseAdmin
        .from('orders')
        .select(`
          guest_email,
          user_id,
          total,
          shipping_addresses (
            full_name, phone, country, postal_code, city, state
          )
        `)
        .eq('id', orderId)
        .single();
        
      let email = orderData?.guest_email || '';
      if (!email && orderData?.user_id) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(orderData.user_id);
        email = userData?.user?.email || '';
      }

      // 1. Calculate the USD value used in the frontend Pixel
      const secureTotalInr = orderData?.total || 0;
      const USD_RATE = 0.010769; // Calibrated rate
      const usdValue = Number((secureTotalInr * USD_RATE).toFixed(2));

      // 2. Extract Client Network Identifiers for CAPI
      const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
      const userAgent = req.headers.get('user-agent') || undefined;
      const fbp = req.cookies.get('_fbp')?.value;
      const fbc = req.cookies.get('_fbc')?.value;
      const nameParts = (orderData?.shipping_addresses?.full_name || '').trim().split(' ');
      const fn = nameParts[0] || undefined;
      const ln = nameParts.slice(1).join(' ') || undefined;

      // 3. Fire Meta CAPI Event (Non-blocking)
      const { sendMetaConversionsApiEvent } = await import('@/lib/metaConversionsApi');
      
      // We don't await this so it doesn't block the checkout response
      sendMetaConversionsApiEvent({
        eventName: 'Purchase',
        eventId: orderId, // Crucial for Deduplication
        eventSourceUrl: req.headers.get('referer') || 'https://www.textilejaipur.com/payment/success',
        userData: {
          email,
          phone: orderData?.shipping_addresses?.phone || undefined,
          first_name: fn,
          last_name: ln,
          city: orderData?.shipping_addresses?.city || undefined,
          state: orderData?.shipping_addresses?.state || undefined,
          country: orderData?.shipping_addresses?.country || undefined,
          zip: orderData?.shipping_addresses?.postal_code || undefined,
          client_ip_address: clientIp,
          client_user_agent: userAgent,
          fbp,
          fbc
        },
        customData: {
          currency: 'USD',
          value: usdValue,
        }
      });

      return NextResponse.json({ 
        success: true, 
        status: captureStatus,
        customer: {
          email,
          name: orderData?.shipping_addresses?.full_name || '',
          phone: orderData?.shipping_addresses?.phone || '',
          country: orderData?.shipping_addresses?.country || '',
          zip: orderData?.shipping_addresses?.postal_code || ''
        }
      }, { status: 200 });
    } else {
      // Default: Create PayPal Order
      if (!orderId || !currency) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }

      // Secure amount validation
      const { data: order } = await supabaseAdmin.from('orders').select('user_id, total').eq('id', orderId).single();
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      let secureTotalInr = order.total || 0;
      
      const USD_RATE = 0.010769; // Calibrated: 6500 INR = $70 USD
      const secureUsdAmount = Number((secureTotalInr * USD_RATE).toFixed(2));

      if (secureUsdAmount <= 0) {
        return NextResponse.json({ error: 'Invalid order amount for PayPal' }, { status: 400 });
      }

      const siteUrl = 'https://www.textilejaipur.com';
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderId,
          amount: {
            currency_code: currency.toUpperCase(),
            value: secureUsdAmount.toString(),
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
        .update({ payment_id: createdPaypalOrderId, payment_method: 'paypal' })
        .eq('id', orderId);

      // Record the payment attempt in the payments table
      await supabaseAdmin
        .from('payments')
        .insert({
          order_id: orderId,
          gateway: 'paypal',
          provider: 'paypal',
          provider_transaction_id: createdPaypalOrderId,
          amount: amount,
          currency: currency,
          status: 'intent_created'
        });

      return NextResponse.json({ id: createdPaypalOrderId, approvalUrl }, { status: 200 });
    }
  } catch (error: any) {
    console.error('PayPal API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
