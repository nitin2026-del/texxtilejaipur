'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Play } from 'lucide-react';

interface BTSItem {
  id: string;
  title: string;
  description: string;
  media_url: string;
}

export default function BehindTheScenes() {
  const [items, setItems] = useState<BTSItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const { data, error } = await supabase
          .from('behind_the_scenes')
          .select('*')
          .eq('status', 'published')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (!error && data) {
          setItems(data);
        }
      } catch (err) {
        console.error('Error fetching BTS items:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-brand-200">
      <Navbar onCartOpen={() => {}} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent opacity-60"></div>
        </div>
        <div className="max-w-[1200px] mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-zinc-900 tracking-tight leading-[1.1] mb-6 animate-slideUp">
            Behind the Seams
          </h1>
          <p className="text-zinc-600 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed animate-slideUp" style={{ animationDelay: '0.1s' }}>
            Discover the artistry, heritage, and meticulous craftsmanship that goes into every single garment we create in our Jaipur studio.
          </p>
        </div>
      </section>

      {/* Masonry Grid Section */}
      <section className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-zinc-300 border-t-zinc-800 rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-32">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Our Story is Unfolding</h2>
            <p className="text-zinc-600">Check back soon for exclusive behind-the-scenes content.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {items.map((item, index) => {
              const isVideo = item.media_url.includes('.mp4') || item.media_url.includes('.mov');
              return (
                <div 
                  key={item.id} 
                  className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white/50 border border-zinc-200/50 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-zinc-900/10"
                  style={{ animation: `fadeSlideUp 0.6s ease-out forwards ${index * 0.1}s`, opacity: 0 }}
                >
                  <div className="relative w-full overflow-hidden bg-zinc-100">
                    {isVideo ? (
                      <video 
                        src={item.media_url} 
                        className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-out" 
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        controls
                      />
                    ) : (
                      <img 
                        src={item.media_url} 
                        alt={item.title} 
                        className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-out" 
                        loading="lazy"
                      />
                    )}
                    {isVideo && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-none">
                        <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                      </div>
                    )}
                    
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-white/80 text-sm md:text-base leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />
    </main>
  );
}
