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

      {/* Security Badge */}
      <p className="text-center text-[10px] text-zinc-500">
        🔒 Secured by PayPal · 256-bit SSL encryption
      </p>
    </div>
  );
};
