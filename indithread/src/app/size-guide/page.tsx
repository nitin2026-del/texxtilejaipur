'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { Ruler, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SizeGuidePage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  const convert = (inches: string) => {
    if (unit === 'inches') return inches;
    const parts = inches.split('-');
    if (parts.length === 2) {
      return `${Math.round(parseFloat(parts[0]) * 2.54)}-${Math.round(parseFloat(parts[1]) * 2.54)}`;
    }
    return Math.round(parseFloat(inches) * 2.54).toString();
  };

  const sizes = [
    { label: 'XS', uk: '6', us: '2', bust: '32-33', waist: '24-25', hips: '34-35' },
    { label: 'S', uk: '8', us: '4', bust: '34-35', waist: '26-27', hips: '36-37' },
    { label: 'M', uk: '10', us: '6', bust: '36-37', waist: '28-29', hips: '38-39' },
    { label: 'L', uk: '12', us: '8', bust: '38-39', waist: '30-31', hips: '40-41' },
    { label: 'XL', uk: '14', us: '10', bust: '40-41', waist: '32-33', hips: '42-43' },
    { label: 'XXL', uk: '16', us: '12', bust: '42-43', waist: '34-35', hips: '44-45' },
  ];

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-zinc-900 pb-24">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <BottomNav onCartOpen={() => setCartOpen(true)} />

      <div className="pt-32 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 border border-brand-100">
            <Ruler className="h-8 w-8 text-brand-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-4">Find Your Perfect Fit</h1>
          <p className="text-zinc-600 max-w-xl mx-auto text-lg leading-relaxed">
            Our garments are handcrafted using traditional methods. Use this guide to find your ideal size across all our collections.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-zinc-100 mb-16 relative overflow-hidden">
          {/* Unit Toggle */}
          <div className="flex justify-end mb-6 relative z-10">
            <div className="inline-flex bg-zinc-100 rounded-lg p-1">
              <button 
                onClick={() => setUnit('inches')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${unit === 'inches' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                Inches
              </button>
              <button 
                onClick={() => setUnit('cm')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${unit === 'cm' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                Centimeters
              </button>
            </div>
          </div>

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="py-4 px-6 border-b-2 border-zinc-900 font-serif font-bold text-zinc-900 text-lg">Size</th>
                  <th className="py-4 px-6 border-b-2 border-zinc-900 font-serif font-bold text-zinc-900 text-lg">UK Size</th>
                  <th className="py-4 px-6 border-b-2 border-zinc-900 font-serif font-bold text-zinc-900 text-lg">US Size</th>
                  <th className="py-4 px-6 border-b-2 border-zinc-900 font-serif font-bold text-zinc-900 text-lg">Bust</th>
                  <th className="py-4 px-6 border-b-2 border-zinc-900 font-serif font-bold text-zinc-900 text-lg">Waist</th>
                  <th className="py-4 px-6 border-b-2 border-zinc-900 font-serif font-bold text-zinc-900 text-lg">Hips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sizes.map((row) => (
                  <tr key={row.label} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-5 px-6 font-bold text-brand-700">{row.label}</td>
                    <td className="py-5 px-6 text-zinc-600">{row.uk}</td>
                    <td className="py-5 px-6 text-zinc-600">{row.us}</td>
                    <td className="py-5 px-6 text-zinc-900 font-medium">{convert(row.bust)}</td>
                    <td className="py-5 px-6 text-zinc-900 font-medium">{convert(row.waist)}</td>
                    <td className="py-5 px-6 text-zinc-900 font-medium">{convert(row.hips)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <h2 className="text-2xl font-serif font-bold text-zinc-900 border-b border-zinc-200 pb-4">How to Measure</h2>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold shrink-0 text-sm mt-0.5">1</div>
              <div>
                <h4 className="font-bold text-zinc-900 mb-1">Bust</h4>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Measure around the fullest part of your bust, keeping the measuring tape horizontal and comfortably loose.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold shrink-0 text-sm mt-0.5">2</div>
              <div>
                <h4 className="font-bold text-zinc-900 mb-1">Waist</h4>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Measure around the narrowest part of your natural waistline, typically just above the belly button.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold shrink-0 text-sm mt-0.5">3</div>
              <div>
                <h4 className="font-bold text-zinc-900 mb-1">Hips</h4>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Measure around the fullest part of your hips, approximately 8 inches below your natural waistline.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-50 rounded-2xl p-8 border border-brand-100">
            <h3 className="text-xl font-serif font-bold text-brand-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600" /> Fit Tips
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-brand-800 leading-relaxed">
                <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0" /> 
                Our cotton block print dresses tend to have a relaxed, flowy fit. If you are between sizes, we recommend sizing down for a more tailored look.
              </li>
              <li className="flex gap-3 text-sm text-brand-800 leading-relaxed">
                <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0" /> 
                Pure silk garments have no stretch. Please ensure you leave at least 1-1.5 inches of ease when measuring for silk items.
              </li>
              <li className="flex gap-3 text-sm text-brand-800 leading-relaxed">
                <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0" /> 
                Still unsure? Use our interactive style quiz or contact our customer care team for personalized sizing advice.
              </li>
            </ul>
            <div className="mt-8 pt-6 border-t border-brand-200">
              <Link href="/quiz" className="block text-center px-6 py-3 bg-white text-brand-700 font-bold rounded-xl border border-brand-200 hover:bg-brand-100 transition-colors text-sm shadow-sm">
                Take the Style Quiz
              </Link>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
