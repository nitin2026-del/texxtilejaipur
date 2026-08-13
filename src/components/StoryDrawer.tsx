'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Heart, Users, Globe, Sparkles } from 'lucide-react';

interface StoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoryDrawer({ isOpen, onClose }: StoryDrawerProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const slides = [
    {
      icon: <Sparkles className="h-8 w-8 text-amber-500 mb-4" />,
      title: "A Dream at 21",
      content: "Our journey began in 2021, when, at just 21 years old, I started this company with a dream, determination, and a passion for sharing Jaipur's rich textile heritage with the world. In the beginning, I didn't know exactly how the journey would unfold, but I believed in taking one step at a time.",
      image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80" // Taj Mahal
    },
    {
      icon: <Heart className="h-8 w-8 text-brand-500 mb-4" />,
      title: "Family & Heart",
      content: "This journey would not have been possible without the constant support of my brother, Hitesh, and my sister-in-law, Archana. Their guidance gave me the confidence to keep moving forward. Our company is named after my little sister, Hiya, whose name represents the heart, inspiration, and values behind everything we do.",
      image: "https://images.unsplash.com/photo-1517427677506-ade074eb1432?w=800&auto=format&fit=crop&q=80" // Indian textiles
    },
    {
      icon: <Users className="h-8 w-8 text-emerald-500 mb-4" />,
      title: "Our Artisans",
      content: "Today, we proudly work with 60+ skilled artisans, manufacturing handcrafted Suzani jackets, block print apparel, bags, and home textiles. Every piece we create carries the heritage of Jaipur while supporting the talented artisans who keep these traditional crafts alive.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80" // Open shop with products
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-500 mb-4" />,
      title: "Trusted Worldwide",
      content: "Our greatest achievement isn't just exporting our products—it's earning the trust of buyers worldwide through quality craftsmanship, honest relationships, and reliable service. Our mission remains simple: to preserve India's textile traditions and deliver handcrafted products you can trust.",
      image: "https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/3ee66097-c7e2-457a-b55e-e034b798497d.webp", // Suzani jacket from DB
      tagline: "Crafted in Jaipur. Built on Trust."
    }
  ];

  const nextSlide = () => {
    if (activeSlide < slides.length - 1) setActiveSlide(prev => prev + 1);
  };

  const prevSlide = () => {
    if (activeSlide > 0) setActiveSlide(prev => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <div className="font-serif font-bold text-zinc-900 text-lg">Textile Jaipur</div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="p-6 pb-24 flex flex-col h-full relative">
            
            {/* Sliding Container */}
            <div 
              className="flex-1 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {slides.map((slide, idx) => (
                <div key={idx} className="w-full shrink-0 px-2 flex flex-col">
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-8 shadow-sm">
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-col flex-1 px-2">
                    {slide.icon}
                    <h3 className="font-serif text-3xl font-bold text-zinc-900 mb-4">
                      {slide.title}
                    </h3>
                    <p className="text-zinc-600 leading-relaxed text-[15px]">
                      {slide.content}
                    </p>
                    
                    {slide.tagline && (
                      <div className="mt-8 pt-6 border-t border-zinc-100">
                        <p className="font-serif font-bold text-brand-700 text-lg italic text-center">
                          "{slide.tagline}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-white border-t border-zinc-100 flex items-center justify-between absolute bottom-0 w-full">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-8 bg-zinc-900' : 'w-2 bg-zinc-200'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={prevSlide}
              disabled={activeSlide === 0}
              className="p-3 rounded-full border border-zinc-200 text-zinc-600 disabled:opacity-30 hover:bg-zinc-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={activeSlide === slides.length - 1 ? onClose : nextSlide}
              className={`px-6 py-3 rounded-full font-bold transition-colors flex items-center gap-2 ${
                activeSlide === slides.length - 1 
                  ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md'
              }`}
            >
              {activeSlide === slides.length - 1 ? 'Explore Shop' : 'Continue'} 
              {activeSlide !== slides.length - 1 && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
