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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Inserting test product for checkout testing...');

  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .limit(1)
    .single();

  if (!category) {
    console.error('No categories found. Cannot insert product.');
    return;
  }

  const testProduct = {
    name: 'Test Product (For Checkout)',
    slug: 'test-product-checkout-' + Date.now(),
    description: 'A cheap dummy product added specifically to test the PayPal checkout integration.',
    price: 1,
    stock: 100,
    stock_quantity: 100,
    status: 'active',
    category_id: category.id,
    is_featured: true,
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('products')
    .insert(testProduct)
    .select('id')
    .single();

  if (insertErr) {
    console.error('Error inserting test product:', insertErr);
    return;
  }

  const productId = inserted.id;
  console.log(`Inserted test product successfully: ID ${productId}`);

  // Insert a dummy image
  const { error: imgInsertErr } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
      is_primary: true,
      display_order: 1
    });

  if (imgInsertErr) {
    console.error('Error inserting product image:', imgInsertErr);
  } else {
    console.log('Added dummy image to test product.');
  }

  console.log('Done!');
}

run().catch(console.error);
