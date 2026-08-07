import { Metadata } from 'next';
import { ReelPlayer } from '@/components/ReelPlayer';
import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'The Artisan Edit | Textile Jaipur',
  description: 'Experience our handcrafted masterpieces in motion. Shop the look directly from our curated video lookbook.',
};

export const revalidate = 60;

export default async function TheArtisanEditPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  let reels: any[] = [];
  
  if (url && key) {
    const supabase = createClient(url, key);
    
    // 1. Fetch published reels from the database
    const { data: btsData } = await supabase
      .from('behind_the_scenes')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
      
    if (btsData && btsData.length > 0) {
      // 2. Extract product IDs to fetch
      const productIdsToFetch = btsData.map(item => {
        if (item.description && item.description.includes('|||')) {
          return item.description.split('|||')[1];
        }
        return null;
      }).filter(Boolean);
      
      // 3. Fetch linked products
      let fetchedProducts: any[] = [];
      if (productIdsToFetch.length > 0) {
        const { data: prodData } = await supabase
          .from('products')
          .select('*, product_images(url,is_primary,display_order)')
          .in('id', productIdsToFetch as string[]);
          
        if (prodData) {
          fetchedProducts = prodData.map((item) => {
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
              category: item.category || 'Ethnic Wear',
              images: sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
              stock: item.stock_quantity || item.stock || 0,
            };
          });
        }
      }
      
      // 4. Map DB reels to UI reels
      reels = btsData.map((item) => {
        let desc = item.description || '';
        let productId = null;
        
        if (desc.includes('|||')) {
          const parts = desc.split('|||');
          desc = parts[0];
          productId = parts[1];
        }
        
        const linkedProduct = productId ? fetchedProducts.find(p => p.id === productId) : null;
        
        return {
          id: item.id,
          videoUrl: item.media_url || '',
          title: item.title,
          description: desc,
          product: linkedProduct || null
        };
      });
    }
  }

  // Fallback to placeholder if no reels in DB
  if (reels.length === 0) {
    reels = [
      {
        id: 'fallback-1',
        videoUrl: 'https://player.vimeo.com/external/498802951.sd.mp4?s=d754b5df5b5e82845c22502efc2bcdd2d74a0c82&profile_id=165&oauth2_token_id=57447761',
        title: 'The Velvet Suzani',
        description: 'Hand-embroidered masterpiece from the heart of Jaipur.',
        product: null
      }
    ];
  }

  return (
    <div className="bg-black min-h-screen">
      <ReelPlayer reels={reels} />
    </div>
  );
}
