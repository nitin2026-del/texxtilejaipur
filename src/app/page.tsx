import React from 'react';
import { HomePageClient } from '@/components/HomePageClient';

export const revalidate = 60; // ISR cache for 60 seconds

export default async function Home() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return <HomePageClient products={[]} dbCategories={[]} />;
  }

  let dbCategories = [];
  let products = [];

  try {
    const catRes = await fetch(
      `${url}/rest/v1/categories?select=id,name,parent_id,display_order&order=display_order.asc.nullsfirst,name.asc`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 60 }
      }
    );
    if (catRes.ok) {
      dbCategories = await catRes.json();
    }
  } catch (err) {
    console.error('Failed to fetch categories', err);
  }

  try {
    const restUrl = `${url}/rest/v1/products?select=*,categories(name),product_images(url,is_primary,display_order)&order=display_rank.asc.nullslast,name.asc`;
    const res = await fetch(restUrl, {
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
          sku: item.slug ? `HT-${item.slug.toUpperCase()}` : `HT-${item.id.slice(0, 8).toUpperCase()}`,
          name: item.name,
          description: item.description || '',
          price_inr: item.price || 0,
          category: item.categories?.name || 'Ethnic Wear',
          images: sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
          stock: item.stock_quantity || item.stock || 0,
          details: {
            material: item.description?.includes('Silk') ? 'Pure Silk' : item.description?.includes('Cotton') ? 'Premium Cotton' : 'Handloom Fabric',
            origin: 'Jaipur, Rajasthan',
            care: 'Dry clean only'
          },
          is_featured: item.is_featured || false,
          display_rank: item.display_rank || 999
        };
      });
    }
  } catch (err) {
    console.error('Failed to fetch products', err);
  }

  return <HomePageClient products={products} dbCategories={dbCategories} />;
}
