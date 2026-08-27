'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Save, Truck } from 'lucide-react';

export function AdminShippingConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [config, setConfig] = useState({
    standard_price: 0,
    express_price: 10,
    is_free_shipping: true
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/shipping-config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/shipping-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (res.ok) {
        setMessage('Shipping configuration saved successfully!');
      } else {
        setMessage('Failed to save configuration.');
      }
    } catch (err) {
      setMessage('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-700" /></div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
        <div className="bg-brand-50 p-2 rounded-lg">
          <Truck className="h-6 w-6 text-brand-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Delivery & Shipping Rates</h2>
          <p className="text-sm text-zinc-500">Configure your global shipping charges.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <div className="space-y-6 max-w-lg">
        {/* Free Shipping Toggle */}
        <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
          <div>
            <h3 className="font-bold text-zinc-900">Enable Free Standard Delivery</h3>
            <p className="text-xs text-zinc-500 mt-1">When toggled ON, standard delivery is entirely free regardless of the price set below.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={config.is_free_shipping}
              onChange={(e) => setConfig({ ...config, is_free_shipping: e.target.checked })}
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-700 mb-2">Standard Shipping Charge ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={config.standard_price}
            onChange={(e) => setConfig({ ...config, standard_price: parseFloat(e.target.value) || 0 })}
            disabled={config.is_free_shipping}
            className={`w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand-500 outline-none ${config.is_free_shipping ? 'bg-zinc-100 opacity-50' : 'bg-white'}`}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-700 mb-2">Express Shipping Charge ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={config.express_price}
            onChange={(e) => setConfig({ ...config, express_price: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand-500 outline-none bg-white"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-700 hover:bg-brand-800 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 mt-4"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Shipping Configuration
        </button>
      </div>
    </div>
  );
}
