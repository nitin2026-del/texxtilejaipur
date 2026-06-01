'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Mail, ArrowRight, X, Sparkles, Clock } from 'lucide-react';

export const AbandonedCartSimulator: React.FC = () => {
  const { cart, applyCoupon, getCartTotalInr, formatPrice } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Inject COMEBACK10 into local storage so it works globally
    try {
      const savedCoupons = localStorage.getItem('textilejaipur_admin_coupons');
      let coupons = savedCoupons ? JSON.parse(savedCoupons) : [];
      if (!coupons.find((c: any) => c.code === 'COMEBACK10')) {
        coupons.push({
          id: 'abandoned-recovery',
          code: 'COMEBACK10',
          type: 'percent',
          value: 10
        });
        localStorage.setItem('hiyawear_admin_coupons', JSON.stringify(coupons));
      }
    } catch (e) {}

    // Check if we already showed it this session
    if (sessionStorage.getItem('hiyawear_recovery_shown')) {
      setHasTriggered(true);
      return;
    }

    const checkInterval = setInterval(() => {
      if (cart.length === 0 || hasTriggered) return;

      const lastUpdated = localStorage.getItem('hiyawear_cart_updated_at');
      if (lastUpdated) {
        const timeDiff = Date.now() - parseInt(lastUpdated, 10);
        // Trigger after 30 seconds of inactivity for demo purposes
        if (timeDiff > 30000) {
          setShowModal(true);
          setHasTriggered(true);
          sessionStorage.setItem('hiyawear_recovery_shown', 'true');
        }
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [cart.length, hasTriggered]);

  const handleClaim = () => {
    applyCoupon('COMEBACK10');
    setShowModal(false);
    
    // Simulate opening the cart so they see the discount
    const cartButton = document.getElementById('cart-drawer-toggle');
    if (cartButton) cartButton.click();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
      
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        {/* Banner header */}
        <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
          <button 
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md mb-4 border border-white/30 shadow-lg">
            <Mail className="h-6 w-6 text-white drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            You left something behind!
          </h2>
        </div>

        {/* Content */}
        <div className="p-8 text-center bg-zinc-900 relative">
          <p className="text-zinc-400 mb-6">
            We noticed you added some beautiful items to your cart but haven't completed your purchase yet. 
            <br/><br/>
            Complete your order right now and get an exclusive <strong className="text-white">10% OFF</strong> your entire cart.
          </p>

          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 mb-8 flex flex-col items-center justify-center gap-2">
            <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Your Code</span>
            <div className="flex items-center gap-2 bg-brand-900/30 px-4 py-2 rounded-lg border border-brand-500/30">
              <Sparkles className="h-4 w-4 text-brand-400" />
              <span className="text-xl font-mono font-bold text-brand-400 tracking-wider">COMEBACK10</span>
              <Sparkles className="h-4 w-4 text-brand-400" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 mt-2">
              <Clock className="h-3 w-3" /> Expires in 2 hours
            </div>
          </div>

          <button
            onClick={handleClaim}
            className="w-full bg-white hover:bg-zinc-100 text-zinc-950 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-xl"
          >
            Claim 10% Off & Checkout <ArrowRight className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => setShowModal(false)}
            className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
          >
            No thanks, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  );
};
