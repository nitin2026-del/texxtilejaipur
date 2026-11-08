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
  let products: any[] = [];

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
            care: 'Dry clean only',
            ...(item.details || {})
          },
          is_featured: item.is_featured || false,
          display_rank: item.display_rank || 999
        };
      });
    }
  } catch (err) {
    console.error('Failed to fetch products', err);
  }

  // Build ItemList + Product structured data for Google rich results / image carousel
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Handmade Embroidered Jackets & Boho Kimonos | Textile Jaipur',
    description: 'Shop handmade embroidered jackets, velvet jackets, boho kimonos, Suzani jackets and embroidered tote bags at Textile Jaipur.',
    url: 'https://textilejaipur.com',
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://textilejaipur.com/product/${p.id}`,
      item: {
        '@type': 'Product',
        '@id': `https://textilejaipur.com/product/${p.id}#product`,
        name: p.name,
        description: p.description || `Handmade ${p.category} from Jaipur, India`,
        image: p.images,
        sku: p.sku,
        brand: {
          '@type': 'Brand',
          name: 'Textile Jaipur'
        },
        category: p.category,
        material: p.details?.material || 'Handloom Fabric',
        countryOfOrigin: 'IN',
        offers: {
          '@type': 'Offer',
          url: `https://textilejaipur.com/product/${p.id}`,
          priceCurrency: 'INR',
          price: p.price_inr,
          itemCondition: 'https://schema.org/NewCondition',
          availability: p.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Textile Jaipur'
          },
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: '0.00',
              currency: 'INR'
            },
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: ['IN', 'US', 'GB', 'CA', 'AU', 'DE', 'FR']
            },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
              transitTime: { '@type': 'QuantitativeValue', minValue: 5, maxValue: 12, unitCode: 'DAY' }
            }
          }
        }
      }
    }))
  };

  // Collect all product images for an ImageGallery schema (helps Google Images)
  const allProductImages = products.slice(0, 30).flatMap(p =>
    p.images.filter((img: string) => !img.includes('unsplash.com')).slice(0, 2)
  );

  const imageGallerySchema = allProductImages.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Textile Jaipur — Handcrafted Jacket Collection',
    description: 'Browse handmade embroidered Suzani jackets, velvet jackets, and boho kimonos from Textile Jaipur.',
    url: 'https://textilejaipur.com',
    image: allProductImages.slice(0, 50).map((imgUrl: string) => ({
      '@type': 'ImageObject',
      url: imgUrl,
      contentUrl: imgUrl
    }))
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {imageGallerySchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }}
        />
      )}
      <HomePageClient products={products} dbCategories={dbCategories} />
    </>
  );
}
