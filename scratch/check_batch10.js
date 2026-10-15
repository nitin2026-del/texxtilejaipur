const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, display_rank, price, status')
    .order('display_rank', { ascending: true, nullsFirst: false })
    .gte('display_rank', 15)
    .limit(35);

  if (error) {
    console.error(error);
    return;
  }

  const pending = [];
  for (const p of products) {
    const { data: images } = await supabase
      .from('product_images')
      .select('id, url, is_primary, display_order')
      .eq('product_id', p.id)
      .order('display_order', { ascending: true });

    const aiImages = images ? images.filter(img => img.url && img.url.includes('ai-models/')) : [];
    const hasAiModel = aiImages.length >= 2;
    
    console.log(`Rank ${p.display_rank} | AI Models: ${aiImages.length} | ${p.id} | ${p.name}`);
    if (!hasAiModel) {
      pending.push({
        id: p.id,
        rank: p.display_rank,
        name: p.name,
        cover: images && images[0] ? images[0].url : null,
        images: images || [],
        aiCount: aiImages.length
      });
    }
  }

  console.log('\n--- TOP 7 PENDING CANDIDATES FOR BATCH 10 ---');
  pending.slice(0, 7).forEach((p, idx) => {
    console.log(`\n[${idx + 1}] Rank ${p.rank} (AI count: ${p.aiCount}): ${p.name}`);
    console.log(`ID: ${p.id}`);
    console.log(`Cover: ${p.cover}`);
    console.log(`Total images: ${p.images.length}`);
    p.images.forEach(img => {
      console.log(`   pos ${img.display_order} (primary: ${img.is_primary}): ${img.url}`);
    });
  });
}

main();
