import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import { useStore } from '../store/useStore';

const COLLECTION_META = {
  'festive-2024': {
    title: 'Festive 2024 Collection',
    subtitle: 'Celebrate every moment in extraordinary style',
    banner: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=90',
    accent: 'from-rose-900/70 to-amber-900/50',
  },
  'wedding': {
    title: 'The Wedding Edit',
    subtitle: 'Crafted for your most cherished moments',
    banner: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=90',
    accent: 'from-indigo-900/70 to-purple-900/50',
  },
};

export default function CollectionPage() {
  const { slug } = useParams();
  const { fetchProducts, products } = useStore();
  const meta = COLLECTION_META[slug] || { title: slug, subtitle: 'Explore this collection', banner: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=90', accent: 'from-gray-900/70 to-gray-800/50' };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <MainLayout title={`${meta.title} – Gupta International`} description={meta.subtitle}>
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-12" style={{ height: 360 }}>
        <img src={meta.banner} alt={meta.title} className="w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-r ${meta.accent}`} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-amber-300 uppercase tracking-widest text-sm font-semibold mb-3">Collection</p>
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-3">{meta.title}</h1>
          <p className="text-gray-200 text-lg max-w-xl">{meta.subtitle}</p>
        </div>
      </div>

      {/* Products */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-16">
        {products.map(p => <Card key={p.id} product={p} />)}
      </div>
    </MainLayout>
  );
}
