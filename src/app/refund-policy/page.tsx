'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-8">Refund & Return Policy</h1>
        
        <div className="prose prose-zinc max-w-none text-zinc-700 space-y-6">
          <p>
            We stand behind the quality of our handcrafted garments. If you are not completely satisfied with your purchase, we're here to help with our <strong>30-Day Money Back Guarantee</strong>.
          </p>

          <div className="bg-brand-50 border border-brand-200 p-6 rounded-xl my-8">
            <h3 className="text-lg font-serif font-bold text-brand-900 mb-2">Ready to initiate a return?</h3>
            <p className="text-sm text-brand-800 mb-4">Use our automated self-service portal to generate your return label instantly.</p>
            <Link href="/returns" className="inline-flex items-center gap-2 bg-brand-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-800 transition-colors shadow-sm">
              Go to Returns Portal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">1. Eligibility for Returns</h2>
          <p>
            To be eligible for a return, your item must be unused, unwashed, and in the same condition that you received it. It must also be in the original packaging with all tags attached. Returns must be initiated within 30 days of receiving your order.
          </p>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">2. Non-returnable Items</h2>
          <p>
            Certain types of items cannot be returned, including:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Custom-made or personalized garments.</li>
            <li>Items marked as "Final Sale".</li>
            <li>Intimates or swimwear (for hygiene reasons).</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">3. Refunds</h2>
          <p>
            Once your return is received and inspected by our Quality Control team in Jaipur, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment within 5-7 business days.
          </p>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">4. Shipping Costs</h2>
          <p>
            We offer free return shipping for defective or incorrect items. For all other returns (e.g., sizing issues, change of mind), the cost of return shipping will be deducted from your total refund amount.
          </p>
        </div>
      </div>
      
      <div className="mt-20">
        <Footer />
      </div>
    </main>
  );
}
