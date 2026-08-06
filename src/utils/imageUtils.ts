export function getOptimizedUrl(url: string | undefined): string {
  if (!url) return 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80';
  if (url.includes('supabase.co')) {
    // Weserv converts webp to jpg and optimizes on the fly, avoiding Vercel quota limits
    return `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}&output=jpg`;
  }
  return url;
}
