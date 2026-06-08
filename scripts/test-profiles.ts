import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function testProfiles() {
  const { data, error } = await supabaseAdmin.from('profiles').select('id, jai_coins').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}

testProfiles();
