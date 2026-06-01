import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URLs
  const baseUrl = 'https://hiyawear.com';
  
  const staticRoutes = [
    '',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  try {
    // Fetch all active products
    const { data: products } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('status', 'active');

    const productRoutes = (products || []).map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(product.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (err) {
    console.error('Error generating sitemap:', err);
    return staticRoutes;
  }
}
