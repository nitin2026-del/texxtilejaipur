import React, { useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import { useStore } from '../store/useStore';

export default function WishlistPage() {
  const { wishlist, fetchWishlist, products } = useStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Map wishlist IDs to actual product objects
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <MainLayout title="Wishlist" description="Your saved items.">
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Wishlist</h1>
        
        {wishlistProducts.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-md rounded-xl p-12 text-center shadow-sm">
            <h2 className="text-2xl text-gray-600 mb-4">Your wishlist is currently empty.</h2>
            <p className="text-gray-500 mb-8">Save items you love here to easily find them later.</p>
            <a href="/shop" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-full transition-colors">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistProducts.map(product => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
