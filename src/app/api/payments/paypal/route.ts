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
    const { action, paypalOrderId, orderId, amount, currency, landingPage, coinsUsed, coinsEarned, fbp, fbc, testEventCode } = body;

    if (action === 'capture') {
      if (!paypalOrderId || !orderId) {
        return NextResponse.json({ error: 'Missing required parameters for capture' }, { status: 400 });
      }

      let captureStatus = '';
      let paypalPayerEmail = '';
      try {
        // Capture the PayPal order
        const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        request.requestBody({});
        const response = await client.execute(request);
        captureStatus = response.result.status;
        paypalPayerEmail = response.result?.payer?.email_address || response.result?.payment_source?.paypal?.email_address || '';
      } catch (captureError: any) {
        // If already captured (back button / duplicate request), treat as success
        const isAlreadyCaptured =
          JSON.stringify(captureError).includes('ORDER_ALREADY_CAPTURED');
        if (isAlreadyCaptured) {
          captureStatus = 'COMPLETED'; // Already captured — order is paid
          // Still fetch the PayPal payer email so Meta gets it for Advanced Matching
          try {
            const getRes = await client.execute(new paypal.orders.OrdersGetRequest(paypalOrderId));
            paypalPayerEmail = getRes.result?.payer?.email_address || getRes.result?.payment_source?.paypal?.email_address || '';
          } catch {
            // non-critical
          }
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

      // Extract tracking parameters for CAPI
      const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
      const clientIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : undefined;
      const userAgent = req.headers.get('user-agent') || undefined;
      const { data: trackOrder } = await supabaseAdmin.from('orders').select('display_currency, total_display_currency').eq('id', orderId).single();
      const rawTrackingAmount = Number(trackOrder?.total_display_currency) || 0;
      const metaData = { 
        fbp, 
        fbc, 
        clientIp: typeof clientIp === 'string' ? clientIp : undefined, 
        userAgent,
        trackingCurrency: (trackOrder?.display_currency || 'USD').toUpperCase(),
        trackingAmount: Number(rawTrackingAmount.toFixed(2)),
        testEventCode,
        paypalEmail: paypalPayerEmail || undefined
      };

      // Centralized success handler
      await handlePaymentSuccess(orderId, supabaseAdmin, metaData);

      // Fetch customer details for Meta Pixel Advanced Matching
      const { data: orderData } = await supabaseAdmin
        .from('orders')
        .select(`
          order_number,
          guest_email,
          user_id,
          total,
          shipping_addresses (
            full_name, phone, country, postal_code, city, state
          ),
          order_items (
            product_id, quantity
          )
        `)
        .eq('id', orderId)
        .single();
        
      let email = orderData?.guest_email || '';
      if (!email && orderData?.user_id) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(orderData.user_id);
        email = userData?.user?.email || '';
      }

      const shipAddr = (Array.isArray(orderData?.shipping_addresses) ? orderData?.shipping_addresses[0] : orderData?.shipping_addresses) as any || {};

      // The CAPI Gateway will automatically pick up the frontend Pixel event.
      // We do not fire a manual Graph API server event here to prevent duplicate server events.

      return NextResponse.json({ 
        success: true, 
        status: captureStatus,
        order_number: orderData?.order_number || orderId,
        order_total: Number((Number(trackOrder?.total_display_currency) || Number(orderData?.total) || 0).toFixed(2)),
        currency: (trackOrder?.display_currency || 'USD').toUpperCase(),
        items: orderData?.order_items || [],
        customer: {
          email: email || paypalPayerEmail || '',
          name: shipAddr?.full_name || '',
          phone: shipAddr?.phone || '',
          country: shipAddr?.country || '',
          zip: shipAddr?.postal_code || '',
          city: shipAddr?.city || '',
          state: shipAddr?.state || ''
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
      
      const FX_RATES: Record<string, number> = {
        INR: 1,
        USD: 0.0104,
        EUR: 0.0091,
        GBP: 0.0079,
        AED: 0.039480,
        AUD: 0.016150,
        NZD: 0.020000,
        CAD: 0.016500,
      };

      const PAYPAL_SUPPORTED = ['USD', 'EUR', 'GBP', 'AUD', 'NZD', 'CAD'];
      const rawCurr = currency.toUpperCase();
      const targetCurrency = PAYPAL_SUPPORTED.includes(rawCurr) ? rawCurr : 'USD';
      const rate = FX_RATES[targetCurrency] || FX_RATES['USD'];
      
      const secureAmountInTargetCurrency = Number((secureTotalInr * rate + 1e-9).toFixed(2));

      if (secureAmountInTargetCurrency <= 0) {
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
            currency_code: targetCurrency,
            value: secureAmountInTargetCurrency.toString(),
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
        .update({ 
          payment_id: createdPaypalOrderId, 
          payment_method: 'paypal'
        })
        .eq('id', orderId);

      // Extract client IP & User-Agent at the moment the customer clicks PayPal
      const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
      const clientIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : undefined;
      const userAgent = req.headers.get('user-agent') || undefined;
      const eventSourceUrl = req.headers.get('referer') || `${siteUrl}/payment/success?order_id=${orderId}`;

      // Record the payment attempt in the payments table with Meta attribution metadata.
      // Stored as JSON in razorpay_order_id (verified TEXT column on payments table) since raw_response does not exist in schema.
      const metaAttributionJson = JSON.stringify({
        fbp: fbp || undefined,
        fbc: fbc || undefined,
        clientIp,
        userAgent,
        eventSourceUrl,
        testEventCode: testEventCode || undefined,
        trackingCurrency: targetCurrency,
        trackingAmount: secureAmountInTargetCurrency
      });

      const { error: insertPaymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          order_id: orderId,
          gateway: 'paypal',
          provider: 'paypal',
          provider_transaction_id: createdPaypalOrderId,
          amount: secureAmountInTargetCurrency,
          currency: targetCurrency,
          status: 'pending',
          razorpay_order_id: metaAttributionJson
        });

      if (insertPaymentError) {
        console.error('Failed to insert pending payment record:', insertPaymentError);
      }

      return NextResponse.json({ id: createdPaypalOrderId, approvalUrl }, { status: 200 });
    }
  } catch (error: any) {
    console.error('PayPal API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
