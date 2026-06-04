/**
 * useRazorpay.js — Custom hook for Razorpay payment integration
 *
 * SETUP:
 * 1. Create a Razorpay account at https://razorpay.com
 * 2. Get your Key ID from Dashboard → Settings → API Keys
 * 3. Add it to your .env file: VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
 *
 * NOTE: For production, create a Razorpay order on your backend/Edge Function.
 * For testing, we use client-side order creation (works with test keys).
 */

import { useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

// Load Razorpay script dynamically
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export function useRazorpay() {
  const initiatePayment = useCallback(async ({
    orderId,         // Supabase order UUID
    amount,          // Amount in rupees (will be converted to paise)
    customerName,
    customerEmail,
    customerPhone,
    onSuccess,       // callback(paymentData)
    onFailure,       // callback(error)
  }) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onFailure?.('Failed to load Razorpay. Please check your internet connection.');
      return;
    }

    if (!RAZORPAY_KEY_ID) {
      onFailure?.('Razorpay Key ID not configured. Add VITE_RAZORPAY_KEY_ID to your .env file.');
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      name: 'Gupta International',
      description: `Order #${orderId?.substring(0, 8)}`,
      image: '/logo.png',
      // order_id: razorpayOrderId, // Add this when using backend order creation
      prefill: {
        name: customerName || '',
        email: customerEmail || '',
        contact: customerPhone || '',
      },
      theme: {
        color: '#4f46e5',
      },
      handler: async (response) => {
        // Payment succeeded — save to Supabase
        try {
          await supabase.from('orders').update({
            payment_status: 'paid',
            payment_method: 'razorpay',
            payment_id: response.razorpay_payment_id,
            status: 'confirmed',
          }).eq('id', orderId);

          await supabase.from('payments').insert({
            order_id: orderId,
            amount,
            status: 'success',
            gateway: 'razorpay',
            razorpay_payment_id: response.razorpay_payment_id,
          });

          onSuccess?.(response);
        } catch (err) {
          console.error('Payment DB save error:', err);
          onSuccess?.(response); // Still call success even if DB save fails
        }
      },
      modal: {
        ondismiss: () => {
          onFailure?.('Payment cancelled by user.');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      onFailure?.(resp.error?.description || 'Payment failed. Please try again.');
    });
    rzp.open();
  }, []);

  return { initiatePayment };
}
