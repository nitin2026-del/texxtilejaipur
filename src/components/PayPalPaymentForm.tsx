'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PayPalPaymentFormProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export const PayPalPaymentForm: React.FC<PayPalPaymentFormProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
}) => {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonsRendered = useRef(false);

  const usdAmount = Number(amount.toFixed(2));

  // Load the PayPal JS SDK script
  useEffect(() => {
    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons,funding-eligibility&enable-funding=card`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => setSdkError(true);
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []);

  // Render PayPal + Card buttons once SDK is ready
  useEffect(() => {
    if (!sdkReady || !window.paypal || buttonsRendered.current) return;
    if (!paypalRef.current || !cardRef.current) return;

    buttonsRendered.current = true;

    const createOrder = async () => {
      const res = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount: usdAmount, currency: 'USD' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create PayPal order');
      return data.id;
    };

    const onApprove = async (data: any) => {
      try {
        const res = await fetch('/api/payments/paypal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'capture', paypalOrderId: data.orderID, orderId }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to capture payment');
        onSuccess(orderId);
      } catch (err: any) {
        onError(err.message || 'Payment capture failed.');
      }
    };

    const onPayPalError = (err: any) => {
      console.error('PayPal Error:', err);
      onError('PayPal payment failed. Please try again.');
    };

    // Render PayPal button
    window.paypal
      .Buttons({
        fundingSource: window.paypal.FUNDING.PAYPAL,
        createOrder,
        onApprove,
        onError: onPayPalError,
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 48,
        },
      })
      .render(paypalRef.current);

    // Render Credit/Debit Card button
    window.paypal
      .Buttons({
        fundingSource: window.paypal.FUNDING.CARD,
        createOrder,
        onApprove,
        onError: onPayPalError,
        style: {
          layout: 'vertical',
          color: 'black',
          shape: 'rect',
          label: 'pay',
          height: 48,
        },
      })
      .render(cardRef.current);
  }, [sdkReady, orderId, usdAmount]);

  return (
    <div className="space-y-4">
      {/* Amount Display */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
        <p className="text-xs text-zinc-400 mb-1">Total Amount</p>
        <p className="text-sm font-bold text-white">
          <span className="text-yellow-400">${usdAmount} USD</span>
        </p>
      </div>

      {/* SDK Error State */}
      {sdkError && (
        <div className="text-center text-red-400 text-sm py-4 border border-red-800 rounded-lg bg-red-900/20">
          Failed to load payment options. Please refresh the page and try again.
        </div>
      )}

      {/* Loading State */}
      {!sdkReady && !sdkError && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <svg className="animate-spin h-6 w-6 text-yellow-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-xs text-zinc-500">Loading payment options...</p>
        </div>
      )}

      {/* PayPal Button Container */}
      <div ref={paypalRef} className={sdkReady ? 'block' : 'hidden'} />

      {/* Divider */}
      {sdkReady && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-zinc-700" />
          <span className="text-xs text-zinc-500">or pay with card</span>
          <div className="flex-1 h-px bg-zinc-700" />
        </div>
      )}

      {/* Card Button Container */}
      <div ref={cardRef} className={sdkReady ? 'block' : 'hidden'} />

      {/* Accepted Cards */}
      <div className="border border-zinc-700 rounded-xl p-3 bg-zinc-800/30">
        <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
          We Accept
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">

          {/* Visa */}
          <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center" style={{ width: 54, height: 34 }}>
            <svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg" width="46">
              <rect width="780" height="500" rx="40" fill="#fff"/>
              <path d="M293.2 348.7L323.3 151h51.4L344.6 348.7H293.2z" fill="#00579F"/>
              <path d="M524.3 154.9c-10.2-3.8-26.1-7.9-46.1-7.9-50.8 0-86.6 25.6-86.9 62.3-.3 27.1 25.6 42.2 45.1 51.2 20 9.2 26.7 15.1 26.6 23.3-.1 12.6-16 18.3-30.7 18.3-20.5 0-31.4-2.8-48.2-9.8l-6.6-3-7.2 42.1c12 5.2 34 9.8 56.9 10 53.7 0 88.6-25.3 89-64.3.2-21.4-13.5-37.7-43.2-51.1-18-8.7-29-14.5-28.9-23.3 0-7.8 9.3-16.2 29.5-16.2 16.8-.3 29 3.3 38.5 7l4.6 2.2 7-40.8" fill="#00579F"/>
              <path d="M616.3 151h-39.7c-12.3 0-21.5 3.4-26.9 15.6l-76.3 182.1h53.9l10.8-28.2 65.7.1c1.5 6.6 6.2 28.1 6.2 28.1h47.6L616.3 151zm-63.1 128.2l20.4-52.7c-.3.4 4.2-10.8 6.8-17.8l3.4 16.1 11.8 54.4h-42.4z" fill="#00579F"/>
              <path d="M232.8 151l-50.3 135-5.4-25.9c-9.3-30.1-38.4-62.7-70.9-79L153 348.5l54.3-.1 80.9-197.4h-55.4" fill="#00579F"/>
              <path d="M138.8 151H57.5l-.7 3.7c63.1 15.3 104.9 52.3 122.2 96.8L161.5 167c-3-11.9-11.8-15.5-22.7-16" fill="#FAA61A"/>
            </svg>
          </div>

          {/* Mastercard */}
          <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center" style={{ width: 54, height: 34 }}>
            <svg viewBox="0 0 131.39 86.9" xmlns="http://www.w3.org/2000/svg" width="42">
              <rect width="131.39" height="86.9" rx="7" fill="#fff"/>
              <circle cx="48.37" cy="43.45" r="27.23" fill="#EB001B"/>
              <circle cx="83.02" cy="43.45" r="27.23" fill="#F79E1B"/>
              <path d="M65.7 19.76a27.22 27.22 0 0 1 0 47.38 27.22 27.22 0 0 1 0-47.38z" fill="#FF5F00"/>
            </svg>
          </div>

          {/* American Express */}
          <div className="rounded-md flex items-center justify-center overflow-hidden" style={{ width: 54, height: 34, background: '#2E77BC' }}>
            <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg" width="46">
              <rect width="750" height="471" rx="40" fill="#2E77BC"/>
              <path d="M0 0h750v471H0z" fill="#2E77BC"/>
              <path d="M185.6 181.5H130l-25.2 54.8-25.4-54.8H24l-.1 107.8 46.2.1 .1-80.8 29.8 62.5h30.3l29.6-63.3.1 81.6h46l-.4-107.9zM243.3 181.5l-48.5 107.8h50.5l7.7-18.3h57l7.5 18.3h52.3l-48.4-107.8h-78.1zm18.9 72.1l17.5-41.3 17.4 41.3h-34.9zM510 181.5h-55l-30.3 40.8-29.4-40.8H270l62.6 54.5-65.3 53.3h56.5l30.9-42 30.6 42h58.2l-65.1-54.5L510 181.5z" fill="white"/>
              <path d="M510 181.5v107.8h120.7c26.5 0 44.3-14.1 44.3-37.3 0-15.5-9.3-27.2-25.3-31.9 12.7-4.9 20.3-15.4 20.3-28.7 0-20-16.3-9.9-159.9-9.9zm45.9 35.5h61.4c8.6 0 13 3.7 13 10.1 0 6.4-4.5 10.2-13.3 10.2h-61.1v-20.3zm0 51.3v-21.5h63.4c9.7 0 14.5 4.1 14.5 11.2 0 6.7-4.9 10.3-13.8 10.3h-64.1z" fill="white"/>
            </svg>
          </div>

          {/* Discover */}
          <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center overflow-hidden" style={{ width: 54, height: 34 }}>
            <svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg" width="46">
              <rect width="780" height="500" rx="40" fill="#fff"/>
              <path d="M510 250c0 63.5-51.5 115-115 115s-115-51.5-115-115 51.5-115 115-115 115 51.5 115 115z" fill="#F76F20"/>
              <path d="M36 180h60c58 0 98 36 98 90s-40 90-98 90H36V180zm55 145c38 0 63-22 63-55s-25-55-63-55H78v110h13zM208 180h43v180h-43zM261 270c0-55 43-95 99-95 16 0 30 3 44 10v50c-11-13-26-21-44-21-33 0-56 24-56 56s23 56 57 56c17 0 32-7 43-21v50c-14 8-28 11-45 11-55 0-98-40-98-96zM538 180h46l-68 180h-39l-67-180h47l41 118zM591 180h115v38h-72v31h70v37h-70v36h72v38H591zM727 247c0-38 30-68 69-68 11 0 21 2 30 7v46c-7-8-16-12-28-12-18 0-30 12-30 27s12 27 30 27c12 0 21-5 28-13v46c-9 5-19 7-30 7-39 0-69-30-69-67z" fill="#221F1F"/>
            </svg>
          </div>

        </div>
        <p className="text-center text-[9px] text-zinc-600 mt-2">
          All major credit & debit cards accepted
        </p>
      </div>

      {/* Security Badge */}
      <p className="text-center text-[10px] text-zinc-500">
        🔒 Secured by PayPal · 256-bit SSL encryption
      </p>
    </div>
  );
};
