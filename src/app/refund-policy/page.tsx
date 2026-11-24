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
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-8">Return &amp; Refund Policy</h1>
        
        <div className="prose prose-zinc max-w-none text-zinc-700 space-y-6">
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-zinc-900 mb-6 font-bold flex items-center gap-3">
              <Heart className="h-6 w-6 text-brand-600" /> Handcrafted with Care, Backed by a 14-Day Guarantee
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-600"></div>
              <p className="text-zinc-600 leading-relaxed text-lg">
                Every Textile Jaipur piece is handcrafted in small batches by master artisans in Jaipur, Rajasthan. We want you to love your garment — if something isn&apos;t right, you have <strong>14 days from delivery</strong> to request a return or exchange.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-zinc-900 mb-6 font-bold flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-brand-600" /> 14-Day Return &amp; Exchange Eligibility
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100 space-y-4">
              <p className="text-zinc-600 leading-relaxed">
                Returns and exchanges are accepted within <strong>14 calendar days of delivery</strong> for all eligible orders. To qualify for a return:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-600">
                <li>Items must be <strong>unworn, unwashed, and unused</strong>, in their original condition with all original tags and packaging attached.</li>
                <li>Return requests must be initiated within <strong>14 days</strong> of receiving your parcel via our <Link href="/returns" className="text-brand-700 font-semibold underline">Returns Portal</Link> or by emailing <a href="mailto:textileofrajasthan.info@gmail.com" className="text-brand-700 font-semibold underline">textileofrajasthan.info@gmail.com</a>.</li>
              </ul>
            </div>
          </section>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">Return Shipping Costs</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-700">
            <li><strong>Damaged, Defective, or Incorrect Items (Free Return Shipping):</strong> If your piece arrives damaged, defective, or is not the item you ordered, Textile Jaipur covers 100% of return shipping costs and provides a full refund or free replacement.</li>
            <li><strong>Sizing or Change-of-Mind Returns:</strong> For returns due to sizing preference or change of mind within 14 days of delivery, the customer is responsible for return shipping postage back to our studio.</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">How to Start a Return</h2>
          <p>
            Visit our <Link href="/returns" className="text-brand-700 font-semibold underline">Returns &amp; Exchanges Portal</Link> with your order number and email address, or email us at <a href="mailto:textileofrajasthan.info@gmail.com" className="text-brand-700 font-semibold underline">textileofrajasthan.info@gmail.com</a> (or call <a href="tel:+918764655537" className="text-brand-700 font-semibold underline">+91 87646 55537</a>). Our team responds within 24 hours with return instructions (and a prepaid label for any damaged or incorrect items).
          </p>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">Refund Processing Timeline</h2>
          <p>
            Once your returned item arrives at our Jaipur studio and passes quality inspection, we will notify you by email and issue your full item refund to your original payment method (PayPal or credit/debit card) within <strong>5–7 business days</strong>. There are no restocking fees.
          </p>

          <p className="text-sm text-zinc-500 pt-4 border-t border-zinc-200">
            Looking for shipping timelines? Read our <Link href="/shipping" className="text-brand-700 font-semibold underline">Shipping &amp; Delivery Policy</Link>.
          </p>
        </div>
      </div>
      
      <div className="mt-20">
        <Footer />
      </div>
    </main>
  );
}
