'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { CartSidebar } from '@/components/CartSidebar';

export default function TermsOfServicePage() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-zinc-900 pb-24">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => {}} />
      <BottomNav onCartOpen={() => setCartOpen(true)} />

      <div className="pt-32 px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-zinc max-w-none text-zinc-700 space-y-6">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Textile Jaipur's website, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">2. Handcrafted Goods Disclaimer</h2>
          <p>
            Please note that our products are entirely handcrafted by artisans. Due to this nature, slight irregularities in color, print, and weave are not defects but rather the hallmark of an authentic handcrafted product.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">3. Prices and Payments</h2>
          <p>
            All prices are subject to change without notice. We make every effort to provide you with the most accurate, up-to-date pricing. However, pricing errors may occasionally occur. If an item's correct price is higher than our stated price, we will, at our discretion, either contact you for instructions before shipping or cancel your order and notify you of such cancellation.
          </p>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">4. Shipping and Duties</h2>
          <p>
            For international orders, the customer is responsible for all customs duties, taxes, and fees associated with the importation of goods into their respective countries, unless specified as DHL Express at checkout.
          </p>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">5. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of Rajasthan, India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </div>
      </div>
      
      <div className="mt-20">
        <Footer />
      </div>
    </main>
  );
}
