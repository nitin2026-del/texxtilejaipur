import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data: products } = await supabaseAdmin.from('products').select('id').limit(1);
  if (!products || products.length === 0) return console.log('no products');
  const productId = products[0].id;

  const { data: newOrder, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: `TEST-${Date.now()}`,
        total: 100,
        subtotal: 100,
        status: 'pending',
        payment_status: 'pending'
      })
      .select('id')
      .single();

  if (orderErr) {
    console.error('Order err:', orderErr);
    return;
  }
  
  const finalItems = [{
    product_id: productId,
    quantity: 1,
    price_at_time: 100,
    order_id: newOrder.id
  }];

  const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(finalItems);

  if (itemsError) {
    console.error('Items error:', itemsError);
  } else {
    console.log('Items inserted successfully!');
  }
  
  await supabaseAdmin.from('orders').delete().eq('id', newOrder.id);
}

testInsert();
