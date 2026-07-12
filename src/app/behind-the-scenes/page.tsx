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
              const mediaUrl = item.media_url?.toLowerCase() || '';
              const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('.mov') || mediaUrl.includes('.webm');
              return (
                <div 
                  key={item.id} 
                  className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white border border-zinc-200/50 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                  style={{ animation: `fadeSlideUp 0.6s ease-out forwards ${index * 0.1}s`, opacity: 0 }}
                >
                  <div className="relative w-full overflow-hidden bg-zinc-100">
                    {isVideo ? (
                      <video 
                        src={item.media_url} 
                        className="w-full h-auto object-cover transition-transform duration-700 ease-out" 
                        muted 
                        playsInline
                        controls
                      />
                    ) : (
                      <img 
                        src={item.media_url} 
                        alt={item.title} 
                        className="w-full h-auto object-cover transition-transform duration-700 ease-out" 
                        loading="lazy"
                      />
                    )}
                  </div>
                  
                  {/* Content below media */}
                  <div className="p-6 bg-white">
                    <h3 className="text-xl font-bold text-zinc-900 mb-2 leading-tight">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-zinc-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    )}
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
