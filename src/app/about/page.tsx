'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Globe, Heart, ShieldCheck, Star } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-brand-200">
      <Navbar onCartOpen={() => {}} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent opacity-60"></div>
          {/* Subtle noise/texture overlay */}
          <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/50 border border-amber-200/50 text-amber-800 text-xs font-bold tracking-widest uppercase mb-6 animate-slideUp">
            <Heart className="h-3 w-3 fill-amber-500 text-amber-500" /> About Us
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tight leading-[1.1] mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            The Soul of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Jaipur</span>
          </h1>
          <p className="text-zinc-600 text-lg md:text-2xl font-serif max-w-3xl mx-auto leading-relaxed animate-slideUp" style={{ animationDelay: '0.2s' }}>
            We are more than just a brand. We are the custodians of centuries-old craftsmanship, bringing the vibrant spirit of Rajasthan to the world.
          </p>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-20 md:py-32 px-6 bg-white border-y border-zinc-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden relative shadow-2xl bg-zinc-100">
              <img 
                src="/about/img1.jpg" 
                alt="Texxtile Jaipur Collection" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-zinc-100 max-w-xs hidden md:block animate-float">
              <div className="flex gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-zinc-900 font-bold text-sm">"Every stitch tells a story of passion and heritage."</p>
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight">
              Born in the Pink City
            </h2>
            <div className="space-y-6 text-zinc-600 text-lg leading-relaxed">
              <p>
                Texxtile Jaipur was born from a simple yet profound vision: to bridge the gap between the master artisans of Rajasthan and the global fashion community. 
              </p>
              <p>
                Nestled in the heart of Jaipur, the Pink City, we are surrounded by a living tapestry of colors, history, and art. For generations, the families we work with have been perfecting the arts of block printing, intricate Suzani embroidery, and weaving luxurious Banarasi silk.
              </p>
              <p>
                Our mission is not just to sell clothing, but to preserve these dying arts. Every jacket, dress, and coat you purchase directly supports the livelihoods of these incredible artisans, allowing them to pass their skills down to the next generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship Highlights */}
      <section className="py-20 md:py-32 px-6 bg-zinc-900 text-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Craft</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">The timeless techniques that make every Texxtile Jaipur piece a masterpiece.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Craft 1 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="h-48 rounded-xl overflow-hidden mb-6 bg-white/10">
                <img src="/about/img2.jpg" alt="Suzani Embroidery" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Suzani Embroidery</h3>
              <p className="text-zinc-400 leading-relaxed">Painstakingly hand-embroidered floral motifs that require weeks of dedication. A true labor of love that results in breathtaking, one-of-a-kind jackets.</p>
            </div>
            {/* Craft 2 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors md:translate-y-8">
              <div className="h-48 rounded-xl overflow-hidden mb-6 bg-white/10">
                <img src="/about/img3.jpg" alt="Hand Block Printing" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Hand Block Printing</h3>
              <p className="text-zinc-400 leading-relaxed">Carved wooden blocks dipped in natural dyes, stamped by hand with perfect precision to create rhythmic, bohemian patterns.</p>
            </div>
            {/* Craft 3 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="h-48 rounded-xl overflow-hidden mb-6 bg-white/10">
                <img src="/about/img4.jpg" alt="Premium Textiles" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Premium Textiles</h3>
              <p className="text-zinc-400 leading-relaxed">From rich, lustrous velvets to handloom cottons and Banarasi silks, we source only the finest fabrics that feel as luxurious as they look.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-100 text-brand-700 mb-4">
            <Globe className="h-8 w-8" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-900">From Jaipur to the World</h2>
          <p className="text-zinc-600 text-lg md:text-xl leading-relaxed">
            What started as a small, passionate endeavor has grown into a global community. Today, our handcrafted garments are worn and loved by women in over 30 countries. We offer seamless, fast worldwide shipping to ensure that no matter where you are, you can experience the magic of Jaipur.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-zinc-200 mt-12">
            <div className="text-center">
              <div className="text-4xl font-black text-amber-600 mb-2">30+</div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Countries Shipped</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-amber-600 mb-2">50+</div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Master Artisans</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-amber-600 mb-2">3k+</div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-amber-600 mb-2">100%</div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Handcrafted</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-brand-50 border-t border-brand-100">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-900">Become a Part of Our Story</h2>
          <p className="text-brand-700 text-lg">
            Explore our collection and find the perfect piece that speaks to your soul.
          </p>
          <Link 
            href="/collection" 
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-full font-bold hover:bg-brand-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/30"
          >
            Explore the Collection <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-slideUp { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}} />
    </main>
  );
}
