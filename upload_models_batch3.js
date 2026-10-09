const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const productsToUpdate = [
  {
    id: '801fddf4-f108-4245-ae66-8a146fa8b69b',
    name: 'White Floral Printed Cotton Corduroy',
    img1: 'white_corduroy_35yo_1791399178352.jpg',
    img2: 'white_corduroy_48yo_1791399315515.jpg'
  },
  {
    id: '4ec8b868-bf75-43ed-bccc-433714d61c65',
    name: 'Artisan Whimsical Velvet',
    img1: 'whimsical_velvet_35yo_1791399189912.jpg',
    img2: 'whimsical_velvet_48yo_1791399326456.jpg'
  },
  {
    id: 'a7c17406-6202-4179-a734-d8cca37cb71e',
    name: 'Traditional Embroidered Velvet',
    img1: 'traditional_velvet_35yo_1791399201490.jpg',
    img2: 'traditional_velvet_48yo_1791399337758.jpg'
  },
  {
    id: '568c1c23-5918-4742-a5aa-a4014019653e',
    name: 'Blue Cowboy Snake',
    img1: 'cowboy_snake_35yo_1791399229677.jpg',
    img2: 'cowboy_snake_48yo_1791399351434.jpg'
  },
  {
    id: 'bfb1b936-23cf-4318-9d3c-3d4a8fb346ab',
    name: 'Statement Embroidered Velvet',
    img1: 'statement_velvet_35yo_1791399244309.jpg',
    img2: 'statement_velvet_48yo_1791399362611.jpg'
  }
];

const basePath = `C:\\Users\\91787\\.gemini\\antigravity\\brain\\e578abc5-5725-4731-888c-367320536024`;

async function run() {
  for (const prod of productsToUpdate) {
    console.log(`Processing ${prod.name}...`);
    
    // 1. Upload img1 (35yo)
    const file1 = fs.readFileSync(path.join(basePath, prod.img1));
    const filename1 = `ai-models/${prod.id}-35yo-${Date.now()}.jpg`;
    const { data: d1, error: e1 } = await supabase.storage.from('product-images').upload(filename1, file1, { contentType: 'image/jpeg' });
    if(e1) { console.error('Upload error 1:', e1); continue; }
    const url1 = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filename1}`;
    
    // 2. Upload img2 (48yo)
    const file2 = fs.readFileSync(path.join(basePath, prod.img2));
    const filename2 = `ai-models/${prod.id}-48yo-${Date.now()}.jpg`;
    const { data: d2, error: e2 } = await supabase.storage.from('product-images').upload(filename2, file2, { contentType: 'image/jpeg' });
    if(e2) { console.error('Upload error 2:', e2); continue; }
    const url2 = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filename2}`;
    
    // 3. Fetch existing images for this product
    const { data: existing, error: e3 } = await supabase.from('product_images').select('*').eq('product_id', prod.id).order('display_order', { ascending: true });
    if(e3) { console.error('Fetch error:', e3); continue; }
    
    let newImagesList = [];
    if(existing.length > 0) {
       newImagesList.push({...existing[0], display_order: 1});
       newImagesList.push({ product_id: prod.id, url: url1, is_primary: false, display_order: 2 });
       newImagesList.push({ product_id: prod.id, url: url2, is_primary: false, display_order: 3 });
       
       for(let i=1; i<existing.length; i++) {
          newImagesList.push({...existing[i], display_order: i + 3});
       }
    } else {
       newImagesList.push({ product_id: prod.id, url: url1, is_primary: true, display_order: 1 });
       newImagesList.push({ product_id: prod.id, url: url2, is_primary: false, display_order: 2 });
    }
    
    // Delete old, insert new
    await supabase.from('product_images').delete().eq('product_id', prod.id);
    
    const toInsert = newImagesList.map(item => {
       const { id, created_at, ...rest } = item;
       return rest;
    });
    
    const { error: e4 } = await supabase.from('product_images').insert(toInsert);
    if(e4) console.error('Insert error:', e4);
    else console.log(`Success for ${prod.name}`);
  }
}

run();
