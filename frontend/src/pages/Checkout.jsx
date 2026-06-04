import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import MainLayout from '../layouts/MainLayout';
import { useRazorpay } from '../hooks/useRazorpay';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import {
  MapPinIcon, CreditCardIcon, CheckBadgeIcon,
  ExclamationCircleIcon, ArrowRightIcon, DevicePhoneMobileIcon,
  BanknotesIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';

const PAYMENT_METHODS = [
  {
    id: 'razorpay',
    label: 'Pay via Razorpay (India)',
    subtitle: 'Cards, UPI, Net Banking, Wallets',
    icon: CreditCardIcon,
    badge: 'Popular',
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
  },
  {
    id: 'stripe',
    label: 'Pay via Stripe (Global)',
    subtitle: 'International Cards, Apple Pay, Google Pay',
    icon: CreditCardIcon,
    badge: 'Secure',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  },
  {
    id: 'upi',
    label: 'UPI Direct',
    subtitle: 'PhonePe, Google Pay, Paytm, BHIM',
    icon: DevicePhoneMobileIcon,
    badge: null,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    subtitle: 'Pay when your order arrives',
    icon: BanknotesIcon,
    badge: null,
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, placeOrder, addresses, fetchAddresses, auth, profile } = useStore();
  const { initiatePayment: initRazorpay } = useRazorpay();
  const { initiatePayment: initStripe } = useStripeCheckout();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (!auth?.user) { navigate('/login'); return; }
    if (items.length === 0) { navigate('/cart'); return; }
    fetchAddresses().then((addrs) => {
      if (addrs?.length > 0) {
        const defaultAddr = addrs.find(a => a.is_default) || addrs[0];
        setSelectedAddress(defaultAddr.id);
      }
    });
  }, [items, navigate, fetchAddresses, auth]);

  const subtotal = totalPrice();
  const shipping = subtotal >= 999 ? 0 : 99;
  const grandTotal = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select or add a shipping address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create order in Supabase (status = pending, not yet paid)
      const newOrderId = await placeOrder({
        shipping_address_id: selectedAddress,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
      });
      setOrderId(newOrderId);

      // 2. If COD, just confirm
      if (paymentMethod === 'cod') {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => navigate('/dashboard'), 3500);
        return;
      }

      // 3. For online payments, launch appropriate gateway
      const paymentHandler = paymentMethod === 'stripe' ? initStripe : initRazorpay;

      paymentHandler({
        orderId: newOrderId,
        amount: grandTotal,
        customerName: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : auth.user.email,
        customerEmail: auth.user.email,
        customerPhone: profile?.phone || '',
        onSuccess: () => {
          setSuccess(true);
          setLoading(false);
          setTimeout(() => navigate('/dashboard'), 3500);
        },
        onFailure: (msg) => {
          setError(typeof msg === 'string' ? msg : 'Payment failed. Your order has been saved — try paying again from your dashboard.');
          setLoading(false);
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <MainLayout title="Order Confirmed - Gupta International" description="Thank you for your purchase.">
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckBadgeIcon className="w-16 h-16 text-green-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Order Confirmed! 🎉</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 max-w-lg">
            Your premium fashion pieces are being prepared for dispatch. You'll receive an email confirmation with tracking details once shipped.
          </p>
          {orderId && (
            <p className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl mb-6">
              Order ID: #{orderId?.substring(0, 8)?.toUpperCase()}
            </p>
          )}
          <p className="text-sm font-medium text-gray-400">Redirecting to your dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Checkout - Gupta International" description="Complete your secure checkout.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-10">Secure Checkout</h1>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 dark:bg-red-500/10 dark:border-red-500/20 rounded-2xl flex items-start gap-3">
            <ExclamationCircleIcon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-600 dark:text-red-400 font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left Column */}
          <div className="flex-1 space-y-8">

            {/* Step 1: Address */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex justify-center items-center font-bold text-sm">1</div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Address</h2>
              </div>

              {addresses && addresses.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {addresses.map(addr => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id)}
                      className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                        selectedAddress === addr.id
                          ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-500/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{addr.full_name}</h3>
                        {selectedAddress === addr.id && <CheckBadgeIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {addr.address_line1}<br />
                        {addr.city}, {addr.state} {addr.postal_code}<br />
                        {addr.country}
                      </p>
                      {addr.phone && <p className="text-xs text-gray-500 mt-1">📞 {addr.phone}</p>}
                    </div>
                  ))}
                  <Link
                    to="/dashboard"
                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:border-indigo-300 transition-colors"
                  >
                    + Add New Address
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPinIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-4 text-sm">No shipping addresses saved.</p>
                  <Link to="/dashboard" className="text-indigo-600 font-medium hover:underline text-sm">
                    Go to dashboard to add an address →
                  </Link>
                </div>
              )}
            </div>

            {/* Step 2: Payment */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex justify-center items-center font-bold text-sm">2</div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-500/10'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="hidden"
                    />
                    <method.icon className={`w-7 h-7 mr-4 shrink-0 ${paymentMethod === method.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{method.label}</h4>
                        {method.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${method.badgeColor}`}>
                            {method.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{method.subtitle}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ml-4 shrink-0 flex items-center justify-center ${
                      paymentMethod === method.id ? 'border-indigo-600' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                    </div>
                  </label>
                ))}
              </div>

              {(paymentMethod === 'razorpay' || paymentMethod === 'stripe') && (
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                  <ShieldCheckIcon className="w-4 h-4 text-green-500 shrink-0" />
                  <span>256-bit SSL encrypted. Your payment info is securely processed by {paymentMethod === 'stripe' ? 'Stripe' : 'Razorpay'}.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-gray-50 dark:bg-gray-900/80 rounded-3xl p-8 sticky top-32 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-56 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                        {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1 text-xs">{item.name}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap">
                      ₹{((item.price || 0) * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 py-5 border-t border-b border-gray-200 dark:border-gray-800 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600">🎉 Free shipping on orders above ₹999</p>
                )}
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{grandTotal.toFixed(0)}</span>
              </div>

              <button
                disabled={loading || !selectedAddress}
                onClick={handlePlaceOrder}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                ) : paymentMethod === 'cod' ? (
                  <>Place Order (COD) <ArrowRightIcon className="w-5 h-5" /></>
                ) : (
                  <>Pay ₹{grandTotal.toFixed(0)} <ArrowRightIcon className="w-5 h-5" /></>
                )}
              </button>

              <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
                By placing this order you agree to our Terms of Service
              </p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
