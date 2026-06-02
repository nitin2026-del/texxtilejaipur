'use client';

import React, { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PayPalPaymentFormProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

// Live PayPal Client ID
const PAYPAL_CLIENT_ID = 'ARLBFUKF5UQx10JQnFw1SUqqQdHqxKbfLddVmtjmrCsLalIrDZZERRlCh0BswWr4AdaETbKqKKx7_d3L';

export const PayPalPaymentForm: React.FC<PayPalPaymentFormProps> = ({ orderId, amount, currency, onSuccess, onError }) => {
  const [processing, setProcessing] = useState(false);

  // Always use USD - PayPal India accounts only support USD for international payments
  const usdAmount = currency === 'USD' ? amount : Number((amount * 0.012).toFixed(2));

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
        enableFunding: 'paypal',
        disableFunding: 'card,credit,venmo,paylater',
      }}
    >
      <div className="paypal-button-wrapper">
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay',
            height: 48,
          }}
          disabled={processing}
          forceReRender={[usdAmount, orderId]}
          createOrder={async () => {
            try {
              setProcessing(true);
              const res = await fetch('/api/payments/paypal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, amount: usdAmount, currency: 'USD' })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Failed to create PayPal order');
              return data.id;
            } catch (err: any) {
              setProcessing(false);
              onError(err.message);
              throw err;
            }
          }}
          onApprove={async (data) => {
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
              setProcessing(false);
              onSuccess(orderId);
            } catch (err: any) {
              setProcessing(false);
              onError(err.message || 'Failed to capture PayPal payment');
            }
          }}
          onError={(err) => {
            setProcessing(false);
            console.error('PayPal button error:', err);
            onError('PayPal encountered an error. Please try again.');
          }}
          onCancel={() => {
            setProcessing(false);
          }}
        />
      </div>
      {processing && (
        <p className="text-center text-xs text-zinc-400 mt-2 animate-pulse">Processing payment...</p>
      )}
    </PayPalScriptProvider>
  );
};
