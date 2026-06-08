import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe (use a placeholder or env variable)
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' as any });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, currency } = body;

    if (!orderId || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Stripe expects amounts in the smallest currency unit (e.g., cents for USD)
    // For INR, it's paise. 
    // We'll multiply by 100 for standard decimals.
    const amountInSmallestUnit = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId,
      },
    });

    // Update the order in Supabase with the payment intent ID
    await supabaseAdmin
      .from('orders')
      .update({ payment_intent_id: paymentIntent.id, gateway: 'stripe' })
      .eq('id', orderId);

    // Record the payment attempt in the payments table
    await supabaseAdmin
      .from('payments')
      .insert({
        order_id: orderId,
        gateway: 'stripe',
        amount: amount,
        currency: currency,
        status: 'pending',
        raw_response: paymentIntent,
      });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret }, { status: 200 });
  } catch (error: any) {
    console.error('Stripe API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
