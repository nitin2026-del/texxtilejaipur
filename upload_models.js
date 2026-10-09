const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const productsToUpdate = [
  {
    id: '59314513-c143-49f5-81f6-e721235b8c61',
    name: 'Cotton TNT Embroidery Suzani Jacket',
    img1: 'tnt_model_35yo_1791380213730.jpg',
    img2: 'tnt_model_48yo_1791380235206.jpg'
  },
  {
    id: '2b2f66da-9197-4b10-9b39-f647220527de',
    name: 'Mustard Yellow Patterned Cotton Corduroy Open-Front Jacket',
    img1: 'mustard_jacket_35yo_1791380365287.jpg',
    img2: 'mustard_jacket_48yo_1791380398005.jpg'
  },
  {
    id: '5e5b393a-ee5c-4803-af17-a1796dd2cbbb',
    name: 'The Ivory Bloom Suzani Jacket',
    img1: 'ivory_35yo_1791380696635.jpg',
    img2: 'ivory_48yo_1791380820568.jpg'
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
    
    // 4. Reorder logic
    // We want to insert url1 at display_order 2, and url2 at display_order 3.
    // existing[0] stays at 1.
    // existing[1..] get shifted to 4, 5, etc.
    
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
    
    // clean up ids from existing items so we can re-insert them cleanly
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
