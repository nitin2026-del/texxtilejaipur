'use client';

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { getOptimizedUrl } from '@/utils/imageUtils';

export function HappyCustomersSlider({ initialImages = [] }: { initialImages?: string[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [uniquePhotos, setUniquePhotos] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Zero page-load impact: only trigger DB fetch & image rendering when user scrolls near this section
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    supabase
      .from('reviews')
      .select('image_url, image_urls')
      .eq('status', 'approved')
      .limit(20)
      .then(({ data, error }) => {
        const dbImages: string[] = [];
        if (!error && data) {
          data.forEach((r) => {
            if (r.image_url) dbImages.push(r.image_url);
            if (Array.isArray(r.image_urls)) dbImages.push(...r.image_urls);
          });
        }

        const combined = [...initialImages, ...dbImages].filter(Boolean);
        const deduped = Array.from(new Set(combined));
        setUniquePhotos(deduped);

        if (deduped.length === 0) {
          setImages([]);
          return;
        }

        let finalImages = [...deduped];
        while (finalImages.length > 0 && finalImages.length < 6) {
          finalImages = [...finalImages, ...deduped];
        }

        setImages(finalImages);
      });
  }, [isVisible, initialImages]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null || uniquePhotos.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % uniquePhotos.length));
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + uniquePhotos.length) % uniquePhotos.length));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, uniquePhotos.length]);

  const openPhoto = (src: string) => {
    const idx = uniquePhotos.indexOf(src);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  return (
    <div ref={containerRef} className="w-full bg-white py-20 border-t border-zinc-200 overflow-hidden relative min-h-[240px]">
      {images.length > 0 && (
        <>
          <div className="text-center mb-12 px-6 relative z-10">
            <h3 className="text-4xl md:text-5xl font-serif text-zinc-900 font-bold mb-4">
              Our Happy Customers
            </h3>
            <p className="text-brand-700 text-sm font-bold tracking-[0.2em] uppercase">
              Join our worldwide community &bull; Tap any photo to view full size
            </p>
          </div>

          <div className="relative w-full flex overflow-hidden group">
            {/* Two identical blocks that slide together to create a seamless infinite loop */}
            {[1, 2].map((setNum) => (
              <div
                key={`set-${setNum}`}
                className="flex animate-marquee group-hover:[animation-play-state:paused] shrink-0 gap-4 pr-4"
                style={lightboxIndex !== null ? { animationPlayState: 'paused' } : undefined}
              >
                {images.map((src, i) => (
                  <button
                    type="button"
                    key={`set${setNum}-${i}`}
                    onClick={() => openPhoto(src)}
                    className="w-[260px] md:w-[300px] shrink-0 aspect-[4/5] rounded-2xl overflow-hidden shadow-sm bg-zinc-100 relative cursor-pointer group/card text-left focus:outline-none focus:ring-2 focus:ring-brand-600"
                    aria-label="View customer review photo full size"
                  >
                    <img
                      src={getOptimizedUrl(src, 320)}
                      alt="Happy Customer Review"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm text-brand-600">
                      <Heart className="w-4 h-4 fill-brand-600" />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/15 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover/card:opacity-100">
                      <span className="bg-black/75 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                        <ZoomIn className="w-3.5 h-3.5" /> Tap to Enlarge
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Fullscreen Lightbox Modal (only mounts when clicked — 0 page load cost) */}
      {lightboxIndex !== null && uniquePhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="fixed top-5 right-5 z-[110] p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
            aria-label="Close photo"
          >
            <X className="w-6 h-6" />
          </button>

          {uniquePhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + uniquePhotos.length) % uniquePhotos.length));
                }}
                className="fixed left-4 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
                aria-label="Previous review photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % uniquePhotos.length));
                }}
                className="fixed right-4 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
                aria-label="Next review photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative max-w-3xl max-h-[88vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={uniquePhotos[lightboxIndex]}
              alt="Customer Review Full Size"
              className="max-h-[82vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-3 text-white/80 text-xs font-medium tracking-wider uppercase">
              Customer Photo {lightboxIndex + 1} of {uniquePhotos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
