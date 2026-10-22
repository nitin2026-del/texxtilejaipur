/**
 * Video Ad "Look Switcher" shared config + helpers.
 *
 * Config lives in `site_settings` under key SYS_VIDEO_LOOKS and is managed from
 * the admin panel (Video Ad Looks tab). A campaign is activated on a product page
 * only when the visitor arrives with `?look=<slug>` in the URL, so organic / SEO
 * traffic never sees (or pays for) the switcher.
 */

export const VIDEO_LOOKS_KEY = 'SYS_VIDEO_LOOKS';
export const VIDEO_LOOKS_PARAM = 'look';
export const VIDEO_LOOKS_MAX_PRODUCTS = 8;

export interface VideoLookCampaign {
  slug: string;
  headline?: string;
  active: boolean;
  product_ids: string[];
  landing_product_id?: string;
  /** Optional per-product thumbnail override: productId -> image url */
  thumbs?: Record<string, string>;
  updated_at?: string;
}

export interface VideoLooksConfig {
  campaigns: VideoLookCampaign[];
}

export function sanitizeLookSlug(raw: string | null | undefined): string {
  return (raw || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80';

/**
 * Maps a raw `products` row (with `categories(name)` and
 * `product_images(url,is_primary,display_order)`) into the exact shape the
 * product page server component builds, so a switched jacket renders and
 * tracks identically to a jacket loaded on its own page.
 * Keep in sync with src/app/product/[id]/page.tsx.
 */
export function mapDbProductToPageProduct(item: any) {
  const sortedImages: string[] = item.product_images
    ? [...item.product_images]
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((img: any) => img.url)
    : [];

  return {
    id: item.id,
    sku: `HT-${String(item.id).slice(0, 8).toUpperCase()}`,
    name: item.name,
    description: item.description || '',
    price_inr: item.price || 0,
    category: item.categories?.name || 'Ethnic Wear',
    images: sortedImages.length > 0 ? sortedImages : [FALLBACK_IMAGE],
    stock_quantity: item.stock_quantity || item.stock || 0,
    details: {
      material: item.description?.includes('Silk') ? 'Pure Silk' : item.description?.includes('Cotton') ? 'Premium Cotton' : 'Handloom Fabric',
      origin: 'Jaipur, Rajasthan',
      care: 'Dry clean only',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      ...(item.details || {})
    },
    is_featured: item.is_featured || false,
    display_rank: item.display_rank || 999
  };
}
