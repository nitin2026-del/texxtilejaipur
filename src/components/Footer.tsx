'use client';

import React, { useState } from 'react';
import { Sparkles, MapPin, Mail, Phone, AtSign, Hash, Globe, ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    question: "Do you ship internationally?",
    answer: "Yes, we offer DHL shipping to the USA, Europe, Australia, and most global destinations. Delivery times typically range from 5-10 business days."
  },
  {
    question: "Are your garments truly handmade?",
    answer: "Absolutely. Our pieces are crafted by master artisans in Jaipur and rural Rajasthan using traditional techniques passed down through generations."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 14 days of delivery for unworn items in their original condition with tags attached. Custom orders are final sale."
  },
  {
    question: "Can I request custom sizing?",
    answer: "Yes! We offer a customization service for most of our garments. Please contact our support team with your measurements before placing an order."
  }
];

export const Footer: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <footer className="bg-white border-t border-zinc-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16 border-b border-zinc-200">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 group cursor-pointer">
              <Sparkles className="h-6 w-6 text-brand-700 animate-pulse" />
              <h1 className="text-2xl font-serif tracking-wide select-none font-bold text-zinc-900">
                TEXTILE <span className="text-brand-700 font-light">WEAR</span>
              </h1>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              Redefining premium ethnic wear. Handcrafted in Jaipur, combining timeless heritage with contemporary luxury for the global stage.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/textileofjaipur" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-zinc-100 text-zinc-500 hover:text-white hover:bg-brand-800 transition-all flex items-center gap-2 pr-4">
                <AtSign className="h-4 w-4" />
                <span className="text-xs font-bold">@textileofjaipur</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-zinc-900 font-serif text-lg mb-6 font-semibold">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/#categories" className="text-sm text-zinc-600 hover:text-brand-800 transition-colors font-medium">Our Collections</a></li>
              <li><a href="/#new-arrivals" className="text-sm text-zinc-600 hover:text-brand-800 transition-colors font-medium">New Arrivals</a></li>
              <li><a href="/" className="text-sm text-zinc-600 hover:text-brand-800 transition-colors font-medium">All Products</a></li>
              <li><a href="/track" className="text-sm text-zinc-600 hover:text-brand-800 transition-colors font-medium">Track Order</a></li>
              <li><a href="/size-guide" className="text-sm text-zinc-600 hover:text-brand-800 transition-colors font-medium">Size Guide</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-zinc-900 font-serif text-lg mb-6 font-semibold">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand-700 shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-600 leading-relaxed font-medium">
                  Jaipur Export Zone,<br />
                  Rajasthan, India 302001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-700 shrink-0" />
                <a href="tel:+918764655537" className="text-sm text-zinc-600 font-medium hover:text-brand-800 transition-colors">+91 87646 55537</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-700 shrink-0" />
                <span className="text-sm text-zinc-600 font-medium">priyanshug863@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <AtSign className="h-4 w-4 text-brand-700 shrink-0" />
                <a href="https://instagram.com/textileofjaipur" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-600 font-medium hover:text-brand-800 transition-colors">@textileofjaipur</a>
              </li>
            </ul>
          </div>

          {/* FAQs Accordion */}
          <div>
            <h4 className="text-zinc-900 font-serif text-lg mb-6 font-semibold">FAQs</h4>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="border border-zinc-200 rounded-lg overflow-hidden bg-[#FDFBF7]">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-50 transition-colors"
                  >
                    <span className="text-xs font-bold text-zinc-800">{faq.question}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="h-4 w-4 text-brand-700 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="p-3 pt-0 text-xs text-zinc-600 leading-relaxed bg-[#FDFBF7] font-medium">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 font-medium">
            © {new Date().getFullYear()} Textile Jaipur. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-zinc-500 font-medium">
            <a href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-zinc-900 transition-colors">Terms of Service</a>
            <a href="/refund-policy" className="hover:text-zinc-900 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
