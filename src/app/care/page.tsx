'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { Droplets, Wind, Sun, AlertTriangle, Shirt, ThermometerSun } from 'lucide-react';

export default function CareGuidePage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-zinc-900 pb-24">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <BottomNav onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image 
            src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1600&q=80" 
            alt="Washing block print fabric" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center pt-10">
          <p className="text-brand-400 font-bold tracking-[0.2em] uppercase text-xs mb-4">Post-Purchase Guide</p>
          <h1 className="text-4xl md:text-6xl font-serif font-medium mb-6">How to Care for Your<br/>Jaipur Handloom</h1>
          <p className="text-zinc-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Our textiles are crafted using natural dyes and traditional block printing methods. Treat them with love, and they will last for generations.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
        
        {/* Important Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 flex items-start gap-4 mb-12 shadow-lg">
          <AlertTriangle className="h-8 w-8 text-amber-600 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">The First Wash is Crucial</h3>
            <p className="text-amber-800 leading-relaxed text-sm md:text-base">
              Because we use authentic, natural vegetable dyes (like Indigo and Madder), some excess color may bleed during the first few washes. <strong>We highly recommend dry cleaning your garment for its first wash</strong> to set the colors permanently.
            </p>
          </div>
        </div>

        {/* Step by Step Guide */}
        <h2 className="text-3xl font-serif font-bold text-center mb-10">The 4 Rules of Handloom Care</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <Droplets className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Cold Water Only</h3>
            <p className="text-zinc-600 leading-relaxed">
              Always wash your block-printed clothes in cold water. Hot water causes natural dyes to bleed rapidly and can shrink pure cotton fabrics. Hand washing is preferred, but a gentle machine wash on a cold cycle is also an option.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
              <Wind className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Mild Detergents</h3>
            <p className="text-zinc-600 leading-relaxed">
              Harsh chemicals will strip the natural colors. Use mild, pH-neutral detergents or baby shampoo. Never use bleach or stain removers directly on the printed areas.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
              <Sun className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Dry in the Shade</h3>
            <p className="text-zinc-600 leading-relaxed">
              Direct sunlight acts as a natural bleaching agent. Always dry your garments inside out in a shaded, well-ventilated area to preserve the vibrancy of the prints.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-zinc-100 text-zinc-700 rounded-full flex items-center justify-center mb-6">
              <ThermometerSun className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">4. Ironing & Storage</h3>
            <p className="text-zinc-600 leading-relaxed">
              Iron on a medium-cotton setting, preferably on the reverse side. Store your clothes in a cool, dry place. Avoid hanging heavy garments; fold them to prevent stretching.
            </p>
          </div>
        </div>

        {/* Fabric Specifics */}
        <div className="bg-zinc-900 text-white rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-serif font-bold mb-8 text-center flex items-center justify-center gap-3">
            <Shirt className="h-6 w-6 text-brand-400" /> Fabric-Specific Advice
          </h2>
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-6">
              <h4 className="text-brand-400 font-bold mb-2 uppercase tracking-wide text-sm">Indigo Prints</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">Indigo is famous for \"crocking\" (rubbing off on lighter fabrics or skin). Wash separately for the first 3-4 washes. Adding a handful of salt to the first wash can help set the dye.</p>
            </div>
            <div className="border-b border-zinc-800 pb-6">
              <h4 className="text-brand-400 font-bold mb-2 uppercase tracking-wide text-sm">Chanderi Silk / Banarasi</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">Strictly dry clean only. Do not spray perfume directly on zari work as it causes oxidation and blackening. Store wrapped in pure cotton muslin cloth, never in plastic.</p>
            </div>
            <div>
              <h4 className="text-brand-400 font-bold mb-2 uppercase tracking-wide text-sm">Mulmul Cotton</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">Extremely delicate. Hand wash gently without wringing or twisting. Starching after wash will help maintain the crispness of the fabric.</p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-700 text-white font-bold rounded-xl hover:bg-brand-800 transition-colors shadow-lg">
            Back to Shopping
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  );
}
