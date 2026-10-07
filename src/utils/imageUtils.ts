export function getOptimizedUrl(url: string | undefined, width: number = 800): string {
  if (!url) return 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80';
  if (url.includes('images.weserv.nl')) return url; // Prevent double-proxying
  if (url.includes('supabase.co')) {
    // Weserv optimizes on the fly, avoiding Vercel quota limits
    // Note: We bumped quality to 90 and added &con=5 &sat=15 to globally fix the "dullness" 
    // caused by standard ICC profile stripping in WebP compression.
    return `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}&output=webp&w=${width}&q=90`;
  }
  return url;
}
