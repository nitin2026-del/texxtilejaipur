'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// This page handles the PayPal return for BOTH guest and logged-in users.
// PayPal redirects to: /payment/success?token=PAYPAL_ORDER_ID&PayerID=xxx&order_id=xxx
function PaymentCaptureHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Guard against double-capture (React StrictMode double-invoke / back-button re-visit)
  const hasCaptured = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (hasCaptured.current) return;

    const token = searchParams.get('token');       // PayPal order ID (token param)
    const orderId = searchParams.get('order_id'); // Our internal Supabase order ID

    if (!token || !orderId) {
      // Missing params — someone visited this URL directly, send them home
      router.replace('/');
      return;
    }

    // Guard against re-capture on page reload / back-button using localStorage
    const captureKey = `captured_${orderId}`;
    if (localStorage.getItem(captureKey) === 'done') {
      // Already captured — go straight to dashboard
      router.replace(`/dashboard?payment=captured&order_id=${orderId}`);
      return;
    }

    hasCaptured.current = true;

    const coinsUsed = localStorage.getItem('pending_order_id') === orderId ? Number(localStorage.getItem('pending_jaicoins_used') || 0) : 0;
    const coinsEarned = localStorage.getItem('pending_order_id') === orderId ? Number(localStorage.getItem('pending_jaicoins_earned') || 0) : 0;
    const usdAmount = localStorage.getItem('pending_order_id') === orderId ? Number(localStorage.getItem('pending_usd_amount') || 0) : 0;

    // Capture the PayPal payment server-side
    fetch('/api/payments/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'capture',
        paypalOrderId: token,   // PayPal token = their order ID
        orderId: orderId,       // Our DB order ID to mark as paid
        coinsUsed,
        coinsEarned
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Mark as captured in localStorage to prevent re-capture
        localStorage.setItem(captureKey, 'done');
        // Clear pending JaiCoins data
        localStorage.removeItem('pending_order_id');
        localStorage.removeItem('pending_jaicoins_used');
        localStorage.removeItem('pending_jaicoins_earned');
        localStorage.removeItem('pending_usd_amount');

        if (data.success) {
          // Fire Facebook Pixel Purchase Event
          if (typeof window !== 'undefined' && (window as any).fbq && usdAmount > 0) {
            (window as any).fbq('track', 'Purchase', {
              value: usdAmount,
              currency: 'USD'
            });
          }

          // Redirect to dashboard with success flag — will show success banner
          router.replace(`/dashboard?payment=captured&order_id=${orderId}`);
        } else {
          console.error('PayPal capture API returned failure:', data.error);
          // Even if capture returns false, PayPal may have already captured.
          // Redirect to dashboard anyway — order will show as paid if capture succeeded server-side.
          router.replace(`/dashboard?payment=captured&order_id=${orderId}`);
        }
      })
      .catch((err) => {
        console.error('PayPal capture network error:', err);
        // Network error — still redirect, admin can verify in PayPal dashboard
        router.replace(`/dashboard?payment=captured&order_id=${orderId}`);
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-6 px-6">
      <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
      <div className="text-center">
        <p className="text-zinc-800 font-bold text-base">Confirming your payment…</p>
        <p className="text-zinc-500 text-sm mt-1">Please do not close or refresh this page</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-400 border border-zinc-200 rounded-full px-4 py-2 bg-white">
        🔒 Secured by PayPal · 256-bit SSL
      </div>
      <p className="text-center text-xs text-zinc-400 max-w-xs leading-relaxed mt-2">
        If this page takes too long, don’t worry —{' '}
        <a href="mailto:support@textilejaipur.com" className="text-amber-600 underline">email us</a>{' '}or{' '}
        <a href="https://wa.me/918764655537" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">WhatsApp us</a>.
        We will confirm your payment and order from our side.
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
        <p className="text-zinc-700 font-semibold text-sm">Processing payment…</p>
        <p className="text-zinc-400 text-xs">Please do not close this page</p>
        <p className="text-center text-xs text-zinc-400 max-w-xs leading-relaxed mt-4">
          Having trouble?{' '}
          <a href="mailto:support@textilejaipur.com" className="text-amber-600 underline">Email us</a>{' '}or{' '}
          <a href="https://wa.me/918764655537" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">WhatsApp us</a>
          {' '}— we handle all issues from our side.
        </p>
      </div>
    }>
      <PaymentCaptureHandler />
    </Suspense>
  );
}
