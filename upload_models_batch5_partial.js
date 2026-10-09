const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const productsToUpdate = [
  {
    id: '2affc501-9ce6-4549-afb4-f46434f3657b',
    name: 'The Cream & Teal Floral Jacket',
    img1: 'cream_teal_35yo_1791459138923.jpg',
    img2: 'cream_teal_48yo_1791459152619.jpg'
  },
  {
    id: '70fab166-8034-405d-bc1a-6de151ced0fc',
    name: 'Velvet Ethnic Embroidery Jacket',
    img1: 'ethnic_embroidery_35yo_1791459164626.jpg',
    img2: 'ethnic_embroidery_48yo_1791459176582.jpg'
  },
  {
    id: 'd0eb90f4-c491-4d33-83d5-17ee0670a136',
    name: 'Embroidered Velvet Suzani Jacket',
    img1: 'embroidered_velvet_suzani_35yo_1791459254311.jpg',
    img2: 'embroidered_velvet_suzani_48yo_1791459266572.jpg'
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
    } else {
       newImagesList.push({ product_id: prod.id, url: url1, is_primary: true, display_order: 1 });
       newImagesList.push({ product_id: prod.id, url: url2, is_primary: false, display_order: 2 });
    }
    
    await supabase.from('product_images').delete().eq('product_id', prod.id);
    
    const toInsert = newImagesList.map(item => { const { id, created_at, ...rest } = item; return rest; });
    const { error: e4 } = await supabase.from('product_images').insert(toInsert);
    if(!e4) console.log(`Success for ${prod.name}`);
  }
}
run();
