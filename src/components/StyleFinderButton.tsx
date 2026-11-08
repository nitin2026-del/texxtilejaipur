'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { StyleFinderModal } from './StyleFinderModal';

interface StyleFinderButtonProps {
  categories?: Array<{ id: string; name: string }>;
}

export const StyleFinderButton: React.FC<StyleFinderButtonProps> = ({ categories = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<Array<{ id: string; name: string }>>(categories);

  useEffect(() => {
    if (categories.length === 0) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDbCategories(data.map((c: any) => ({ id: c.id, name: c.name })));
          }
        })
        .catch(() => {});
    }
  }, [categories]);

  // Listen for global custom event if any other button wants to trigger the style finder modal
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-style-finder', handler);
    return () => window.removeEventListener('open-style-finder', handler);
  }, []);

  return (
    <>
      {/* Floating Pill on Bottom Left */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:block">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-950/90 hover:bg-zinc-900 border border-gold/50 hover:border-gold shadow-xl shadow-gold/10 backdrop-blur-md transition-all duration-300 hover:scale-105"
          aria-label="Need Help Choosing? AI Recommendation"
        >
          <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold group-hover:rotate-12 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-zinc-100 tracking-wide font-serif leading-none flex items-center gap-1.5">
              <span>Need Recommendation?</span>
              <span className="text-[9px] font-sans uppercase px-1.5 py-0.5 rounded bg-gold/20 text-gold font-bold">
                AI Stylist
              </span>
            </p>
            <p className="text-[9px] text-zinc-400 mt-0.5">Find your perfect jacket in 10s</p>
          </div>
        </button>
      </div>

      {/* Mobile Floating Mini Pill */}
      <div className="fixed bottom-20 left-4 z-40 sm:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-950/95 border border-gold/60 shadow-lg shadow-gold/15 backdrop-blur-md text-gold text-xs font-semibold"
          aria-label="AI Recommendation"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] font-serif">Style Finder</span>
        </button>
      </div>

      <StyleFinderModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        categories={dbCategories}
      />
    </>
  );
};
