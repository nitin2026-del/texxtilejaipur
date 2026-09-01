'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import Link from 'next/link';
import { ArrowRight, Heart, ShieldCheck } from 'lucide-react';

export default function RefundPolicyPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-zinc-900 pb-24">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} 
      />
      <CheckoutModal 
        isOpen={checkoutOpen} 
        onClose={() => setCheckoutOpen(false)} 
      />
      <BottomNav onCartOpen={() => setCartOpen(true)} />

      <div className="pt-32 px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-8">Our Philosophy & Return Policy</h1>
        
        <div className="prose prose-zinc max-w-none text-zinc-700 space-y-6">
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-zinc-900 mb-6 font-bold flex items-center gap-3">
              <Heart className="h-6 w-6 text-brand-600" /> Respecting the Art
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-600"></div>
              <p className="text-zinc-600 leading-relaxed text-lg">
                Every piece we create is a labor of love, woven with dedication, time, and the soul of our artisans. We do not operate a factory of mass-produced goods, but a studio of artistic expression. As such, we ask that you respect the craft and purchase with intention. 
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-zinc-900 mb-6 font-bold flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-brand-600" /> Strict Return Eligibility
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100">
              <p className="text-zinc-600 leading-relaxed font-semibold">
                We do NOT accept returns for "change of mind" or arbitrary reasons. Treating our handmade art as something to casually try and discard diminishes the immense effort poured into every thread.
              </p>
              <p className="text-zinc-600 leading-relaxed mt-4">
                Returns or exchanges are <strong>strictly limited</strong> to the following rare circumstances:
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-600">
                <li>You received a <strong>damaged</strong> or defective product.</li>
                <li>You received the <strong>wrong</strong> item.</li>
              </ul>
              <p className="text-zinc-600 leading-relaxed mt-4">
                If your situation meets these criteria, you must contact us within <strong>3 days</strong> of receiving the item. It must be unworn, unwashed, and in its exact original condition with all tags attached.
              </p>
            </div>
          </section>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">How to Request a Valid Return</h2>
          <p>
            If you have received a damaged or incorrect piece, please email us directly with clear photos of the issue. Our team will review your case. We reserve the right to deny any return that does not explicitly meet our criteria or appears to take advantage of our policies.
          </p>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">Refunds & Processing</h2>
          <p>
            Once a valid return is received and inspected in our studio, we will notify you of the approval. If approved, your refund or replacement will be processed. We appreciate your understanding and support in valuing authentic artisan craftsmanship over fast fashion convenience.
          </p>
        </div>
      </div>
      
      <div className="mt-20">
        <Footer />
      </div>
    </main>
  );
}
