require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  const empty = products.filter(p => !p.description || p.description.length < 20 || !p.details?.translations);
  console.log(JSON.stringify(empty, null, 2));
}

run();
