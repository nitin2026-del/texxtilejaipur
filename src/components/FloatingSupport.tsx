'use client';

import React, { useState } from 'react';
import { MessageCircle, Mail, X } from 'lucide-react';

export const FloatingSupport = () => {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = "919461858955";
  const email = "textileofrajasthan.info@gmail.com";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Support Menu */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-zinc-100 p-3 mb-2 animate-fadeIn flex flex-col gap-2 w-64 origin-bottom-right">
          <div className="px-2 pb-2 border-b border-zinc-100 flex justify-between items-center">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Customer Support</h4>
          </div>
          
          <a 
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 hover:bg-green-50 rounded-xl transition-colors group"
          >
            <div className="bg-green-100 p-2 rounded-full text-green-600 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900">WhatsApp</span>
              <span className="text-xs text-zinc-500">Fastest response</span>
            </div>
          </a>

          <a 
            href={`mailto:${email}`}
            className="flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-xl transition-colors group"
          >
            <div className="bg-blue-100 p-2 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900">Email Us</span>
              <span className="text-xs text-zinc-500">For detailed inquiries</span>
            </div>
          </a>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 bg-zinc-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-zinc-800 hover:scale-105 transition-all focus:outline-none"
        aria-label="Customer Support"
      >
        {isOpen ? (
          <X className="h-6 w-6 animate-fadeIn" />
        ) : (
          <MessageCircle className="h-6 w-6 animate-fadeIn" />
        )}
      </button>
    </div>
  );
};
