const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const productsToUpdate = [
  {
    id: '8eeafbab-cf54-411c-a7d0-9862ed70c061',
    name: 'Long Suzani Kimono',
    // Generated before rate limit:
    img1: 'long_suzani_35yo_1791399511823.jpg',
    // Generated just now:
    img2: 'long_suzani_48yo_1791440718474.jpg'
  },
  {
    id: 'b9d291c2-3cc8-4be1-aca0-c6352e3afdf4',
    name: 'Brown Velvet',
    img1: 'brown_velvet_35yo_1791440731997.jpg',
    img2: 'brown_velvet_48yo_1791440748348.jpg'
  },
  {
    id: '3e213213-b19b-4eea-a962-ef0b56aab8c8',
    name: 'Velvet Suzani Jacket',
    img1: 'velvet_suzani_35yo_1791440789334.jpg',
    img2: 'velvet_suzani_48yo_1791440802213.jpg'
  },
  {
    id: 'b774d2bb-6609-435d-8ba1-778ee3fea833',
    name: 'Canterbury Needlework',
    img1: 'canterbury_35yo_1791440814915.jpg',
    img2: 'canterbury_48yo_1791440827841.jpg'
  },
  {
    id: '4934f30c-eb32-4381-b7f5-8bf12b55e82c',
    name: 'Cotton TNT',
    img1: 'cotton_tnt_2_35yo_1791440869731.jpg',
    img2: 'cotton_tnt_2_48yo_1791440885014.jpg'
  }
];

const basePath = `C:\\Users\\91787\\.gemini\\antigravity\\brain\\e578abc5-5725-4731-888c-367320536024`;

async function run() {
  for (const prod of productsToUpdate) {
    console.log(`Processing ${prod.name}...`);
    
    // 1. Upload img1 (35yo)
    let url1;
    try {
      const file1 = fs.readFileSync(path.join(basePath, prod.img1));
      const filename1 = `ai-models/${prod.id}-35yo-${Date.now()}.jpg`;
      const { data: d1, error: e1 } = await supabase.storage.from('product-images').upload(filename1, file1, { contentType: 'image/jpeg' });
      if(e1) { console.error('Upload error 1:', e1); continue; }
      url1 = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filename1}`;
    } catch(err) {
      console.error(`Missing file for ${prod.name} 35yo: ${prod.img1}`);
      continue;
    }
    
    // 2. Upload img2 (48yo)
    let url2;
    try {
      const file2 = fs.readFileSync(path.join(basePath, prod.img2));
      const filename2 = `ai-models/${prod.id}-48yo-${Date.now()}.jpg`;
      const { data: d2, error: e2 } = await supabase.storage.from('product-images').upload(filename2, file2, { contentType: 'image/jpeg' });
      if(e2) { console.error('Upload error 2:', e2); continue; }
      url2 = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filename2}`;
    } catch(err) {
      console.error(`Missing file for ${prod.name} 48yo: ${prod.img2}`);
      continue; 
    }
    
    // 3. Fetch existing images
    const { data: existing, error: e3 } = await supabase.from('product_images').select('*').eq('product_id', prod.id).order('display_order', { ascending: true });
    if(e3) { console.error('Fetch error:', e3); continue; }
    
    let newImagesList = [];
    if(existing && existing.length > 0) {
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
    
    // 4. Delete old, insert new
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
