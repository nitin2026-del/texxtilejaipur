import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import { useStore } from '../store/useStore';

const CATEGORY_META = {
  kimonos: { title: 'Kimonos Collection', desc: 'Elegant and flowing kimono designs', image: 'https://images.unsplash.com/photo-1598522325345-c8969431f41e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
  jackets: { title: 'Jackets Collection', desc: 'Crafted jackets for modern layering', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
  vests: { title: 'Vests Collection', desc: 'Handcrafted vests with intricate details', image: 'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
  bags: { title: 'Bags Collection', desc: 'Artisanal bags and accessories', image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
  'cotton-suzani-shorts': { title: 'Cotton Suzani Shorts', desc: 'Breathable and beautifully embroidered shorts', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
  'girls-dresses': { title: 'Girls Dresses', desc: 'Whimsical dresses for girls', image: 'https://images.unsplash.com/photo-1515347619362-75fe3dd19e6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
  pajamas: { title: 'Pajamas', desc: 'Luxurious and comfortable loungewear', image: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
  'quilt-sets': { title: 'Quilt Sets', desc: 'Handmade heritage quilt sets', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
  skirts: { title: 'Skirts', desc: 'Flowing and detailed skirts', image: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
};

export default function CategoryPage() {
  const { slug } = useParams();
  const { fetchProducts, products } = useStore();
  const meta = CATEGORY_META[slug?.toLowerCase()] || { title: slug, desc: 'Browse this category', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=90' };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <MainLayout title={`${meta.title} – Gupta International`} description={meta.desc}>
      {/* Header */}
      <div className="relative w-full h-[50vh] min-h-[400px] -mt-[72px] sm:-mt-[84px] mb-16 overflow-hidden bg-black reveal">
        <img src={meta.image} alt={meta.title} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 pt-16">
          <p className="text-white/80 label-luxury tracking-[0.3em] mb-4 animate-fade-up">Category</p>
          <h1 className="text-white font-editorial text-5xl md:text-7xl mb-4 animate-fade-up delay-100">{meta.title}</h1>
          <p className="text-white/90 text-lg md:text-xl font-light animate-fade-up delay-200">{meta.desc}</p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 mb-24">
        <div className="flex justify-between items-center mb-8 border-b border-[var(--color-sand)] dark:border-[#1e1b17] pb-4 reveal">
          <span className="text-[0.65rem] uppercase tracking-widest text-[var(--color-taupe)]">
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
          {products.map((p, i) => (
            <div key={p.id} className={`reveal delay-${(i % 4) + 1}`}>
              <Card product={p} />
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
