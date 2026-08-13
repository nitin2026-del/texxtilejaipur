require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAllOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }

  for (const o of orders) {
    // If the difference between total and subtotal is exactly 5 / 0.010769 (464.295)
    // we need to fix it.
    const expectedOldDiff = 5 / 0.010769;
    if (Math.abs(o.total - o.subtotal - expectedOldDiff) < 1) {
      // Calculate what it should have been based on total_display_currency
      // If total_display is ~$115, then express shipping ($3)
      // If total_display is ~$112, then standard shipping ($0)
      let newTotal = o.subtotal;
      const displayTotal = parseFloat(o.total_display_currency);
      const subtotalUsd = o.subtotal * 0.010769;
      
      if (Math.abs(displayTotal - subtotalUsd - 3) < 1) {
        // Express shipping
        newTotal += (3 / 0.010769);
      }
      
      console.log(`Fixing ${o.order_number}: Old total: ${o.total}, New total: ${newTotal}`);
      await supabase.from('orders').update({ total: newTotal }).eq('id', o.id);
    }
  }
  console.log('Done fixing all recent orders.');
}

fixAllOrders();
