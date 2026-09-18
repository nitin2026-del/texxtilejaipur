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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal content */}
      <div className="relative bg-[#FDFBF7] w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in duration-300">
        
        {/* Top graphic area */}
        <div className="bg-brand-50 pt-8 pb-6 px-6 text-center relative border-b border-brand-100">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-brand-600/50 hover:text-brand-900 bg-white/50 hover:bg-white p-1.5 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-6xl mb-2 drop-shadow-md animate-bounce" style={{ animationDuration: '2s' }}>
            ??
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1a1464] tracking-tight">
            Caught you staring!
          </h2>
        </div>

        {/* Text content */}
        <div className="px-6 py-6 text-center space-y-4">
          <p className="text-sm text-zinc-700 leading-relaxed font-medium">
            We know our products are <span className="font-bold text-brand-700">dangerously attractive</span>, but they look even better on you.
          </p>
          <p className="text-[13px] text-zinc-500">
            Toss <strong className="text-zinc-800">2 items</strong> into your cart right now and watch some magic happen! ???
          </p>
          
          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[#1a1464] hover:bg-brand-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            Let's see the magic!
          </button>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="text-[11px] text-zinc-400 hover:text-zinc-600 font-medium pt-2 underline underline-offset-2"
          >
            I'll just keep window shopping
          </button>
        </div>
      </div>
    </div>
  );
}
