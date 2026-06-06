const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://evtjgujsfllegfmtqspq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dGpndWpzZmxsZWdmbXRxc3BxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA4ODU1MiwiZXhwIjoyMDk0NjY0NTUyfQ.NlIvOmJAFKxK_e5xzWv8k5ayZFhILAYEYwRSYuUuh8Y'
);

async function run() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  console.log('Orders:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

run();
