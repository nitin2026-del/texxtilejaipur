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
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'SYS_FREE_RING_IMAGES')
          .single();

        console.log('[FreeRingWidget] Loaded data:', data, 'Error:', error);

        if (data?.value?.is_active && data.value.images?.length > 0) {
          console.log('[FreeRingWidget] Activating with images:', data.value.images.length);
          setActive(true);
          setImages(data.value.images);
        } else {
          console.log('[FreeRingWidget] Not active or no images');
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
    <div className="w-full mt-2 flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-rose-100 p-2 rounded-full text-rose-600">
          <Gift className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider font-bold text-rose-600 leading-tight">Free Gift Included</span>
          <span className="text-[10px] sm:text-xs text-zinc-500 font-medium leading-tight">Every purchase comes with 1 of {images.length} rings</span>
        </div>
      </div>
      
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shadow-sm border border-zinc-200 bg-white">
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
