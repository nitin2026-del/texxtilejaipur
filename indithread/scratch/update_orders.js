const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://evtjgujsfllegfmtqspq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dGpndWpzZmxsZWdmbXRxc3BxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA4ODU1MiwiZXhwIjoyMDk0NjY0NTUyfQ.NlIvOmJAFKxK_e5xzWv8k5ayZFhILAYEYwRSYuUuh8Y'
);

async function run() {
  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status: 'paid' })
    .eq('user_id', '4fe61b05-6001-46c6-8d05-73e2a8300ea7');
    
  console.log('Updated orders to paid!');
}

run();
