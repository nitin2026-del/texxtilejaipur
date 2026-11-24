'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { StyleFinderModal, AtelierHangerIcon } from './StyleFinderModal';

interface StyleFinderButtonProps {
  categories?: Array<{ id: string; name: string }>;
}

export const StyleFinderButton: React.FC<StyleFinderButtonProps> = ({ categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<Array<{ id: string; name: string }>>(categories ?? []);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setDbCategories(categories);
    }
  }, [categories]);

  useEffect(() => {
    if (isOpen && dbCategories.length === 0 && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDbCategories(data.map((c: any) => ({ id: c.id, name: c.name })));
          }
        })
        .catch(() => {
          hasFetchedRef.current = false;
        });
    }
  }, [isOpen, dbCategories.length]);

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
          className="group flex items-center gap-3 pl-2 pr-2.5 py-2 rounded-full bg-[#FDFBF7]/95 hover:bg-white border border-[#DFCDB7] hover:border-[#B6805B] shadow-[0_12px_32px_-10px_rgba(44,24,16,0.22),0_2px_8px_-2px_rgba(182,128,91,0.14)] hover:shadow-[0_16px_38px_-10px_rgba(44,24,16,0.28)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"
          aria-label="Style Guide — Find your perfect jacket"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#36241A] to-[#1F120C] ring-1 ring-[#D4AF37]/35 flex items-center justify-center text-[#EBD5A7] shrink-0 group-hover:scale-105 transition-transform duration-300">
            <AtelierHangerIcon className="w-[18px] h-[18px]" />
          </div>
          <div className="text-left pr-0.5">
            <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-[#98664A] leading-none flex items-center gap-1.5">
              <span>Style Guide</span>
              <span className="w-1 h-1 rounded-full bg-[#C9A46A]" />
              <span>10 Sec</span>
            </p>
            <p className="text-[13.5px] font-serif font-medium text-[#23140E] tracking-[0.01em] leading-snug mt-1">
              Find Your Perfect Jacket
            </p>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#F5EFE6] group-hover:bg-[#2C1810] text-[#7E5540] group-hover:text-[#F3E5AB] flex items-center justify-center transition-colors duration-300 shrink-0">
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
          </div>
        </button>
      </div>

      {/* Mobile Floating Mini Pill */}
      <div className="fixed bottom-20 left-4 z-40 sm:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-[#FDFBF7]/95 border border-[#DFCDB7] shadow-[0_8px_24px_-6px_rgba(44,24,16,0.24)] backdrop-blur-md active:scale-95 transition-all"
          aria-label="Open Style Guide"
        >
          <div className="w-6 h-6 rounded-full bg-[#2C1810] text-[#EBD5A7] flex items-center justify-center">
            <AtelierHangerIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11.5px] font-serif font-medium text-[#23140E] tracking-wide">
            Style Guide
          </span>
          <ArrowRight className="w-3 h-3 text-[#98664A]" />
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
