'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import { trackMetaEvent } from '@/utils/metaTracking';

// This page handles the PayPal return for BOTH guest and logged-in users.
// PayPal redirects to: /payment/success?token=PAYPAL_ORDER_ID&PayerID=xxx&order_id=xxx
function PaymentCaptureHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart, cart } = useCart();
  const { user } = useAuth();
  const hasCaptured = useRef(false);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [orderIdState, setOrderIdState] = useState<string | null>(null);
  const [orderNumberState, setOrderNumberState] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  useEffect(() => {
    if (hasCaptured.current) return;

    const token = searchParams.get('token');       // PayPal order ID (token param)
    const orderId = searchParams.get('order_id'); // Our internal Supabase order ID

    if (!token || !orderId) {
      router.replace('/');
      return;
    }

    setOrderIdState(orderId);
    const captureKey = `captured_${orderId}`;

    // Wait we can't reliably load order number if it was cached as done without server response,
    // but the email and number should be fetched. For now if it's cached we just show generic success.

    if (localStorage.getItem(captureKey) === 'done' && !orderNumberState) {
      // If we want we can fetch order details here, but let's just show success
      setStatus('success');
      return;
    }

    hasCaptured.current = true;
    const usdAmount = localStorage.getItem('pending_order_id') === orderId ? Number(localStorage.getItem('pending_usd_amount') || 0) : 0;

    fetch('/api/payments/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'capture',
        paypalOrderId: token,
        orderId: orderId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem(captureKey, 'done');
        localStorage.removeItem('pending_order_id');
        localStorage.removeItem('pending_usd_amount');

        if (data.success) {
          if (data.order_number) setOrderNumberState(data.order_number);
          if (data.customer?.email) setCustomerEmail(data.customer.email);
          clearCart();

          trackMetaEvent('Purchase', {
            value: usdAmount,
            currency: 'USD',
            content_ids: cart.map(item => item.id),
            content_type: 'product'
          }, orderId, true);

          setStatus('success');
        } else {
          console.error('PayPal capture API returned failure:', data.error);
          setStatus('error');
        }
      })
      .catch((err) => {
        console.error('PayPal capture network error:', err);
        setStatus('error');
      });
  }, [searchParams, router, clearCart, orderNumberState]);

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <CheckCircle className="h-20 w-20 text-brand-600 animate-fade-in" />
        <div>
          <h1 className="text-3xl font-serif text-zinc-900 mb-2">Thank you for your order!</h1>
          <p className="text-zinc-600 mb-1">Your payment was successfully processed.</p>
          <p className="text-zinc-500 text-sm">Order ID: {orderNumberState || orderIdState}</p>
        </div>
        <div className="flex gap-4 mt-4">
          {user ? (
            <Link href={`/dashboard?payment=captured&order_id=${orderIdState}`} className="px-6 py-3 bg-brand-800 text-white font-bold text-sm uppercase tracking-wider shadow-md hover:bg-brand-900 transition-colors">
              View Order
            </Link>
          ) : (
            <Link href={`/track-order?order=${orderNumberState}&email=`} className="px-6 py-3 bg-brand-800 text-white font-bold text-sm uppercase tracking-wider shadow-md hover:bg-brand-900 transition-colors">
              Track Order
            </Link>
          )}
          <Link href="/collection" className="px-6 py-3 border border-zinc-300 text-zinc-700 font-bold text-sm uppercase tracking-wider hover:bg-zinc-50 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <XCircle className="h-20 w-20 text-red-500" />
        <div>
          <h1 className="text-2xl font-serif text-zinc-900 mb-2">Something went wrong</h1>
          <p className="text-zinc-600">We couldn't confirm your payment automatically.</p>
        </div>
        <div className="flex gap-4 mt-4">
          {user ? (
            <Link href="/dashboard" className="px-6 py-3 bg-zinc-900 text-white font-bold text-sm uppercase tracking-wider shadow-md hover:bg-zinc-800 transition-colors">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/" className="px-6 py-3 bg-zinc-900 text-white font-bold text-sm uppercase tracking-wider shadow-md hover:bg-zinc-800 transition-colors">
              Return Home
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-6 px-6">
      <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
      <div className="text-center">
        <p className="text-zinc-800 font-bold text-base">Confirming your payment�</p>
        <p className="text-zinc-500 text-sm mt-1">Please do not close or refresh this page</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-400 border border-zinc-200 rounded-full px-4 py-2 bg-white">
        ?? Secured by PayPal � 256-bit SSL
      </div>
      <p className="text-center text-xs text-zinc-400 max-w-xs leading-relaxed mt-2">
        If this page takes too long, don�t worry �{' '}
        <a href="mailto:textileofrajasthan.info@gmail.com" className="text-amber-600 underline">email us</a>{' '}or{' '}
        <a href="https://wa.me/919929835848" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">WhatsApp us</a>.
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    }>
      <PaymentCaptureHandler />
    </Suspense>
  );
}
