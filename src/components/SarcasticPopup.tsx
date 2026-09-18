'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { X, Sparkles } from 'lucide-react';

export function SarcasticPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();

  useEffect(() => {
    // If they already added to cart, don't ever show this
    if (cart.length > 0) return;

    // Check if we already showed it this session
    const hasShown = sessionStorage.getItem('textilejaipur_sarcastic_shown');
    if (hasShown === 'true') return;

    // Check for test mode (3 seconds) vs production (120 seconds = 2 mins)
    const isTestMode = typeof window !== 'undefined' && window.location.search.includes('test-popup=true');
    const delay = isTestMode ? 3000 : 120000;

    const timer = setTimeout(() => {
      // Final check just in case they added to cart during the 2 minutes
      if (cart.length === 0) {
        setIsOpen(true);
        sessionStorage.setItem('textilejaipur_sarcastic_shown', 'true');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [cart.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Blurred overlay */}
      <div 
        className="absolute inset-0 bg-[#1a1464]/20 backdrop-blur-md transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal content */}
      <div className="relative bg-[#FDFBF7] w-full max-w-md rounded-[20px] shadow-2xl overflow-hidden border border-[#e5dcd3] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Top pattern bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300"></div>

        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-800 bg-white hover:bg-zinc-100 p-2 rounded-full transition-colors shadow-sm border border-zinc-200 z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8 md:p-10 text-center relative">
          <div className="mx-auto w-16 h-16 bg-white border border-[#e5dcd3] rounded-full flex items-center justify-center shadow-sm mb-6 relative">
            <span className="text-3xl" role="img" aria-label="eyes">👀</span>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1a1464] tracking-tight mb-4">
            Caught you staring!
          </h2>
          
          <p className="text-[15px] text-zinc-600 leading-relaxed font-medium mb-6">
            We know our collections are <span className="text-brand-700 font-bold">dangerously attractive</span>, but they look even better on you.
          </p>

          <div className="bg-white border border-[#e5dcd3] rounded-xl p-4 mb-8 shadow-sm">
            <p className="text-[13px] text-zinc-800 font-medium">
              Toss <strong className="text-[#1a1464] font-bold text-sm">2 items</strong> into your cart right now and watch a little magic happen! <span className="text-lg inline-block translate-y-0.5">✨🪄</span>
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1464] hover:bg-[#2a2484] text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-[#1a1464]/20 transition-all active:scale-[0.98] group"
            >
              Let's see the magic
              <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            </button>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-800 font-medium py-2 transition-colors"
            >
              No thanks, I'll keep window shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
