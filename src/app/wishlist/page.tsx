'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Sparkles } from 'lucide-react';

interface WishlistProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  price_inr: number;
  category: string;
  images: string[];
  stock: number;
  details: { material?: string; origin?: string; care?: string };
}

export default function WishlistPage() {
  const { addToCart, formatPrice } = useCart();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      const wlProducts: Record<string, WishlistProduct> = JSON.parse(
        localStorage.getItem('hiyawear_wishlist_products') || '{}'
      );
      setProducts(Object.values(wlProducts));
    } catch {}
  }, []);

  const removeFromWishlist = (productId: string) => {
    try {
      const wl: string[] = JSON.parse(localStorage.getItem('hiyawear_wishlist') || '[]');
      const updated = wl.filter((id) => id !== productId);
      localStorage.setItem('hiyawear_wishlist', JSON.stringify(updated));

      const wlProducts: Record<string, WishlistProduct> = JSON.parse(
        localStorage.getItem('hiyawear_wishlist_products') || '{}'
      );
      delete wlProducts[productId];
      localStorage.setItem('hiyawear_wishlist_products', JSON.stringify(wlProducts));
      setProducts(Object.values(wlProducts));
    } catch {}
  };

  const moveToCart = (product: WishlistProduct) => {
    addToCart(product);
    removeFromWishlist(product.id);
    setCartOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-zinc-900 pb-24">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <BottomNav onCartOpen={() => setCartOpen(true)} />

      <div className="pt-32 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-3">
              <ArrowLeft className="h-4 w-4" /> Back to Shop
            </Link>
            <h1 className="text-4xl font-serif text-zinc-900 font-bold flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-zinc-500 mt-1">{products.length} saved {products.length === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        {products.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="h-10 w-10 text-zinc-300" />
            </div>
            <h2 className="text-2xl font-serif text-zinc-900 mb-2">Your wishlist is empty</h2>
            <p className="text-zinc-500 mb-8 max-w-sm">
              Save your favourite Jaipur textiles here and never lose track of what you love.
            </p>
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-brand-700 text-white font-bold rounded-xl hover:bg-brand-800 transition-colors shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              Explore Collection
            </Link>
          </div>
        ) : (
          <>
            {/* Move all to cart */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => products.forEach(moveToCart)}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-700 text-white text-sm font-bold rounded-xl hover:bg-brand-800 transition-colors shadow-md"
              >
                <ShoppingCart className="h-4 w-4" />
                Add All to Cart ({products.length})
              </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-md transition-all group">
                  <Link href={`/product/${product.id}`} className="block aspect-[4/5] relative overflow-hidden bg-zinc-50">
                    <Image
                      src={product.images?.[0] || 'https://via.placeholder.com/400x500'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-white text-zinc-800 text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded shadow-sm">
                      {product.category}
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); removeFromWishlist(product.id); }}
                      className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </Link>

                  <div className="p-4 space-y-3">
                    <div>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-serif text-zinc-900 font-semibold line-clamp-1 hover:text-brand-700 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      {product.details?.material && (
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{product.details.material}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-serif font-bold text-zinc-900">{formatPrice(product.price_inr)}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => moveToCart(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-700 text-white text-xs font-bold rounded-lg hover:bg-brand-800 transition-colors"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="p-2.5 border border-zinc-200 rounded-lg text-zinc-500 hover:text-red-500 hover:border-red-200 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
