'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CartSidebar } from '@/components/CartSidebar';
import { Filter, ChevronDown, Loader2, Star, ShieldCheck, Truck, Undo2, Sparkles, Flame } from 'lucide-react';
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
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('textilejaipur_collection_cache');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });
  
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('textilejaipur_collection_cache');
    }
    return true;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('textilejaipur_collection_categories');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return ['All'];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Cart
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      // Don't set loading true if we already have cached products
      if (products.length === 0) setLoading(true);
      
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      if (!url || !key) {
        if (products.length === 0) setLoading(false);
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
          const catList = ['All', ...uniqueCats.sort()];
          setCategories(catList);
          
          // Cache to localStorage
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('textilejaipur_collection_cache', JSON.stringify(mapped));
              localStorage.setItem('textilejaipur_collection_categories', JSON.stringify(catList));
            } catch (e) {}
          }
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

      {/* TOP TRUST BAR */}
      <div className="bg-zinc-900 text-brand-100 text-[11px] md:text-xs font-semibold tracking-wider py-2.5 px-4 text-center flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 sticky top-[72px] z-30 shadow-md border-b border-zinc-800">
        <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-brand-400" /> FREE Worldwide UPS Shipping</span>
        <span className="hidden md:inline text-zinc-600">|</span>
        <span className="flex items-center gap-1.5"><Undo2 className="h-3.5 w-3.5 text-brand-400" /> 30-Day No-Questions Returns</span>
        <span className="hidden md:inline text-zinc-600">|</span>
        <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand-400" /> 100% Secure Checkout</span>
      </div>

      <div className="pt-6 md:pt-8 pb-8 md:pb-24 max-w-[1400px] mx-auto px-4 md:px-6">
        
        {/* ULTRA-PREMIUM HERO SECTION */}
        <div className="mb-8 md:mb-14 rounded-[2rem] relative overflow-hidden shadow-2xl min-h-[400px] md:min-h-[600px] flex items-center border border-zinc-200/50">
          
          {/* Stunning Background Image (Unsplash) */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1583391733958-69279b90c7f1?auto=format&fit=crop&q=100&w=2000")',
            }}
          >
            {/* Elegant dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          </div>
          
          <div className="relative z-10 w-full p-6 md:p-16 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
            
            <div className="max-w-2xl w-full text-left">
              {/* Trust Badge - Glassmorphism */}
              <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <div className="flex text-amber-400">
                  <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" />
                  <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" />
                  <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" />
                  <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" />
                  <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-white tracking-wide">4.9/5 Rating</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-3 md:mb-6 leading-[1.1] tracking-tight drop-shadow-lg">
                The Jaipur <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Heritage</span> Collection
              </h1>
              
              <p className="text-zinc-200 text-sm md:text-xl leading-relaxed max-w-xl mb-6 md:mb-10 drop-shadow-md font-light">
                Authentic, hand-stitched ethnic wear directly from the royal artisan clusters of Rajasthan. Elevate your wardrobe with premium pieces loved by women worldwide.
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => window.scrollTo({ top: window.innerWidth < 768 ? 500 : 800, behavior: 'smooth' })}
                  className="px-6 py-3 md:px-8 md:py-4 bg-white text-zinc-900 font-bold rounded-full hover:bg-zinc-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] flex items-center gap-2 transform hover:-translate-y-1 text-sm md:text-base"
                >
                  Explore Collection <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Floating Trust Cards - Right Side */}
            <div className="hidden lg:flex flex-col gap-5 shrink-0 w-80">
              <div className="bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl transform transition hover:-translate-y-1 group">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-xl text-amber-400 group-hover:scale-110 transition-transform"><Sparkles className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-wide">100% Handcrafted</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Sourced directly from Jaipur</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl transform transition hover:-translate-y-1 group">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform"><ShieldCheck className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-wide">Premium Quality</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Authentic, pure fabrics only</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* URGENCY BANNER */}
        <div className="mb-8 flex items-center justify-center gap-2 text-sm font-bold text-red-600 bg-red-50 py-3 rounded-xl border border-red-100 animate-pulse">
          <Flame className="h-4 w-4" /> High Demand: Many pieces are selling out fast due to limited handcrafted stock.
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Mobile Filter Toggle */}
          <button 
            className="lg:hidden flex items-center justify-between w-full bg-white border border-brand-200 shadow-sm p-4 rounded-xl font-bold text-zinc-900"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-brand-600" />
              Filters & Categories
            </div>
            <ChevronDown className={`h-5 w-5 text-zinc-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Sidebar Filters */}
          <div className={`lg:w-64 shrink-0 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white border border-zinc-100 shadow-sm p-6 rounded-2xl sticky top-32">
              <div className="flex items-center gap-2 font-bold text-zinc-900 mb-6 font-serif text-lg border-b border-zinc-100 pb-4">
                <Filter className="h-5 w-5 text-brand-600" />
                Refine Search
              </div>
              
              <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wider mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-zinc-300"
                    />
                    <span className={`text-sm transition-colors ${selectedCategory === cat ? 'text-brand-700 font-bold' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>

              <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wider mt-8 mb-4">Sort By</h3>
              <div className="space-y-3">
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
                    <span className={`text-sm transition-colors ${sortBy === sort.id ? 'text-brand-700 font-bold' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                      {sort.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 min-h-[100vh]">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-4">
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

      {/* WHY BUY FROM US - BOTTOM TRUST REINFORCEMENT */}
      <div className="bg-white border-t border-zinc-200 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 mb-3">Why Women Worldwide Choose Us</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">We bring the authentic heritage of Rajasthan directly to your doorstep with zero compromises on quality.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-brand-50/50 border border-brand-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-brand-600 shadow-sm mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">Free Express Shipping</h3>
              <p className="text-sm text-zinc-600">We partner with UPS to deliver your ethnic wear safely and fast, anywhere in the world.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-amber-50/50 border border-amber-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">Authentic Handcrafted</h3>
              <p className="text-sm text-zinc-600">Every piece is hand-stitched by skilled artisans in Jaipur, preserving centuries of Indian textile heritage.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm mb-4">
                <Undo2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">30-Day Easy Returns</h3>
              <p className="text-sm text-zinc-600">Don't love the fit? We offer a hassle-free 30-day return policy globally with no questions asked.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
