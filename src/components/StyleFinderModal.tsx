'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, RotateCcw, ShoppingBag, Eye, Heart, Compass } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getOptimizedUrl } from '@/utils/imageUtils';
import Link from 'next/link';

interface StyleFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ id: string; name: string }>;
}

const OCCASIONS = [
  {
    id: 'evening_party',
    name: 'Evening Dinners & Parties',
    desc: 'Rich jewel tones, glowing velvet & intricate embroidery',
    icon: '🍷'
  },
  {
    id: 'wedding_festive',
    name: 'Weddings & Celebrations',
    desc: 'Regal statement pieces crafted for memorable moments',
    icon: '💍'
  },
  {
    id: 'winter_travel',
    name: 'Winter & Fall Travel / Holidays',
    desc: 'Cozy warmth, luxurious textures & effortless layering',
    icon: '🍂'
  },
  {
    id: 'casual_chic',
    name: 'Casual Chic & Daily Layering',
    desc: 'Artisanal day-to-night elegance with jeans or trousers',
    icon: '☕'
  },
  {
    id: 'bohemian_art',
    name: 'Art Galleries & Bohemian Gatherings',
    desc: 'Expressive traditional motifs & creative silhouettes',
    icon: '🎨'
  },
  {
    id: 'special_gift',
    name: 'Gifting a Loved One',
    desc: 'Universally loved, timeless handcrafted heirloom piece',
    icon: '🎁'
  }
];

const AI_STEPS = [
  'Analyzing your preferred silhouette & style profile...',
  'Scanning artisan hand-embroidered collection...',
  'Matching embroidery density & fabric weight...',
  'Finalizing bespoke curated picks for you...'
];

