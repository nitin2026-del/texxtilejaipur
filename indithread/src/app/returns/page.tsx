'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { RefreshCcw, Box, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ReturnsPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep('success');
      } else {
        setError(data.error || 'Failed to process return request.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-zinc-900 pb-24">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <BottomNav onCartOpen={() => setCartOpen(true)} />

      <div className="pt-32 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-4">Returns & Exchanges</h1>
          <p className="text-zinc-600 max-w-lg mx-auto text-lg">
            Not completely in love? We offer a hassle-free 30-day return policy. Enter your order details below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Form Section */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-zinc-100">
            {step === 'form' ? (
              <>
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-zinc-100">
                  <div className="p-3 bg-brand-50 rounded-xl">
                    <RefreshCcw className="h-6 w-6 text-brand-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Start a Return</h2>
                    <p className="text-xs text-zinc-500">Have your order number ready</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-2">Order Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. TEXTILE123456" 
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="Email used for the order" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-brand-700 hover:bg-brand-800 text-white font-bold py-4 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? 'Verifying...' : (
                      <>Find My Order <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-3">Order Found!</h2>
                <p className="text-zinc-600 mb-8">
                  We've sent a secure link to <strong>{email}</strong>. Please check your inbox to select the items you wish to return.
                </p>
                <button 
                  onClick={() => setStep('form')}
                  className="text-brand-700 font-bold text-sm hover:underline"
                >
                  Start another return
                </button>
              </div>
            )}
          </div>

          {/* Policy Section */}
          <div className="flex flex-col justify-center space-y-8">
            <h3 className="text-2xl font-serif font-bold text-zinc-900 border-b border-zinc-200 pb-4">Our Policy</h3>
            
            <div className="flex gap-4">
              <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Box className="h-5 w-5 text-zinc-700" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 mb-1">30-Day Window</h4>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  You have 30 days from the date of delivery to return or exchange your items. Items must be unworn, unwashed, and have original tags attached.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-zinc-700" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 mb-1">Free Return Shipping</h4>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  We provide a prepaid shipping label for all returns within India. For international orders, a small return shipping fee applies.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <RefreshCcw className="h-5 w-5 text-zinc-700" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 mb-1">Fast Refunds</h4>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Once we receive your return, refunds are processed within 3-5 business days directly to your original payment method.
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-6 border-t border-zinc-200">
              <p className="text-sm text-zinc-500">
                Need help? <a href="mailto:support@textilejaipur.com" className="text-brand-700 font-bold hover:underline">Contact Support</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
