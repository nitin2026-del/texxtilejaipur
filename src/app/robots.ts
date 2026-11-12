import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/merchant-feed'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/api/merchant-feed'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/'],
      },
    ],
    sitemap: 'https://www.textilejaipur.com/sitemap.xml',
    host: 'https://www.textilejaipur.com',
  };
}
