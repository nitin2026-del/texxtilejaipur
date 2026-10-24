'use client';

import React, { useState } from 'react';
import { Sparkles, MapPin, Mail, Phone, ChevronDown, ChevronUp, ArrowUpRight, Heart, Send } from 'lucide-react';
import { trackMetaEvent } from '@/utils/metaTracking';

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
const IconInstagram = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconWhatsApp = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
  </svg>
);

const IconFacebook = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const IconPinterest = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
  </svg>
);

const IconYouTube = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const Footer: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subMessage, setSubMessage] = useState('');

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setSubStatus('error');
      setSubMessage('Please enter a valid email address');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (/@(domain\.com|example\.com|test\.com|invalid\.com)$/i.test(cleanEmail)) { setSubStatus('error'); setSubMessage('Please enter a valid email address'); return; }
    setSubStatus('loading');
    trackMetaEvent('Lead', { content_name: 'Footer VIP Newsletter' }, undefined, false, { email: cleanEmail });

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSubStatus('success');
        setSubMessage('Welcome! Check your email for a 10% off VIP code 🎉');
        setEmail('');
      } else {
        setSubStatus('error');
        setSubMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setSubStatus('error');
      setSubMessage('Network error. Please try again.');
    }
  };
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
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              {subStatus === 'success' ? (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-4 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-sm text-emerald-300 font-medium">{subMessage}</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 lg:w-80">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (subStatus === 'error') setSubStatus('idle'); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                        placeholder="Enter your email address" 
                        className={`w-full pl-11 pr-4 py-3.5 bg-white/[0.06] border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.08] transition-all ${
                          subStatus === 'error' ? 'border-red-500/40' : 'border-white/[0.08]'
                        }`}
                        disabled={subStatus === 'loading'}
                      />
                    </div>
                    <button 
                      onClick={handleSubscribe}
                      disabled={subStatus === 'loading'}
                      className="px-6 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30 flex items-center justify-center gap-2 group min-w-[140px]"
                    >
                      {subStatus === 'loading' ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Subscribing...
                        </>
                      ) : (
                        <>
                          Subscribe
                          <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                  {subStatus === 'error' && (
                    <p className="text-xs text-red-400 font-medium pl-1 animate-fade-in">{subMessage}</p>
                  )}
                  <p className="text-[11px] text-zinc-600 pl-1">Subscribe & get an exclusive <span className="text-brand-400 font-semibold">10% off</span> VIP discount code instantly!</p>
                </>
              )}
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
                  className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:text-pink-300 hover:bg-pink-500/20 hover:border-pink-500/40 transition-all group"
                  title="Instagram @textileofjaipur"
                >
                  <IconInstagram className="h-4 w-4 text-pink-400" />
                </a>
                <a 
                  href="https://www.youtube.com/@TextileJaipur" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all group"
                  title="YouTube @TextileJaipur"
                >
                  <IconYouTube className="h-4 w-4 text-red-500" />
                </a>
                <a 
                  href="https://www.pinterest.com/priyanshug863/" 
                  target="_blank" 
                  rel="nofollow noopener noreferrer" 
                  className="p-2.5 rounded-xl bg-red-600/10 border border-red-600/20 text-[#E60023] hover:text-white hover:bg-[#E60023] hover:border-[#E60023] transition-all group" 
                  title="Pinterest"
                >
                  <IconPinterest className="h-4 w-4" />
                </a>
                <a 
                  href="https://wa.me/919461858955" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all"
                  title="WhatsApp"
                >
                  <IconWhatsApp className="h-4 w-4 text-emerald-400" />
                </a>
                <a 
                  href="mailto:textileofrajasthan.info@gmail.com" 
                  className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:text-brand-300 hover:bg-brand-500/20 hover:border-brand-500/40 transition-all"
                  title="Email"
                >
                  <Mail className="h-4 w-4 text-brand-400" />
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
                    <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 group-hover:border-pink-500/40 group-hover:bg-pink-500/20 group-hover:text-pink-300 transition-all shrink-0">
                      <IconInstagram className="h-4 w-4 text-pink-400" />
                    </div>
                    <span className="text-[13px] text-zinc-300 group-hover:text-pink-300 font-medium transition-colors">@textileofjaipur</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@TextileJaipur" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 group-hover:border-red-500/40 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all shrink-0">
                      <IconYouTube className="h-4 w-4 text-red-500" />
                    </div>
                    <span className="text-[13px] text-zinc-300 group-hover:text-red-400 font-medium transition-colors">@TextileJaipur</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.pinterest.com/priyanshug863/" target="_blank" rel="nofollow noopener noreferrer" className="flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-red-600/10 border border-red-600/20 text-[#E60023] group-hover:border-red-500/40 group-hover:bg-red-600/20 transition-all shrink-0">
                      <IconPinterest className="h-4 w-4 text-[#E60023]" />
                    </div>
                    <span className="text-[13px] text-zinc-300 group-hover:text-red-400 font-medium transition-colors">Pinterest</span>
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
