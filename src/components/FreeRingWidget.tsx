'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Gift, Check } from 'lucide-react';

interface FreeRingWidgetProps {
  onSelectRing?: (url: string) => void;
  selectedRingUrl?: string | null;
}

export const FreeRingWidget = ({ onSelectRing, selectedRingUrl }: FreeRingWidgetProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [active, setActive] = useState(false);
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
          // Auto-select the first ring if none is selected
          if (!selectedRingUrl && onSelectRing) {
            onSelectRing(data.value.images[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load ring images', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading || !active || images.length === 0) return null;

  return (
    <div className="w-full mt-6 bg-zinc-50 border border-zinc-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-rose-100 p-2 rounded-full text-rose-600">
          <Gift className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-wider font-bold text-rose-600 leading-tight">Choose Your Free Gift</span>
          <span className="text-xs text-zinc-500 font-medium leading-tight">Select 1 free ring below to include with your purchase</span>
        </div>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {images.map((img, idx) => {
          const isSelected = selectedRingUrl === img;
          return (
            <button
              key={idx}
              onClick={() => onSelectRing && onSelectRing(img)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 snap-start ${isSelected ? 'border-rose-500 shadow-md ring-2 ring-rose-500/20' : 'border-zinc-200 opacity-70 hover:opacity-100'}`}
            >
              <img 
                src={img}
                alt={`Free Gift Ring Option ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              {isSelected && (
                <div className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-sm">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
