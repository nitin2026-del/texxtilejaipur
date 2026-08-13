require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixOrder() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }

  console.log('Recent Orders:');
  for (const o of orders) {
    console.log(`Order: ${o.order_number}, Total INR: ${o.total}, Subtotal: ${o.subtotal}, Display: ${o.total_display_currency}`);
  }
}

fixOrder();
