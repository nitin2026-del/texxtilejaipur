'use client';

import React, { useState } from 'react';
import { useCart, Currency } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Globe, LogOut, Loader2, Sparkles } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  onCartOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCartOpen }) => {
  const { cart, currency, setCurrency } = useCart();
  const { user, profile, loading, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-zinc-950/60 backdrop-blur-md border-b border-zinc-900/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500 animate-pulse" />
          <h1 className="text-2xl font-black tracking-tight select-none">
            Indi<span className="text-violet-500">Thread</span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Currency Geopricing Dropdown */}
          <div className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900/50 rounded-lg px-2.5 py-1.5">
            <Globe className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          {/* Cart Icon trigger */}
          <button
            onClick={onCartOpen}
            className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 transition-colors relative"
          >
            <ShoppingBag className="h-4 w-4 text-zinc-300" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-[9px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-zinc-950">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth options */}
          {loading ? (
            <div className="p-2">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white max-w-[80px] truncate">
                  {profile?.name || user.email?.split('@')[0]}
                </span>
                <span className="text-[9px] text-violet-400 font-semibold uppercase tracking-wider">
                  {profile?.role || 'buyer'}
                </span>
              </div>
              
              <button
                onClick={signOut}
                title="Log Out"
                className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-red-950/20 hover:border-red-900/50 hover:text-red-400 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-md shrink-0"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal overlay */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </nav>
  );
};
