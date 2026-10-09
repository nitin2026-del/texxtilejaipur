const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getNext5() {
  const processedIds = [
    '59314513-c143-49f5-81f6-e721235b8c61',
    '2b2f66da-9197-4b10-9b39-f647220527de',
    '5e5b393a-ee5c-4803-af17-a1796dd2cbbb',
    'ba835eb3-4c34-4138-bc10-cdfe389c640e',
    'bb91e2c3-2a89-4b8c-a755-fe56644f750c'
  ];

  const { data, error } = await supabase
    .from('products')
    .select('id, name')
    .not('id', 'in', `(${processedIds.join(',')})`)
    .limit(5);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  for (const p of data) {
    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', p.id)
      .eq('is_primary', true)
      .limit(1);
      
    console.log(`Product: ${p.name}`);
    console.log(`ID: ${p.id}`);
    console.log(`Ref URL: ${images?.[0]?.url || 'No primary image'}`);
    console.log('---');
  }
}

getNext5();
