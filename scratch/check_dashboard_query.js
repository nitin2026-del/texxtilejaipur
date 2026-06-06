const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://evtjgujsfllegfmtqspq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dGpndWpzZmxsZWdmbXRxc3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODg1NTIsImV4cCI6MjA5NDY2NDU1Mn0.Kz_BZk3rpr3kAWV6fMaEu0kPqOtQdFZx8TTRGT_BzKQ' // ANON KEY
);

async function run() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (
          name,
          images
        )
      )
    `)
    .eq('user_id', '4fe61b05-6001-46c6-8d05-73e2a8300ea7')
    .order('created_at', { ascending: false });
    
  console.log('OrdersData:', data?.length);
  console.log('Error:', error);
}

run();
