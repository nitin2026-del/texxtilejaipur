'use client';

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getOptimizedUrl } from '@/utils/imageUtils';
import { Check } from 'lucide-react';
import {
  VIDEO_LOOKS_KEY,
  VideoLookCampaign,
  mapDbProductToPageProduct,
  sanitizeLookSlug
} from '@/lib/videoLooks';

/**
 * Overlay row of jacket avatars rendered on top of the main product image when
 * a visitor lands with `?look=<slug>`. This chunk is only downloaded after the
 * page has fully loaded and the browser is idle (see ProductPageClient), and it
 * is absolutely positioned, so it can never delay LCP or cause layout shift.
 */

type LookItem = { product: any; thumb: string };

type Props = {
  lookSlug: string;
  landingProduct: any;
  activeProductId: string;
  cartIds: string[];
  onSelect: (product: any) => void;
  onLooksLoaded: (products: any[]) => void;
};

// Must match the URL the gallery renders (ProductPageClient main <img>), so the
// preloaded bytes are served from the browser cache on switch.
const galleryUrl = (url: string) => getOptimizedUrl(url, 1200);

const preloaded = new Set<string>();
function preloadImage(url: string | undefined): Promise<void> {
  if (!url || preloaded.has(url)) return Promise.resolve();
  preloaded.add(url);
  return new Promise((resolve) => {
    const img = new window.Image();
    try { (img as any).fetchPriority = 'low'; } catch {}
    img.decoding = 'async';
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

export default function VideoLookSwitcher({ lookSlug, landingProduct, activeProductId, cartIds, onSelect, onLooksLoaded }: Props) {
  const [looks, setLooks] = useState<LookItem[]>([]);
  const [headline, setHeadline] = useState('');
  const onLooksLoadedRef = useRef(onLooksLoaded);
  onLooksLoadedRef.current = onLooksLoaded;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const slug = sanitizeLookSlug(lookSlug);
        if (!landingProduct?.id) return;

        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', VIDEO_LOOKS_KEY)
          .maybeSingle();

        const campaigns: VideoLookCampaign[] = data?.value?.campaigns || [];
        // 1. Try matching by slug if provided in URL (?look=video1)
        let campaign = slug ? campaigns.find((c) => c && c.active && sanitizeLookSlug(c.slug) === slug) : undefined;
        // 2. Option B: Auto-detect active look for this product even without ?look= in URL
        if (!campaign) {
          campaign = campaigns.find((c) => c && c.active && (c.landing_product_id === landingProduct.id || (c.product_ids && c.product_ids.includes(landingProduct.id))));
        }
        if (!campaign) return;

        const ids = Array.from(new Set((campaign.product_ids || []).filter(Boolean)));
        // Only activate on pages that are part of this look.
        if (!ids.includes(landingProduct.id)) return;

        const otherIds = ids.filter((pid) => pid !== landingProduct.id);
        if (otherIds.length === 0) return;

        const { data: rows, error } = await supabase
          .from('products')
          .select('*,categories(name),product_images(url,is_primary,display_order)')
          .in('id', otherIds);
        if (error || !rows || cancelled) return;

        const byId = new Map<string, any>();
        rows.forEach((row: any) => byId.set(row.id, mapDbProductToPageProduct(row)));
        byId.set(landingProduct.id, landingProduct);

        const list: LookItem[] = ids
          .map((pid) => byId.get(pid))
          .filter(Boolean)
          .map((p: any) => ({ product: p, thumb: campaign.thumbs?.[p.id] || p.images?.[0] }));

        if (cancelled || list.length < 2) return;

        setHeadline(campaign.headline || '');
        setLooks(list);
        onLooksLoadedRef.current(list.map((l) => l.product));

        // Quietly warm the first gallery image of every other jacket, one at a
        // time so we never compete for bandwidth with anything the shopper does.
        for (const item of list) {
          if (cancelled) break;
          if (item.product.id === landingProduct.id) continue;
          await preloadImage(galleryUrl(item.product.images?.[0]));
        }
      } catch (err) {
        console.warn('[VideoLookSwitcher] failed to load look', err);
      }
    })();

    return () => { cancelled = true; };
  }, [lookSlug, landingProduct]);

  // On touch / hover, warm the next couple of photos for that jacket too.
  const warm = (product: any) => {
    (product.images || []).slice(0, 3).forEach((u: string) => { preloadImage(galleryUrl(u)); });
  };

  if (looks.length < 2) return null;

  const activeIdx = Math.max(0, looks.findIndex((l) => l.product.id === activeProductId));
  const addedCount = looks.filter((l) => cartIds.includes(l.product.id)).length;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none animate-fade-in">
      <div className="bg-gradient-to-t from-black/75 via-black/40 to-transparent pt-12 pb-3 px-3">
        <div className="flex items-end justify-between gap-2 mb-2 px-0.5">
          <p className="text-white text-[10px] md:text-[11px] font-bold uppercase tracking-widest drop-shadow leading-tight">
            {headline || `${looks.length} jackets from the video · tap to switch`}
          </p>
          <span className="shrink-0 text-white/90 text-[10px] font-semibold bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
            {activeIdx + 1}/{looks.length}{addedCount > 0 ? ` · ${addedCount} added` : ''}
          </span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pointer-events-auto py-1 px-0.5">
          {looks.map((l, i) => {
            const isActive = l.product.id === activeProductId;
            const inCart = cartIds.includes(l.product.id);
            return (
              <button
                key={l.product.id}
                type="button"
                aria-label={`Show ${l.product.name}`}
                aria-pressed={isActive}
                onPointerDown={() => warm(l.product)}
                onMouseEnter={() => warm(l.product)}
                onClick={(e) => { e.stopPropagation(); onSelect(l.product); }}
                className={`relative shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden transition-all duration-200 ${
                  isActive ? 'ring-[3px] ring-white scale-105 shadow-lg' : 'ring-2 ring-white/50 opacity-90 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getOptimizedUrl(l.thumb, 120)}
                  alt={l.product.name}
                  width={56}
                  height={56}
                  decoding="async"
                  fetchPriority="low"
                  className="h-full w-full object-cover"
                />
                {inCart && (
                  <span className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-0.5 ring-2 ring-white">
                    <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                  </span>
                )}
                <span className="sr-only">Look {i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
