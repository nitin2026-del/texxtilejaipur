import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.textilejaipur.com';
  const now = new Date();

  const seoCollectionSlugs = [
    'embroidered-jackets',
    'suzani-jackets',
    'velvet-jackets',
    'velvet-suzani-jacket',
    'cotton-jackets',
    'cotton-suzani-jacket',
    'tnt-suzani-jacket',
    'corduroy-jacket',
    'velvet-short-kimono',
    'velvet-long-suzani-kimono',
    'cotton-long-suzani-kimono',
    'cotton-suzani-dress',
    'velvet-vest',
    'cotton-tote-bag',
  ];

  const cleanCollectionRoutes: MetadataRoute.Sitemap = seoCollectionSlugs.map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.95,
  }));

  // Define static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/track`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/the-artisan-edit`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/agents.md`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/care`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/size-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/refer`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Fetch dynamic products
  let dynamicProductRoutes: MetadataRoute.Sitemap = [];
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (url && key) {
      const res = await fetch(`${url}/rest/v1/products?select=id,updated_at,product_images(url)&status=eq.active`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        },
        // Revalidate every hour
        next: { revalidate: 3600 }
      });

      if (res.ok) {
        const products = await res.json();
        if (Array.isArray(products)) {
          dynamicProductRoutes = products.map((product: any) => {
            const imageUrls = (product.product_images || [])
              .map((img: any) => img.url)
              .filter(Boolean);
            return {
              url: `${baseUrl}/product/${product.id}`,
              lastModified: product.updated_at ? new Date(product.updated_at) : now,
              changeFrequency: 'daily',
              priority: 0.9,
              ...(imageUrls.length > 0 ? { images: imageUrls } : {})
            };
          });
        }
      }

      // Fetch categories for category-filtered collection pages
      const catRes = await fetch(`${url}/rest/v1/categories?select=name`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        },
        next: { revalidate: 3600 }
      });

      let categoryRoutes: MetadataRoute.Sitemap = [];
      if (catRes.ok) {
        const categories = await catRes.json();
        if (Array.isArray(categories)) {
          categoryRoutes = categories
            .filter((cat: any) => cat.name && cat.name.toLowerCase() !== 'uncategorized')
            .map((cat: any) => ({
              url: `${baseUrl}/collection?category=${encodeURIComponent(cat.name)}`,
              lastModified: now,
              changeFrequency: 'daily' as const,
              priority: 0.85,
            }));
        }
      }

      // Fetch published blog articles for SEO Authority (matching Zoshak's blog sitemap)
      const blogRes = await fetch(`${url}/rest/v1/blogs?select=slug,created_at&status=eq.published`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        },
        next: { revalidate: 3600 }
      });

      let blogRoutes: MetadataRoute.Sitemap = [];
      if (blogRes.ok) {
        const blogs = await blogRes.json();
        if (Array.isArray(blogs)) {
          blogRoutes = blogs
            .filter((b: any) => b.slug)
            .map((b: any) => ({
              url: `${baseUrl}/blog/${encodeURIComponent(b.slug.trim())}`,
              lastModified: b.created_at ? new Date(b.created_at) : now,
              changeFrequency: 'weekly' as const,
              priority: 0.8,
            }));
        }
      }

      return [...staticRoutes, ...cleanCollectionRoutes, ...categoryRoutes, ...blogRoutes, ...dynamicProductRoutes];
    }
  } catch (err) {
    console.error('Failed to fetch products for sitemap', err);
  }

  return [...staticRoutes, ...cleanCollectionRoutes, ...dynamicProductRoutes];
}
