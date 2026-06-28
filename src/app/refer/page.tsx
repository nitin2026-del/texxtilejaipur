'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { Gift, Share2, Copy, CheckCircle2, IndianRupee, Sparkles, Mail, MessageCircle } from 'lucide-react';

export default function ReferPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralCode = 'JAIPUR500';
  const referralLink = `https://textilejaipur.com/invite/${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Hey! I thought you'd love these authentic Jaipur handloom textiles. Use my link to get ₹500 off your first order: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-zinc-900 pb-24">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <BottomNav onCartOpen={() => setCartOpen(true)} />

      <div className="pt-32 px-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 md:p-14 shadow-xl border border-zinc-100 text-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-brand-50 to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gold/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="relative z-10">
            <div className="w-20 h-20 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-sm border border-brand-200">
              <Gift className="h-10 w-10" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-4">
              Give ₹500, <span className="text-brand-700">Get ₹500</span>
            </h1>
            <p className="text-zinc-600 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Invite your friends to discover authentic Jaipur textiles. They get ₹500 off their first order, and you get a ₹500 discount code when they shop!
            </p>

            <div className="max-w-md mx-auto bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mb-10 shadow-inner">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Your Unique Referral Link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-mono text-sm truncate select-all">
                  {referralLink}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${copied ? 'bg-green-600 text-white' : 'bg-brand-700 hover:bg-brand-800 text-white shadow-md'}`}
                >
                  {copied ? <><CheckCircle2 className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <button 
                onClick={shareWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-md"
              >
                <MessageCircle className="h-5 w-5" />
                Share via WhatsApp
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-md">
                <Mail className="h-5 w-5" />
                Invite via Email
              </button>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-2xl font-serif font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Share2, title: 'Share Your Link', desc: 'Send your unique referral link to friends and family.' },
              { icon: Sparkles, title: 'They Get ₹500 Off', desc: 'Your friends get ₹500 off their very first order with us.' },
              { icon: IndianRupee, title: 'You Earn ₹500', desc: 'You receive a ₹500 discount code when their order ships.' },
            ].map((step, i) => (
              <div key={i} className="text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-white border border-zinc-200 rounded-full flex items-center justify-center mb-6 shadow-sm relative">
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-700 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#FDFBF7]">
                    {i + 1}
                  </span>
                  <step.icon className="h-6 w-6 text-brand-700" />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
