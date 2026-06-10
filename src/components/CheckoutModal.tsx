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

const COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Rwanda","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

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
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
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
  // PayPal always charges in USD — 1 INR = 0.012 USD with 3% markup (kept in sync with CartContext)
  const USD_RATE = 0.012 * 1.03;
  const paypalUsdAmount = Number((effectiveInr * USD_RATE).toFixed(2));
  // Display total in user's chosen currency (uses CartContext FX_RATES directly)
  const effectiveDisplay = effectiveInr * (effectiveInr > 0 ? (getCartTotalDisplay() / Math.max(getCartTotalInr(), 1)) : USD_RATE);

  // Reset createdOrderId and step on every open to avoid stale state (BUG-006)
  useEffect(() => {
    if (isOpen) {
      setCreatedOrderId(null);
      setError('');
      setStep('shipping');
      if (user) {
        if (profile) {
          setFullName(profile.full_name || '');
          setPhone(profile.phone || '');
        }
      }
    }
  }, [isOpen, user, profile]);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
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
      let finalUserId = user?.id;
      let usedTempSignupCoins = false;

      // Guest creates an account using password field during checkout
      if (!user && email && password) {
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              name: fullName
            }
          }
        });
        
        if (authError) {
          throw new Error(`Account creation failed: ${authError.message}`);
        }
        
        if (authData.user) {
          finalUserId = authData.user.id;
          usedTempSignupCoins = true;
          setJaiCoins(500);
          setUseJaiCoins(true);
          
          fetch('/api/auth/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name: fullName })
          }).catch(console.error);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      let orderTotalInr = getCartTotalInr();
      if (useJaiCoins && user) {
        orderTotalInr = Math.max(0, orderTotalInr - JAI_COINS_VALUE_INR);
      } else if (usedTempSignupCoins) {
        orderTotalInr = Math.max(0, orderTotalInr - 500);
      }

      let orderTotalDisplay = getCartTotalDisplay();
      if (usedTempSignupCoins || (useJaiCoins && user)) {
        const coinsValue = usedTempSignupCoins ? 500 : JAI_COINS_VALUE_INR;
        const discountRatio = Math.max(0, getCartTotalInr() - coinsValue) / Math.max(getCartTotalInr(), 1);
        orderTotalDisplay = getCartTotalDisplay() * discountRatio;
      }

      // 1. Create order via our API
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          user_id: finalUserId,
          guest_email: email,
          items: cart,
          total_inr: orderTotalInr,
          display_currency: currency,
          total_display_currency: orderTotalDisplay,
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

  const handlePaymentSuccess = async (orderId: string) => {
    // Free order handling - securely process via backend
    const coinsEarned = Math.round(getCartTotalInr() * 0.05);
    const coinsUsed = useJaiCoins ? JAI_COINS_VALUE_INR : 0;
    
    setLoading(true);
    try {
      await fetch('/api/payments/free-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, coinsUsed, coinsEarned })
      });
      // Update local context
      const newBalance = Math.max(0, jaiCoins - coinsUsed) + coinsEarned;
      setJaiCoins(newBalance);
      
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setStep('success');
      clearCart();
    } catch(err) {
      setError("Failed to confirm free order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm overflow-y-auto pt-10 pb-10">
      <div className="relative w-full max-w-lg rounded-lg glass-card p-8 border-zinc-200 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 shrink-0 border-b border-zinc-300 pb-4">
          <h2 className="text-2xl font-serif font-bold text-zinc-900 tracking-wide">Checkout</h2>
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
              <div className="text-center p-4 bg-white rounded border border-zinc-300 mb-4">
                <ShoppingBag className="h-8 w-8 text-gold mx-auto mb-2" />
                <p className="text-sm font-semibold text-zinc-900">Sign In</p>
                <p className="text-xs text-zinc-600 mt-1">Log in to your account to securely complete your checkout.</p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded text-xs font-bold text-zinc-950 btn-premium flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign In to Continue
                </button>
              </form>
              <div className="text-center mt-4 border-t border-zinc-200 pt-4">
                 <button type="button" onClick={() => setStep('shipping')} className="text-xs font-bold text-zinc-600 hover:text-zinc-900">
                    Continue as Guest
                 </button>
              </div>
            </div>
          )}

          {/* STEP 2: SHIPPING DETAILS */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5 mb-2 font-serif">
                <MapPin className="h-4 w-4 text-gold" /> Delivery Details
              </h3>

              {!user && (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center bg-zinc-50 border border-zinc-200 rounded p-3">
                    <span className="text-xs text-zinc-600">Already have an account?</span>
                    <button 
                      type="button" 
                      onClick={() => setStep('auth')} 
                      className="text-xs font-bold text-gold hover:underline"
                    >
                      Sign In
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Email Address (For order tracking & receipts)</label>
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded p-4 shadow-sm">
                    <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-2">
                      <span className="text-amber-500">🎁</span> You are checking out as a Guest.
                    </h4>
                    <p className="text-xs text-zinc-700 mb-3 leading-relaxed">
                      By not creating a free account, you will miss out on:
                    </p>
                    <ul className="text-xs text-zinc-600 space-y-1.5 mb-4 list-disc list-inside">
                      <li>🚫 <strong className="text-zinc-800">Losing 500 Jai Coins ($5 Value):</strong> You won&apos;t get your sign-up bonus applied to this order.</li>
                      <li>🚫 <strong className="text-zinc-800">No Order History:</strong> You won&apos;t be able to easily track past purchases.</li>
                      <li>🚫 <strong className="text-zinc-800">Slower Checkouts:</strong> We won&apos;t save your shipping details for next time.</li>
                    </ul>
                    
                    <div className="pt-3 border-t border-amber-200/50">
                      <label className="block text-xs font-bold text-amber-800 mb-1">Create a Password to claim 500 Jai Coins instantly! (Optional)</label>
                      <input
                        type="password"
                        placeholder="Set a password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded py-2 px-3 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[10px] text-amber-600 mt-1.5">Leave blank to continue as a guest.</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Mitchell"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  placeholder="123 Export Avenue, Apt 4B"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Suite, unit, etc."
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    placeholder="New York"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Postal / Zip Code</label>
                  <input
                    type="text"
                    required
                    placeholder="10001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-gold"
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Country</label>
                  <div 
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 cursor-pointer flex justify-between items-center focus-within:border-gold"
                  >
                    <span>{country || 'Select Country'}</span>
                    <span className="text-zinc-400 text-xs">▼</span>
                  </div>
                  
                  {showCountryDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-zinc-300 rounded shadow-2xl max-h-48 flex flex-col overflow-hidden">
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="Search country..." 
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full border-b border-zinc-200 py-2 px-3 text-sm text-zinc-900 focus:outline-none bg-zinc-50"
                      />
                      <div className="overflow-y-auto">
                        {COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                          <div 
                            key={c}
                            onClick={() => {
                              setCountry(c);
                              setShowCountryDropdown(false);
                              setCountrySearch('');
                            }}
                            className="py-2 px-3 text-sm text-zinc-800 hover:bg-gold/10 hover:text-gold cursor-pointer transition-colors"
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-zinc-600 mb-2">Select Payment Method</label>
                <div className="flex gap-4">
                  <label className={`flex-1 border rounded py-3 px-2 cursor-pointer transition-colors border-gold bg-gold/10`}>
                    <input type="radio" name="payment" value="paypal" checked={true} readOnly className="hidden" />
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="text-sm font-bold text-zinc-900">Credit / Debit Card & PayPal</div>
                      <div className="text-[10px] text-zinc-600 mt-1 font-medium">All major cards accepted securely</div>
                    </div>
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
              <h3 className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5 mb-2 font-serif">
                <CreditCard className="h-4 w-4 text-gold" /> Secure Checkout
              </h3>

              <div className="rounded border border-zinc-300 bg-white p-4 space-y-3 mb-4">
                
                {/* Product List Summary */}
                <div className="space-y-2 border-b border-zinc-300 pb-3 mb-3">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">Order Items</h4>
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <span className="text-zinc-800 pr-4">{item.quantity}x {item.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-sm text-zinc-800">
                  <span>Cart Items Count</span>
                  <span className="text-zinc-900 font-medium">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-800">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 font-medium">{formatPrice(getCartSubtotalInr())}</span>
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
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Duties & Port Taxes</span>
                  <span className="text-amber-500 font-bold bg-amber-900/30 px-2 py-0.5 rounded border border-amber-500/30">
                    FREE UPS Express
                  </span>
                </div>
                
                {JAI_COINS_BALANCE > 0 && (
                  <label className="flex items-center justify-between py-2 border-t border-zinc-300 mt-2 cursor-pointer group">
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

                <div className="flex justify-between text-sm font-bold text-zinc-900 border-t border-zinc-300 pt-2 mt-2 font-serif">
                  <span>Total Charges</span>
                  <span className="text-gold">
                    {formatPrice(effectiveInr)}
                  </span>
                </div>
              </div>



              {paymentMethod === 'paypal' && (() => {
                // Save temp state for PayPal redirect to read
                if (typeof window !== 'undefined') {
                  localStorage.setItem('temp_jaicoins_used', useJaiCoins ? JAI_COINS_VALUE_INR.toString() : '0');
                  localStorage.setItem('temp_jaicoins_earned', Math.round(getCartTotalInr() * 0.05).toString());
                }
                return (
                  <PayPalPaymentForm 
                    orderId={createdOrderId} 
                    amount={paypalUsdAmount}
                    currency="USD" 
                    onSuccess={handlePaymentSuccess} 
                    onError={setError} 
                  />
                );
              })()}

              {/* Payment help */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-1.5 justify-center text-[10px] text-zinc-500">
                  <ShieldCheck className="h-4 w-4 text-gold" />
                  <span>Encrypted &amp; Protected by 3D-Secure 2.0</span>
                </div>
                <p className="text-center text-[10px] text-zinc-400 leading-relaxed">
                  Having trouble paying?{' '}
                  <a href="mailto:support@textilejaipur.com" className="text-amber-500 underline underline-offset-2 hover:text-amber-400">
                    Write to us
                  </a>{' '}or{' '}
                  <a href="https://wa.me/918764655537" target="_blank" rel="noopener noreferrer" className="text-green-500 underline underline-offset-2 hover:text-green-400">
                    WhatsApp us
                  </a>
                  {' '}— we handle all payment issues personally.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="h-16 w-16 bg-emerald-50 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 font-serif">Order Confirmed! 🎉</h3>
              <div className="text-xs text-zinc-600 space-y-1">
                <p className="font-medium">Thank you for shopping with Textile Jaipur!</p>
                <p className="mt-1 text-zinc-500">Order ID: <span className="font-mono text-zinc-800 font-bold">{createdOrderId}</span></p>
                <p className="text-zinc-500">Your order has been received and our Jaipur team will dispatch it shortly.</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded text-center">
                <p className="text-xs font-bold text-amber-700">✨ You earned {Math.round(getCartTotalInr() * 0.05)} JaiCoins from this purchase!</p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded text-left max-w-sm mx-auto text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Delivery to:</span>
                  <span className="text-zinc-800 font-medium text-right">{city}, {country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tracking:</span>
                  <span className="text-amber-600 font-semibold font-mono">Will be emailed to you</span>
                </div>
              </div>

              {/* Support note */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 leading-relaxed">
                <p className="font-semibold mb-1">💬 Need help with your order?</p>
                <p>If you face any issue — wrong item, delay, or payment concern — just reach out to us directly. We&apos;ll take care of everything from our side.</p>
                <div className="flex gap-3 mt-2 justify-center">
                  <a href="mailto:support@textilejaipur.com" className="text-blue-600 underline underline-offset-2 font-medium">Email Us</a>
                  <span className="text-blue-300">|</span>
                  <a href="https://wa.me/918764655537" target="_blank" rel="noopener noreferrer" className="text-green-600 underline underline-offset-2 font-medium">WhatsApp</a>
                </div>
              </div>

              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded text-xs font-bold text-zinc-950 btn-premium mt-2"
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
