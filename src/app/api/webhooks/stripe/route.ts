import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { handlePaymentSuccess } from '@/lib/paymentSuccessHandler';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' as any });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } else {
      // In local dev without webhook secret, just parse the JSON
      event = JSON.parse(payload);
    }
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent was successful!');
      
      const orderId = paymentIntent.metadata?.orderId;
      
      if (orderId) {
        // Centralized success handler
        await handlePaymentSuccess(orderId, supabaseAdmin);
          
        await supabaseAdmin
          .from('payments')
          .update({ status: 'completed' })
          .eq('order_id', orderId)
          .eq('provider', 'stripe');
          
        // Here you would trigger the Email / WhatsApp notifications
      }
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      if (failedIntent.metadata?.orderId) {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'cancelled', payment_status: 'failed' })
          .eq('id', failedIntent.metadata.orderId);
          
        await supabaseAdmin
          .from('payments')
          .update({ status: 'failed' })
          .eq('order_id', failedIntent.metadata.orderId)
          .eq('provider', 'stripe');
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
