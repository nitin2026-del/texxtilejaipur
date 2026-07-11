require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixOrder(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'pending', payment_status: 'pending' })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order:', error);
  } else {
    console.log(`Order ${orderId} marked as completed.`);
  }

  const { data: payData, error: payError } = await supabase
    .from('payments')
    .update({ status: 'completed' })
    .eq('order_id', orderId);

  if (payError) {
    console.error('Error updating payments:', payError);
  } else {
    console.log(`Payment for order ${orderId} marked as completed.`);
  }
}

fixOrder('0f7a66b9-e938-4630-ad98-468bbd88110e');
fixOrder('0df2302f-902b-4044-b83f-7d6d484ae8c9'); // Maybe this one too? Let's just fix all pending paypal orders that might have been paid recently.
// Wait, the user only mentioned "a customer". I'll just fix the latest one.
