import { createClient } from '@supabase/supabase-js';
import { handlePaymentSuccess } from '../src/lib/paymentSuccessHandler';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function runTest() {
  console.log('--- Starting Payment Success Test ---');
  
  // 1. Create a dummy user profile
  const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: 'test' + Math.floor(Math.random() * 1000) + '@example.com',
    password: 'password123',
    email_confirm: true
  });
  
  if (userError || !user.user) {
    console.error('Failed to create user:', userError);
    return;
  }
  
  const userId = user.user.id;
  
  // Insert profile
  await supabaseAdmin.from('profiles').insert({
    id: userId,
    full_name: 'Test Buyer',
    first_name: 'Test',
    last_name: 'Buyer',
    jai_coins: 1000
  });

  // 2. Fetch existing product
  const { data: product, error: productError } = await supabaseAdmin.from('products').select('*').limit(1).single();
  
  if (productError || !product) {
    console.error('Failed to fetch existing product:', productError);
    return;
  }
  
  // 3. Insert dummy order
  const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
    user_id: userId,
    order_number: 'TEST-' + Math.floor(Math.random() * 1000),
    total: 500,
    subtotal: 500,
    status: 'pending',
    payment_status: 'pending'
  }).select().single();
  
  if (orderError || !order) {
    console.error('Failed to create order:', orderError);
    return;
  }

  // 4. Insert order items
  await supabaseAdmin.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    quantity: 1,
    price_at_time: 500
  });

  console.log(`Created test order ${order.id}. Current stock: ${product.stock_qty}. Calling handlePaymentSuccess...`);

  // 5. Run the handler!
  try {
    await handlePaymentSuccess(order.id, supabaseAdmin);
    console.log('handlePaymentSuccess executed successfully!');
    
    // 6. Verify the results
    const { data: checkOrder } = await supabaseAdmin.from('orders').select('*').eq('id', order.id).single();
    console.log('Order Status:', checkOrder.status, '| Payment Status:', checkOrder.payment_status);
    
    const { data: checkProduct } = await supabaseAdmin.from('products').select('*').eq('id', product.id).single();
    console.log('Product Stock Before:', product.stock, '| Product Stock After:', checkProduct.stock);
    
    if (checkOrder.status === 'processing' && checkOrder.payment_status === 'paid' && checkProduct.stock === (product.stock - 1)) {
      console.log('✅ TEST PASSED: Database updated correctly.');
    } else {
      console.log('❌ TEST FAILED: Database updates did not match expected values.');
    }
    
  } catch (err) {
    console.error('Test threw an error:', err);
  }
  
  // Cleanup
  console.log('Cleaning up test data...');
  await supabaseAdmin.from('orders').delete().eq('id', order.id);
  // Restore product stock manually if needed, but for test we won't bother
  await supabaseAdmin.auth.admin.deleteUser(userId);
  
  console.log('--- Test Complete ---');
}

runTest();
