'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { Truck, Clock, Globe, ShieldCheck, PackageCheck } from 'lucide-react';

export function ShippingPageClient() {
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
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-4">Shipping &amp; Delivery Policy</h1>
        <p className="text-zinc-600 text-lg mb-10">
          Free, fully tracked worldwide express shipping direct from our artisan studio in Jaipur, Rajasthan — with customs &amp; import duties handled for you.
        </p>

        <div className="prose prose-zinc max-w-none text-zinc-700 space-y-8">
          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4 font-bold flex items-center gap-3">
              <Globe className="h-6 w-6 text-brand-600" /> Free Worldwide Express Shipping
            </h2>
            <div className="bg-white p-7 rounded-xl shadow-sm border border-zinc-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-600"></div>
              <p className="text-zinc-600 leading-relaxed">
                Every order placed at Textile Jaipur ships <strong>100% free worldwide</strong> via UPS Express and trusted international air couriers. There is no minimum order value and no surprise shipping charge at checkout.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4 font-bold flex items-center gap-3">
              <Clock className="h-6 w-6 text-brand-600" /> Order Processing &amp; Dispatch Time
            </h2>
            <div className="bg-white p-7 rounded-xl shadow-sm border border-zinc-100">
              <p className="text-zinc-600 leading-relaxed">
                Each garment is inspected, steamed, and packed by our team in Jaipur. Orders are processed and dispatched within <strong>1–3 business days</strong> (Monday–Saturday, excluding public holidays).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4 font-bold flex items-center gap-3">
              <Truck className="h-6 w-6 text-brand-600" /> Estimated Transit Times by Destination
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
              <table className="w-full text-left text-sm text-zinc-700">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">Destination</th>
                    <th className="px-6 py-3.5 font-bold">Courier Service</th>
                    <th className="px-6 py-3.5 font-bold">Estimated Transit Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="px-6 py-3.5 font-semibold">United States (USA)</td>
                    <td className="px-6 py-3.5">UPS Express Worldwide</td>
                    <td className="px-6 py-3.5">5–9 Business Days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-semibold">United Kingdom</td>
                    <td className="px-6 py-3.5">UPS Express Worldwide</td>
                    <td className="px-6 py-3.5">4–8 Business Days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-semibold">Europe</td>
                    <td className="px-6 py-3.5">UPS Express Worldwide</td>
                    <td className="px-6 py-3.5">5–10 Business Days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-semibold">Canada</td>
                    <td className="px-6 py-3.5">UPS Express Worldwide</td>
                    <td className="px-6 py-3.5">6–10 Business Days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-semibold">Australia &amp; New Zealand</td>
                    <td className="px-6 py-3.5">UPS Express Worldwide</td>
                    <td className="px-6 py-3.5">6–12 Business Days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-semibold">Rest of World</td>
                    <td className="px-6 py-3.5">Global Express Courier</td>
                    <td className="px-6 py-3.5">5–12 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4 font-bold flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-brand-600" /> Customs, Duties &amp; Import Taxes
            </h2>
            <div className="bg-white p-7 rounded-xl shadow-sm border border-zinc-100">
              <p className="text-zinc-600 leading-relaxed">
                <strong>No surprise fees at delivery.</strong> Textile Jaipur handles all export documentation, port clearances, and pre-paid import duties on your behalf so your package arrives directly at your door.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4 font-bold flex items-center gap-3">
              <PackageCheck className="h-6 w-6 text-brand-600" /> Real-Time Order Tracking &amp; Priority Delivery
            </h2>
            <div className="bg-white p-7 rounded-xl shadow-sm border border-zinc-100 space-y-4">
              <p className="text-zinc-600 leading-relaxed">
                As soon as your parcel leaves Jaipur, we email your live courier tracking number. You can check shipment updates anytime on our <Link href="/track-order" className="text-brand-700 font-semibold underline">Track Your Order</Link> page.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Need your jacket for an upcoming event or gift? Email <a href="mailto:textileofrajasthan.info@gmail.com" className="text-brand-700 font-semibold underline">textileofrajasthan.info@gmail.com</a> or call <a href="tel:+918764655537" className="text-brand-700 font-semibold underline">+91 87646 55537</a> and we will arrange priority dispatch at no extra cost whenever possible.
              </p>
            </div>
          </section>

          <p className="text-sm text-zinc-500 pt-4 border-t border-zinc-200">
            Need to return or exchange an order? View our <Link href="/refund-policy" className="text-brand-700 font-semibold underline">14-Day Return &amp; Refund Policy</Link> or visit the <Link href="/returns" className="text-brand-700 font-semibold underline">Returns Portal</Link>.
          </p>
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </main>
  );
}
