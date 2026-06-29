const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getDetails() {
  const skus = ['HT-52B60A68'];
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
