require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const restoreData = [
  { order_number: 'TJ-798882', old_total: 10864.3 },
  { order_number: 'TJ-389445', old_total: 10864.3 },
  { order_number: 'TJ-165523', old_total: 5144.3 },
];

async function undoOrders() {
  for (const o of restoreData) {
    let success = false;
    while (!success) {
      const { error } = await supabase
        .from('orders')
        .update({ total: o.old_total })
        .eq('order_number', o.order_number);
      
      if (error) {
        console.error(`Failed to restore ${o.order_number}:`, error.message);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.log(`Restored ${o.order_number} to ${o.old_total}`);
        success = true;
      }
    }
  }
  console.log('Final undo complete.');
}

undoOrders();
