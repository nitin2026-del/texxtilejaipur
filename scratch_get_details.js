const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getDetails() {
  const skus = ['HT-3CB2856C', 'HT-2F2A2BCB', 'HT-5046D569', 'HT-D6AE71F0', 'HT-91807C13'];
  // The SKU is just HT- followed by the first 8 chars of the ID.
  // It's easier to just fetch all products and filter locally.
  const { data, error } = await supabase.from('products').select('id, name, description, details');
  
  if (error) {
    console.error(error);
    return;
  }
  
  const matched = data.filter(p => {
    const sku = `HT-${p.id.slice(0, 8).toUpperCase()}`;
    return skus.includes(sku);
  });
  
  matched.forEach(p => {
    const sku = `HT-${p.id.slice(0, 8).toUpperCase()}`;
    console.log(`\n--- ${sku} ---`);
    console.log(`Name: ${p.name}`);
    console.log(`Desc: ${p.description}`);
    console.log(`Details: ${JSON.stringify(p.details)}`);
  });
}

getDetails();
