'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CartSidebar } from '@/components/CartSidebar';
import { Filter, ChevronDown, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price_inr: number;
  category: string;
  images: string[];
  stock: number;
  is_featured?: boolean;
  display_rank?: number;
  details: { material?: string; origin?: string; care?: string };
}

type SortOption = 'featured' | 'price-low-high' | 'price-high-low' | 'newest';

export default function CollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Cart
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      if (!url || !key) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (name),
            product_images (url, is_primary, display_order)
          `)
          .order('display_rank', { ascending: true, nullsFirst: false });

        if (error) throw error;

        if (data) {
          const mapped = (data as any[]).map((item) => {
            const sortedImages = item.product_images
              ? [...item.product_images]
                  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                  .map((img) => img.url)
              : [];

            return {
              id: item.id,
              sku: item.slug ? `HT-${item.slug.toUpperCase()}` : `HT-${item.id.slice(0, 8).toUpperCase()}`,
              name: item.name,
              description: item.description || '',
              price_inr: item.price || 0,
              category: item.categories?.name || 'Ethnic Wear',
              images: sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
              stock: item.stock_quantity || item.stock || 0,
              details: {
                material: item.description?.includes('Silk') ? 'Pure Silk' : item.description?.includes('Cotton') ? 'Premium Cotton' : 'Handloom Fabric',
                origin: 'Jaipur, Rajasthan',
                care: 'Dry clean only'
              },
              is_featured: item.is_featured || false,
              display_rank: item.display_rank || 999,
              created_at: item.created_at
            };
          });

          setProducts(mapped);
          
          // Extract unique categories
          const uniqueCats = Array.from(new Set(mapped.map(p => p.category))).filter(Boolean);
          setCategories(['All', ...uniqueCats.sort()]);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-low-high':
        result.sort((a, b) => a.price_inr - b.price_inr);
        break;
      case 'price-high-low':
        result.sort((a, b) => b.price_inr - a.price_inr);
        break;
      case 'newest':
        // Assuming higher ID or created_at logic. Let's just reverse the array as a rough approximation of 'newest'
        // If we fetched created_at we could sort by it. We'll add created_at logic.
        result.sort((a, b) => {
           const dateA = (a as any).created_at ? new Date((a as any).created_at).getTime() : 0;
           const dateB = (b as any).created_at ? new Date((b as any).created_at).getTime() : 0;
           return dateB - dateA;
        });
        break;
      case 'featured':
      default:
        result.sort((a, b) => (a.display_rank || 999) - (b.display_rank || 999));
        break;
    }

    return result;
  }, [products, selectedCategory, sortBy]);

  return (
    <main className="min-h-screen bg-[#FDFBF7] selection:bg-brand-200 selection:text-brand-900">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => {}} />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-4">Shop All Collections</h1>
          <p className="text-zinc-600 max-w-2xl text-lg">
            Discover our complete range of handcrafted Indian ethnic wear, direct from the artisans of Jaipur.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Mobile Filter Toggle */}
          <button 
            className="lg:hidden flex items-center justify-between w-full bg-white border border-zinc-200 p-4 rounded-xl font-medium text-zinc-800"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-zinc-500" />
              Filters & Categories
            </div>
            <ChevronDown className={`h-5 w-5 text-zinc-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Sidebar Filters */}
          <div className={`lg:w-64 shrink-0 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl sticky top-32">
              <h3 className="font-bold text-zinc-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-zinc-300"
                    />
                    <span className={`text-sm transition-colors ${selectedCategory === cat ? 'text-brand-700 font-semibold' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>

              <h3 className="font-bold text-zinc-900 mt-8 mb-4">Sort By</h3>
              <div className="space-y-2">
                {[
                  { id: 'featured', label: 'Featured' },
                  { id: 'newest', label: 'New Arrivals' },
                  { id: 'price-low-high', label: 'Price: Low to High' },
                  { id: 'price-high-low', label: 'Price: High to Low' },
                ].map((sort) => (
                  <label key={sort.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="sort" 
                      checked={sortBy === sort.id}
                      onChange={() => setSortBy(sort.id as SortOption)}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-zinc-300"
                    />
                    <span className={`text-sm transition-colors ${sortBy === sort.id ? 'text-brand-700 font-semibold' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                      {sort.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
                <p className="text-zinc-500 font-medium">Loading collection...</p>
              </div>
            ) : filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-10">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center">
                <p className="text-zinc-500 text-lg mb-4">No products found in this category.</p>
                <button 
                  onClick={() => setSelectedCategory('All')}
                  className="px-6 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
                >
                  View All Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
