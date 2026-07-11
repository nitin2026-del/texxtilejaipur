require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkOrder(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, payment_status, status, guest_email')
    .eq('id', orderId)
    .single();

  console.log(data);
}

checkOrder('0f7a66b9-e938-4630-ad98-468bbd88110e');
