import React from 'react';
import { ProductPageClient } from '@/components/ProductPageClient';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';

export const revalidate = 60; // ISR cache for 60 seconds

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return { title: 'Product Not Found' };
  }

  try {
    const res = await fetch(`${url}/rest/v1/products?select=name,description,product_images(url,is_primary)&id=eq.${id}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      next: { revalidate: 60 }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const primaryImage = item.product_images?.find((img: any) => img.is_primary)?.url 
          || item.product_images?.[0]?.url 
          || 'https://textilejaipur.com/images/default-share.jpg';

        return {
          title: `${item.name} | Textile Jaipur`,
          description: item.description?.substring(0, 160) || `Buy ${item.name} at Textile Jaipur.`,
          openGraph: {
            title: `${item.name} | Textile Jaipur`,
            description: item.description?.substring(0, 160),
            images: [primaryImage],
            type: 'website',
          },
        };
      }
    }
  } catch (err) {
    console.error('Error fetching metadata', err);
  }

  return {
    title: 'Product | Textile Jaipur',
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return notFound();
  }

  let product: any = null;
  let relatedProducts: any[] = [];
  let initialReviews: any[] = [];

  try {
    // 1. Fetch Product
    const res = await fetch(`${url}/rest/v1/products?select=*,categories(name),product_images(url,is_primary,display_order)&id=eq.${id}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      next: { revalidate: 60 }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const sortedImages = item.product_images
          ? [...item.product_images]
              .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
              .map((img: any) => img.url)
          : [];

        product = {
          id: item.id,
          sku: `HT-${item.id.slice(0, 8).toUpperCase()}`,
          name: item.name,
          description: item.description || '',
          price_inr: item.price || 0,
          category: item.categories?.name || 'Ethnic Wear',
          images: sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
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
    }
    
    if (!product) return notFound();

    // 2. Fetch Related Products
    const relatedRes = await fetch(`${url}/rest/v1/products?select=*,categories!inner(name),product_images(url,is_primary)&id=neq.${id}&categories.name=eq.${encodeURIComponent(product.category)}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 }
    });
    
    if (relatedRes.ok) {
      const relatedData = await relatedRes.json();
      relatedProducts = relatedData.map((item: any) => ({
        id: item.id,
        name: item.name,
        price_inr: item.price,
        category: item.categories?.name || 'Ethnic Wear',
        image: item.product_images && item.product_images.length > 0 
                ? (item.product_images.find((img: any) => img.is_primary)?.url || item.product_images[0].url) 
                : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
      }));
    }

    // 3. Fetch Reviews
    const reviewsRes = await fetch(`${url}/rest/v1/reviews?product_id=eq.${id}&status=eq.approved&order=created_at.desc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 }
    });
    
    if (reviewsRes.ok) {
      const reviewsData = await reviewsRes.json();
      initialReviews = reviewsData.map((review: any) => ({
        id: review.id,
        initial: review.reviewer_name ? review.reviewer_name.charAt(0).toUpperCase() : 'A',
        name: review.reviewer_name || 'Anonymous',
        location: review.reviewer_location || undefined,
        date: new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        stars: review.rating || 5,
        title: review.title ? `"${review.title}"` : undefined,
        body: review.comment || '',
        reply: review.reply || undefined,
        isVerified: review.is_verified_buyer || false,
        imageUrl: review.image_url || undefined,
        imageUrls: review.image_urls && review.image_urls.length > 0 
          ? review.image_urls 
          : (review.image_url ? [review.image_url] : [])
      }));
    }
    
    // 4. Fetch UGC Videos
    let ugcVideos: any[] = [];
    try {
      const ugcRes = await fetch(`${url}/rest/v1/behind_the_scenes?status=eq.published&order=display_order.asc.nullslast`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 60 }
      });
      if (ugcRes.ok) {
        const ugcData = await ugcRes.json();
        // Filter videos linked to this product (format: text|||product_id)
        let linkedVideos = ugcData.filter((item: any) => item.description?.includes(`|||${id}`));
        
        // If no linked videos, just take the latest 2 videos to always show something
        if (linkedVideos.length === 0) {
          linkedVideos = ugcData.slice(0, 2);
        }
        
        ugcVideos = linkedVideos.map((item: any) => ({
            id: item.id,
            videoUrl: item.media_url,
            title: item.title,
            description: item.description ? item.description.split('|||')[0] : ''
        }));
      }
    } catch (err) {
      console.error('Failed to fetch UGC videos', err);
    }
    
  } catch (err) {
    console.error('Failed to fetch product data', err);
  }

  if (!product) {
    return notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images[0],
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Textile Jaipur'
    },
    offers: {
      '@type': 'Offer',
      url: `https://textilejaipur.com/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price_inr,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock_quantity > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient 
        product={product} 
        relatedProducts={relatedProducts} 
        initialReviews={initialReviews} 
        ugcVideos={ugcVideos}
      />
    </>
  );
}
