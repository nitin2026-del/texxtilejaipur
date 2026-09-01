import React from 'react';
import { CollectionPageClient } from '@/components/CollectionPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Collections | Textile Jaipur',
  description: 'Explore our curated collection of handcrafted Indian ethnic wear. Discover premium silk and cotton pieces, featuring traditional Jaipur block prints and intricate embroidery.',
  openGraph: {
    title: 'Shop All Collections | Textile Jaipur',
    description: 'Explore our curated collection of handcrafted Indian ethnic wear. Discover premium silk and cotton pieces, featuring traditional Jaipur block prints and intricate embroidery.',
    url: 'https://textilejaipur.com/collection',
    siteName: 'Textile Jaipur',
    locale: 'en_IN',
    type: 'website',
  },
};

export const revalidate = 60; // ISR cache for 60 seconds

export default async function CollectionPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return <CollectionPageClient initialProducts={[]} categories={['All']} />;
  }

  let products: any[] = [];
  let categories = ['All'];

  try {
    const res = await fetch(`${url}/rest/v1/products?select=*,categories(name),product_images(url,is_primary,display_order)&order=display_rank.asc.nullslast`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      next: { revalidate: 60 }
    });

    if (res.ok) {
      const data = await res.json();
      products = (data as any[]).map((item) => {
        const sortedImages = item.product_images
          ? [...item.product_images]
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map((img) => img.url)
          : [];

        return {
          id: item.id,
          sku: `HT-${item.id.slice(0, 8).toUpperCase()}`,
          name: item.name,
          description: item.description || '',
          price_inr: item.price || 0,
          category: item.categories?.name || 'Ethnic Wear',
          images: sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
          stock: item.stock_quantity || item.stock || 0,
          details: {
            material: item.description?.includes('Silk') ? 'Pure Silk' : item.description?.includes('Cotton') ? 'Premium Cotton' : 'Handloom Fabric',
            origin: 'Jaipur, Rajasthan',
            care: 'Dry clean only',
            ...(item.details || {})
          },
          is_featured: item.is_featured || false,
          display_rank: item.display_rank || 999,
          created_at: item.created_at
        };
      });

      const uniqueCats = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
      categories = ['All', ...uniqueCats.sort()];
    }
  } catch (err) {
    console.error('Failed to fetch products', err);
  }

  let saleBanner = null;
  try {
    const bannerRes = await fetch(
      `${url}/rest/v1/site_settings?key=eq.SYS_BANNER_CONFIG&select=value`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 60 }
      }
    );
    if (bannerRes.ok) {
      const bData = await bannerRes.json();
      if (bData && bData.length > 0) {
        const config = bData[0];
        if (config.value?.is_active) {
          saleBanner = `${url}/storage/v1/object/public/products/sale-banner.png?v=${config.value?.discount_value}`;
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch banner config', err);
  }

  return <CollectionPageClient initialProducts={products} categories={categories} saleBanner={saleBanner} />;
}
