import React from 'react';
import { CollectionPageClient } from '@/components/CollectionPageClient';
import { Metadata } from 'next';
import { sortCategoriesCustom } from '@/utils/categorySort';

export const metadata: Metadata = {
  title: 'Handmade Suzani Jackets & Indian Ethnic Wear Collections | Textile Jaipur',
  description: 'Explore our curated collection of handcrafted Indian ethnic wear. Discover luxury velvet Suzani jackets, embroidered kimonos, and traditional Jaipur artisanal fashion with free worldwide shipping.',
  alternates: {
    canonical: 'https://textilejaipur.com/collection',
  },
  openGraph: {
    title: 'Handmade Suzani Jackets & Indian Ethnic Wear Collections | Textile Jaipur',
    description: 'Explore our curated collection of handcrafted Indian ethnic wear. Discover luxury velvet Suzani jackets, embroidered kimonos, and traditional Jaipur artisanal fashion with free worldwide shipping.',
    url: 'https://textilejaipur.com/collection',
    siteName: 'Textile Jaipur',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://textilejaipur.com/about/img1.jpg',
        width: 1200,
        height: 630,
        alt: 'Textile Jaipur Collections'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Handmade Suzani Jackets & Indian Ethnic Wear Collections | Textile Jaipur',
    description: 'Explore our curated collection of handcrafted Indian ethnic wear. Discover luxury velvet Suzani jackets, embroidered kimonos, and traditional Jaipur artisanal fashion.',
    images: ['https://textilejaipur.com/about/img1.jpg'],
  }
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
  let saleBanner = null;
  let seoDescriptions: Record<string, string> = {};

  try {
    const fetchHeaders = { apikey: key, Authorization: `Bearer ${key}` };
    const fetchOpts = { headers: fetchHeaders, next: { revalidate: 60 } };

    const [res, catRes, bannerRes, seoRes] = await Promise.all([
      fetch(
        `${url}/rest/v1/products?select=id,name,price,stock,stock_quantity,is_featured,display_rank,created_at,details,categories(name),product_images(url,is_primary,display_order)&order=display_rank.asc.nullslast`,
        fetchOpts
      ),
      fetch(`${url}/rest/v1/categories?select=name&order=name`, fetchOpts),
      fetch(`${url}/rest/v1/site_settings?key=eq.SYS_BANNER_CONFIG&select=value`, fetchOpts),
      fetch(`${url}/rest/v1/site_settings?key=eq.SYS_CATEGORY_DESCRIPTIONS&select=value`, fetchOpts),
    ]);

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
          description: '',
          price_inr: item.price || 0,
          category: item.categories?.name || 'Ethnic Wear',
          images: sortedImages.length > 0 ? sortedImages.slice(0, 2) : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
          stock: item.stock_quantity || item.stock || 0,
          details: {
            material: item.details?.material || 'Handloom Fabric',
            origin: item.details?.origin || 'Jaipur, Rajasthan',
            care: item.details?.care || 'Dry clean only',
            isBestseller: item.details?.isBestseller || false,
          },
          is_featured: item.is_featured || false,
          display_rank: item.display_rank || 999,
          created_at: item.created_at
        };
      });
    }

    if (catRes.ok) {
      const catData = await catRes.json();
      const fetchedCats = (catData as any[]).map(c => c.name);
      categories = ['All', ...sortCategoriesCustom(fetchedCats)];
    }

    if (bannerRes.ok) {
      const bData = await bannerRes.json();
      if (bData && bData.length > 0) {
        const config = bData[0];
        if (config.value?.is_active) {
          saleBanner = `${url}/storage/v1/object/public/products/sale-banner.png?v=${config.value?.discount_value}`;
        }
      }
    }

    if (seoRes.ok) {
      const sData = await seoRes.json();
      if (sData && sData.length > 0 && sData[0].value) {
        seoDescriptions = sData[0].value;
      }
    }
  } catch (err) {
    console.error('Failed to fetch collection data', err);
  }
  const jsonLdCollection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Handmade Suzani Jackets & Indian Ethnic Wear Collections',
    description: 'Explore our curated collection of handcrafted Indian ethnic wear. Discover luxury velvet Suzani jackets, embroidered kimonos, and traditional Jaipur artisanal fashion with free worldwide shipping.',
    url: 'https://textilejaipur.com/collection',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 30).map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://textilejaipur.com/product/${p.id}`,
        name: p.name,
        image: p.images?.[0]
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollection) }}
      />
      <CollectionPageClient initialProducts={products} categories={categories} saleBanner={saleBanner} seoDescriptions={seoDescriptions} />
    </>
  );
}
