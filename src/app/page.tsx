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
    const fetchOpts = {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 }
    };
    const [catRes, res] = await Promise.all([
      fetch(
        `${url}/rest/v1/categories?select=id,name,parent_id,display_order&order=display_order.asc.nullsfirst,name.asc`,
        fetchOpts
      ),
      fetch(
        `${url}/rest/v1/products?select=id,slug,name,price,stock,stock_quantity,is_featured,display_rank,details,categories(name),product_images(url,is_primary,display_order)&order=display_rank.asc.nullslast,name.asc`,
        fetchOpts
      )
    ]);

    if (catRes.ok) {
      dbCategories = await catRes.json();
    }

    if (res.ok) {
      const data = await res.json();
      products = (data as any[]).map((item) => {
        const sortedImageObjs = item.product_images
          ? [...item.product_images]
              .filter((img) => img?.url && !/\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(img.url))
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          : [];
        const primaryObj = sortedImageObjs.find((img) => img.is_primary);
        const orderedImages = primaryObj
          ? [primaryObj.url, ...sortedImageObjs.filter((img) => img.url !== primaryObj.url).map((img) => img.url)]
          : sortedImageObjs.map((img) => img.url);
        const cardImages = orderedImages.slice(0, 2);

        return {
          id: item.id,
          slug: item.slug || undefined,
          sku: `HT-${item.id.slice(0, 8).toUpperCase()}`,
          name: item.name,
          description: '',
          price_inr: item.price || 0,
          category: item.categories?.name || 'Ethnic Wear',
          images: cardImages.length > 0 ? cardImages : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
          stock: item.stock_quantity || item.stock || 0,
          details: {
            material: item.details?.material || 'Handloom Fabric',
            isBestseller: Boolean(item.details?.isBestseller),
          },
          is_featured: item.is_featured || false,
          display_rank: item.display_rank || 999
        };
      });
    }
  } catch (err) {
    console.error('Failed to fetch homepage data', err);
  }

  // Build ItemList + Product structured data for Google rich results / image carousel
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Handmade Embroidered Jackets & Boho Kimonos | Textile Jaipur',
    description: 'Shop handmade embroidered jackets, velvet jackets, boho kimonos, Suzani jackets and embroidered tote bags at Textile Jaipur.',
    url: 'https://www.textilejaipur.com',
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://www.textilejaipur.com/product/${p.slug || p.id}`,
      item: {
        '@type': 'Product',
        '@id': `https://www.textilejaipur.com/product/${p.slug || p.id}#product`,
        name: p.name,
        description: `Handmade ${p.category} crafted by Jaipur artisans`,
        image: p.images.slice(0, 2),
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
          url: `https://www.textilejaipur.com/product/${p.slug || p.id}`,
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
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: ['IN', 'US', 'GB', 'CA', 'AU', 'DE', 'FR'],
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 14,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
            customerRemorseReturnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
            itemDefectReturnFees: 'https://schema.org/FreeReturn',
            merchantReturnLink: 'https://www.textilejaipur.com/refund-policy'
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
    url: 'https://www.textilejaipur.com',
    image: allProductImages.slice(0, 50).map((imgUrl: string) => ({
      '@type': 'ImageObject',
      url: imgUrl,
      contentUrl: imgUrl
    }))
  } : null;

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="https://images.unsplash.com/photo-1610030469983-98e550d615ef?q=75&w=800&auto=format&fit=crop"
        fetchPriority="high"
      />
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
