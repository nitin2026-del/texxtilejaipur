'use client';

import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

interface StripePaymentFormProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ orderId, amount, currency, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    
    // Instead of redirecting right away, we handle confirm logic manually if possible,
    // or just let stripe confirm it.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Here we could return to a success page, but we want to stay in the modal.
        // For actual production, it's safer to redirect. 
        // For MVP, we'll try to redirect to a special ?success=true page or similar.
        return_url: `${window.location.origin}/dashboard?order=${orderId}`,
      },
      redirect: 'if_required' // Avoids redirect if 3D secure is not needed
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setLoading(false);
    } else {
      // Payment succeeded without redirect
      onSuccess(orderId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 rounded text-xs font-bold text-zinc-950 btn-premium flex items-center justify-center gap-2 mt-4"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay Securely`
        )}
      </button>
    </form>
  );
};
