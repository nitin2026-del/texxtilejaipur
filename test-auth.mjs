import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Testing authentication...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'akshaygupta24042007@gmail.com',
    password: 'Akshaygupta24@'
  });

  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  console.log('Auth success! User ID:', authData.user.id);

  console.log('Fetching profile...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
  } else {
    console.log('Profile fetch success:', profileData);
  }

  console.log('Testing admin query on products...');
  const { data: prodData, error: prodError } = await supabase
    .from('products')
    .select('*');

  if (prodError) {
    console.error('Products fetch error:', prodError);
  } else {
    console.log('Products fetch success. Count:', prodData.length);
  }

  console.log('Testing admin query on orders...');
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*');

  if (orderError) {
    console.error('Orders fetch error:', orderError);
  } else {
    console.log('Orders fetch success. Count:', orderData.length);
  }
}

run().catch(console.error);
