'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { Search, Sparkles, Filter, ShieldCheck, Mail, MapPin, Truck } from 'lucide-react';

interface Product {
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

const CATEGORIES = [
  'All',
  'Ethnic Wear',
  'Sarees',
  'Fusion Apparel',
  'Fabrics',
  'Home Textiles'
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal states
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        if (data) {
          setProducts(data as Product[]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term and category
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === 'All' || 
      prod.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen text-white pb-16">
      {/* Navigation */}
      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-violet-900/30 text-violet-400 text-xs px-3 py-1.5 rounded-full font-semibold border border-violet-800/30">
            <Sparkles className="h-3.5 w-3.5" />
            Empowering Traditional Indian Weavers
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
            Heritage Jaipur Garments, <br />
            <span className="text-gold">Shipped Globally.</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Discover a curated collection of handloom block prints, Banarasi silk sarees, and contemporary fusion wear direct from Indian master weavers. Custom sizing, low minimum orders (MOQs), and secure multi-currency checkouts.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 max-w-lg mx-auto">
            <div className="p-3 bg-zinc-900/30 border border-zinc-800/30 rounded-xl">
              <span className="block text-lg font-bold text-white">100%</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Organic Slub</span>
            </div>
            <div className="p-3 bg-zinc-900/30 border border-zinc-800/30 rounded-xl">
              <span className="block text-lg font-bold text-white">Jaipur</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Craft Origin</span>
            </div>
            <div className="p-3 bg-zinc-900/30 border border-zinc-800/30 rounded-xl">
              <span className="block text-lg font-bold text-white">DHL</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Worldwide DDP</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section className="px-6 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900/60 pb-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Explore Collection</h3>
            <p className="text-xs text-zinc-500">Premium apparel curated for cross-border shipping</p>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative shrink-0 sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search Kurta, Sarees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Category Select Mobile */}
            <div className="sm:hidden relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Filter className="h-4 w-4" />
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs (Desktop) */}
        <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-violet-600 border-violet-500 text-white shadow-md'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl glass-card border border-zinc-800/50 animate-pulse bg-zinc-900/20 p-6 space-y-4">
                <div className="h-48 bg-zinc-800/50 rounded-xl w-full" />
                <div className="h-4 bg-zinc-850 rounded w-1/3" />
                <div className="h-6 bg-zinc-850 rounded w-3/4" />
                <div className="h-4 bg-zinc-850 rounded w-5/6" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-zinc-800 rounded w-1/4" />
                  <div className="h-8 bg-zinc-800 rounded w-1/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-950/20 border border-zinc-900 rounded-2xl p-8">
            <Filter className="h-12 w-12 text-zinc-700 mx-auto mb-4 stroke-[1.5]" />
            <p className="text-sm font-semibold text-white">No products found</p>
            <p className="text-xs text-zinc-500 mt-1">Try resetting your filters or adjusting your keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Trust & Craftsmanship Info Grid */}
      <section className="px-6 max-w-7xl mx-auto pt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-3xl bg-zinc-950/40 border border-zinc-900/80 backdrop-blur-md">
          <div className="space-y-2">
            <Truck className="h-8 w-8 text-violet-500 mb-2" />
            <h4 className="text-base font-bold text-white">DDP Export Shipping</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Delivered Duty Paid. All local port tariffs, custom clearances, and overseas logistic delays are managed fully by our Jaipur dispatch team.
            </p>
          </div>
          <div className="space-y-2 border-t md:border-t-0 md:border-l border-zinc-900/80 pt-6 md:pt-0 md:pl-8">
            <ShieldCheck className="h-8 w-8 text-violet-500 mb-2" />
            <h4 className="text-base font-bold text-white">Certified Craft Origins</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every single yard of slub-cotton, silk zari, or Ajrakh indigo dye is audited for local community wages and geographic authenticity tags.
            </p>
          </div>
          <div className="space-y-2 border-t md:border-t-0 md:border-l border-zinc-900/80 pt-6 md:pt-0 md:pl-8">
            <Sparkles className="h-8 w-8 text-violet-500 mb-2" />
            <h4 className="text-base font-bold text-white">Sizing & Custom Tailoring</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Need custom modifications or matching accessories? Our WhatsApp desk connects you directly to tailors in Rajasthan to adjust lengths dynamically.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="px-6 max-w-7xl mx-auto pt-24 mt-12 border-t border-zinc-900/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h5 className="text-sm font-bold text-white">IndiThread Garment Exporters</h5>
          <p className="text-[10px] text-zinc-500">© 2026 IndiThread Inc. Woven with pride in Jaipur, Rajasthan.</p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-violet-500" />
            <span>Industrial Area, Jaipur, IN</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="h-3.5 w-3.5 text-violet-500" />
            <span>export@indithread.com</span>
          </div>
        </div>
      </footer>

      {/* Sidebar Cart */}
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />

      {/* Checkout Wizard */}
      <CheckoutModal 
        isOpen={checkoutOpen} 
        onClose={() => setCheckoutOpen(false)} 
      />
    </main>
  );
}
