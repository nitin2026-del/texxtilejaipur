'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Check, Plus, Trash2, Search, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price?: number;
  price_inr?: number;
  sale_price?: number;
  category_id?: string;
  category?: string;
  image_url?: string;
  images?: string[];
  product_images?: Array<{ url: string; is_primary?: boolean; display_order?: number }>;
}

interface Category {
  id: string;
  name: string;
}

interface AdminRecommendationsConfigProps {
  products: any[];
  categories: Category[];
  showToast?: (msg: string, type: 'success' | 'error') => void;
}

const DEFAULT_OCCASIONS = [
  { id: 'evening_party', name: 'Evening Dinners & Parties' },
  { id: 'wedding_festive', name: 'Weddings & Celebrations' },
  { id: 'winter_travel', name: 'Winter & Fall Travel / Holidays' },
  { id: 'casual_chic', name: 'Casual Chic & Daily Layering' },
  { id: 'bohemian_art', name: 'Art Galleries & Bohemian Gatherings' },
  { id: 'special_gift', name: 'Gifting a Loved One' }
];

export const AdminRecommendationsConfig: React.FC<AdminRecommendationsConfigProps> = ({
  products,
  categories,
  showToast
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>(DEFAULT_OCCASIONS[0].name);
  const [rules, setRules] = useState<Record<string, { product_ids: string[]; note?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Set default category
  useEffect(() => {
    if (categories.length > 0 && !selectedCatId) {
      const valid = categories.find(c => c.name.toLowerCase() !== 'uncategorized') || categories[0];
      setSelectedCatId(valid.id);
    }
  }, [categories, selectedCatId]);

  // Load existing rules from API
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/recommendations');
      const data = await res.json();
      setRules(data.rules || {});
    } catch (err) {
      console.error('Failed to load recommendation rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const ruleKey = `${selectedCatId}___${selectedOccasion}`;
  const currentAssignedIds: string[] = rules[ruleKey]?.product_ids || [];

  const handleToggleProduct = (prodId: string) => {
    const isAssigned = currentAssignedIds.includes(prodId);
    let updatedIds: string[];
    if (isAssigned) {
      updatedIds = currentAssignedIds.filter(id => id !== prodId);
    } else {
      updatedIds = [...currentAssignedIds, prodId];
    }

    setRules(prev => ({
      ...prev,
      [ruleKey]: {
        ...prev[ruleKey],
        product_ids: updatedIds
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      if (showToast) showToast('AI Recommendation rules saved successfully!', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Failed to save recommendations', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectedCategoryObj = categories.find(c => c.id === selectedCatId);

  // Products belonging to the selected category (match either category_id or category name)
  const categoryProducts = products.filter(p => {
    if (p.category_id && p.category_id === selectedCatId) return true;
    if (p.category && selectedCategoryObj && p.category.toLowerCase() === selectedCategoryObj.name.toLowerCase()) return true;
    return false;
  });

  // Search filter
  const filteredProducts = categoryProducts.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductImage = (p: any) => {
    if (p.product_images && p.product_images.length > 0) {
      return p.product_images[0].url;
    }
    if (p.images && p.images.length > 0) {
      return p.images[0];
    }
    return p.image_url || '/placeholder.jpg';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Sparkles className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-serif font-bold text-zinc-900">
              AI Style Recommendations Manager
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
            Control which handcrafted jackets are recommended when customers use the Style Finder. Pick the category, select the purpose/occasion, and choose the exact jackets to showcase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRules}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Recommendations</span>
          </button>
        </div>
      </div>

      {/* Selector Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Category Selector */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            1. Select Category
          </label>
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-amber-500"
          >
            {/* Group into AI Stylist 3 Categories & Other categories */}
            <optgroup label="✨ AI Stylist Categories (Customer Active)">
              {categories
                .filter(cat => ['velvet suzani jacket', 'cotton suzani jacket', 'tnt suzani jacket'].includes(cat.name.toLowerCase().trim()))
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    ⭐ {cat.name} ({products.filter(p => p.category_id === cat.id || (p.category && p.category.toLowerCase() === cat.name.toLowerCase())).length} jackets)
                  </option>
                ))}
            </optgroup>
            <optgroup label="Other Store Categories">
              {categories
                .filter(cat => !['velvet suzani jacket', 'cotton suzani jacket', 'tnt suzani jacket', 'uncategorized'].includes(cat.name.toLowerCase().trim()))
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({products.filter(p => p.category_id === cat.id || (p.category && p.category.toLowerCase() === cat.name.toLowerCase())).length} items)
                  </option>
                ))}
            </optgroup>
          </select>
          <p className="text-[11px] text-zinc-500">
            Select the jacket/kimono category the customer inquired about.
          </p>
        </div>

        {/* 2. Occasion Selector */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
            2. Select Purpose / Occasion
          </label>
          <select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-amber-500"
          >
            {DEFAULT_OCCASIONS.map((occ) => (
              <option key={occ.id} value={occ.name}>
                {occ.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-500">
            The customer occasion or event to tailor the recommendation for.
          </p>
        </div>
      </div>

      {/* Preview Customer Message */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-orange-50 border border-amber-300/60 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Customer Experience Note Preview
            </h4>
            <p className="text-xs md:text-sm text-zinc-800 font-serif mt-1 leading-relaxed">
              &ldquo;Based on customer purchases, your selected category (<span className="font-bold text-amber-900">{selectedCategoryObj?.name || 'Selected Category'}</span>), purpose (<span className="font-bold text-amber-900">{selectedOccasion}</span>), and our personal stylist curation, here are our top recommended handcrafted jackets for you.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Currently Selected Showcase */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <span>Showcased Jackets for this combination</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                {currentAssignedIds.length} selected
              </span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              These will be shown first to the customer when they pick this category and purpose.
            </p>
          </div>
          {currentAssignedIds.length === 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
              ✨ Automatic Fallback: System will show top bestsellers of this category until you select specific jackets.
            </span>
          )}
        </div>

        {currentAssignedIds.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {currentAssignedIds.map(id => {
              const prod = products.find(p => p.id === id);
              if (!prod) return null;
              return (
                <div
                  key={id}
                  className="group relative rounded-xl border-2 border-amber-500 bg-amber-50/20 p-2 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-zinc-100 relative mb-2">
                    <img
                      src={getProductImage(prod)}
                      alt={prod.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <button
                      onClick={() => handleToggleProduct(id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors"
                      title="Remove from recommendations"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 line-clamp-1 leading-tight">
                      {prod.name}
                    </p>
                    <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
                      ₹{prod.sale_price || prod.price_inr || prod.price}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50">
            <p className="text-xs text-zinc-500">
              No specific products selected yet. Click any jacket below to add it to this recommendation!
            </p>
          </div>
        )}
      </div>

      {/* Available Products Picker */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Pick Jackets from {selectedCategoryObj?.name || 'Category'} ({filteredProducts.length})
            </h3>
            <p className="text-xs text-zinc-500">
              Click &ldquo;Select&rdquo; to add or remove a jacket from this occasion recommendation.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search jacket by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredProducts.map((prod) => {
            const isSelected = currentAssignedIds.includes(prod.id);
            return (
              <div
                key={prod.id}
                onClick={() => handleToggleProduct(prod.id)}
                className={`cursor-pointer rounded-xl border p-2 transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-400/50 shadow-md'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-zinc-100 relative mb-2">
                    <img
                      src={getProductImage(prod)}
                      alt={prod.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <div
                      className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-white/90 text-zinc-400 hover:text-zinc-700'
                      }`}
                    >
                      {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-zinc-900 line-clamp-2 leading-tight">
                    {prod.name}
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700">
                    ₹{prod.sale_price || prod.price_inr || prod.price}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-amber-600 text-white' : 'text-zinc-500 bg-zinc-100'
                  }`}>
                    {isSelected ? 'Selected' : 'Add'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-xs text-zinc-500">
            No products match your search in this category.
          </div>
        )}
      </div>
    </div>
  );
};
