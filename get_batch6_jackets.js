const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getNext5() {
  const processedIds = [
    // Batch 1
    '59314513-c143-49f5-81f6-e721235b8c61', '2b2f66da-9197-4b10-9b39-f647220527de', '5e5b393a-ee5c-4803-af17-a1796dd2cbbb', 'ba835eb3-4c34-4138-bc10-cdfe389c640e', 'bb91e2c3-2a89-4b8c-a755-fe56644f750c',
    // Batch 2
    '801fddf4-f108-4245-ae66-8a146fa8b69b', '4ec8b868-bf75-43ed-bccc-433714d61c65', 'a7c17406-6202-4179-a734-d8cca37cb71e', '568c1c23-5918-4742-a5aa-a4014019653e', 'bfb1b936-23cf-4318-9d3c-3d4a8fb346ab',
    // Batch 3
    '8eeafbab-cf54-411c-a7d0-9862ed70c061', 'b9d291c2-3cc8-4be1-aca0-c6352e3afdf4', '3e213213-b19b-4eea-a962-ef0b56aab8c8', 'b774d2bb-6609-435d-8ba1-778ee3fea833', '4934f30c-eb32-4381-b7f5-8bf12b55e82c',
    // Batch 4
    'b8c28530-7d5f-4cae-9e32-dadf558d380f', '73dcac4b-5e7e-47b7-8e98-bb5eb45fadb8', '9f374974-a83d-4ce7-9444-0af9467aa308', 'cd1206d6-acd8-432c-85ab-702ec0670014', 'd651f415-65e8-4773-9ffa-070a1ca67666',
    // Batch 5
    '2affc501-9ce6-4549-afb4-f46434f3657b', '70fab166-8034-405d-bc1a-6de151ced0fc', 'd0eb90f4-c491-4d33-83d5-17ee0670a136', 'cd887cfe-ffb7-437a-aad8-a5ceebc3143d', 'c527964c-f190-4e72-b898-4694a04f03ec'
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
