'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { BottomNav } from '@/components/BottomNav';
import { AbandonedCartSimulator } from '@/components/AbandonedCartSimulator';
import { Search, Sparkles, Filter, ShieldCheck, Truck, Clock } from 'lucide-react';
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

const CATEGORIES = [
  'All',
  'Embroidered Jackets',
  'Boho Dresses',
  'Banarasi Silk',
  'Sarees',
  'Kurtas',
  'Lehengas',
  'Sherwanis'
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbCategories, setDbCategories] = useState<{id: string, name: string, parent_id: string | null}[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  
  // Pagination State
  const [categoryTiers, setCategoryTiers] = useState<Record<string, number>>({});
  
  // Debug states
  const [debugStatus, setDebugStatus] = useState('Initializing fetch...');
  const [debugError, setDebugError] = useState<string | null>(null);

  // Modal states
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    // Capture global errors
    const handleError = (e: ErrorEvent) => {
      setDebugError((prev) => (prev ? prev + '\n' : '') + `Uncaught Error: ${e.message}`);
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      setDebugError((prev) => (prev ? prev + '\n' : '') + `Promise Rejection: ${e.reason}`);
    };
    const handleCategorySelect = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSelectedMainCategory(customEvent.detail);
      setSelectedSubCategory('All');
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    window.addEventListener('selectCategory', handleCategorySelect);

    const fetchProducts = async () => {
      setLoading(true);
      setDebugError(null);
      
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      setDebugStatus(`Config - URL: "${url || 'undefined'}", Key Length: ${key.length}`);

      if (!url || !key) {
        setDebugStatus('Config missing. Cannot fetch products.');
        setLoading(false);
        return;
      }

      // Fetch Categories
      try {
        const catRes = await fetch(`${url}/rest/v1/categories?select=id,name,parent_id,display_order&order=display_order.asc.nullsfirst,name.asc`, {
          headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        if (catRes.ok) {
          const catData = await catRes.json();
          setDbCategories(catData);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }

      // Try Direct Fetch
      try {
        setDebugStatus('Fetching via direct REST API...');
        const restUrl = `${url}/rest/v1/products?select=*,categories(name),product_images(url,is_primary,display_order)&order=display_rank.asc.nullslast,name.asc`;
        const res = await fetch(restUrl, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        });

        if (!res.ok) {
          throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setDebugStatus(`Fetched ${data.length} products via direct REST.`);

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
              display_rank: item.display_rank || 999
            };
          });
          setProducts(mapped);
        }
      } catch (restErr: any) {
        console.error('Direct REST fetch failed:', restErr);
        setDebugError((prev) => (prev ? prev + '\n' : '') + `REST Fetch Error: ${restErr.message || String(restErr)}`);
        
        // Fallback to Supabase SDK
        try {
          setDebugStatus('REST failed. Fetching via Supabase SDK...');
          const { data, error } = await supabase
            .from('products')
            .select(`
              *,
              categories (
                name
              ),
              product_images (
                url,
                is_primary,
                display_order
              )
            `)
            .order('name', { ascending: true });

          if (error) throw error;
          
          if (data) {
            setDebugStatus(`Fetched ${data.length} products via SDK.`);
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
                }
              };
            });
            setProducts(mapped);
          }
        } catch (sdkErr: any) {
          console.error('Supabase SDK fetch failed:', sdkErr);
          setDebugError((prev) => (prev ? prev + '\n' : '') + `SDK Error: ${sdkErr.message || String(sdkErr)}`);
          setDebugStatus('All fetch methods failed.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('selectCategory', handleCategorySelect);
    };
  }, []);

  // Filter products based on category and search term
  const filteredProducts = products.filter((prod) => {
    // Determine active category for filtering
    const activeCategory = selectedSubCategory !== 'All' ? selectedSubCategory : selectedMainCategory;
    
    let matchesCategory = false;
    if (activeCategory === 'All') {
      matchesCategory = true;
    } else {
      // Find the category object for the active category
      const catObj = dbCategories.find(c => c.name === activeCategory);
      if (catObj) {
        // If it's a main category, get all its subcategories
        const subCats = dbCategories.filter(c => c.parent_id === catObj.id).map(c => c.name);
        matchesCategory = prod.category === activeCategory || subCats.includes(prod.category);
      } else {
        // Fallback if category object not found
        matchesCategory = prod.category === activeCategory;
      }
    }

    const matchesSearch = 
      (prod.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesCategory && matchesSearch;
  });

  const mainCategories = dbCategories.filter(c => !c.parent_id).map(c => c.name);
  const displayMainCategories = mainCategories.length > 0 
    ? mainCategories 
    : Array.from(new Set(products.map(p => p.category))).filter(c => c !== 'All');
  
  const activeMainCatObj = dbCategories.find(c => c.name === selectedMainCategory);
  const currentSubCategories = activeMainCatObj ? dbCategories.filter(c => c.parent_id === activeMainCatObj.id).map(c => c.name) : [];

  // Reset display tiers when category changes
  useEffect(() => {
    setCategoryTiers({});
  }, [selectedMainCategory, selectedSubCategory]);

  const handleLoadMore = (categoryName: string, e: React.MouseEvent<HTMLButtonElement>) => {
    // Blur the button so that if it gets unmounted, the browser doesn't auto-scroll to the next focusable element
    e.currentTarget.blur();
    
    // Track current scroll position
    const containerId = `carousel-${categoryName.replace(/\s+/g, '-')}`;
    const container = document.getElementById(containerId);
    const scrollPos = container ? container.scrollLeft : 0;
    
    setCategoryTiers(prev => ({
      ...prev,
      [categoryName]: (prev[categoryName] || 1) + 1
    }));

    // Force restore scroll position after DOM update to completely prevent snap-jumping
    if (container) {
      setTimeout(() => {
        container.scrollLeft = scrollPos;
      }, 50);
    }
  };

  // Determine which categories to render sections for
  const categoriesToRender = selectedMainCategory === 'All' 
    ? displayMainCategories 
    : [selectedSubCategory !== 'All' ? selectedSubCategory : selectedMainCategory];

  return (
    <main className="min-h-screen text-zinc-900 pb-16 bg-[#FDFBF7]">
      {/* Navigation */}
      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <section className="relative w-full h-[72vh] sm:h-screen min-h-[500px] sm:min-h-[700px] flex flex-col justify-end sm:justify-center overflow-hidden">
        {/* Background — CSS bg-image loads more reliably on mobile than img tag */}
        <div
          className="absolute inset-0 z-0 animate-slow-zoom"
          style={{
            backgroundColor: '#2C1810',
            backgroundImage: 'url(https://images.unsplash.com/photo-1610030469983-98e550d615ef?q=75&w=800&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col justify-between px-5 sm:px-12 md:px-24 max-w-7xl mx-auto pt-20 pb-10 sm:pb-0 sm:pt-28 animate-slide-up">
          
          {/* Brand logo — visible in upper area on mobile, properly below navbar */}
          <div className="flex flex-col items-center justify-center flex-1 sm:hidden">
            <div className="flex flex-col items-center gap-3">
              <img
                src="/icon.png"
                alt="Texxtile Jaipur"
                className="h-24 w-24 rounded-2xl shadow-2xl border-2 border-white/30 object-cover"
              />
              <div className="text-center">
                <p className="text-white font-serif text-3xl font-bold tracking-wider drop-shadow-lg">TEXTILE</p>
                <p className="text-brand-300 text-sm font-bold tracking-[0.4em] uppercase mt-0.5">JAIPUR</p>
              </div>
            </div>
          </div>

          {/* Bottom content — headline & CTA */}
          <div className="space-y-3 sm:space-y-6 sm:mt-0">
            <h1 className="text-[2.6rem] sm:text-7xl md:text-8xl lg:text-[100px] font-serif font-medium tracking-tight leading-[1.05] text-white drop-shadow-2xl max-w-4xl">
              Modern <br />
              <span className="font-light italic text-brand-200">Bohemian</span> Luxe.
            </h1>
            
            <p className="text-white/80 text-xs sm:text-lg max-w-xs sm:max-w-xl leading-relaxed font-medium drop-shadow-lg border-l-2 border-brand-400 pl-3 sm:pl-4">
              Handcrafted by master artisans in Jaipur for 400+ years. Delivered anywhere in the world — fully tracked &amp; guaranteed.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6 pt-1">
              <a href="#categories" className="px-8 py-3 sm:px-10 sm:py-4 bg-white text-zinc-950 hover:bg-brand-50 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-xl">
                Explore Collection
              </a>
              <div className="flex items-center gap-2 text-white/60 text-[10px] sm:text-xs font-medium">
                <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 shrink-0" />
                <span>Secure Payments &bull; 14-Day Returns &bull; Free UPS Express</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Scrolling Marquee */}
      <div className="w-full bg-zinc-950 text-white overflow-hidden py-3 border-y border-zinc-800 relative z-20">
        <div className="whitespace-nowrap flex animate-marquee items-center text-xs font-bold tracking-widest uppercase opacity-90">
          <span className="mx-8">✦ FREE UPS EXPRESS WORLDWIDE</span>
          <span className="mx-8">✦ HANDCRAFTED IN JAIPUR</span>
          <span className="mx-8">✦ 14-DAY MONEY BACK GUARANTEE</span>
          <span className="mx-8">✦ TRUSTED BY 3,200+ BUYERS</span>
          <span className="mx-8">✦ WE SHIP TO EVERY COUNTRY</span>
          <span className="mx-8">✦ SECURE PAYPAL CHECKOUT</span>
          <span className="mx-8">✦ 400+ YEARS OF CRAFT HERITAGE</span>
          <span className="mx-8">✦ FREE UPS EXPRESS WORLDWIDE</span>
          <span className="mx-8">✦ HANDCRAFTED IN JAIPUR</span>
          <span className="mx-8">✦ 14-DAY MONEY BACK GUARANTEE</span>
          <span className="mx-8">✦ TRUSTED BY 3,200+ BUYERS</span>
          <span className="mx-8">✦ WE SHIP TO EVERY COUNTRY</span>
        </div>
      </div>

      {/* New Arrivals Section */}
      <section id="new-arrivals" className="px-6 sm:px-12 max-w-[1600px] mx-auto pt-24 pb-12">
        <div className="flex items-end justify-between mb-12 border-b border-zinc-200 pb-6">
          <div>
            <h3 className="text-4xl font-serif text-zinc-900">The Latest Edit</h3>
            <p className="text-xs text-zinc-500 tracking-widest mt-2 uppercase font-bold">New Discoveries from our Artisans</p>
          </div>
          <a href="#categories" className="text-xs font-bold text-brand-700 hover:text-brand-900 transition-colors uppercase tracking-wider">
            View All
          </a>
        </div>
        
        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[280px] sm:w-[320px] h-[450px] rounded-lg glass-card border border-zinc-900 animate-pulse bg-zinc-900/20 p-6 space-y-4 shrink-0">
                <div className="h-72 bg-zinc-800/50 rounded w-full" />
                <div className="h-4 bg-zinc-850 rounded w-1/3" />
                <div className="h-6 bg-zinc-850 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar [overflow-anchor:none]">
            {(products.filter(p => p.is_featured).length > 0
              ? products.filter(p => p.is_featured)
              : products
            ).slice(0, 4).map((prod) => (
              <div key={prod.id} className="w-[280px] sm:w-[320px] shrink-0">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Catalog & Filter Section */}
      <section id="categories" className="w-full bg-white border-t border-zinc-200 py-20 mt-8 shadow-sm">
        <div className="px-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8 mb-8">
            <div className="max-w-xl">
              <h3 className="text-4xl sm:text-5xl font-serif text-zinc-900 mb-3 font-bold">Shop by Category</h3>
              <p className="text-brand-700 text-xs font-bold tracking-[0.2em] uppercase leading-relaxed">
                Explore our curated selection of heritage textiles
              </p>
            </div>
          
          <div className="w-full md:w-72 shrink-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search Suzani, Maxi Dresses, Silk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-full py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-col gap-3 pb-2">
          {/* Main Categories Row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setSelectedMainCategory('All'); setSelectedSubCategory('All'); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-250 border ${
                selectedMainCategory === 'All'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              All
            </button>
            {displayMainCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedMainCategory(cat); setSelectedSubCategory('All'); }}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-250 border ${
                  selectedMainCategory === cat
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Subcategories Row (Only visible if a main category with subcategories is selected) */}
          {currentSubCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pl-4 border-l-2 border-zinc-200 animate-slide-up">
              <button
                onClick={() => setSelectedSubCategory('All')}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all duration-250 uppercase ${
                  selectedSubCategory === 'All'
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'bg-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                All {selectedMainCategory}
              </button>
              {currentSubCategories.map((subCat) => (
                <button
                  key={subCat}
                  onClick={() => setSelectedSubCategory(subCat)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all duration-250 uppercase ${
                    selectedSubCategory === subCat
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'bg-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {subCat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stacked Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[450px] bg-zinc-50 border border-zinc-100 animate-pulse p-6 space-y-4">
                <div className="h-72 bg-zinc-200 rounded w-full" />
                <div className="h-4 bg-zinc-200 rounded w-1/3" />
                <div className="h-6 bg-zinc-200 rounded w-3/4" />
                <div className="flex justify-between items-center pt-4">
                  <div className="h-6 bg-zinc-200 rounded w-1/4" />
                  <div className="h-8 bg-zinc-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32 bg-[#FDFBF7] border border-zinc-200 p-8">
            <Filter className="h-12 w-12 text-zinc-300 mx-auto mb-4 stroke-[1.5]" />
            <p className="text-lg font-serif font-bold text-zinc-900">No products found</p>
            <p className="text-sm text-zinc-500 mt-2 font-medium tracking-wide">Try adjusting your category or search terms.</p>
          </div>
        ) : (
          <div className="space-y-24">
            {categoriesToRender.map((catName) => {
              // 1. Get products for this category
              const isMainCat = dbCategories.find(c => c.name === catName && !c.parent_id);
              const subCats = isMainCat ? dbCategories.filter(c => c.parent_id === isMainCat.id).map(c => c.name) : [];
              const catProducts = filteredProducts.filter(p => p.category === catName || subCats.includes(p.category));
              
              if (catProducts.length === 0) return null;

              // 2. Apply tier logic for THIS category
              const currentTier = categoryTiers[catName] || 1;
              const visibleCatProducts = catProducts.filter((p) => {
                const rank = p.display_rank ?? 999;
                if (rank < 999) {
                  return rank <= currentTier;
                } else {
                  const maxDefinedRank = Math.max(1, ...catProducts.filter(x => (x.display_rank ?? 999) < 999).map(x => x.display_rank ?? 999));
                  if (currentTier <= maxDefinedRank) return false;
                  const unrankedPages = currentTier - maxDefinedRank;
                  const unrankedIndex = catProducts.filter(x => (x.display_rank ?? 999) === 999).indexOf(p);
                  return unrankedIndex < (unrankedPages * 12);
                }
              });

              const hasMoreProducts = visibleCatProducts.length < catProducts.length;

              return (
                <div key={catName} className="space-y-8">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 border-b border-zinc-200 pb-2">
                    <h4 className="text-3xl font-serif text-zinc-900">{catName}</h4>
                    <span className="text-xs text-zinc-500 font-medium tracking-widest uppercase">{catProducts.length} items</span>
                  </div>

                  {/* Horizontal Scrolling Carousel */}
                  <div id={`carousel-${catName.replace(/\s+/g, '-')}`} className="flex gap-6 overflow-x-auto pb-8 pt-4 custom-scrollbar [overflow-anchor:none]">
                    {visibleCatProducts.map((prod) => (
                      <div key={prod.id} className="w-[280px] sm:w-[320px] shrink-0">
                        <ProductCard product={prod} />
                      </div>
                    ))}
                    
                    {/* Load More Button at the end of carousel */}
                    {hasMoreProducts && (
                      <div key={`load-more-${catName}-${currentTier}`} className="w-[280px] sm:w-[320px] shrink-0 flex items-center justify-center">
                        <button
                          onClick={(e) => handleLoadMore(catName, e)}
                          className="px-8 py-6 border border-zinc-900 text-zinc-900 font-bold tracking-widest uppercase text-xs hover:bg-zinc-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col items-center gap-2"
                        >
                          <span>View More</span>
                          <span className="text-[10px] text-zinc-500">{catProducts.length - visibleCatProducts.length} more items</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </section>

      {/* Editorial Heritage Section */}
      <section className="px-6 sm:px-12 max-w-[1600px] mx-auto py-24 my-12 border-y border-zinc-200 bg-[#FDFBF7]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-8 max-w-xl pl-0 lg:pl-12">
            <h3 className="text-4xl sm:text-5xl font-serif text-zinc-900 leading-[1.1]">
              The Art of <br />
              <span className="italic font-light text-brand-700">Slow Fashion.</span>
            </h3>
            <p className="text-zinc-600 leading-loose text-lg font-medium">
              We collaborate exclusively with heritage artisans across rural Rajasthan to preserve techniques that have been passed down for centuries. From intricate block-printing to exquisite Suzani embroidery, every thread tells a story of cultural mastery.
            </p>
            <div className="pt-4">
              <a href="#categories" className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-900 border-b border-zinc-900 pb-1 hover:text-brand-700 hover:border-brand-700 transition-colors">
                Discover The Craft
              </a>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="aspect-[4/3] overflow-hidden bg-zinc-100">
              <img 
                src="/heritage_craft.png" 
                alt="Jaipur Artisan Craft"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Craftsmanship Info Grid */}
      <section className="px-6 max-w-7xl mx-auto pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 rounded-2xl bg-[#FDFBF7] border border-[#E5DFD3] shadow-sm">
          <div className="space-y-3">
            <Truck className="h-10 w-10 text-[#6B2A2A] mb-3" />
            <h4 className="text-xl font-serif text-zinc-900 font-medium tracking-wide">Worldwide UPS Shipping</h4>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              We manage all port tariffs, customs clearances, and international logistic flows. Seamlessly shipped to any country in the world with full tracking and care.
            </p>
          </div>
          <div className="space-y-3 border-t md:border-t-0 md:border-l border-[#E5DFD3] pt-6 md:pt-0 md:pl-10">
            <ShieldCheck className="h-10 w-10 text-[#6B2A2A] mb-3" />
            <h4 className="text-xl font-serif text-zinc-900 font-medium tracking-wide">Secure Export Quality</h4>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              Every garment reflects flawless craftsmanship. Hand-checked for international quality standards before export from our Jaipur artisan center.
            </p>
          </div>
          <div className="space-y-3 border-t md:border-t-0 md:border-l border-[#E5DFD3] pt-6 md:pt-0 md:pl-10">
            <Sparkles className="h-10 w-10 text-[#6B2A2A] mb-3" />
            <h4 className="text-xl font-serif text-zinc-900 font-medium tracking-wide">Wholesale & Boutique</h4>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              Contact our wholesale desk for catalogs, custom sizing, or low MOQ arrangements tailored perfectly to your international boutique.
            </p>
          </div>
        </div>
      </section>

      {/* Instagram Strip */}
      <section className="w-full bg-gradient-to-r from-[#FDF8F9] via-[#FEF5ED] to-[#FDF8F9] py-16 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 text-center mb-10">
          <h3 className="text-3xl sm:text-4xl font-bold text-[#1a202c] mb-3">Follow Us on Instagram</h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#E1306C]">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            <a href="https://instagram.com/textileofjaipur" target="_blank" rel="noopener noreferrer" className="text-[#E1306C] font-bold text-lg hover:underline decoration-2 underline-offset-4">
              @textileofjaipur
            </a>
          </div>
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Join over 3,000+ followers</p>
        </div>

        {/* Image Strip */}
        <div className="max-w-[1600px] mx-auto px-4 overflow-hidden mb-12">
          <div className="flex gap-4 justify-center flex-wrap sm:flex-nowrap">
            {products.slice(0, 6).map((prod, idx) => (
              <a 
                key={idx} 
                href="https://instagram.com/textileofjaipur" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative group w-[45%] sm:w-[16%] aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-zinc-100 block shrink-0"
              >
                <img 
                  src={prod.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'} 
                  alt="Instagram Post" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100 transform">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <a 
            href="https://instagram.com/textileofjaipur" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            Follow @textileofjaipur
          </a>
        </div>
      </section>

      {/* Press Mentions & Trust Stats */}
      <section className="w-full bg-zinc-950 py-14">
        <div className="px-6 max-w-7xl mx-auto">
          <p className="text-center text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase mb-8">Trusted by Buyers in 30+ Countries Worldwide</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { number: '3,200+', label: 'Happy Customers Worldwide', icon: '🌍' },
              { number: '400+', label: 'Years of Craft Heritage', icon: '🏺' },
              { number: '4.9★', label: 'Average Customer Rating', icon: '⭐' },
              { number: '14-Day', label: 'No-Questions Returns', icon: '✅' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center p-5 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-2xl mb-2">{stat.icon}</span>
                <span className="text-2xl font-serif font-bold text-white">{stat.number}</span>
                <span className="text-xs text-zinc-400 mt-1 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Buy From Us Section */}
      <section className="w-full bg-[#FDFBF7] border-y border-zinc-200 py-16">
        <div className="px-6 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-serif text-zinc-900 mb-3">Why Buyers Across the World Choose Us</h2>
            <p className="text-sm text-zinc-500 font-medium">Trusted by boutiques, stylists, and individual shoppers in 30+ countries since 2015</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🚀', title: 'UPS Express — Delivered Worldwide', desc: 'All orders ship via UPS Express Worldwide. Fast, fully tracked delivery to every country on the globe. Full tracking number provided on dispatch.' },
              { icon: '🔒', title: 'Secure & Trusted Payments', desc: 'Pay by Visa, Mastercard, Amex or PayPal. All transactions are 256-bit SSL encrypted and PayPal buyer-protected. No hidden fees.' },
              { icon: '🤝', title: '30-Day No-Questions Returns', desc: 'Not happy? Return your item within 30 days for a full refund — no questions asked. We want you to love every piece you order.' },
              { icon: '🛃', title: 'We Handle All Customs & Duties', desc: 'Confused about import taxes? Don\'t be. We manage all export paperwork and customs declarations. You receive the package — we handle the rest.' },
              { icon: '🧵', title: '100% Genuinely Handcrafted', desc: 'Every product is hand-stitched, hand-embroidered, or hand-block-printed by certified artisans in Jaipur, Rajasthan. No factory production — ever.' },
              { icon: '💬', title: 'Real Customer Support', desc: 'Questions before you buy? Email us at support[at]textilejaipur.com or WhatsApp us. We reply within 4 hours — in English, Hindi and Spanish.' },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl block mb-3">{item.icon}</span>
                <h3 className="text-sm font-bold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />

      {/* Recently Viewed Section */}
      <RecentlyViewedSection />

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

      {/* Bottom Mobile Navigation */}
      <BottomNav onCartOpen={() => setCartOpen(true)} />
      
      {/* Background Simulators */}
      <AbandonedCartSimulator />
    </main>
  );
}

/* ---- Recently Viewed Section ---- */
function RecentlyViewedSection() {
  const [products, setProducts] = useState<{id:string;name:string;price_inr:number;images:string[];category:string}[]>([]);
  const { formatPrice } = useCart();

  useEffect(() => {
    try {
      const rvIds: string[] = JSON.parse(localStorage.getItem('textilejaipur_recently_viewed') || '[]');
      const rvProducts = JSON.parse(localStorage.getItem('hiyawear_rv_products') || '{}');
      const list = rvIds.map((id: string) => rvProducts[id]).filter(Boolean).slice(0, 6);
      setProducts(list);
    } catch {}
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="w-full bg-white border-t border-zinc-100 py-14">
      <div className="px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="h-5 w-5 text-brand-600" />
          <h3 className="text-2xl font-serif text-zinc-900 font-bold">Recently Viewed</h3>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {products.map((product) => (
            <a
              key={product.id}
              href={`/product/${product.id}`}
              className="shrink-0 w-40 group"
            >
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-zinc-50 relative mb-2">
                <img
                  src={product.images?.[0] || 'https://via.placeholder.com/160x200'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-xs font-semibold text-zinc-900 line-clamp-1">{product.name}</p>
              <p className="text-xs text-brand-700 font-bold mt-0.5">{formatPrice(product.price_inr)}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
