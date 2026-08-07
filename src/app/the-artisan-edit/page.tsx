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

  let products = [];
  
  if (url && key) {
    const supabase = createClient(url, key);
    // Fetch a few featured jackets to link to the reels
    const { data } = await supabase
      .from('products')
      .select('*, product_images(url,is_primary,display_order)')
      .eq('is_featured', true)
      .limit(5);
      
    if (data) {
      products = data.map((item) => {
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

  // Placeholder reels with stunning vertical fashion videos from Pexels/Unsplash
  const reels = [
    {
      id: 'reel-1',
      videoUrl: 'https://player.vimeo.com/external/498802951.sd.mp4?s=d754b5df5b5e82845c22502efc2bcdd2d74a0c82&profile_id=165&oauth2_token_id=57447761',
      title: 'The Velvet Suzani',
      description: 'Hand-embroidered masterpiece from the heart of Jaipur.',
      product: products[0] || null
    },
    {
      id: 'reel-2',
      videoUrl: 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b88d20a00b2a6fe1ba4f1&profile_id=165&oauth2_token_id=57447761',
      title: 'Bohemian Summer',
      description: 'Block-printed perfection for the modern wanderer.',
      product: products[1] || null
    },
    {
      id: 'reel-3',
      videoUrl: 'https://player.vimeo.com/external/420237731.sd.mp4?s=f5ef861c8c1e8d7d91cc3a0b5f58c7cc1923e3e0&profile_id=164&oauth2_token_id=57447761',
      title: 'Artisan Heritage',
      description: 'Every stitch tells a story of generation-old craftsmanship.',
      product: products[2] || null
    }
  ];

  return (
    <div className="bg-black min-h-screen">
      <ReelPlayer reels={reels} />
    </div>
  );
}
