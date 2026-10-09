const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getNext5() {
  const processedIds = [
    '59314513-c143-49f5-81f6-e721235b8c61',
    '2b2f66da-9197-4b10-9b39-f647220527de',
    '5e5b393a-ee5c-4803-af17-a1796dd2cbbb',
    'ba835eb3-4c34-4138-bc10-cdfe389c640e',
    'bb91e2c3-2a89-4b8c-a755-fe56644f750c',
    '801fddf4-f108-4245-ae66-8a146fa8b69b',
    '4ec8b868-bf75-43ed-bccc-433714d61c65',
    'a7c17406-6202-4179-a734-d8cca37cb71e',
    '568c1c23-5918-4742-a5aa-a4014019653e',
    'bfb1b936-23cf-4318-9d3c-3d4a8fb346ab'
  ];

  const { data, error } = await supabase.from('products').select('*');
  const remaining = data.filter(p => !processedIds.includes(p.id) && p.name.includes('Jacket')).slice(0, 5);
  
  if (remaining.length === 0) {
    console.log("No more jackets found!");
    return;
  }
  
  for (const p of remaining) {
    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', p.id)
      .order('display_order', { ascending: true })
      .limit(1);
      
    console.log(`Product: ${p.name}`);
    console.log(`ID: ${p.id}`);
    console.log(`Ref URL: ${images?.[0]?.url || 'No primary image'}`);
    console.log('---');
  }
}

getNext5();
