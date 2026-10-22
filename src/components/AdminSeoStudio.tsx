'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  ArrowRight, 
  Globe, 
  Tag, 
  Palette, 
  Sliders, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Zap,
  Layers,
  FileText
} from 'lucide-react';

interface AuditedProduct {
  id: string;
  name: string;
  sku: string;
  hasSeoTitle: boolean;
  hasSeoDescription: boolean;
  hasVisionAnalysis: boolean;
  hasTranslations: boolean;
  isFullyOptimized: boolean;
  primaryImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

interface SeoStats {
  totalProducts: number;
  healthScore: number;
  missingSeoTitle: number;
  missingSeoDescription: number;
  missingVisionAnalysis: number;
  missingTranslations: number;
  fullyOptimized: number;
}

export function AdminSeoStudio({ onEditProduct }: { onEditProduct?: (productId: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SeoStats | null>(null);
  const [products, setProducts] = useState<AuditedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'needs_seo' | 'optimized'>('all');
  
  // Single Optimization State
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);

  // Batch Runner State
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, activeName: '' });
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchScanData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seo-copywriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan' })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setStats(data.stats);
      setProducts(data.products || []);
    } catch (err: any) {
      console.error('Scan error:', err);
      showNotification(err.message || 'Failed to scan catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanData();
  }, []);

  const handleOptimizeSingle = async (prod: AuditedProduct) => {
    setOptimizingId(prod.id);
    try {
      const res = await fetch('/api/admin/seo-copywriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'single',
          productId: prod.id,
          autoSave: true
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showNotification(`Optimized "${prod.name}" successfully! ✨`, 'success');
      setPreviewProduct({
        ...data.data,
        productName: prod.name,
        primaryImage: prod.primaryImage,
        sku: prod.sku
      });

      // Update local state
      setProducts(prev => prev.map(p => {
        if (p.id === prod.id) {
          return {
            ...p,
            hasSeoTitle: true,
            hasSeoDescription: true,
            hasVisionAnalysis: true,
            hasTranslations: true,
            isFullyOptimized: true,
            seoTitle: data.data.seoTitle,
            seoDescription: data.data.seoDescription
          };
        }
        return p;
      }));

      // Update stats
      if (stats) {
        setStats({
          ...stats,
          missingSeoTitle: Math.max(0, stats.missingSeoTitle - 1),
          missingSeoDescription: Math.max(0, stats.missingSeoDescription - 1),
          fullyOptimized: stats.fullyOptimized + 1,
          healthScore: Math.min(100, Math.round(((stats.fullyOptimized + 1) / stats.totalProducts) * 100))
        });
      }
    } catch (err: any) {
      console.error('Optimize error:', err);
      showNotification(err.message || 'Optimization failed', 'error');
    } finally {
      setOptimizingId(null);
    }
  };

  const handleRunBatchOptimization = async () => {
    const unoptimized = products.filter(p => !p.isFullyOptimized);
    if (unoptimized.length === 0) {
      showNotification('All catalog products are already fully optimized!', 'success');
      return;
    }

    if (!confirm(`Run Automated Vision Analysis & SEO Copywriting on ${unoptimized.length} products? This will examine images and generate optimized SEO titles, descriptions, and tags.`)) {
      return;
    }

    setIsBatchRunning(true);
    setBatchProgress({ current: 0, total: unoptimized.length, activeName: unoptimized[0]?.name || '' });

    let successCount = 0;

    for (let i = 0; i < unoptimized.length; i++) {
      const prod = unoptimized[i];
      setBatchProgress({ current: i + 1, total: unoptimized.length, activeName: prod.name });

      try {
        const res = await fetch('/api/admin/seo-copywriting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'single',
            productId: prod.id,
            autoSave: true
          })
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
          setProducts(prev => prev.map(p => {
            if (p.id === prod.id) {
              return {
                ...p,
                hasSeoTitle: true,
                hasSeoDescription: true,
                hasVisionAnalysis: true,
                hasTranslations: true,
                isFullyOptimized: true,
                seoTitle: data.data.seoTitle,
                seoDescription: data.data.seoDescription
              };
            }
            return p;
          }));
        }
      } catch (err) {
        console.error('Failed for:', prod.name, err);
      }

      // Safe pacing delay
      if (i < unoptimized.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    setIsBatchRunning(false);
    showNotification(`Batch complete! Successfully optimized ${successCount} products.`, 'success');
    fetchScanData();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.seoTitle || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'needs_seo') return !p.isFullyOptimized;
    if (filterMode === 'optimized') return p.isFullyOptimized;
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {notification && (
        <div className={`rounded-xl p-4 text-xs font-semibold flex items-center gap-2 border shadow-lg animate-fadeIn ${
          notification.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300' 
            : 'bg-red-950/40 border-red-900/60 text-red-300'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Hero Header & Metrics */}
      <div className="glass-card rounded-3xl border border-zinc-200 p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-xl shadow-md">
                <Sparkles className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">
                AI Vision & SEO Copywriting Studio
              </h2>
            </div>
            <p className="text-xs text-zinc-600 mt-1 max-w-2xl">
              Multimodal image inspection, visual color palette & embroidery motif extraction, and automated Google SEO copywriting designed specifically for Textile Jaipur&apos;s international luxury clientele.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchScanData}
              disabled={loading || isBatchRunning}
              className="px-4 py-2 border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 hover:text-zinc-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Scan Health
            </button>

            <button
              onClick={handleRunBatchOptimization}
              disabled={loading || isBatchRunning || (stats?.healthScore === 100)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isBatchRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-white" />}
              {isBatchRunning 
                ? `Analyzing (${batchProgress.current}/${batchProgress.total})...` 
                : 'Auto-Optimize All Missing SEO'}
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Catalog SEO Health</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${
                (stats?.healthScore || 0) >= 80 ? 'text-emerald-600' : (stats?.healthScore || 0) >= 50 ? 'text-amber-600' : 'text-red-500'
              }`}>
                {stats?.healthScore || 0}%
              </span>
              <span className="text-[10px] text-zinc-400">Score</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden mt-2">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${stats?.healthScore || 0}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Products</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-zinc-900">{stats?.totalProducts || 0}</span>
              <span className="text-[10px] text-zinc-400">items</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">In active database</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Missing SEO Titles</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black ${(stats?.missingSeoTitle || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {stats?.missingSeoTitle || 0}
              </span>
              <span className="text-[10px] text-zinc-400">unoptimized</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">Lacks search meta title</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Missing Meta Descs</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black ${(stats?.missingSeoDescription || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {stats?.missingSeoDescription || 0}
              </span>
              <span className="text-[10px] text-zinc-400">unoptimized</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">Lacks snippet copy</p>
          </div>
        </div>

        {/* Live Batch Progress Bar */}
        {isBatchRunning && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                <span className="font-bold text-amber-900">
                  Processing Product {batchProgress.current} of {batchProgress.total}:
                </span>
                <span className="font-semibold text-zinc-700 truncate max-w-xs">{batchProgress.activeName}</span>
              </div>
              <span className="font-mono font-bold text-amber-800">
                {Math.round((batchProgress.current / batchProgress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterMode === 'all' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border border-zinc-200'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('needs_seo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterMode === 'needs_seo' ? 'bg-amber-600 text-white' : 'bg-white text-zinc-600 border border-zinc-200'
            }`}
          >
            Needs Optimization ({products.filter(p => !p.isFullyOptimized).length})
          </button>
          <button
            onClick={() => setFilterMode('optimized')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterMode === 'optimized' ? 'bg-emerald-600 text-white' : 'bg-white text-zinc-600 border border-zinc-200'
            }`}
          >
            Optimized ({products.filter(p => p.isFullyOptimized).length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
          />
        </div>
      </div>

      {/* Catalog Table */}
      <div className="glass-card rounded-3xl border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-zinc-500">Auditing product image metadata and SEO health...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-zinc-800">No matching products found</p>
            <p className="text-xs text-zinc-500">All products in this category may already be optimized.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/70 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                  <th className="p-4">Product & Visual</th>
                  <th className="p-4">SEO Title (Target 55-65 ch)</th>
                  <th className="p-4">Meta Description (150-160 ch)</th>
                  <th className="p-4 text-center">Vision Tags</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 bg-white">
                {filteredProducts.map((prod) => {
                  const isOptimizing = optimizingId === prod.id;
                  const titleLen = prod.seoTitle?.length || 0;
                  const descLen = prod.seoDescription?.length || 0;

                  return (
                    <tr key={prod.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="h-14 w-14 rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200 shrink-0 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={prod.primaryImage || 'https://via.placeholder.com/80'} 
                            alt={prod.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="block font-bold text-zinc-900 leading-snug">{prod.name}</span>
                          <span className="font-mono text-[10px] text-zinc-400">{prod.sku}</span>
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        {prod.seoTitle ? (
                          <div className="space-y-1">
                            <span className="block font-semibold text-zinc-800 line-clamp-2">{prod.seoTitle}</span>
                            <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              titleLen >= 50 && titleLen <= 68 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {titleLen} characters {titleLen >= 50 && titleLen <= 68 ? '✓ Optimal' : '(Needs adjustment)'}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-1 rounded-md">
                            <AlertCircle className="h-3 w-3" /> Missing SEO Title
                          </span>
                        )}
                      </td>

                      <td className="p-4 max-w-sm">
                        {prod.seoDescription ? (
                          <div className="space-y-1">
                            <span className="block text-zinc-600 line-clamp-2 text-[11px] leading-relaxed">
                              {prod.seoDescription}
                            </span>
                            <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              descLen >= 145 && descLen <= 165 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {descLen} characters {descLen >= 145 && descLen <= 165 ? '✓ Optimal' : '(Needs adjustment)'}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-1 rounded-md">
                            <AlertCircle className="h-3 w-3" /> Missing Meta Description
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {prod.hasVisionAnalysis ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle className="h-3 w-3" /> Visual Tags
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-500 text-[10px] font-medium px-2 py-0.5 rounded-full">
                              Unanalyzed
                            </span>
                          )}
                          {prod.hasTranslations && (
                            <span className="text-[9px] text-zinc-400 font-medium">4 Languages (FR/ES/DE/AR)</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOptimizeSingle(prod)}
                          disabled={isOptimizing || isBatchRunning}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] font-bold shadow-sm flex items-center gap-1 mx-auto transition-all disabled:opacity-50"
                        >
                          {isOptimizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          {isOptimizing ? 'Analyzing...' : prod.isFullyOptimized ? 'Re-Analyze' : 'Optimize Now'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 space-y-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-zinc-900">
                  AI Vision & SEO Results: {previewProduct.productName}
                </h3>
              </div>
              <button
                onClick={() => setPreviewProduct(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Google SERP Card Preview */}
            <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                Google Search Result Preview (Desktop & Mobile)
              </span>
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <span>https://textilejaipur.com</span>
                <span>›</span>
                <span>product</span>
                <span>›</span>
                <span className="truncate">{previewProduct.sku}</span>
              </div>
              <h4 className="text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer">
                {previewProduct.seoTitle}
              </h4>
              <p className="text-xs text-[#4d5156] leading-relaxed">
                {previewProduct.seoDescription}
              </p>
            </div>

            {/* Extracted Image Vision Attributes */}
            <div className="border border-amber-200 bg-amber-50/50 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" /> Extracted Vision Attributes
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block">Dominant Color:</span>
                  <span className="font-bold text-zinc-800">{previewProduct.imageAnalysis?.colorPalette?.dominant}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block">Craft Technique:</span>
                  <span className="font-bold text-zinc-800">{previewProduct.imageAnalysis?.craftTechnique}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block">Silhouette:</span>
                  <span className="font-bold text-zinc-800">{previewProduct.imageAnalysis?.garmentSilhouette}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block">Aesthetic Mood:</span>
                  <span className="font-bold text-zinc-800">{previewProduct.imageAnalysis?.aestheticMood}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block">Fabric Texture:</span>
                  <span className="font-bold text-zinc-800">{previewProduct.imageAnalysis?.fabricTexture}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block">Artisan Provenance:</span>
                  <span className="font-bold text-zinc-800">{previewProduct.imageAnalysis?.artisanProvenance}</span>
                </div>
              </div>
            </div>

            {/* Focus Keywords */}
            <div>
              <span className="text-xs font-bold text-zinc-700 block mb-2">High-Volume Focus Keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {previewProduct.seoKeywords?.map((kw: string, i: number) => (
                  <span key={i} className="text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-full">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Generated Narrative Description */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-700 block">Artisan Storytelling Description:</span>
              <p className="text-xs text-zinc-600 bg-zinc-50 p-4 rounded-xl border border-zinc-200 whitespace-pre-line leading-relaxed">
                {previewProduct.productDescription}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewProduct(null)}
                className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
