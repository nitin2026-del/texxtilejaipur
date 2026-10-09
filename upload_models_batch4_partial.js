const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const productsToUpdate = [
  {
    id: 'b8c28530-7d5f-4cae-9e32-dadf558d380f',
    name: 'Dark Grey Corduroy',
    img1: 'dark_grey_corduroy_35yo_1791441164651.jpg',
    img2: 'dark_grey_corduroy_48yo_1791441177221.jpg'
  },
  {
    id: '73dcac4b-5e7e-47b7-8e98-bb5eb45fadb8',
    name: 'Premium Cotton Suzani',
    img1: 'premium_cotton_35yo_1791441249830.jpg',
    img2: 'premium_cotton_48yo_1791441264170.jpg'
  }
];

const basePath = `C:\\Users\\91787\\.gemini\\antigravity\\brain\\e578abc5-5725-4731-888c-367320536024`;

async function run() {
  for (const prod of productsToUpdate) {
    console.log(`Processing ${prod.name}...`);
    
    const file1 = fs.readFileSync(path.join(basePath, prod.img1));
    const filename1 = `ai-models/${prod.id}-35yo-${Date.now()}.jpg`;
    const { error: e1 } = await supabase.storage.from('product-images').upload(filename1, file1, { contentType: 'image/jpeg' });
    if(e1) { console.error('Upload error 1:', e1); continue; }
    const url1 = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filename1}`;
    
    const file2 = fs.readFileSync(path.join(basePath, prod.img2));
    const filename2 = `ai-models/${prod.id}-48yo-${Date.now()}.jpg`;
    const { error: e2 } = await supabase.storage.from('product-images').upload(filename2, file2, { contentType: 'image/jpeg' });
    if(e2) { console.error('Upload error 2:', e2); continue; }
    const url2 = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filename2}`;
    
    const { data: existing, error: e3 } = await supabase.from('product_images').select('*').eq('product_id', prod.id).order('display_order', { ascending: true });
    
    let newImagesList = [];
    if(existing && existing.length > 0) {
       newImagesList.push({...existing[0], display_order: 1});
       newImagesList.push({ product_id: prod.id, url: url1, is_primary: false, display_order: 2 });
       newImagesList.push({ product_id: prod.id, url: url2, is_primary: false, display_order: 3 });
       
       for(let i=1; i<existing.length; i++) {
          newImagesList.push({...existing[i], display_order: i + 3});
       }
    }
    
    await supabase.from('product_images').delete().eq('product_id', prod.id);
    
    const toInsert = newImagesList.map(item => { const { id, created_at, ...rest } = item; return rest; });
    const { error: e4 } = await supabase.from('product_images').insert(toInsert);
    if(!e4) console.log(`Success for ${prod.name}`);
  }
}
run();
