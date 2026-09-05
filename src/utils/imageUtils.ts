export function getOptimizedUrl(url: string | undefined, width: number = 800): string {
  if (!url) return 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80';
  if (url.includes('supabase.co')) {
    // Weserv optimizes on the fly, avoiding Vercel quota limits
    return `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}&output=webp&w=${width}&q=80`;
  }
  return url;
}
