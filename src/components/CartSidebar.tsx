'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ShieldCheck, ArrowRight, Info, Sparkles, Video } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, removeFromCart, updateQuantity, formatPrice, getCartSubtotalInr, getCartTotalInr, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { userTier, tierDiscountPercentage } = useAuth();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [shippingConfig, setShippingConfig] = useState<{ standard_price: number; is_free_shipping: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/shipping-config')
        .then(res => res.json())
        .then(data => setShippingConfig(data))
        .catch(console.error);
    }
  }, [isOpen]);

  const goToProduct = (id: string) => {
    onClose();
    router.push(`/product/${id}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-zinc-950 border-l border-zinc-800 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-gold" />
                <h3 className="text-lg font-serif font-medium text-white">Your Cart</h3>
                <span className="bg-brand-900/30 text-gold text-xs px-2.5 py-0.5 rounded font-semibold border border-brand-800/30">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={onClose}
                aria-label="Close Cart"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="h-16 w-16 text-zinc-700 mb-4 stroke-[1.5]" />
                  <p className="text-zinc-400 font-medium">Your cart is empty</p>
                  <p className="text-zinc-600 text-xs mt-1">Explore our premium textiles to add items</p>
                  
                  <div className="mt-8 p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl max-w-[280px]">
                    <Sparkles className="h-6 w-6 text-brand-400 mx-auto mb-2" />
                    <p className="text-zinc-300 text-sm font-semibold mb-3">See how our community styles their pieces.</p>
                    <Link href="/the-artisan-edit" onClick={onClose} className="px-6 py-2.5 bg-brand-600/90 text-white hover:bg-brand-500 rounded-full font-bold text-xs transition-colors shadow-lg shadow-brand-500/20 inline-flex items-center gap-2 w-full justify-center">
                      <Video className="h-3.5 w-3.5" /> Watch The Artisan Edit
                    </Link>
                  </div>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.id}
                    className="flex gap-4 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40 relative group"
                  >
                    {/* Item Image - clickable to product page */}
                    <button onClick={() => goToProduct(item.id)} className="h-20 w-20 rounded-md overflow-hidden bg-zinc-800 shrink-0 block hover:opacity-80 transition-opacity cursor-pointer">
                      <img 
                        src={item.images?.[0] || 'https://via.placeholder.com/80'} 
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80'; }}
                      />
                    </button>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <button onClick={() => goToProduct(item.id)} className="text-sm font-semibold text-white line-clamp-1 pr-6 hover:text-amber-300 transition-colors block text-left w-full">{item.name}</button>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-wider">{item.sku}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-zinc-800 bg-zinc-950 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease Quantity"
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase Quantity"
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-sm font-bold text-white">
                          {formatPrice(item.price_inr * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove Item"
                      className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-800 bg-zinc-950/60 backdrop-blur-md space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(getCartSubtotalInr())}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-xs text-amber-500 font-bold">
                      <span className="flex items-center gap-2">
                        Discount ({appliedCoupon.code})
                        <button onClick={removeCoupon} className="text-zinc-500 hover:text-zinc-300 text-[10px] underline">Remove</button>
                      </span>
                      <span>-{appliedCoupon.type === 'percent' ? `${appliedCoupon.value}%` : formatPrice(appliedCoupon.value)}</span>
                    </div>
                  )}
                  {tierDiscountPercentage > 0 && (
                    <div className="flex justify-between text-xs text-brand-400 font-bold">
                      <span>VIP {userTier} Discount ({tierDiscountPercentage}%)</span>
                      <span>-{formatPrice(getCartSubtotalInr() * (tierDiscountPercentage / 100))}</span>
                    </div>
                  )}

                  
                  {/* Promo Code Input */}
                  <div className="py-2 border-t border-zinc-800/50 mt-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponCode} 
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          if (couponMsg.text) setCouponMsg({ type: '', text: '' });
                        }}
                        placeholder="Promo Code"
                        className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-xs text-white w-full uppercase placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      <button 
                        onClick={async () => {
                          if(!couponCode) return;
                          setSuggestedProducts([]);
                          const res = await applyCoupon(couponCode);
                          setCouponMsg({ type: res.success ? 'success' : 'error', text: res.message });
                          if(res.success) {
                            setCouponCode('');
                          } else if (res.shortfallInr) {
                            // Fetch 2 products roughly around or slightly above the shortfall price
                            const { data } = await supabase
                              .from('products')
                              .select('id, name, price, product_images(url, is_primary)')
                              .gte('price', res.shortfallInr)
                              .order('price', { ascending: true })
                              .limit(2);
                            if (data) setSuggestedProducts(data);
                          }
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {couponMsg.text && (
                      <div className="mt-1.5">
                        <p className={`text-[10px] ${couponMsg.type === 'success' ? 'text-amber-500' : 'text-red-400'}`}>
                          {couponMsg.text}
                        </p>
                        {suggestedProducts.length > 0 && couponMsg.type === 'error' && (
                          <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5">
                            <p className="text-[10px] text-zinc-400 mb-2 font-medium flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-gold" /> Suggested Add-ons:
                            </p>
                            <div className="flex flex-col gap-2">
                              {suggestedProducts.map(sp => {
                                const imgUrl = sp.product_images?.find((img: any) => img.is_primary)?.url || sp.product_images?.[0]?.url;
                                return (
                                  <div key={sp.id} onClick={() => goToProduct(sp.id)} className="flex items-center gap-2.5 bg-zinc-950 p-1.5 rounded cursor-pointer hover:bg-zinc-800 transition-colors border border-zinc-800 hover:border-zinc-700">
                                    <div className="h-10 w-8 rounded overflow-hidden bg-zinc-800 shrink-0">
                                      {imgUrl && <img src={imgUrl} alt={sp.name} className="h-full w-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] text-zinc-200 truncate font-medium">{sp.name}</p>
                                      <p className="text-[10px] text-gold">{formatPrice(sp.price)}</p>
                                    </div>
                                    <ArrowRight className="h-3 w-3 text-zinc-600 mr-1" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 mb-2">
                    <Link href="/the-artisan-edit" onClick={onClose} className="w-full bg-zinc-900 border border-zinc-800 hover:border-brand-600/50 rounded-xl p-3 flex items-center justify-between group transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-950/30 flex items-center justify-center text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                          <Video className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-zinc-200">Loved By Our Community</p>
                          <p className="text-[10px] text-zinc-500">See our pieces in the wild</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-brand-400 transition-colors" />
                    </Link>
                  </div>

                  <div className="flex justify-between text-base font-serif font-semibold text-white pt-2 border-t border-zinc-800">
                    <span>Total Amount</span>
                    <span className="text-gold font-bold">
                      {formatPrice(getCartTotalInr())}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-zinc-900/30 p-2.5 rounded border border-zinc-800">
                  <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
                  <span>Cross-Border Direct Garment Export. Certified Origin & PCI Secure Checkout.</span>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full py-3 px-4 rounded text-sm font-semibold text-zinc-950 btn-premium flex items-center justify-center gap-2 shadow-lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
