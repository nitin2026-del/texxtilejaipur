'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { X, CreditCard, ShoppingBag, ShieldCheck, User, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PayPalPaymentForm } from './PayPalPaymentForm';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, formatPrice, getCartSubtotalInr, getCartTotalInr, getCartTotalDisplay, currency, clearCart, appliedCoupon } = useCart();
  const { user, profile, jaiCoins, setJaiCoins, userTier, tierDiscountPercentage } = useAuth();

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
  const [phone, setPhone] = useState('');

  // Auth fields (for quick register/login inside checkout)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal'>('paypal');
  
  const [useJaiCoins, setUseJaiCoins] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const JAI_COINS_BALANCE = jaiCoins || 0;
  const JAI_COINS_VALUE_INR = JAI_COINS_BALANCE; // 1:1 ratio

  // Compute effective totals accounting for JaiCoins
  const effectiveInr = useJaiCoins ? Math.max(0, getCartTotalInr() - JAI_COINS_VALUE_INR) : getCartTotalInr();
  const FX_RATES: Record<string, number> = { INR: 1, USD: 0.012 * 1.03, EUR: 0.011 * 1.03, GBP: 0.0095 * 1.03, AED: 0.044 * 1.03, AUD: 0.018 * 1.03 };
  const effectiveDisplay = effectiveInr * (FX_RATES[currency] || 0.012 * 1.03);
  // PayPal always charges in USD — use the EXACT same rate CartContext uses for USD display
  // This guarantees PayPal Amount = Total Charges (when displayed in USD)
  const CART_USD_RATE = 0.012 * 1.03; // Must stay in sync with CartContext FX_RATES USD
  const paypalUsdAmount = Number((effectiveInr * CART_USD_RATE).toFixed(2));

  // Reset createdOrderId and step on every open to avoid stale state (BUG-006)
  useEffect(() => {
    if (isOpen) {
      setCreatedOrderId(null);
      setError('');
      if (user) {
        setStep('shipping');
        if (profile) {
          setFullName(profile.full_name || '');
          setPhone(profile.phone || '');
        }
      } else {
        setStep('auth');
      }
    }
  }, [isOpen, user, profile]);

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
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              name: name
            }
          }
        });
        if (err) throw err;
        setRegisterSuccess(true);
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // 1. Create order via our API
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          user_id: user?.id,
          items: cart,
          total_inr: getCartTotalInr(),
          display_currency: currency,
          total_display_currency: getCartTotalDisplay(),
          shipping_address: {
            full_name: fullName,
            address_line1: addressLine1,
            address_line2: addressLine2,
            city,
            state,
            postal_code: postalCode,
            country,
            phone
          }
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);
      const orderId = orderData.orderId;
      setCreatedOrderId(orderId);

      // 2. Initialize Payment Intent via API (Removed Stripe logic)

      setStep('payment');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize checkout');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    // Credit JaiCoins earned (5% of order value)
    const coinsEarned = Math.round(getCartTotalInr() * 0.05);
    // Deduct used JaiCoins and add earned ones
    const newBalance = Math.max(0, jaiCoins - (useJaiCoins ? JAI_COINS_VALUE_INR : 0)) + coinsEarned;
    setJaiCoins(newBalance);

    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    setStep('success');
    clearCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm overflow-y-auto pt-10 pb-10">
      <div className="relative w-full max-w-lg rounded-lg glass-card p-8 border-luxury glow-border overflow-hidden flex flex-col my-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 shrink-0 border-b border-zinc-800 pb-4">
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Checkout</h2>
          <p className="text-gold text-xs mt-1 tracking-wider uppercase font-light">Textile Jaipur Secure Export Gateway</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 rounded bg-red-950/30 border border-red-900/50 p-3 text-xs text-red-400 shrink-0">
            <span>{error}</span>
          </div>
        )}

        {/* Steps container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* STEP 1: AUTHENTICATION GATE */}
          {step === 'auth' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-zinc-900/40 rounded border border-zinc-800 mb-4">
                <ShoppingBag className="h-8 w-8 text-gold mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Create your Account</p>
                <p className="text-xs text-zinc-400 mt-1">Please sign in or register to complete your order securely.</p>
              </div>

              {/* Login / Register Toggle */}
              <div className="flex border-b border-zinc-900">
                <button
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 pb-2 text-center text-xs font-semibold ${
                    authTab === 'login' ? 'text-gold border-b-2 border-gold' : 'text-zinc-500'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthTab('register')}
                  className={`flex-1 pb-2 text-center text-xs font-semibold ${
                    authTab === 'register' ? 'text-gold border-b-2 border-gold' : 'text-zinc-500'
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
                      className="w-full bg-zinc-800/80 border border-zinc-700 rounded py-2 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
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
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded py-2 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
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
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded py-2 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded text-xs font-bold text-zinc-950 btn-premium flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {authTab === 'login' ? 'Proceed with Login' : 'Register Account'}
                </button>
              </form>
              {registerSuccess && (
                <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-800/50 rounded text-xs text-emerald-400 text-center">
                  ✅ Verification email sent! Check your inbox, then sign in to continue.
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SHIPPING DETAILS */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5 mb-2 font-serif">
                <MapPin className="h-4 w-4 text-gold" /> Shipping Destination
              </h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Mitchell"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded py-2 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
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
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded py-2 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Suite, unit, etc."
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded py-2 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded py-2 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded py-2 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    placeholder="New York"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded py-2 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Postal / Zip Code</label>
                  <input
                    type="text"
                    required
                    placeholder="10001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded py-2 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-gold"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Italy">Italy</option>
                    <option value="Spain">Spain</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Japan">Japan</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Sweden">Sweden</option>
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-zinc-400 mb-2">Select Payment Method</label>
                <div className="flex gap-4">
                  <label className={`flex-1 border rounded p-3 cursor-pointer transition-colors border-gold bg-gold/10`}>
                    <input type="radio" name="payment" value="paypal" checked={true} readOnly className="hidden" />
                    <div className="text-xs font-bold text-center text-white">PayPal</div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded text-xs font-bold text-zinc-950 btn-premium mt-4"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Continue to Payment'}
              </button>
            </form>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 'payment' && createdOrderId && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5 mb-2 font-serif">
                <CreditCard className="h-4 w-4 text-gold" /> Secure Checkout
              </h3>

              <div className="rounded border border-zinc-700 bg-zinc-800/40 p-4 space-y-3 mb-4">
                
                {/* Product List Summary */}
                <div className="space-y-2 border-b border-zinc-700 pb-3 mb-3">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Order Items</h4>
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <span className="text-zinc-100 pr-4">{item.quantity}x {item.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-sm text-zinc-300">
                  <span>Cart Items Count</span>
                  <span className="text-white font-medium">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-300">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatPrice(getCartSubtotalInr())}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-xs text-amber-500 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{appliedCoupon.type === 'percent' ? `${appliedCoupon.value}%` : formatPrice(appliedCoupon.value)}</span>
                  </div>
                )}
                {tierDiscountPercentage > 0 && (
                  <div className="flex justify-between text-xs text-brand-400 font-bold">
                    <span>VIP {userTier} Discount ({tierDiscountPercentage}%)</span>
                    <span>-{formatPrice(getCartSubtotalInr() * (tierDiscountPercentage / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Duties & Port Taxes</span>
                  <span className="text-amber-500 font-bold bg-amber-900/30 px-2 py-0.5 rounded border border-amber-500/30">
                    FREE UPS Express
                  </span>
                </div>
                
                {JAI_COINS_BALANCE > 0 && (
                  <label className="flex items-center justify-between py-2 border-t border-zinc-800 mt-2 cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={useJaiCoins} 
                        onChange={(e) => setUseJaiCoins(e.target.checked)}
                        className="accent-gold w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs text-amber-500 font-bold group-hover:text-amber-400 transition-colors">
                        Apply {JAI_COINS_BALANCE} JaiCoins
                      </span>
                    </div>
                    <span className="text-xs text-amber-500 font-mono">-₹{JAI_COINS_VALUE_INR}</span>
                  </label>
                )}

                <div className="flex justify-between text-sm font-bold text-white border-t border-zinc-800 pt-2 mt-2 font-serif">
                  <span>Total Charges</span>
                  <span className="text-gold">
                    {formatPrice(effectiveInr)}
                  </span>
                </div>
              </div>



              {paymentMethod === 'paypal' && (
                <PayPalPaymentForm 
                  orderId={createdOrderId} 
                  amount={paypalUsdAmount}
                  currency="USD" 
                  onSuccess={handlePaymentSuccess} 
                  onError={setError} 
                />
              )}

              <div className="flex items-center gap-1.5 justify-center text-[10px] text-zinc-500 mt-4">
                <ShieldCheck className="h-4 w-4 text-gold" />
                <span>Encrypted & Protected by 3D-Secure 2.0</span>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="h-16 w-16 bg-emerald-950/30 border border-emerald-800/60 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-white font-serif">Order Confirmed!</h3>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>Thank you for purchasing with Textile Jaipur!</p>
                <p className="mt-2 text-zinc-500">Order ID: <span className="font-mono text-zinc-300">{createdOrderId}</span></p>
                <p className="text-zinc-500">Our Jaipur logistics hub has queued your shipment.</p>
              </div>

              <div className="bg-amber-950/30 border border-amber-900/50 p-3 rounded text-center my-3">
                <p className="text-xs font-bold text-amber-500">✨ You earned {Math.round(getCartTotalInr() * 0.05)} JaiCoins from this purchase!</p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-left max-w-sm mx-auto text-xs space-y-1.5 mt-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Delivery Address:</span>
                  <span className="text-zinc-300 text-right">{city}, {country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tracking Ref:</span>
                  <span className="text-gold font-semibold font-mono">Pending Dispatch</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded text-xs font-bold text-zinc-950 btn-premium mt-6"
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
