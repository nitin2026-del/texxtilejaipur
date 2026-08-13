require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const restoreData = [
  { order_number: 'TJ-798882', old_total: 10864.3 },
  { order_number: 'TJ-389445', old_total: 10864.3 },
  { order_number: 'TJ-981976', old_total: 5664.3 },
  { order_number: 'TJ-830325', old_total: 5464.3 },
  { order_number: 'TJ-883343', old_total: 5144.3 },
  { order_number: 'TJ-996648', old_total: 5144.3 },
  { order_number: 'TJ-350757', old_total: 5144.3 },
  { order_number: 'TJ-165523', old_total: 5144.3 },
  { order_number: 'TJ-886897', old_total: 5214.3 },
  { order_number: 'TJ-621201', old_total: 9824.3 },
  { order_number: 'TJ-374631', old_total: 9824.3 },
  { order_number: 'TJ-695123', old_total: 5144.3 },
  { order_number: 'TJ-465240', old_total: 5144.3 },
  { order_number: 'TJ-777431', old_total: 5144.3 },
  { order_number: 'TJ-653818', old_total: 5144.3 },
  { order_number: 'TJ-388245', old_total: 6964.3 },
  { order_number: 'TJ-300352', old_total: 13464.3 },
  { order_number: 'TJ-874030', old_total: 6964.3 },
  { order_number: 'TJ-899314', old_total: 6964.3 },
  { order_number: 'TJ-814016', old_total: 10864.3 }
];

async function undoOrders() {
  for (const o of restoreData) {
    const { error } = await supabase
      .from('orders')
      .update({ total: o.old_total })
      .eq('order_number', o.order_number);
    
    if (error) {
      console.error(`Failed to restore ${o.order_number}:`, error);
    } else {
      console.log(`Restored ${o.order_number} to ${o.old_total}`);
    }
  }
  console.log('Undo complete.');
}

undoOrders();
