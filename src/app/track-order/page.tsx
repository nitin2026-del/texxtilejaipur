'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Package, Search, CheckCircle, Truck, MapPin, Clock, AlertCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

interface OrderItem {
  quantity: number;
  price_at_time: number;
  products: { name: string; slug: string } | null;
}

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  created_at: string;
  tracking_number: string | null;
  display_currency: string;
  shipping_addresses: { full_name: string; city: string; country: string } | null;
  order_items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  pending:    { label: 'Order Placed',     color: 'text-amber-500',  icon: <Clock className="h-5 w-5" />,       step: 1 },
  paid:       { label: 'Payment Confirmed',color: 'text-blue-500',   icon: <CheckCircle className="h-5 w-5" />, step: 2 },
  processing: { label: 'Preparing Order',  color: 'text-purple-500', icon: <Package className="h-5 w-5" />,     step: 2 },
  shipped:    { label: 'Shipped',          color: 'text-indigo-500', icon: <Truck className="h-5 w-5" />,       step: 3 },
  delivered:  { label: 'Delivered',        color: 'text-emerald-500',icon: <CheckCircle className="h-5 w-5" />, step: 4 },
  cancelled:  { label: 'Cancelled',        color: 'text-red-500',    icon: <AlertCircle className="h-5 w-5" />, step: 0 },
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderInput, setOrderInput] = useState(searchParams.get('order') || '');
  const [emailInput, setEmailInput] = useState(searchParams.get('email') || '');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Auto-search if params are pre-filled (from email link)
  useEffect(() => {
    if (searchParams.get('order') && searchParams.get('email')) {
      handleSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderInput.trim() || !emailInput.trim()) {
      setError('Please enter both your email and order number.');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(true);

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), order_number: orderInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order not found');
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Could not find your order. Please check the details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG['pending']) : null;
  const steps = ['Order Placed', 'Payment Confirmed', 'Shipped', 'Delivered'];

  return (
    <div className="min-h-screen bg-[#FDFBF7]" style={{ fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <div style={{ background: '#1a1a1a' }} className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-amber-400 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-bold tracking-widest" style={{ color: '#d4af37', letterSpacing: '2px' }}>TEXTILE JAIPUR</span>
        </Link>
        <span className="text-xs text-zinc-500 font-sans">Order Tracking</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 border-2 border-amber-200 mb-4">
            <Package className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Track Your Order</h1>
          <p className="text-sm text-zinc-500 font-sans">Enter your email and order number to check your delivery status.</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 font-sans uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full border border-zinc-300 rounded-lg py-3 px-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-400 transition-colors font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 font-sans uppercase tracking-wider">Order Number</label>
              <input
                type="text"
                required
                placeholder="e.g. TJ-123456"
                value={orderInput}
                onChange={e => setOrderInput(e.target.value.toUpperCase())}
                className="w-full border border-zinc-300 rounded-lg py-3 px-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-400 transition-colors font-sans font-mono"
              />
              <p className="text-[11px] text-zinc-400 mt-1.5 font-sans">Your order number is in the confirmation email we sent you (format: TJ-XXXXXX)</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-sm text-zinc-950 flex items-center justify-center gap-2 transition-all font-sans"
              style={{ background: loading ? '#e5c34a' : '#d4af37' }}
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-800 border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 font-sans">Order Not Found</p>
              <p className="text-xs text-red-600 mt-0.5 font-sans">{error}</p>
            </div>
          </div>
        )}

        {/* Order Result */}
        {order && statusInfo && (
          <div className="space-y-5">
            {/* Status Banner */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold text-zinc-500 font-sans uppercase tracking-wider mb-1">Order Number</p>
                  <p className="text-xl font-bold text-zinc-900 font-mono">{order.order_number}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-sans text-sm font-bold ${statusInfo.color} bg-zinc-50`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </div>
              </div>

              {/* Progress Steps */}
              {order.status !== 'cancelled' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-200 z-0" />
                    <div
                      className="absolute top-4 left-0 h-0.5 bg-amber-400 z-0 transition-all duration-700"
                      style={{ width: `${((statusInfo.step - 1) / 3) * 100}%` }}
                    />
                    {steps.map((step, i) => {
                      const done = statusInfo.step > i + 1;
                      const active = statusInfo.step === i + 1;
                      return (
                        <div key={step} className="flex flex-col items-center z-10 gap-2">
                          <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'bg-amber-400 border-amber-400' : active ? 'bg-white border-amber-400' : 'bg-white border-zinc-300'}`}>
                            {done ? <CheckCircle className="h-4 w-4 text-white" /> : <span className={`text-xs font-bold font-sans ${active ? 'text-amber-500' : 'text-zinc-400'}`}>{i + 1}</span>}
                          </div>
                          <span className={`text-[10px] font-sans font-semibold text-center max-w-[60px] leading-tight ${active ? 'text-amber-600' : done ? 'text-zinc-700' : 'text-zinc-400'}`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Number */}
            {order.tracking_number && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <Truck className="h-5 w-5 text-blue-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 font-sans">UPS Tracking Number</p>
                  <p className="text-sm font-mono font-bold text-blue-900">{order.tracking_number}</p>
                  <a href={`https://www.ups.com/track?tracknum=${order.tracking_number}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline font-sans">Track on UPS.com →</a>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-700 mb-4 font-sans uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Your Items
              </h3>
              <div className="space-y-3">
                {order.order_items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{item.products?.name || 'Product'}</p>
                      <p className="text-xs text-zinc-500 font-sans">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-zinc-900">₹{(item.price_at_time * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2">
                  <p className="text-sm font-bold text-zinc-900 font-sans">Total</p>
                  <p className="text-base font-bold" style={{ color: '#d4af37' }}>₹{order.total?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Shipping To */}
            {order.shipping_addresses && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-zinc-500 font-sans uppercase tracking-wider mb-1">Shipping To</p>
                  <p className="text-sm font-bold text-zinc-900">{order.shipping_addresses.full_name}</p>
                  <p className="text-sm text-zinc-600 font-sans">{order.shipping_addresses.city}, {order.shipping_addresses.country}</p>
                </div>
              </div>
            )}

            {/* Placed On */}
            <p className="text-center text-xs text-zinc-400 font-sans">
              Order placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}

        {/* Help */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-400 font-sans">Need help? <a href="mailto:textileofrajasthan.info@gmail.com" className="underline" style={{ color: '#d4af37' }}>textileofrajasthan.info@gmail.com</a> or <a href="https://wa.me/919461858955" target="_blank" rel="noopener noreferrer" className="underline text-green-600">WhatsApp Us</a></p>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
