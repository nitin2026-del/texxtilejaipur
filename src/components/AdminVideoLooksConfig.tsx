'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getOptimizedUrl } from '@/utils/imageUtils';
import { Loader2, Video, Plus, Trash2, ArrowUp, ArrowDown, X, Star, Copy, Check, ExternalLink, Search, Save, Info } from 'lucide-react';
import {
  VIDEO_LOOKS_KEY,
  VIDEO_LOOKS_MAX_PRODUCTS,
  VIDEO_LOOKS_PARAM,
  VideoLookCampaign,
  VideoLooksConfig,
  sanitizeLookSlug
} from '@/lib/videoLooks';

type AdminProduct = { id: string; name: string; price: number; images: string[]; category: string };

const SITE_URL = 'https://textilejaipur.com';

const emptyCampaign = (existing: VideoLookCampaign[]): VideoLookCampaign => {
  let n = existing.length + 1;
  while (existing.some((c) => sanitizeLookSlug(c.slug) === `video${n}`)) n++;
  return { slug: `video${n}`, headline: '', active: true, product_ids: [], landing_product_id: '', thumbs: {} };
};

export const AdminVideoLooksConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [campaigns, setCampaigns] = useState<VideoLookCampaign[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<VideoLookCampaign | null>(null);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const flash = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: settings }, { data: prodRows }] = await Promise.all([
        supabase.from('site_settings').select('value').eq('key', VIDEO_LOOKS_KEY).maybeSingle(),
        supabase
          .from('products')
          .select('id,name,price,display_rank,categories(name),product_images(url,display_order)')
          .order('display_rank', { ascending: true })
      ]);
      const cfg = (settings?.value || { campaigns: [] }) as VideoLooksConfig;
      setCampaigns(Array.isArray(cfg.campaigns) ? cfg.campaigns : []);
      setProducts(
        (prodRows || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price || 0,
          category: p.categories?.name || '',
          images: [...(p.product_images || [])]
            .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
            .map((i: any) => i.url)
        }))
      );
    } catch (err) {
      console.error('Failed to load video looks', err);
      flash('Failed to load video looks config', 'error');
    } finally {
      setLoading(false);
    }
  };

  const productById = useMemo(() => {
    const m: Record<string, AdminProduct> = {};
    products.forEach((p) => { m[p.id] = p; });
    return m;
  }, [products]);

  const persist = async (next: VideoLookCampaign[]) => {
    setSaving(true);
    try {
      const payload = { key: VIDEO_LOOKS_KEY, value: { campaigns: next } };
      const { data: existing } = await supabase.from('site_settings').select('key').eq('key', VIDEO_LOOKS_KEY).maybeSingle();
      const { error } = existing?.key
        ? await supabase.from('site_settings').update(payload).eq('key', VIDEO_LOOKS_KEY)
        : await supabase.from('site_settings').insert([payload]);
      if (error) throw error;
      setCampaigns(next);
      return true;
    } catch (err: any) {
      console.error('Failed to save video looks', err);
      flash(err?.message || 'Failed to save', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const startNew = () => {
    setDraft(emptyCampaign(campaigns));
    setEditingIdx(-1);
    setSearch('');
  };

  const startEdit = (idx: number) => {
    setDraft(JSON.parse(JSON.stringify(campaigns[idx])));
    setEditingIdx(idx);
    setSearch('');
  };

  const cancelEdit = () => { setDraft(null); setEditingIdx(null); };

  const saveDraft = async () => {
    if (!draft) return;
    const slug = sanitizeLookSlug(draft.slug);
    if (!slug) return flash('Please enter a link name (e.g. video1)', 'error');
    if (campaigns.some((c, i) => i !== editingIdx && sanitizeLookSlug(c.slug) === slug)) {
      return flash(`Link name "${slug}" is already used by another campaign`, 'error');
    }
    if (draft.product_ids.length < 2) return flash('Add at least 2 jackets', 'error');
    const landing = draft.landing_product_id && draft.product_ids.includes(draft.landing_product_id)
      ? draft.landing_product_id
      : draft.product_ids[0];
    const thumbs: Record<string, string> = {};
    draft.product_ids.forEach((pid) => { if (draft.thumbs?.[pid]) thumbs[pid] = draft.thumbs[pid]; });
    const clean: VideoLookCampaign = {
      ...draft,
      slug,
      headline: (draft.headline || '').trim(),
      landing_product_id: landing,
      thumbs,
      updated_at: new Date().toISOString()
    };
    const next = [...campaigns];
    if (editingIdx === -1 || editingIdx === null) next.push(clean); else next[editingIdx] = clean;
    if (await persist(next)) {
      flash('Video look saved. Live on the site within a few seconds.', 'success');
      cancelEdit();
    }
  };

  const toggleActive = async (idx: number) => {
    const next = campaigns.map((c, i) => (i === idx ? { ...c, active: !c.active, updated_at: new Date().toISOString() } : c));
    if (await persist(next)) flash(next[idx].active ? 'Switcher turned ON' : 'Switcher turned OFF', 'success');
  };

  const deleteCampaign = async (idx: number) => {
    if (!confirm(`Delete video look "${campaigns[idx].slug}"? Ads using this link will show the normal product page.`)) return;
    const next = campaigns.filter((_, i) => i !== idx);
    if (await persist(next)) flash('Video look deleted', 'success');
  };

  const adUrl = (c: VideoLookCampaign) => {
    const landing = c.landing_product_id || c.product_ids[0];
    return landing ? `${SITE_URL}/product/${landing}?${VIDEO_LOOKS_PARAM}=${sanitizeLookSlug(c.slug)}` : '';
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  // ── Draft helpers ──
  const addProduct = (pid: string) => {
    if (!draft || draft.product_ids.includes(pid) || draft.product_ids.length >= VIDEO_LOOKS_MAX_PRODUCTS) return;
    setDraft({
      ...draft,
      product_ids: [...draft.product_ids, pid],
      landing_product_id: draft.landing_product_id || pid
    });
  };
  const removeProduct = (pid: string) => {
    if (!draft) return;
    const ids = draft.product_ids.filter((x) => x !== pid);
    const thumbs = { ...(draft.thumbs || {}) };
    delete thumbs[pid];
    setDraft({ ...draft, product_ids: ids, thumbs, landing_product_id: draft.landing_product_id === pid ? (ids[0] || '') : draft.landing_product_id });
  };
  const move = (idx: number, dir: -1 | 1) => {
    if (!draft) return;
    const ids = [...draft.product_ids];
    const j = idx + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[idx], ids[j]] = [ids[j], ids[idx]];
    setDraft({ ...draft, product_ids: ids });
  };
  const setThumb = (pid: string, url: string) => {
    if (!draft) return;
    setDraft({ ...draft, thumbs: { ...(draft.thumbs || {}), [pid]: url } });
  };

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !draft) return [];
    return products
      .filter((p) => !draft.product_ids.includes(p.id))
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.startsWith(q))
      .slice(0, 12);
  }, [search, products, draft]);

  if (loading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" /></div>;

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-zinc-900 flex items-center gap-2">
            <Video className="h-6 w-6 text-brand-700" />
            Video Ad Looks
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Let ad visitors switch between all jackets from a video on one product page, without opening other pages.
          </p>
        </div>
        {draft === null && (
          <button onClick={startNew} className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800">
            <Plus className="h-4 w-4" /> New Video Look
          </button>
        )}
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6">
        <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-1"><Info className="h-4 w-4" /> How it works</h4>
        <p className="text-xs text-blue-700 leading-relaxed">
          1. Create a look and add the jackets from your video (in the order they appear).<br />
          2. Pick the landing jacket (★). Copy the <strong>Ad URL</strong> and paste it as the website URL in Meta Ads Manager.<br />
          3. Only visitors who open that exact link see the switcher. Normal/Google visitors see the regular page. Turning a look OFF instantly shows the normal page to ad traffic.
        </p>
      </div>

      {/* ── EDITOR ── */}
      {draft !== null ? (
        <div className="border border-zinc-200 rounded-2xl p-5 space-y-6 bg-zinc-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">Link name (used in the ad URL)</label>
              <div className="flex items-center rounded-lg border border-zinc-300 bg-white overflow-hidden">
                <span className="px-3 text-xs text-zinc-400 border-r border-zinc-200 py-2.5 bg-zinc-50">?{VIDEO_LOOKS_PARAM}=</span>
                <input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  onBlur={(e) => setDraft({ ...draft, slug: sanitizeLookSlug(e.target.value) })}
                  placeholder="video1"
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">Headline on the image (optional)</label>
              <input
                value={draft.headline || ''}
                onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                placeholder={`${Math.max(draft.product_ids.length, 2)} jackets from the video · tap to switch`}
                maxLength={60}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Jackets in this video ({draft.product_ids.length}/{VIDEO_LOOKS_MAX_PRODUCTS})
            </label>
            <div className="relative">
              <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={draft.product_ids.length >= VIDEO_LOOKS_MAX_PRODUCTS ? 'Maximum reached' : 'Search jackets by name or category to add…'}
                disabled={draft.product_ids.length >= VIDEO_LOOKS_MAX_PRODUCTS}
                className="w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none disabled:bg-zinc-100"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 border border-zinc-200 rounded-xl bg-white divide-y divide-zinc-100 max-h-72 overflow-y-auto shadow-sm">
                {searchResults.map((p) => (
                  <button key={p.id} onClick={() => { addProduct(p.id); setSearch(''); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 text-left">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getOptimizedUrl(p.images[0], 80)} alt="" className="h-10 w-10 rounded object-cover border border-zinc-200" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-800 truncate">{p.name}</p>
                      <p className="text-[11px] text-zinc-400">{p.category} · ₹{p.price}</p>
                    </div>
                    <Plus className="h-4 w-4 text-zinc-400" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-3">
              {draft.product_ids.length === 0 && (
                <p className="text-xs text-zinc-400 italic">No jackets added yet.</p>
              )}
              {draft.product_ids.map((pid, idx) => {
                const p = productById[pid];
                const isLanding = draft.landing_product_id === pid;
                const thumb = draft.thumbs?.[pid] || p?.images?.[0];
                return (
                  <div key={pid} className={`rounded-xl border bg-white p-3 ${isLanding ? 'border-amber-400 ring-1 ring-amber-200' : 'border-zinc-200'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-400 w-5 text-center">{idx + 1}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getOptimizedUrl(thumb, 100)} alt="" className="h-12 w-12 rounded-full object-cover border border-zinc-200" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-zinc-800 truncate">{p?.name || `Missing product (${pid.slice(0, 8)})`}</p>
                        <p className="text-[11px] text-zinc-400">{p ? `${p.category} · ₹${p.price}` : 'This product no longer exists — remove it'}</p>
                      </div>
                      <button
                        onClick={() => setDraft({ ...draft, landing_product_id: pid })}
                        title="Use as landing jacket (ad opens on this one)"
                        className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 ${isLanding ? 'bg-amber-100 text-amber-700' : 'text-zinc-400 hover:bg-zinc-100'}`}
                      >
                        <Star className={`h-4 w-4 ${isLanding ? 'fill-amber-500 text-amber-500' : ''}`} />
                        <span className="hidden md:inline">{isLanding ? 'Landing' : 'Set landing'}</span>
                      </button>
                      <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => move(idx, 1)} disabled={idx === draft.product_ids.length - 1} className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                      <button onClick={() => removeProduct(pid)} className="p-2 rounded-lg text-red-500 hover:bg-red-50"><X className="h-4 w-4" /></button>
                    </div>
                    {p && p.images.length > 1 && (
                      <div className="mt-2 pl-8">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-1">Switcher thumbnail (tap a photo)</p>
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {p.images.slice(0, 8).map((img) => (
                            <button
                              key={img}
                              onClick={() => setThumb(pid, img)}
                              className={`shrink-0 h-12 w-10 rounded overflow-hidden border-2 ${thumb === img ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={getOptimizedUrl(img, 80)} alt="" className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-200">
            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 cursor-pointer">
              <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="h-4 w-4" />
              Active (show switcher to ad visitors)
            </label>
            <div className="flex gap-2">
              <button onClick={cancelEdit} className="px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold text-zinc-600 hover:bg-zinc-100">Cancel</button>
              <button onClick={saveDraft} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Look
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── LIST ── */
        <div className="space-y-4">
          {campaigns.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl">
              <Video className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No video looks yet. Click <strong>New Video Look</strong> to create one.</p>
            </div>
          )}
          {campaigns.map((c, idx) => {
            const url = adUrl(c);
            return (
              <div key={`${c.slug}-${idx}`} className="border border-zinc-200 rounded-2xl p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-zinc-900">{sanitizeLookSlug(c.slug)}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                        {c.active ? 'LIVE' : 'OFF'}
                      </span>
                      <span className="text-[11px] text-zinc-400">{c.product_ids.length} jackets</span>
                    </div>
                    {c.headline && <p className="text-xs text-zinc-500 mt-0.5 truncate">“{c.headline}”</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(idx)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${c.active ? 'bg-brand-600' : 'bg-zinc-300'}`}
                      title={c.active ? 'Turn off' : 'Turn on'}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${c.active ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                    <button onClick={() => startEdit(idx)} className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-100">Edit</button>
                    <button onClick={() => deleteCampaign(idx)} disabled={saving} className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {c.product_ids.map((pid) => {
                    const p = productById[pid];
                    const thumb = c.thumbs?.[pid] || p?.images?.[0];
                    const isLanding = (c.landing_product_id || c.product_ids[0]) === pid;
                    return (
                      <div key={pid} className="relative shrink-0" title={p?.name || pid}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getOptimizedUrl(thumb, 100)} alt="" className={`h-12 w-12 rounded-full object-cover border-2 ${isLanding ? 'border-amber-400' : 'border-zinc-200'}`} />
                        {isLanding && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 absolute -top-1 -right-1" />}
                      </div>
                    );
                  })}
                </div>

                {url && (
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg p-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 shrink-0 px-1">Ad URL</span>
                    <code className="text-xs text-zinc-700 truncate flex-1">{url}</code>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => copy(url)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-900 text-white text-[11px] font-bold">
                        {copied === url ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied === url ? 'Copied' : 'Copy'}
                      </button>
                      <a href={url.replace(SITE_URL, '')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-zinc-300 text-zinc-700 text-[11px] font-bold hover:bg-white">
                        <ExternalLink className="h-3.5 w-3.5" /> Preview
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
