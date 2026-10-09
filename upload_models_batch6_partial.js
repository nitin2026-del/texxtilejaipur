const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const productsToUpdate = [
  {
    id: '84e8d0d1-7d40-4d55-9389-808378738440',
    name: 'Ochre Yellow Velvet Suzani',
    img1: 'ochre_yellow_35yo_1791477800171.jpg',
    img2: 'ochre_yellow_48yo_1791477810990.jpg'
  },
  {
    id: '24dd340c-bee6-4494-86b0-d3b4b9d673c5',
    name: 'Bohemian Suzani Embroidered',
    img1: 'bohemian_suzani_35yo_1791477821255.jpg',
    img2: 'bohemian_suzani_48yo_1791477832264.jpg'
  },
  {
    id: '97c9e512-eb28-4353-9704-ba2943b1b6b4',
    name: 'Womens Velvet Suzani Jacket',
    img1: 'womens_velvet_suzani_35yo_1791477898675.jpg',
    img2: 'womens_velvet_suzani_48yo_1791477909253.jpg'
  }
];

const basePath = `C:\\Users\\91787\\.gemini\\antigravity\\brain\\e578abc5-5725-4731-888c-367320536024`;

async function run() {
  for (const prod of productsToUpdate) {
    console.log(`Processing ${prod.name}...`);
    
    // Upload 35yo
    const file1Path = path.join(basePath, prod.img1);
    const file1 = fs.readFileSync(file1Path);
    const filename1 = `ai-models/${prod.id}-35yo-${Date.now()}.jpg`;
    const { error: e1 } = await supabase.storage.from('product-images').upload(filename1, file1, { contentType: 'image/jpeg' });
    if(e1) { console.error('Upload error 1:', e1); continue; }
    const url1 = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filename1}`;
    
    // Upload 48yo
    const file2Path = path.join(basePath, prod.img2);
    const file2 = fs.readFileSync(file2Path);
    const filename2 = `ai-models/${prod.id}-48yo-${Date.now()}.jpg`;
    const { error: e2 } = await supabase.storage.from('product-images').upload(filename2, file2, { contentType: 'image/jpeg' });
    if(e2) { console.error('Upload error 2:', e2); continue; }
    const url2 = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filename2}`;
    
    // Fetch existing images
    const { data: existing, error: e3 } = await supabase.from('product_images').select('*').eq('product_id', prod.id).order('display_order', { ascending: true });
    
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
    
    // Replace
    await supabase.from('product_images').delete().eq('product_id', prod.id);
    
    const toInsert = newImagesList.map(item => { const { id, created_at, ...rest } = item; return rest; });
    const { error: e4 } = await supabase.from('product_images').insert(toInsert);
    if(!e4) console.log(`Success for ${prod.name}`);
    else console.error('Insert error:', e4);
  }
}
run();
