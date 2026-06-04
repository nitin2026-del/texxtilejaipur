import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import { useStore } from '../store/useStore';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1598522325345-c8969431f41e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=90',
    title: 'Elegant Flowing\nSilhouettes',
    subtitle: 'THE KIMONOS COLLECTION',
    link: '/category/kimonos',
  },
  {
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=90',
    title: 'Modern\nLayering',
    subtitle: 'SIGNATURE JACKETS',
    link: '/category/jackets',
  },
  {
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=90',
    title: 'Heritage\nHome',
    subtitle: 'ARTISANAL QUILT SETS',
    link: '/category/quilt-sets',
  },
];

export default function Home() {
  const fetchProducts = useStore(state => state.fetchProducts);
  const products = useStore(state => state.products);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    fetchProducts().finally(() => setLoading(false));
    const timer = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  return (
    <MainLayout>
      
      {/* ─── Hero Full-Bleed ─── */}
      <section className="relative w-full h-[95vh] min-h-[600px] -mt-[72px] sm:-mt-[84px] mb-24 overflow-hidden bg-black">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img 
              src={s.image} 
              alt="Campaign" 
              className={`w-full h-full object-cover object-center transition-transform duration-[10000ms] linear ${i === slide ? 'scale-105' : 'scale-100'}`} 
            />
            
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <p className={`text-white/80 label-luxury tracking-[0.3em] mb-6 transition-all duration-1000 delay-300 ${i === slide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {s.subtitle}
              </p>
              <h1 className={`text-white font-editorial text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] leading-[1.05] tracking-tight whitespace-pre-line mb-10 transition-all duration-1000 delay-500 ${i === slide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {s.title}
              </h1>
              <Link
                to={s.link}
                className={`btn-ghost text-white border-white/50 hover:bg-white hover:text-black hover:border-white transition-all duration-1000 delay-700 ${i === slide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                Discover Collection
              </Link>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-4">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="group py-4"
              aria-label={`Go to slide ${i + 1}`}
            >
              <div className={`h-[1px] transition-all duration-500 ${i === slide ? 'w-12 bg-white' : 'w-6 bg-white/40 group-hover:bg-white/70'}`} />
            </button>
          ))}
        </div>
      </section>

      {/* ─── Editorial Introduction ─── */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 text-center mb-[var(--section-gap)] reveal">
        <p className="label-luxury mb-6">Our Philosophy</p>
        <h2 className="display-md text-[var(--color-espresso)] dark:text-[#f0ede8] mb-8">
          Crafting modern heirlooms through the lens of Indian heritage. Every thread tells a story of artisanal mastery.
        </h2>
        <Link to="/about" className="link-luxury">Read Our Story</Link>
      </section>

      {/* ─── Featured Collection ─── */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-6 mb-[var(--section-gap)]">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 reveal">
          <h2 className="display-md">New Arrivals</h2>
          <Link to="/shop" className="link-luxury mt-4 md:mt-0">Shop All</Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] skeleton rounded-none" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {products.slice(0, 4).map((product, i) => (
              <div key={product.id} className={`reveal delay-${(i % 4) + 1}`}>
                <Card product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Editorial Split Banner ─── */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-6 mb-[var(--section-gap)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:h-[700px] bg-[var(--color-parchment)] dark:bg-[#161412] reveal">
          <div className="h-[400px] lg:h-full img-zoom">
            <img 
              src="https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Bridal Collection" 
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center items-center text-center p-8 md:p-12 lg:p-24">
            <p className="label-luxury mb-4">Signature Home</p>
            <h2 className="display-md mb-6">The Quilt Edit</h2>
            <p className="text-[var(--color-bronze)] mb-10 max-w-md">
              Intricate hand-stitched details, luxurious natural fibers, and vibrant patterns designed for your most restful spaces.
            </p>
            <Link to="/category/quilt-sets" className="btn-luxury">Explore Quilts</Link>
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-6 mb-[var(--section-gap)]">
        <div className="section-label reveal"><span className="label-luxury">Curated Collections</span></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Girls Dresses', img: 'https://images.unsplash.com/photo-1515347619362-75fe3dd19e6b?auto=format&fit=crop&w=800&q=80', link: '/category/girls-dresses' },
            { name: 'Suzani Shorts', img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80', link: '/category/cotton-suzani-shorts' },
            { name: 'Pajamas', img: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=800&q=80', link: '/category/pajamas' },
          ].map((cat, i) => (
            <Link key={cat.name} to={cat.link} className={`block group reveal delay-${i + 1}`}>
              <div className="relative aspect-[4/5] img-zoom mb-4">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <h3 className="font-editorial text-2xl text-center group-hover:text-[var(--color-bronze)] transition-colors">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

    </MainLayout>
  );
}
