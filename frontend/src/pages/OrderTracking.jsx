import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { MagnifyingGlassIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const MOCK_ORDERS = {
  'PFH-001234': { status: 'In Transit', eta: 'May 23, 2024', origin: 'Varanasi, UP', steps: ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'], current: 3 },
  'PFH-005678': { status: 'Delivered', eta: 'May 18, 2024', origin: 'Jaipur, RJ', steps: ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'], current: 5 },
  'PFH-009999': { status: 'Processing', eta: 'May 26, 2024', origin: 'Mumbai, MH', steps: ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'], current: 1 },
};

export default function OrderTracking() {
  const [input, setInput] = useState('');
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    const found = MOCK_ORDERS[input.trim().toUpperCase()];
    if (found) { setOrder(found); setNotFound(false); }
    else { setOrder(null); setNotFound(true); }
  };

  return (
    <MainLayout title="Track Your Order – Gupta International" description="Track your order status in real time.">
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <TruckIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Track Your Order</h1>
          <p className="text-gray-500 text-lg">Enter your order number to see the latest status</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="flex gap-3 mb-12">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. PFH-001234"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-4 rounded-2xl transition-colors">
            Track
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center -mt-8 mb-10">Try: PFH-001234, PFH-005678, or PFH-009999</p>

        {/* Not Found */}
        {notFound && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-medium">Order not found. Please check the order number and try again.</p>
          </div>
        )}

        {/* Order Card */}
        {order && (
          <div className="bg-white/60 backdrop-blur-sm border border-white/80 rounded-3xl shadow-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="text-xl font-bold text-gray-900">{input.toUpperCase()}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                order.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-400 mb-1">Expected Delivery</p>
                <p className="font-semibold text-gray-800">{order.eta}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-400 mb-1">Shipped From</p>
                <p className="font-semibold text-gray-800">{order.origin}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="relative">
              <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gray-100" />
              <div className="space-y-6">
                {order.steps.map((step, i) => {
                  const done = i <= order.current;
                  const active = i === order.current;
                  return (
                    <div key={step} className="relative flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all ${
                        done ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'
                      } ${active ? 'ring-4 ring-indigo-100' : ''}`}>
                        {done ? <CheckCircleIcon className="w-5 h-5 text-white" /> : <span className="text-gray-300 text-sm font-bold">{i + 1}</span>}
                      </div>
                      <p className={`font-medium ${done ? 'text-gray-900' : 'text-gray-400'} ${active ? 'text-indigo-700' : ''}`}>
                        {step}
                        {active && <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Current</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