export const StyleFinderModal: React.FC<StyleFinderModalProps> = ({
  isOpen,
  onClose,
  categories
}) => {
  const { formatPrice, addToCart } = useCart();

  const [step, setStep] = useState<'category' | 'occasion' | 'analyzing' | 'results'>('category');
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<{ id: string; name: string } | null>(null);
  const [aiStepIndex, setAiStepIndex] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [liveCategories, setLiveCategories] = useState<Array<{ id: string; name: string }>>(categories || []);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveCategories(data.map((c: any) => ({ id: c.id, name: c.name })));
        }
      })
      .catch(() => {});
  }, []);

  const catsToUse = liveCategories.length > 0 ? liveCategories : categories;
  const availableCategories = (catsToUse && catsToUse.length > 0)
    ? catsToUse.filter(c => c.name.toLowerCase() !== 'uncategorized')
    : [
        { id: 'ee1ccb2f-e65c-46d7-9ec8-0e0fb84ecdf6', name: 'VELVET SUZANI JACKET' },
        { id: '40039886-343c-43b0-9074-e4ad2c647da4', name: 'COTTON SUZANI JACKET' },
        { id: '0e8de96e-2634-444a-bff5-5d1fcc71ac41', name: 'VELVET LONG SUZANI KIMONO' },
        { id: '51de4b8e-768c-47ee-92e2-a310f3b04568', name: 'COTTON LONG SUZANI KIMONO' },
        { id: 'fd358cd0-d535-4ce8-a031-e392315c39c7', name: 'VELVET SHORT KIMONO' },
        { id: 'ea347015-35b0-4e89-b512-4855dc3077c5', name: 'VELVET VEST' },
        { id: '6fc46e0a-837f-4841-895c-d7fa3af8c83c', name: 'Corduroy JACKET' }
      ];

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('category');
      setSelectedCategory(null);
      setSelectedOccasion(null);
      setRecommendedProducts([]);
      setAiStepIndex(0);
    }
  }, [isOpen]);

  // AI simulation effect
  useEffect(() => {
    if (step === 'analyzing') {
      const stepInterval = setInterval(() => {
        setAiStepIndex(prev => {
          if (prev < AI_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 850);

      const timer = setTimeout(() => {
        clearInterval(stepInterval);
        fetchRecommendations();
      }, 3400);

      return () => {
        clearInterval(stepInterval);
        clearTimeout(timer);
      };
    }
  }, [step, selectedCategory, selectedOccasion]);

  const fetchRecommendations = async () => {
    if (!selectedCategory || !selectedOccasion) return;
    setLoading(true);
    try {
      const res = await fetch('/api/recommendations/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory.id,
          categoryName: selectedCategory.name,
          occasion: selectedOccasion.name
        })
      });
      const data = await res.json();
      setRecommendedProducts(data.products || []);
      setStep('results');
    } catch (err) {
      console.error('Failed to match recommendations:', err);
      setStep('results');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (cat: { id: string; name: string }) => {
    setSelectedCategory(cat);
    setStep('occasion');
  };

  const handleSelectOccasion = (occ: { id: string; name: string }) => {
    setSelectedOccasion(occ);
    setAiStepIndex(0);
    setStep('analyzing');
  };

  const handleReset = () => {
    setStep('category');
    setSelectedCategory(null);
    setSelectedOccasion(null);
    setRecommendedProducts([]);
    setAiStepIndex(0);
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      sku: product.id,
      name: product.name,
      price_inr: product.sale_price || product.price,
      images: product.images || [product.image],
      category: selectedCategory?.name
    }, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-gold/30 rounded-2xl shadow-2xl overflow-hidden my-auto text-zinc-100">
        
        {/* Top Gold Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-gold/15 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="relative p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-zinc-100 tracking-wide flex items-center gap-2">
                Personal Style Recommendation
              </h2>
              <p className="text-[11px] text-gold/80 tracking-widest uppercase">
                Artisan Curation Assistant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: SELECT CATEGORY */}
          {step === 'category' && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto">
                <span className="inline-block text-[11px] font-semibold text-gold tracking-widest uppercase mb-1">
                  Step 1 of 2
                </span>
                <h3 className="text-xl font-serif font-bold text-zinc-100">
                  Which silhouette are you looking for?
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Choose the category you want our stylists to review for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-gold/10 hover:border-gold/60 text-left transition-all duration-200 group flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-gold transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Handcrafted in Jaipur</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT OCCASION */}
          {step === 'occasion' && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto">
                <span className="inline-block text-[11px] font-semibold text-gold tracking-widest uppercase mb-1">
                  Step 2 of 2 • {selectedCategory?.name}
                </span>
                <h3 className="text-xl font-serif font-bold text-zinc-100">
                  For what occasion or purpose?
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Tell us where you plan to wear this piece so we match the right embroidery and feel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() => handleSelectOccasion(occ)}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-gold/10 hover:border-gold/60 text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xl">{occ.icon}</span>
                      <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-gold transition-colors">
                        {occ.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 pl-8 leading-relaxed">
                      {occ.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep('category')}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                >
                  ← Back to Categories
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REALISTIC AI SIMULATION (3.5s) */}
          {step === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              {/* Animated Glowing AI Orb */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping opacity-30" />
                <div className="absolute inset-2 rounded-full border border-gold/50 animate-spin" style={{ animationDuration: '4s' }} />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600/40 via-gold/30 to-amber-300/40 border border-gold/60 flex items-center justify-center shadow-lg shadow-gold/20">
                  <Sparkles className="w-7 h-7 text-gold animate-bounce" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm">
                <p className="text-[11px] text-gold uppercase tracking-widest font-semibold">
                  AI Stylist Matching Engine
                </p>
                <h3 className="text-lg font-serif font-bold text-zinc-100 min-h-[56px] flex items-center justify-center">
                  {AI_STEPS[aiStepIndex]}
                </h3>
                <p className="text-xs text-zinc-500">
                  Evaluating {selectedCategory?.name} for {selectedOccasion?.name}...
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-gold transition-all duration-700 ease-out"
                  style={{ width: `${((aiStepIndex + 1) / AI_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 4: RECOMMENDATION RESULTS */}
          {step === 'results' && (
            <div className="space-y-6">
              {/* Personalized Stylist Message (as requested) */}
              <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 relative">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/50 flex-shrink-0 flex items-center justify-center text-gold mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-gold mb-1">
                      Stylist Curation Note
                    </h4>
                    <p className="text-xs md:text-sm text-zinc-200 leading-relaxed font-serif">
                      &ldquo;Based on customer purchases, your selected category (<span className="text-gold font-semibold">{selectedCategory?.name}</span>), purpose (<span className="text-gold font-semibold">{selectedOccasion?.name}</span>), and our personal stylist curation, here are our top recommended handcrafted jackets for you.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {recommendedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5 flex flex-col justify-between hover:border-gold/50 transition-all duration-200 group"
                    >
                      <div>
                        {/* Image */}
                        <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-zinc-800 mb-3">
                          <img
                            src={getOptimizedUrl(product.image, 400)}
                            alt={product.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm border border-gold/40 px-2 py-0.5 rounded text-[10px] text-gold font-medium">
                            Curated Match
                          </div>
                        </div>

                        {/* Title & Price */}
                        <h4 className="text-sm font-serif font-bold text-zinc-200 line-clamp-2 leading-tight">
                          {product.name}
                        </h4>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm font-bold text-gold">
                            {formatPrice(product.sale_price || product.price)}
                          </span>
                          {product.sale_price && product.price > product.sale_price && (
                            <span className="text-xs text-zinc-500 line-through">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                        <Link
                          href={`/product/${product.id}`}
                          onClick={onClose}
                          className="flex-1 py-2 px-3 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 text-center transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            addedProductId === product.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gold hover:bg-amber-400 text-zinc-950 shadow-md shadow-gold/20'
                          }`}
                        >
                          {addedProductId === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Bag</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center space-y-3">
                  <p className="text-sm text-zinc-400">
                    No exact items found for this specific filter right now.
                  </p>
                  <button
                    onClick={handleReset}
                    className="py-2 px-4 rounded-lg bg-gold text-zinc-950 font-bold text-xs"
                  >
                    Try Another Selection
                  </button>
                </div>
              )}

              {/* Reset / Try another */}
              <div className="pt-2 flex justify-between items-center border-t border-zinc-800">
                <button
                  onClick={handleReset}
                  className="text-xs text-zinc-400 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Choose Different Style or Occasion</span>
                </button>

                <button
                  onClick={onClose}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
