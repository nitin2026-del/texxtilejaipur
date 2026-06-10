'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CheckCircle2, ArrowRight, Loader2, PackageOpen } from 'lucide-react';
import Link from 'next/link';

function ReturnProcessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState('');
  const [step, setStep] = useState<'select' | 'success'>('select');

  useEffect(() => {
    if (!orderId) {
      setError('Invalid return link. Missing order ID.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/returns/process?orderId=${orderId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch order details');
        }

        setOrderData(data.order);
        setItems(data.items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItemIds = Object.keys(selectedItems).filter(id => selectedItems[id]);

    if (selectedItemIds.length === 0) {
      setError('Please select at least one item to return.');
      return;
    }

    if (!reason) {
      setError('Please select a reason for the return.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/returns/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          items: selectedItemIds,
          reason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process return');
      }

      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
      </div>
    );
  }

  if (error && step !== 'success') {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-6 max-w-lg mx-auto">
          <p className="font-bold mb-2">Error</p>
          <p>{error}</p>
          <Link href="/returns" className="block mt-4 text-brand-700 font-bold hover:underline">
            Back to Returns Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-zinc-100">
        {step === 'select' ? (
          <>
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-100">
              <div className="p-3 bg-brand-50 rounded-xl">
                <PackageOpen className="h-6 w-6 text-brand-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">Select Items to Return</h1>
                <p className="text-sm text-zinc-500">Order: {orderId}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-4">Items in Order</h2>
                {items.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No items found for this order.</p>
                ) : (
                  items.map((item) => (
                    <label 
                      key={item.id} 
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedItems[item.id] ? 'border-brand-500 bg-brand-50/50' : 'border-zinc-200 hover:border-zinc-300'}`}
                    >
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-brand-700"
                        checked={!!selectedItems[item.id]}
                        onChange={() => handleToggleItem(item.id)}
                      />
                      <div className="flex-1">
                        <p className="font-bold text-zinc-900">{item.products?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-zinc-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-zinc-900">₹{(item.price_at_time * item.quantity).toLocaleString()}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-3 uppercase tracking-widest">Reason for Return</label>
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none appearance-none"
                >
                  <option value="" disabled>Select a reason...</option>
                  <option value="size_too_small">Size is too small</option>
                  <option value="size_too_large">Size is too large</option>
                  <option value="defective">Item was defective or damaged</option>
                  <option value="not_as_pictured">Item doesn't match description/pictures</option>
                  <option value="changed_mind">Changed my mind</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-4 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-8"
              >
                {submitting ? 'Submitting...' : (
                  <>Submit Return Request <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-zinc-900 mb-4">Request Submitted</h2>
            <p className="text-zinc-600 mb-8 max-w-md mx-auto">
              Your return request for order <strong>{orderId}</strong> has been received. We've sent a confirmation email with further instructions.
            </p>
            <Link 
              href="/"
              className="inline-block bg-zinc-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Return to Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProcessReturnPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-zinc-900 pb-24">
      <Navbar onCartOpen={() => {}} />
      <div className="pt-32">
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
          </div>
        }>
          <ReturnProcessContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
