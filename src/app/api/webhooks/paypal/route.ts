import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { createClient } from '@supabase/supabase-js';
import { handlePaymentSuccess } from '@/lib/paymentSuccessHandler';

const clientId = process.env.PAYPAL_CLIENT_ID || '';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
const isSandbox = process.env.PAYPAL_SANDBOX === 'true';
const environment = isSandbox
  ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
  : new paypal.core.LiveEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// We must manually fetch the webhook signature verification API
async function verifyWebhookSignature(req: NextRequest, rawBody: string, bodyJson: any) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn('PAYPAL_WEBHOOK_ID is not configured. Webhooks will fail verification.');
    throw new Error('PAYPAL_WEBHOOK_ID is not configured');
  }

  const authAlgo = req.headers.get('paypal-auth-algo');
  const certUrl = req.headers.get('paypal-cert-url');
  const transmissionId = req.headers.get('paypal-transmission-id');
  const transmissionSig = req.headers.get('paypal-transmission-sig');
  const transmissionTime = req.headers.get('paypal-transmission-time');

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    throw new Error('Missing required PayPal headers');
  }

  // To verify, we need an access token
  const authUrl = isSandbox ? 'https://api-m.sandbox.paypal.com/v1/oauth2/token' : 'https://api-m.paypal.com/v1/oauth2/token';
  const authResponse = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const authData = await authResponse.json();
  const accessToken = authData.access_token;

  if (!accessToken) throw new Error('Failed to get PayPal access token for webhook verification');

  const verifyUrl = isSandbox 
    ? 'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' 
    : 'https://api-m.paypal.com/v1/notifications/verify-webhook-signature';

  const verifyResponse = await fetch(verifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: bodyJson
    })
  });

  const verifyData = await verifyResponse.json();
  return verifyData.verification_status === 'SUCCESS';
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Verify signature
    try {
      const isValid = await verifyWebhookSignature(req, rawBody, body);
      if (!isValid) {
        console.error('PayPal Webhook Signature Verification Failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } catch (verifyError: any) {
      console.error('Error verifying PayPal webhook:', verifyError);
      return NextResponse.json({ error: 'Verification error' }, { status: 400 });
    }

    // Handle CHECKOUT.ORDER.APPROVED (User approved, needs capture)
    if (body.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const paypalOrderId = body.resource.id;
      
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id, payment_status')
        .eq('payment_id', paypalOrderId)
        .single();
        
      if (order && order.payment_status !== 'completed') {
        try {
          const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
          request.requestBody({});
          const response = await client.execute(request);
          if (response.result.status === 'COMPLETED') {
            await supabaseAdmin.from('payments').update({ status: 'completed' }).eq('order_id', order.id);
            await handlePaymentSuccess(order.id, supabaseAdmin);
          }
        } catch (e: any) {
          const isAlreadyCaptured = e?.statusCode === 422 || JSON.stringify(e).includes('ORDER_ALREADY_CAPTURED');
          if (isAlreadyCaptured) {
            await handlePaymentSuccess(order.id, supabaseAdmin);
          }
        }
      }
    }
    
    // Handle PAYMENT.CAPTURE.COMPLETED (Fallback if captured via frontend but fulfillment failed)
    if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const paypalOrderId = body.resource?.supplementary_data?.related_ids?.order_id;
      if (paypalOrderId) {
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('id, payment_status')
          .eq('payment_id', paypalOrderId)
          .single();
          
        if (order && order.payment_status !== 'completed') {
          await supabaseAdmin.from('payments').update({ status: 'completed' }).eq('order_id', order.id);
          await handlePaymentSuccess(order.id, supabaseAdmin);
        }
      }
    }
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}
