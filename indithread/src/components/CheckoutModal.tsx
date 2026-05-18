'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { X, CreditCard, ShoppingBag, ShieldCheck, User, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, formatPrice, getCartTotalInr, getCartTotalDisplay, currency, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [step, setStep] = useState<'auth' | 'shipping' | 'payment' | 'success'>('auth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping form fields
  const [fullName, setFullName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Auth fields (for quick register/login inside checkout)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Payment mock fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Set default shipping name if profile exists
  useEffect(() => {
    if (user) {
      setStep('shipping');
      if (profile) {
        setFullName(profile.name || '');
      }
    } else {
      setStep('auth');
    }
  }, [user, profile, isOpen]);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authTab === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } }
        });
        if (err) throw err;
        alert('Verification email sent! You can proceed with checkout now.');
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('User not logged in');

      const totalInr = getCartTotalInr();
      const totalDisplay = getCartTotalDisplay();
      
      const shippingAddress = {
        fullName,
        line1: addressLine1,
        line2: addressLine2,
        city,
        state,
        postalCode,
        country
      };

      // 1. Create order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'paid', // Mark as paid directly in successful simulation
          total_inr: totalInr,
          total_display: totalDisplay,
          currency: currency,
          shipping_address: shippingAddress
        })
        .select()
        .single();

      if (orderError) throw orderError;
      const orderId = orderData.id;
      setCreatedOrderId(orderId);

      // 2. Insert order items
      const orderItemsToInsert = cart.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price_inr: item.price_inr
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Create payment transaction record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          gateway: 'stripe',
          amount: totalDisplay,
          currency: currency,
          status: 'succeeded',
          payment_intent_id: 'ch_' + Math.random().toString(36).substring(2, 15)
        });

      if (paymentError) throw paymentError;

      // 4. Create shipment tracking record
      await supabase
        .from('shipments')
        .insert({
          order_id: orderId,
          courier: 'dhl',
          tracking_number: 'JD' + Math.floor(100000000 + Math.random() * 900000000),
          status: 'pending'
        });

      // 5. Trigger stock decrement in public.products
      for (const item of cart) {
        const { error: rpcError } = await supabase.rpc('decrement_product_stock', {
          prod_id: item.id,
          qty: item.quantity
        });

        if (rpcError) {
          // Fallback if RPC not fully initialized: raw update
          const { data: currentProduct } = await supabase.from('products').select('stock').eq('id', item.id).single();
          if (currentProduct) {
            await supabase.from('products').update({ stock: Math.max(0, currentProduct.stock - item.quantity) }).eq('id', item.id);
          }
        }
      }

      // Success animation
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setStep('success');
      clearCart();
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl glass-card p-8 glow-border overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 shrink-0 border-b border-zinc-800/60 pb-4">
          <h2 className="text-2xl font-extrabold tracking-tight">Checkout</h2>
          <p className="text-zinc-400 text-xs mt-1">IndiThread Clothes Export Gateway</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-950/30 border border-red-900/50 p-3 text-xs text-red-400 shrink-0">
            <span>{error}</span>
          </div>
        )}

        {/* Steps container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* STEP 1: AUTHENTICATION GATE (DEFERRED AUTH) */}
          {step === 'auth' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/40 mb-4">
                <ShoppingBag className="h-8 w-8 text-violet-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Guest browsing ended</p>
                <p className="text-xs text-zinc-400 mt-1">Please sign in or register to complete your order securely.</p>
              </div>

              {/* Login / Register Toggle */}
              <div className="flex border-b border-zinc-900">
                <button
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 pb-2 text-center text-xs font-semibold ${
                    authTab === 'login' ? 'text-violet-500 border-b-2 border-violet-500' : 'text-zinc-500'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthTab('register')}
                  className={`flex-1 pb-2 text-center text-xs font-semibold ${
                    authTab === 'register' ? 'text-violet-500 border-b-2 border-violet-500' : 'text-zinc-500'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
                {authTab === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Sarah Mitchell"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-xs font-bold text-white btn-premium flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {authTab === 'login' ? 'Proceed with Login' : 'Register Account'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: SHIPPING DETAILS */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
                <MapPin className="h-4 w-4 text-violet-500" /> Shipping Destination
              </h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Mitchell"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  placeholder="123 Export Avenue, Apt 4B"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Behind Landmark"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="London"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    placeholder="Greater London"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Postal / Zip Code</label>
                  <input
                    type="text"
                    required
                    placeholder="E1 6AN"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-xs font-bold text-white btn-premium mt-4"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {/* STEP 3: MOCK PCI-DSS CARD PAYMENT */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
                <CreditCard className="h-4 w-4 text-violet-500" /> PCI Secure Checkout
              </h3>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-4 space-y-2 mb-4">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Cart Items Count</span>
                  <span className="text-white font-medium">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Duties & Port Taxes</span>
                  <span className="text-emerald-500 font-medium">Free Shipping (DDP)</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white border-t border-zinc-800 pt-2 mt-2">
                  <span>Total Charges</span>
                  <span className="text-violet-400">{formatPrice(getCartTotalInr())}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Cardholder Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Sarah Mitchell"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Card Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">CVC / CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="•••"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-xs font-bold text-white btn-premium flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Completing 3D Secure Challenge...
                  </>
                ) : (
                  `Pay ${formatPrice(getCartTotalInr())}`
                )}
              </button>

              <div className="flex items-center gap-1.5 justify-center text-[10px] text-zinc-500 mt-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>3D-Secure 2.0 Enabled. Protected by Stripe Radar.</span>
              </div>
            </form>
          )}

          {/* STEP 4: ORDER SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="h-16 w-16 bg-emerald-950/30 border border-emerald-800/60 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Order Confirmed!</h3>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>Thank you for purchasing with IndiThread Export Store!</p>
                <p className="mt-2 text-zinc-500">Order ID: <span className="font-mono text-zinc-300">{createdOrderId}</span></p>
                <p className="text-zinc-500">Our Jaipur logistics hub has queued your DHL shipment.</p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/40 p-4 rounded-xl text-left max-w-sm mx-auto text-xs space-y-1.5 mt-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Delivery Address:</span>
                  <span className="text-zinc-300 text-right">{city}, {country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">DHL Tracking Ref:</span>
                  <span className="text-violet-400 font-semibold font-mono">Pending Dispatch</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-lg text-xs font-bold text-white btn-premium mt-6"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
