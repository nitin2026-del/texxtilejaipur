import React from 'react';
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { Link } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalInr, clearCart } = useCartStore();
  const { formatProductPrice, formatPrice } = useCurrencyStore();

  if (!isOpen) return null;

  const total = totalInr();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="absolute right-0 inset-y-0 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-zinc-950 border-l border-zinc-800 shadow-2xl animate-slide-in-right">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-gold" />
                <h2 className="text-lg font-serif font-medium text-white">Shopping Cart</h2>
                {items.length > 0 && (
                  <span className="text-xs bg-yellow-950/40 text-gold border border-yellow-800/30 px-2 py-0.5 rounded-full font-semibold">
                    {items.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">
                    Clear all
                  </button>
                )}
                <button onClick={closeCart} className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 mb-4">
                    <ShoppingBag className="h-12 w-12 text-zinc-700 stroke-[1.5]" />
                  </div>
                  <h3 className="text-zinc-300 font-medium mb-1">Your cart is empty</h3>
                  <p className="text-sm text-zinc-600 mb-6">Discover our premium ethnic wear collection</p>
                  <Link to="/catalog" onClick={closeCart} className="btn-premium px-6 py-2.5 rounded-xl text-sm">
                    Shop Now
                  </Link>
                </div>
              ) : (
                items.map((item) => {
                  const img = item.product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&auto=format&fit=crop&q=80';
                  return (
                    <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40 group">
                      <Link to={`/product/${item.product_id}`} onClick={closeCart} className="shrink-0">
                        <div className="h-20 w-16 rounded-lg overflow-hidden bg-zinc-800">
                          <img src={img} alt={item.product.name} className="h-full w-full object-cover" />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/product/${item.product_id}`} onClick={closeCart}>
                            <h4 className="text-sm font-medium text-white hover:text-gold transition-colors line-clamp-2 leading-tight">
                              {item.product.name}
                            </h4>
                          </Link>
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="shrink-0 p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {item.selected_size && (
                          <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider">Size: {item.selected_size}</p>
                        )}
                        <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{item.product.sku}</p>

                        <div className="flex items-center justify-between mt-2.5">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-zinc-800 bg-zinc-950 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-white min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Item Price */}
                          <span className="text-sm font-bold text-white">
                            {formatProductPrice({ ...item.product, price_inr: item.product.price_inr * item.quantity })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer - Summary & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-zinc-800 px-6 py-5 space-y-4">
                {/* Trust Message */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
                  <p className="text-[10px] text-zinc-500 leading-snug">
                    Secure checkout. All duties paid (DDP). PCI-DSS Level 1.
                  </p>
                </div>

                {/* Order Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Shipping & Duties</span>
                    <span className="text-gold">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white font-serif pt-2 border-t border-zinc-800">
                    <span>Total</span>
                    <span className="text-gold">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  to="/?checkout=open"
                  onClick={closeCart}
                  className="btn-premium w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button onClick={closeCart} className="w-full text-xs text-zinc-500 hover:text-white transition-colors py-1">
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
