import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import { useStore } from '../store/useStore';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchPage() {
  const { fetchProducts, products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    fetchProducts().finally(() => setLoading(false));
  }, []);

  const results = products.filter(p =>
    p.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <MainLayout title={`Search: "${query}" – Gupta International`} description={`Search results for ${query}`}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 pt-12 mb-24 min-h-[60vh]">
        <div className="mb-16 reveal">
          <div className="relative max-w-2xl mx-auto flex items-center border-b-2 border-[var(--color-charcoal)] dark:border-[#f0ede8] pb-4">
            <MagnifyingGlassIcon className="absolute left-0 w-6 h-6 text-[var(--color-bronze)]" />
            <input
              type="text"
              defaultValue={query}
              placeholder="Search collections..."
              onKeyDown={e => {
                if (e.key === 'Enter') setSearchParams({ q: e.target.value });
              }}
              className="w-full bg-transparent border-none pl-10 outline-none text-2xl md:text-4xl font-editorial text-[var(--color-charcoal)] dark:text-[#f0ede8] placeholder-[var(--color-taupe)]"
            />
          </div>
          {query && (
            <p className="mt-8 text-center text-[0.65rem] uppercase tracking-widest text-[var(--color-taupe)]">
              {loading ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''} for `}
              {!loading && <span className="font-semibold text-[var(--color-charcoal)] dark:text-[#f0ede8]">"{query}"</span>}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] skeleton" />)}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {results.map((p, i) => (
              <div key={p.id} className={`reveal delay-${(i % 4) + 1}`}>
                <Card product={p} />
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-24 reveal">
            <MagnifyingGlassIcon className="w-12 h-12 text-[var(--color-sand)] dark:text-[#1e1b17] mx-auto mb-6" />
            <h2 className="display-md text-[var(--color-espresso)] dark:text-[#f0ede8] mb-4">No results found</h2>
            <p className="text-[var(--color-bronze)] mb-10">Try a different keyword or browse our collections.</p>
            <Link to="/shop" className="btn-luxury">
              Browse All
            </Link>
          </div>
        ) : (
          <div className="text-center py-24 reveal">
            <p className="font-editorial text-2xl text-[var(--color-taupe)]">Type something to search our collection…</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
