'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';

export function HappyCustomersSlider() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    supabase.from('reviews')
      .select('image_url, image_urls')
      .not('image_urls', 'is', null) // only fetch reviews with images to save bandwidth
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching review images:", error);
          return;
        }
        
        const allImages: string[] = [];
        if (data) {
          data.forEach(r => {
            if (r.image_url) allImages.push(r.image_url);
            if (r.image_urls) allImages.push(...r.image_urls);
          });
        }
        
        // Remove duplicates just in case
        const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));
        
        // If we have fewer than 5 images, repeat them so the marquee has enough content to scroll
        let finalImages = [...uniqueImages];
        while (finalImages.length > 0 && finalImages.length < 6) {
          finalImages = [...finalImages, ...uniqueImages];
        }
        
        setImages(finalImages);
      });
  }, []);

  if (images.length === 0) return null;

  return (
    <div className="w-full bg-white py-20 border-t border-zinc-200 overflow-hidden relative">
      <div className="text-center mb-12 px-6 relative z-10">
        <h3 className="text-4xl md:text-5xl font-serif text-zinc-900 font-bold mb-4">
          Our Happy Customers
        </h3>
        <p className="text-brand-700 text-sm font-bold tracking-[0.2em] uppercase">
          Join our worldwide community
        </p>
      </div>

      <div className="relative w-full flex overflow-hidden group">
        {/* We use two identical blocks that slide together to create a seamless infinite loop */}
        <div className="flex animate-marquee shrink-0 gap-4 pr-4 hover:[animation-play-state:paused]">
          {images.map((src, i) => (
            <div key={`set1-${i}`} className="w-[280px] md:w-[320px] shrink-0 aspect-[4/5] rounded-2xl overflow-hidden shadow-sm bg-zinc-100 relative">
              <img src={src} alt="Happy Customer" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" loading="lazy" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm text-brand-600">
                <Heart className="w-4 h-4 fill-brand-600" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex animate-marquee shrink-0 gap-4 pr-4 hover:[animation-play-state:paused]">
          {images.map((src, i) => (
            <div key={`set2-${i}`} className="w-[280px] md:w-[320px] shrink-0 aspect-[4/5] rounded-2xl overflow-hidden shadow-sm bg-zinc-100 relative">
              <img src={src} alt="Happy Customer" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" loading="lazy" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm text-brand-600">
                <Heart className="w-4 h-4 fill-brand-600" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Fading edges to make the marquee look premium */}
        <div className="absolute top-0 left-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
}
