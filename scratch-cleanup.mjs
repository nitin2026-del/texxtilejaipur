import { createClient } from '@supabase/supabase-js';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanDuplicates() {
  console.log('Fetching all addresses...');
  const { data: addresses, error } = await supabase.from('shipping_addresses').select('*');
  if (error) throw error;

  const unique = new Map();
  const toDelete = [];

  console.log('Addresses:', addresses.length);
  for (const addr of addresses) {
    const key = `${addr.user_id}-${addr.full_name}-${addr.address_line1}-${addr.city}-${addr.state}`;
    if (unique.has(key)) {
      toDelete.push(addr.id);
    } else {
      unique.set(key, addr.id);
    }
  }

  console.log(`Found ${toDelete.length} duplicates to delete.`);
  
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('shipping_addresses')
      .delete()
      .in('id', toDelete);
    
    if (deleteError) {
      console.error('Failed to delete:', deleteError);
    } else {
      console.log('Successfully deleted duplicates!');
    }
  }
}

cleanDuplicates().catch(console.error);
