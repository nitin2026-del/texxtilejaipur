import React from 'react';
import { ProductPageClient } from '@/components/ProductPageClient';
import { notFound } from 'next/navigation';

export const revalidate = 60; // ISR cache for 60 seconds

export default async function ProductPage({ params }: { params: { id: string } }) {
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
    const relatedRes = await fetch(`${url}/rest/v1/products?select=*,categories!inner(name),product_images(url,is_primary)&limit=4&id=neq.${id}&categories.name=eq.${encodeURIComponent(product.category)}`, {
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
        isVerified: review.is_verified_buyer || false
      }));
    }
  } catch (err) {
    console.error('Failed to fetch product data', err);
  }

  if (!product) {
    return notFound();
  }

  return (
    <ProductPageClient 
      product={product} 
      relatedProducts={relatedProducts} 
      initialReviews={initialReviews} 
    />
  );
}
