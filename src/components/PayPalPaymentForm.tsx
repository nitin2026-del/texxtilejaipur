'use client';

import React, { useState } from 'react';

interface PayPalPaymentFormProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export const PayPalPaymentForm: React.FC<PayPalPaymentFormProps> = ({ orderId, amount, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  // Amount is already converted to USD by CheckoutModal (effectiveInr * 0.012)
  const usdAmount = Number(amount.toFixed(2));

  const handlePayPalClick = async () => {
    try {
      setLoading(true);

      // Step 1: Create PayPal order on backend
      const res = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount: usdAmount, currency: 'USD' })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create PayPal order');

      if (data.approvalUrl) {
        // Step 2: Redirect the user to PayPal to complete payment
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No PayPal approval URL received');
      }

    } catch (err: any) {
      setLoading(false);
      onError(err.message || 'PayPal payment failed. Please try again.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
        <p className="text-xs text-zinc-400 mb-1">You will be securely redirected to PayPal</p>
        <p className="text-sm font-bold text-white">Amount: <span className="text-gold">${usdAmount} USD</span></p>
      </div>

      <button
        onClick={handlePayPalClick}
        disabled={loading}
        className="w-full py-4 rounded-xl font-bold text-zinc-900 text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-70"
        style={{ background: 'linear-gradient(135deg, #FFC439 0%, #F0A500 100%)' }}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting to PayPal...
          </>
        ) : (
          <>
            {/* PayPal Logo SVG */}
            <svg width="80" height="20" viewBox="0 0 80 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 2H4.5C4.2 2 4 2.2 3.9 2.5L2 13.5C2 13.7 2.1 13.9 2.4 13.9H5C5.3 13.9 5.5 13.7 5.6 13.4L6.1 10.3C6.2 10 6.4 9.8 6.7 9.8H8.2C11.2 9.8 12.9 8.4 13.4 5.6C13.6 4.4 13.4 3.4 12.8 2.8C12.1 2.3 11 2 9.5 2Z" fill="#003087"/>
              <path d="M22.5 2H17.5C17.2 2 17 2.2 16.9 2.5L15 13.5C15 13.7 15.1 13.9 15.4 13.9H18C18.3 13.9 18.5 13.7 18.6 13.4L19.1 10.3C19.2 10 19.4 9.8 19.7 9.8H21.2C24.2 9.8 25.9 8.4 26.4 5.6C26.6 4.4 26.4 3.4 25.8 2.8C25.1 2.3 24 2 22.5 2Z" fill="#009cde"/>
              <text x="30" y="14" fill="#003087" fontSize="12" fontFamily="Arial" fontWeight="bold">Pay</text>
            </svg>
            Pay with PayPal
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-zinc-500">
        🔒 Secured by PayPal · 256-bit SSL encryption
      </p>
    </div>
  );
};
