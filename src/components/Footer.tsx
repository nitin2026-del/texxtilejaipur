'use client';

import React, { useState } from 'react';
import { Sparkles, MapPin, Mail, Phone, ChevronDown, ChevronUp, ArrowUpRight, Heart, Send } from 'lucide-react';

const FAQS = [
  {
    question: "In how many days will I receive my delivery?",
    answer: "✈️ Estimated Delivery Times:\n\n• USA: 5–9 Business Days\n• United Kingdom: 4–8 Business Days\n• Europe: 5–10 Business Days\n• Canada: 6–10 Business Days\n• Australia: 6–12 Business Days\n\nNeed it sooner? We can provide expedited shipping at no extra cost if you have a genuine reason (like a wedding, gift, or special event). Please reach out to us to request fast delivery for your order."
  },
  {
    question: "Are your garments truly handmade?",
    answer: "Absolutely. Our pieces are crafted by master artisans in Jaipur and rural Rajasthan using traditional techniques passed down through generations."
  },
  {
    question: "What is your return policy?",
    answer: "To protect the artistic integrity of our handcrafted pieces, we do not accept returns for change of mind. We accept returns strictly for damaged or incorrect items reported within 3 days of delivery."
  },
  {
    question: "Can I request custom sizing?",
    answer: "Yes! We offer a customization service for most of our garments. Please contact our support team with your measurements before placing an order."
  }
];

/* ─── Custom SVG Icons ─── */
const IconInstagram = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconWhatsApp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
  </svg>
);

const IconFacebook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

export const Footer: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <footer className="relative overflow-hidden">
      {/* ─── Decorative Top Border ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />
      
      {/* ─── Newsletter / CTA Section ─── */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(182,128,91,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(182,128,91,0.05),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left max-w-lg">
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
                <div className="h-px w-8 bg-brand-500/50" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-400">Stay Connected</span>
                <div className="h-px w-8 bg-brand-500/50" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
                Join the <span className="text-brand-400">Artisan</span> Community
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Be the first to discover new handcrafted collections, exclusive offers, and stories from our artisans in Jaipur.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full pl-11 pr-4 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.08] transition-all"
                />
              </div>
              <button className="px-6 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30 flex items-center justify-center gap-2 group">
                Subscribe
                <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Footer Content ─── */}
      <div className="bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(182,128,91,0.04),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16 border-b border-white/[0.06]">
            
            {/* Brand Column */}
            <div className="space-y-6 lg:pr-8">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-brand-400" />
                <div className="text-2xl font-serif tracking-wide font-bold text-white">
                  TEXTILE <span className="text-brand-400 font-light">JAIPUR</span>
                </div>
              </div>
              <p className="text-[13px] text-zinc-400 leading-relaxed">
                Redefining premium ethnic wear. Handcrafted in Jaipur, combining timeless heritage with contemporary luxury for the global stage.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                <a 
                  href="https://instagram.com/textileofjaipur" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/20 transition-all group"
                  title="Instagram"
                >
                  <IconInstagram />
                </a>
                <a 
                  href="https://wa.me/919461858955" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/20 transition-all"
                  title="WhatsApp"
                >
                  <IconWhatsApp />
                </a>
                <a 
                  href="mailto:textileofrajasthan.info@gmail.com" 
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-brand-400 hover:bg-brand-500/10 hover:border-brand-500/20 transition-all"
                  title="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-4 pt-2">
                <img src="/paypal.svg" alt="PayPal" className="h-6 opacity-40 hover:opacity-70 transition-opacity" />
                <img src="/mastercard.svg" alt="Mastercard" className="h-6 opacity-40 hover:opacity-70 transition-opacity" />
                <img src="/amex.svg" alt="Amex" className="h-6 opacity-40 hover:opacity-70 transition-opacity" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-serif text-base mb-6 font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Our Collections', href: '/#categories' },
                  { label: 'New Arrivals', href: '/#new-arrivals' },
                  { label: 'All Products', href: '/collection' },
                  { label: 'About Us', href: '/about' },
                  { label: 'Customer Reviews', href: '/reviews' },
                  { label: 'The Artisan Edit', href: '/the-artisan-edit' },
                  { label: 'Track Order', href: '/track-order' },
                  { label: 'Size Guide', href: '/size-guide' },
                ].map((link) => (
                  <li key={link.href}>
                    <a 
                      href={link.href} 
                      className="text-[13px] text-zinc-400 hover:text-white transition-colors font-medium inline-flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-brand-400 transition-all duration-300" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Details */}
            <div>
              <h4 className="text-white font-serif text-base mb-6 font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Contact Us
              </h4>
              <ul className="space-y-4">
                <li>
                  <a href="https://maps.google.com/?q=Jaipur+Export+Zone+Rajasthan+302001" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                    <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:border-brand-500/20 group-hover:bg-brand-500/10 transition-all shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4 text-brand-400" />
                    </div>
                    <div>
                      <span className="text-[13px] text-zinc-400 group-hover:text-zinc-300 leading-relaxed font-medium transition-colors">
                        Jaipur Export Zone,<br />Rajasthan, India 302001
                      </span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="tel:+918764655537" className="flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:border-brand-500/20 group-hover:bg-brand-500/10 transition-all shrink-0">
                      <Phone className="h-4 w-4 text-brand-400" />
                    </div>
                    <span className="text-[13px] text-zinc-400 group-hover:text-zinc-300 font-medium transition-colors">+91 87646 55537</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:textileofrajasthan.info@gmail.com" className="flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:border-brand-500/20 group-hover:bg-brand-500/10 transition-all shrink-0">
                      <Mail className="h-4 w-4 text-brand-400" />
                    </div>
                    <span className="text-[13px] text-zinc-400 group-hover:text-zinc-300 font-medium transition-colors break-all">textileofrajasthan.info@gmail.com</span>
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com/textileofjaipur" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:border-pink-500/20 group-hover:bg-pink-500/10 transition-all shrink-0">
                      <IconInstagram />
                    </div>
                    <span className="text-[13px] text-zinc-400 group-hover:text-pink-300 font-medium transition-colors">@textileofjaipur</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* FAQs Accordion */}
            <div>
              <h4 className="text-white font-serif text-base mb-6 font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                FAQs
              </h4>
              <div className="space-y-2.5">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-3.5 text-left transition-colors"
                    >
                      <span className="text-xs font-semibold text-zinc-300 pr-2">{faq.question}</span>
                      <div className={`p-0.5 rounded-md transition-all shrink-0 ${openFaq === idx ? 'bg-brand-500/20 text-brand-400' : 'text-zinc-600'}`}>
                        {openFaq === idx ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </button>
                    {openFaq === idx && (
                      <div className="px-3.5 pb-3.5 pt-0 text-xs text-zinc-400 leading-relaxed font-medium whitespace-pre-line animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ─── Bottom Bar ─── */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <p className="text-xs text-zinc-500 font-medium">
                © {new Date().getFullYear()} Textile Jaipur. All rights reserved.
              </p>
              <span className="hidden sm:inline text-zinc-700">·</span>
              <p className="text-xs text-zinc-600 flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> in Jaipur, India
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-zinc-500 font-medium">
              <a href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
              <a href="/refund-policy" className="hover:text-zinc-300 transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
