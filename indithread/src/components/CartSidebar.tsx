'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ShieldCheck, ArrowRight } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, removeFromCart, updateQuantity, formatPrice, getCartTotalInr } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
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
                <ShoppingBag className="h-5 w-5 text-violet-500" />
                <h3 className="text-lg font-bold text-white">Your Cart</h3>
                <span className="bg-violet-900/30 text-violet-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-violet-800/30">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={onClose}
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
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.id}
                    className="flex gap-4 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40 relative group"
                  >
                    {/* Item Image */}
                    <div className="h-20 w-20 rounded-md overflow-hidden bg-zinc-800 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={item.images?.[0] || 'https://via.placeholder.com/80'} 
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-sm font-semibold text-white line-clamp-1 pr-6">{item.name}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-wider">{item.sku}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-zinc-800 bg-zinc-950 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                    <span>{formatPrice(getCartTotalInr())}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Duties & Taxes</span>
                    <span className="text-zinc-500">Calculated at Checkout</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800/60">
                    <span>Total Amount</span>
                    <span>{formatPrice(getCartTotalInr())}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-800/30">
                  <ShieldCheck className="h-4 w-4 text-violet-500 shrink-0" />
                  <span>Cross-Border Direct Garment Export. Certified Origin & PCI Secure Checkout.</span>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white btn-premium flex items-center justify-center gap-2 shadow-lg"
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
