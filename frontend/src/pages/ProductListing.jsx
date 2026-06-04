import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import { useStore } from '../store/useStore';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export default function ProductListing() {
  const { fetchProducts, products } = useStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts().finally(() => setLoading(false));
  }, []);

  const sorted = [...products]
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return 0;
    });

  return (
    <MainLayout title="Shop – Gupta International" description="Browse our full collection of luxury ethnic wear.">
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 mb-24">
        {/* Page Header */}
        <div className="text-center mb-16 pt-8 reveal">
          <p className="label-luxury mb-4">The Complete Archive</p>
          <h1 className="display-md text-[var(--color-espresso)] dark:text-[#f0ede8] mb-6">Our Collection</h1>
          <p className="text-[var(--color-bronze)] max-w-xl mx-auto">
            Discover handcrafted luxury ethnic wear from master artisans. Every piece tells a story of heritage and craft.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-12 border-b border-[var(--color-sand)] dark:border-[#1e1b17] pb-6 reveal delay-100">
          {/* Search */}
          <div className="relative w-full md:w-96 flex items-center">
            <MagnifyingGlassIcon className="w-5 h-5 text-[var(--color-bronze)] absolute left-0" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent border-none pl-8 py-2 outline-none text-[var(--color-charcoal)] dark:text-[#f0ede8] placeholder-[var(--color-taupe)]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-0">
                <XMarkIcon className="w-4 h-4 text-[var(--color-taupe)] hover:text-[var(--color-charcoal)] transition-colors" />
              </button>
            )}
          </div>

          {/* Sort & Count */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <span className="text-[0.65rem] uppercase tracking-widest text-[var(--color-taupe)] hidden md:block">
              {sorted.length} {sorted.length === 1 ? 'Product' : 'Products'}
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent text-[0.65rem] uppercase tracking-widest font-semibold outline-none cursor-pointer text-[var(--color-charcoal)] dark:text-[#f0ede8]"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} className="bg-[var(--color-ivory)] dark:bg-[#0e0d0c]">{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] skeleton" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-32 reveal delay-200">
            <p className="font-editorial text-2xl text-[var(--color-bronze)] mb-4">No pieces found.</p>
            <p className="text-sm text-[var(--color-taupe)] mb-8">Try refining your search terms.</p>
            <button onClick={() => setSearch('')} className="link-luxury">
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {sorted.map((p, i) => (
              <div key={p.id} className={`reveal delay-${(i % 4) + 1}`}>
                <Card product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
