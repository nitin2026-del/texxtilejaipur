'use client';

import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PayPalPaymentFormProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export const PayPalPaymentForm: React.FC<PayPalPaymentFormProps> = ({ orderId, amount, currency, onSuccess, onError }) => {
  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '', currency: currency.toUpperCase(), intent: 'capture' }}>
      <PayPalButtons
        createOrder={async () => {
          try {
            const res = await fetch('/api/payments/paypal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, amount, currency })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data.id; // Return PayPal order ID
          } catch (err: any) {
            onError(err.message);
            throw err;
          }
        }}
        onApprove={async (data, actions) => {
          try {
            const res = await fetch('/api/payments/paypal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'capture',
                paypalOrderId: data.orderID,
                orderId: orderId
              })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to capture payment');
            onSuccess(orderId);
          } catch (err: any) {
            onError(err.message || 'Failed to capture PayPal payment');
          }
        }}
        onError={(err) => {
          onError(err.toString());
        }}
      />
    </PayPalScriptProvider>
  );
};
