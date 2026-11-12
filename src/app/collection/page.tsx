import React from 'react';
import { CollectionPageClient } from '@/components/CollectionPageClient';
import { Metadata } from 'next';
import { sortCategoriesCustom } from '@/utils/categorySort';

const CATEGORY_SEO_META: Record<string, { title: string; description: string; h1: string; intro: string }> = {
  'All': {
    title: 'Hand-Embroidered Suzani Jackets, Velvet Coats & Boho Kimonos | Textile Jaipur',
    description: 'Shop authentic hand-embroidered Suzani jackets, luxury velvet embroidered jackets, cotton artisan coats, and boho kimonos handcrafted in Jaipur, Rajasthan. Free worldwide shipping.',
    h1: 'Hand-Embroidered Suzani Jackets & Jaipur Artisan Outerwear',
    intro: 'Each embroidered jacket and kimono is handcrafted by master artisans in Jaipur, Rajasthan using centuries-old Suzani chain-stitch needlework, plush velvet, and breathable handloom cotton.'
  },
  'VELVET SUZANI JACKET': {
    title: 'Hand-Embroidered Velvet Suzani Jackets — Jaipur Artisan | Textile Jaipur',
    description: 'Luxurious hand-embroidered velvet Suzani jackets crafted by skilled artisans in Jaipur. Intricate floral & botanical chain-stitch embroidery on plush velvet with free worldwide shipping.',
    h1: 'Hand-Embroidered Velvet Suzani Jackets',
    intro: 'Opulent stone-washed and plush velvet jackets featuring dense hand-embroidered Suzani floral motifs, tailored by family workshops in Jaipur, Rajasthan.'
  },
  'COTTON SUZANI JACKET': {
    title: 'Hand-Embroidered Cotton Suzani Jackets — Boho Artisan Coats | Textile Jaipur',
    description: 'Lightweight hand-embroidered cotton Suzani jackets from Jaipur. Breathable cotton twill and handloom outerwear featuring vibrant floral and geometric needlework.',
    h1: 'Hand-Embroidered Cotton Suzani Jackets',
    intro: 'Breathable handloom cotton and quilted artisan jackets adorned with vibrant hand-stitched Suzani embroidery for effortless, all-season bohemian layering.'
  },
  'TNT SUZANI JACKET': {
    title: 'Hand-Embroidered TNT Suzani Jackets — Statement Boho Outerwear | Textile Jaipur',
    description: 'Authentic hand-embroidered TNT Suzani jackets handcrafted by Jaipur artisans. Bold floral and geometric motifs on structured bohemian coats with free worldwide shipping.',
    h1: 'Hand-Embroidered TNT Suzani Jackets',
    intro: 'Structured, statement-making TNT Suzani embroidered jackets blending traditional Central Asian & Rajasthani needlework with contemporary silhouettes.'
  },
  'Corduroy JACKET': {
    title: 'Hand-Embroidered Corduroy Suzani Jackets — Jaipur Artisan | Textile Jaipur',
    description: 'Shop handcrafted corduroy embroidered jackets featuring traditional Suzani floral needlework from Jaipur, Rajasthan. Vintage-inspired boho outerwear with free worldwide shipping.',
    h1: 'Hand-Embroidered Corduroy Jackets',
    intro: 'Richly textured ribbed corduroy jackets elevated with intricate hand-embroidered Suzani florals—crafted in small batches in Jaipur.'
  },
  'VELVET SHORT KIMONO': {
    title: 'Hand-Embroidered Velvet Short Kimono Jackets — Boho Layering | Textile Jaipur',
    description: 'Explore hand-embroidered velvet short kimono jackets crafted in Jaipur. Effortless bohemian cardigans and embroidered jackets with intricate Suzani floral stitchwork.',
    h1: 'Hand-Embroidered Velvet Short Kimono Jackets',
    intro: 'Relaxed open-front velvet kimono jackets richly detailed with artisan Suzani embroidery for versatile day-to-evening styling.'
  },
  'VELVET LONG SUZANI KIMONO': {
    title: 'Hand-Embroidered Velvet Long Suzani Kimonos & Duster Coats | Textile Jaipur',
    description: 'Shop statement hand-embroidered velvet long Suzani kimonos and duster coats made by master artisans in Jaipur, India. Free express worldwide shipping.',
    h1: 'Hand-Embroidered Velvet Long Suzani Kimonos',
    intro: 'Floor-skimming and midi-length velvet duster kimonos showcasing head-to-toe hand-embroidered Suzani botanical motifs from Jaipur.'
  },
  'COTTON LONG SUZANI KIMONO': {
    title: 'Hand-Embroidered Cotton Long Suzani Kimonos & Duster Coats | Textile Jaipur',
    description: 'Discover breathable hand-embroidered cotton long Suzani kimonos and bohemian robes handcrafted in Jaipur, Rajasthan. Free worldwide shipping.',
    h1: 'Hand-Embroidered Cotton Long Suzani Kimonos',
    intro: 'Lightweight handloom cotton long kimonos and boho duster coats hand-embroidered by Jaipur artisans.'
  },
  'COTTON SUZANI DRESS': {
    title: 'Hand-Embroidered Cotton Suzani Dresses — Bohemian Jaipur Fashion | Textile Jaipur',
    description: 'Shop artisan hand-embroidered cotton Suzani dresses from Jaipur. Ethically handcrafted bohemian maxi and midi dresses with intricate floral needlework.',
    h1: 'Hand-Embroidered Cotton Suzani Dresses',
    intro: 'Artisanal cotton dresses featuring delicate hand-embroidered Suzani motifs and relaxed bohemian silhouettes.'
  },
  'VELVET VEST': {
    title: 'Hand-Embroidered Velvet Suzani Vests & Gilets — Jaipur Artisan | Textile Jaipur',
    description: 'Explore handcrafted velvet Suzani embroidered vests and bohemian sleeveless jackets made by master artisans in Jaipur, Rajasthan.',
    h1: 'Hand-Embroidered Velvet Suzani Vests',
    intro: 'Sleeveless velvet Suzani embroidered vests and artisan gilets designed for effortless bohemian layering.'
  },
  'COTTON TOTE BAG': {
    title: 'Hand-Embroidered Suzani & Quilted Cotton Tote Bags — Jaipur | Textile Jaipur',
    description: 'Shop handmade embroidered cotton tote bags and quilted bohemian shoulder bags crafted by artisans in Jaipur, India.',
    h1: 'Hand-Embroidered Cotton Tote Bags',
    intro: 'Spacious quilted and hand-embroidered cotton shoulder tote bags crafted from heritage Jaipur textiles.'
  }
};

