import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function simulateCheckoutAPI() {
  const { data: products } = await supabaseAdmin.from('products').select('id, price').limit(1);
  if (!products || products.length === 0) return console.log('No products');
  const prod = products[0];

  const payload = {
    user_id: null,
    items: [{ id: prod.id, quantity: 1, price_inr: prod.price }],
    total_inr: prod.price,
    display_currency: 'INR',
    total_display_currency: prod.price,
    shipping_address: {
      full_name: 'Test',
      address_line1: '123 Test',
      city: 'Test City',
      state: 'Test State',
      postal_code: '12345',
      country: 'India',
      phone: '1234567890'
    }
  };

  const response = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log('Response:', response.status, text);
}

simulateCheckoutAPI();
