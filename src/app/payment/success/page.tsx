'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// This page handles the PayPal return for BOTH guest and logged-in users.
// PayPal redirects to: /payment/success?token=PAYPAL_ORDER_ID&PayerID=xxx&order_id=xxx
function PaymentCaptureHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');       // PayPal order ID
    const orderId = searchParams.get('order_id'); // Our internal order ID

    if (!token || !orderId) {
      // Missing params — redirect home
      router.replace('/');
      return;
    }

    // Capture the PayPal payment
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
        if (data.success) {
          // Redirect to dashboard with success flag
          router.replace(`/dashboard?payment=captured&order_id=${orderId}`);
        } else {
          console.error('Capture failed:', data.error);
          // Still redirect to dashboard — PayPal may have already captured
          router.replace(`/dashboard?payment=captured&order_id=${orderId}`);
        }
      })
      .catch((err) => {
        console.error('Capture error:', err);
        router.replace(`/dashboard?payment=captured&order_id=${orderId}`);
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
      <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
      <p className="text-zinc-700 font-semibold text-sm">Confirming your payment…</p>
      <p className="text-zinc-400 text-xs">Please do not close this page</p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
        <p className="text-zinc-700 font-semibold text-sm">Processing payment…</p>
      </div>
    }>
      <PaymentCaptureHandler />
    </Suspense>
  );
}
