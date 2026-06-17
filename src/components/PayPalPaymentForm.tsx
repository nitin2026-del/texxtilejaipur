'use client';

import React, { useState } from 'react';

interface PayPalPaymentFormProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export const PayPalPaymentForm: React.FC<PayPalPaymentFormProps> = ({
  orderId,
  amount,
  currency,
  onSuccess,
  onError,
}) => {
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const usdAmount = Number(Math.max(0, amount).toFixed(2));

  // BUG-7 fix: If order is fully covered by JaiCoins (amount = 0), skip PayPal
  if (usdAmount === 0) {
    return (
      <div className="space-y-3">
        <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-lg p-4 text-center">
          <p className="text-emerald-400 font-bold text-sm mb-1">🎉 Order Fully Covered by JaiCoins!</p>
          <p className="text-xs text-zinc-400">No payment needed. Click below to confirm your order.</p>
        </div>
        <button
          onClick={() => onSuccess(orderId)}
          className="w-full py-4 rounded-xl font-bold text-zinc-900 text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FFC439 0%, #F0A500 100%)' }}
        >
          ✓ Confirm Free Order
        </button>
      </div>
    );
  }

  const handleRedirect = async (landingPage: 'LOGIN' | 'BILLING') => {
    const setLoading = landingPage === 'LOGIN' ? setPaypalLoading : setCardLoading;
    try {
      setLoading(true);

      // Save JaiCoins info to localStorage so the return URL can deduct them after PayPal capture
      const coinsUsed = amount === 0 ? '0' : (localStorage.getItem('temp_jaicoins_used') || '0');
      const coinsEarned = localStorage.getItem('temp_jaicoins_earned') || '0';
      localStorage.setItem('pending_order_id', orderId);
      localStorage.setItem('pending_jaicoins_used', coinsUsed);
      localStorage.setItem('pending_jaicoins_earned', coinsEarned);
      localStorage.setItem('pending_usd_amount', usdAmount.toString());

      const res = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          amount: usdAmount, 
          currency: 'USD', 
          landingPage,
          coinsUsed: Number(coinsUsed) 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      if (data.approvalUrl) {
        // Force the card view if BILLING is requested, bypassing PayPal's smart cookie detection
        const url = new URL(data.approvalUrl);
        if (landingPage === 'BILLING') {
          url.searchParams.append('fundingSource', 'card');
        }
        window.location.href = url.toString();
      } else {
        throw new Error('No approval URL received');
      }
    } catch (err: any) {
      setLoading(false);
      onError(err.message || 'Payment failed. Please try again.');
    }
  };

  if (paypalLoading || cardLoading) {
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
        <p className="text-center text-xs text-zinc-400 max-w-xs leading-relaxed">
          If this page takes too long, don’t worry —{' '}
          <a href="mailto:priyanshug863@gmail.com" className="text-amber-600 underline">email us</a>{' '}or{' '}
          <a href="https://wa.me/918764655537" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">WhatsApp us</a>.
          We will confirm your payment and order from our side.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* Amount */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
        <p className="text-xs text-zinc-400 mb-1">Total Amount</p>
        <p className="text-sm font-bold text-white">
          <span className="text-yellow-400">${usdAmount} USD</span>
        </p>
      </div>

      {/* PayPal Button */}
      <button
        onClick={() => handleRedirect('LOGIN')}
        disabled={paypalLoading || cardLoading}
        className="w-full py-4 rounded-xl font-bold text-zinc-900 text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-60 active:scale-95 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #FFC439 0%, #F0A500 100%)' }}
      >
        {paypalLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting to PayPal...
          </>
        ) : (
          <>
            {/* PayPal Logo */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 32" width="80" height="26">
              <text x="0" y="24" fontFamily="Arial" fontWeight="900" fontSize="26" fill="#003087">Pay</text>
              <text x="42" y="24" fontFamily="Arial" fontWeight="900" fontSize="26" fill="#009cde">Pal</text>
            </svg>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-zinc-700" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-zinc-700" />
      </div>

      {/* Card Button */}
      <button
        onClick={() => handleRedirect('BILLING')}
        disabled={paypalLoading || cardLoading}
        className="w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-60 active:scale-95 border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 shadow"
      >
        {cardLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </>
        ) : (
          <>
            {/* Card Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Pay with Debit / Credit Card
          </>
        )}
      </button>

      {/* Accepted Cards Row */}
      <div className="border border-zinc-700/60 rounded-xl p-3 bg-zinc-800/20">
        <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest mb-2">We Accept</p>
        <div className="flex items-center justify-center gap-2">

          {/* Visa */}
          <div className="bg-white rounded-md flex items-center justify-center" style={{ width: 52, height: 32 }}>
            <svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg" width="44">
              <path d="M293.2 348.7L323.3 151h51.4L344.6 348.7H293.2z" fill="#00579F"/>
              <path d="M524.3 154.9c-10.2-3.8-26.1-7.9-46.1-7.9-50.8 0-86.6 25.6-86.9 62.3-.3 27.1 25.6 42.2 45.1 51.2 20 9.2 26.7 15.1 26.6 23.3-.1 12.6-16 18.3-30.7 18.3-20.5 0-31.4-2.8-48.2-9.8l-6.6-3-7.2 42.1c12 5.2 34 9.8 56.9 10 53.7 0 88.6-25.3 89-64.3.2-21.4-13.5-37.7-43.2-51.1-18-8.7-29-14.5-28.9-23.3 0-7.8 9.3-16.2 29.5-16.2 16.8-.3 29 3.3 38.5 7l4.6 2.2 7-40.8" fill="#00579F"/>
              <path d="M616.3 151h-39.7c-12.3 0-21.5 3.4-26.9 15.6l-76.3 182.1h53.9l10.8-28.2 65.7.1 6.2 28.1h47.6L616.3 151zm-63.1 128.2l20.4-52.7 6.8-17.8 3.4 16.1 11.8 54.4h-42.4z" fill="#00579F"/>
              <path d="M232.8 151l-50.3 135-5.4-25.9c-9.3-30.1-38.4-62.7-70.9-79L153 348.5l54.3-.1 80.9-197.4h-55.4" fill="#00579F"/>
              <path d="M138.8 151H57.5l-.7 3.7c63.1 15.3 104.9 52.3 122.2 96.8L161.5 167c-3-11.9-11.8-15.5-22.7-16" fill="#FAA61A"/>
            </svg>
          </div>

          {/* Mastercard */}
          <div className="bg-white rounded-md flex items-center justify-center" style={{ width: 52, height: 32 }}>
            <svg viewBox="0 0 131.39 86.9" xmlns="http://www.w3.org/2000/svg" width="40">
              <circle cx="48.37" cy="43.45" r="27.23" fill="#EB001B"/>
              <circle cx="83.02" cy="43.45" r="27.23" fill="#F79E1B"/>
              <path d="M65.7 19.76a27.22 27.22 0 0 1 0 47.38 27.22 27.22 0 0 1 0-47.38z" fill="#FF5F00"/>
            </svg>
          </div>

          {/* Amex */}
          <div className="rounded-md flex items-center justify-center" style={{ width: 52, height: 32, background: '#2E77BC' }}>
            <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg" width="44">
              <path d="M185.6 181.5H130l-25.2 54.8-25.4-54.8H24l-.1 107.8 46.2.1.1-80.8 29.8 62.5h30.3l29.6-63.3.1 81.6h46l-.4-107.9zM243.3 181.5l-48.5 107.8h50.5l7.7-18.3h57l7.5 18.3h52.3l-48.4-107.8h-78.1zm18.9 72.1l17.5-41.3 17.4 41.3h-34.9z" fill="white"/>
              <path d="M510 181.5v107.8h120.7c26.5 0 44.3-14.1 44.3-37.3 0-15.5-9.3-27.2-25.3-31.9 12.7-4.9 20.3-15.4 20.3-28.7 0-20-16.3-9.9-159.9-9.9zm45.9 35.5h61.4c8.6 0 13 3.7 13 10.1 0 6.4-4.5 10.2-13.3 10.2h-61.1v-20.3zm0 51.3v-21.5h63.4c9.7 0 14.5 4.1 14.5 11.2 0 6.7-4.9 10.3-13.8 10.3h-64.1z" fill="white"/>
            </svg>
          </div>

          {/* Discover */}
          <div className="bg-white rounded-md flex items-center justify-center" style={{ width: 52, height: 32 }}>
            <svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg" width="44">
              <path d="M510 250c0 63.5-51.5 115-115 115s-115-51.5-115-115 51.5-115 115-115 115 51.5 115 115z" fill="#F76F20"/>
              <path d="M36 180h60c58 0 98 36 98 90s-40 90-98 90H36V180zm55 145c38 0 63-22 63-55s-25-55-63-55H78v110h13zM208 180h43v180h-43zM261 270c0-55 43-95 99-95 16 0 30 3 44 10v50c-11-13-26-21-44-21-33 0-56 24-56 56s23 56 57 56c17 0 32-7 43-21v50c-14 8-28 11-45 11-55 0-98-40-98-96z" fill="#221F1F"/>
            </svg>
          </div>

        </div>
        <p className="text-center text-[9px] text-zinc-600 mt-2">All major credit &amp; debit cards accepted</p>
      </div>

      {/* Security */}
      <p className="text-center text-[10px] text-zinc-500">
        🔒 Secured by PayPal · 256-bit SSL encryption
      </p>
      {/* Support */}
      <p className="text-center text-[10px] text-zinc-400 leading-relaxed">
        Payment issue?{' '}
        <a href="mailto:priyanshug863@gmail.com" className="text-amber-500 underline underline-offset-2">Email us</a>{' '}or{' '}
        <a href="https://wa.me/918764655537" target="_blank" rel="noopener noreferrer" className="text-green-500 underline underline-offset-2">WhatsApp</a>
        {' '}— we’ll resolve it from our side.
      </p>
    </div>
  );
};