function findCategorySeo(rawCat?: string) {
  if (!rawCat || rawCat === 'All') return CATEGORY_SEO_META['All'];
  const matchKey = Object.keys(CATEGORY_SEO_META).find(k => k.toLowerCase() === rawCat.toLowerCase());
  if (matchKey) return CATEGORY_SEO_META[matchKey];
  return {
    title: `Hand-Embroidered ${rawCat} — Jaipur Artisan Collection | Textile Jaipur`,
    description: `Shop authentic hand-embroidered ${rawCat.toLowerCase()} handcrafted by master artisans in Jaipur, Rajasthan. Free express worldwide shipping at Textile Jaipur.`,
    h1: `Hand-Embroidered ${rawCat}`,
    intro: `Explore our handcrafted ${rawCat.toLowerCase()} collection, ethically made by master artisans in Jaipur, Rajasthan.`
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { category?: string };
}): Promise<Metadata> {
  const rawCategory = typeof searchParams?.category === 'string' ? searchParams.category.trim() : '';
  const seo = findCategorySeo(rawCategory);
  const canonicalUrl = rawCategory
    ? `https://www.textilejaipur.com/collection?category=${encodeURIComponent(rawCategory)}`
    : 'https://www.textilejaipur.com/collection';

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonicalUrl,
      siteName: 'Textile Jaipur',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: 'https://www.textilejaipur.com/about/img1.jpg',
          width: 1200,
          height: 630,
          alt: seo.h1
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: ['https://www.textilejaipur.com/about/img1.jpg'],
    }
  };
}

export const revalidate = 60; // ISR cache for 60 seconds

export default async function CollectionPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const rawCategory = typeof searchParams?.category === 'string' ? searchParams.category.trim() : 'All';
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
  const defaultSeoDescs: Record<string, string> = {};
  for (const [k, v] of Object.entries(CATEGORY_SEO_META)) {
    defaultSeoDescs[k] = v.intro;
  }
  const mergedSeoDescriptions = { ...defaultSeoDescs, ...seoDescriptions };
  const activeSeo = findCategorySeo(rawCategory);
  const schemaProducts = (rawCategory && rawCategory !== 'All')
    ? products.filter(p => p.category.toLowerCase() === rawCategory.toLowerCase())
    : products;
  const canonicalUrl = (rawCategory && rawCategory !== 'All')
    ? `https://www.textilejaipur.com/collection?category=${encodeURIComponent(rawCategory)}`
    : 'https://www.textilejaipur.com/collection';

  const jsonLdCollection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: activeSeo.h1,
    description: activeSeo.description,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: schemaProducts.length,
      itemListElement: schemaProducts.slice(0, 30).map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://www.textilejaipur.com/product/${p.id}`,
        name: p.name,
        image: p.images?.[0],
        item: {
          '@type': 'Product',
          name: p.name,
          image: p.images,
          sku: p.sku,
          brand: { '@type': 'Brand', name: 'Textile Jaipur' },
          offers: {
            '@type': 'Offer',
            url: `https://www.textilejaipur.com/product/${p.id}`,
            priceCurrency: 'INR',
            price: Number(p.price_inr || 0).toFixed(2),
            availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition'
          }
        }
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollection) }}
      />
      <CollectionPageClient
        initialProducts={products}
        categories={categories}
        saleBanner={saleBanner}
        seoDescriptions={mergedSeoDescriptions}
        initialCategory={rawCategory}
      />
    </>
  );
}
