'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Gift } from 'lucide-react';

export const FreeRingWidget = () => {
  const [images, setImages] = useState<string[]>([]);
  const [active, setActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'SYS_FREE_RING_IMAGES')
          .single();

        if (data?.value?.is_active && data.value.images?.length > 0) {
          setActive(true);
          setImages(data.value.images);
        }
      } catch (err) {
        console.error('Failed to load ring images', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (images.length <= 1 || !active) return;
    
    // Automatically cycle through ring images every 3 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images, active]);

  if (loading || !active || images.length === 0) return null;

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-zinc-100 flex items-center gap-2 max-w-max pointer-events-auto shadow-rose-900/10 animate-fade-in">
        <div className="bg-rose-100 p-1 rounded-full text-rose-600 shrink-0">
          <Gift className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-bold text-rose-600 leading-tight">Free Gift Included</span>
          <span className="text-[9px] text-zinc-500 font-medium leading-tight">1 of {images.length} Rings</span>
        </div>
      </div>
      
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shadow-xl border-2 border-white pointer-events-auto bg-white animate-fade-in" style={{ animationDelay: '150ms' }}>
        {images.map((img, idx) => (
          <img 
            key={idx}
            src={img}
            alt="Free Gift Ring"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          />
        ))}
      </div>
    </div>
  );
};
