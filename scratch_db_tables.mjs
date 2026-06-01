import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env.local');

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    envVars[key] = val;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.rpc('get_tables_info');
  if (error) {
    console.log('RPC get_tables_info error:', error.message);
    // fallback: run direct query via raw query (if rpc not defined, we can try querying some tables)
    // Let's try executing standard sql if we have an endpoint, or query profiles, products, categories, product_images, orders, etc.
    const tablesList = ['products', 'product_images', 'categories', 'collections', 'profiles', 'orders', 'order_items', 'payments', 'shipping_addresses', 'shipments'];
    for (const table of tablesList) {
      const { data: tblData, error: tblErr } = await supabase.from(table).select('*').limit(1);
      if (tblErr) {
        console.log(`Table ${table} check failed:`, tblErr.message);
      } else {
        console.log(`Table ${table} check success. Sample:`, tblData[0] ? Object.keys(tblData[0]) : 'empty');
      }
    }
  } else {
    console.log('Tables info:', data);
  }
}

run().catch(console.error);
