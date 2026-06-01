'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartSidebar } from '@/components/CartSidebar';
import { Search, Package, MapPin, Truck, ChevronRight, Loader2 } from 'lucide-react';

export default function TrackOrderPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('dhl');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingDetails, setTrackingDetails] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError('');
    setTrackingDetails(null);

    try {
      const res = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber, carrier })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setTrackingDetails(data.tracker);
    } catch (err: any) {
      setError(err.message || 'Tracking failed. Please check your tracking number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => setIsCartOpen(false)}
      />

      <div className="flex-grow pt-32 pb-16 px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12 animate-fadeIn">
          <Truck className="h-12 w-12 text-gold mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-bold tracking-wide">Track Your Order</h1>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto font-light">
            Enter your tracking number below to receive live updates on your handcrafted export.
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-xl backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Tracking Number</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g., JD1234567890"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-gold transition-colors font-mono tracking-wider"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Carrier</label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-gold transition-colors appearance-none"
              >
                <option value="dhl">DHL Express</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto h-[58px] px-8 bg-gold hover:bg-yellow-500 text-zinc-950 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Track Package'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl text-sm text-red-400 text-center animate-fadeIn">
              {error}
            </div>
          )}

          {trackingDetails && (
            <div className="mt-8 pt-8 border-t border-zinc-800 animate-fadeIn">
              <div className="flex justify-between items-center mb-8 bg-zinc-950 border border-zinc-800 p-6 rounded-xl">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Current Status</span>
                  <span className="text-gold font-bold text-xl tracking-wide uppercase">{trackingDetails.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Carrier</span>
                  <span className="text-white font-mono tracking-widest">{trackingDetails.carrier}</span>
                </div>
              </div>
              
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-3 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-zinc-800 before:to-transparent">
                {trackingDetails.tracking_details?.slice().reverse().map((detail: any, idx: number) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-zinc-900 bg-zinc-950 z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                       <div className="h-2 w-2 bg-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-zinc-950/80 p-5 rounded-xl border border-zinc-800/80 shadow-lg hover:border-gold/30 transition-colors">
                      <p className="font-bold text-white text-sm tracking-wide">{detail.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {new Date(detail.datetime).toLocaleString(undefined, {
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                        {detail.tracking_location?.city && (
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-full">
                            <MapPin className="h-3 w-3 text-gold" />
                            {detail.tracking_location.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
