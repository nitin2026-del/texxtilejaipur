'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { CartSidebar } from '@/components/CartSidebar';

export default function PrivacyPolicyPage() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-zinc-900 pb-24">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => {}} />
      <BottomNav onCartOpen={() => setCartOpen(true)} />

      <div className="pt-32 px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-zinc max-w-none text-zinc-700 space-y-6">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), and other information you choose to provide.
          </p>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We may use the information we collect about you to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide, maintain, and improve our services, including facilitating payments and sending receipts.</li>
            <li>Perform internal operations, including troubleshooting software bugs and operational problems.</li>
            <li>Send communications we think will be of interest to you, including information about products, services, promotions, news, and events of Textile Jaipur.</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">3. Sharing of Information</h2>
          <p>
            We do not share your personal information with third parties except as described in this privacy policy. We may share your information with our third-party service providers (such as Stripe or PayPal for payment processing) who need access to such information to carry out work on our behalf.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">4. Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
          </p>

          <h2 className="text-2xl font-serif font-bold text-zinc-900 mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <strong>priyanshug863@gmail.com</strong>.
          </p>
        </div>
      </div>
      
      <div className="mt-20">
        <Footer />
      </div>
    </main>
  );
}
