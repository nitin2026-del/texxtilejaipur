require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkLatestOrder() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, payments(*)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching orders:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

checkLatestOrder();
