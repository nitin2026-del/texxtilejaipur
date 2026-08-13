require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixOrder() {
  const { data, error } = await supabase
    .from('orders')
    .update({ total: 10400 })
    .eq('order_number', 'TJ-814016')
    .select();

  if (error) {
    console.error('Error updating order:', error);
  } else {
    console.log('Order updated:', data);
  }
}

fixOrder();
