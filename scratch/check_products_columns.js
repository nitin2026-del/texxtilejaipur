const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://evtjgujsfllegfmtqspq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dGpndWpzZmxsZWdmbXRxc3BxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA4ODU1MiwiZXhwIjoyMDk0NjY0NTUyfQ.NlIvOmJAFKxK_e5xzWv8k5ayZFhILAYEYwRSYuUuh8Y'
);

async function run() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);
    
  if (data && data.length > 0) {
    console.log('Product Columns:', Object.keys(data[0]));
  }
  console.log('Error:', error);
}

run();
