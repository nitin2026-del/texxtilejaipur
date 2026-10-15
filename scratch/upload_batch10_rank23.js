const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function uploadFile(localPath, storagePath) {
  const fileBuffer = fs.readFileSync(localPath);
  const { error } = await supabase.storage
    .from('product-images')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });
  if (error) {
    throw new Error('Upload error for ' + storagePath + ': ' + error.message);
  }
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(storagePath);
  return publicUrl;
}

async function updateProductGallery(productId, productName, pos2Path, pos3Path) {
  console.log(`\n======================================================`);
  console.log(`Processing: ${productName} (${productId})`);
  console.log(`======================================================`);

  const { data: currentImages, error: fetchErr } = await supabase
    .from('product_images')
    .select('id, url, is_primary, display_order')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });

  if (fetchErr) throw fetchErr;

  console.log('Current gallery:');
  currentImages.forEach(img => console.log(`  Pos ${img.display_order} | Primary: ${img.is_primary} | ${img.url}`));

  let url2 = null;
  if (pos2Path) {
    const tsMatch = pos2Path.match(/(\d{10,})/);
    const ts = tsMatch ? tsMatch[1] : Date.now();
    const storagePath = `ai-models/${productId}-35yo-${ts}.jpg`;
    console.log(`Uploading 35yo to ${storagePath}...`);
    url2 = await uploadFile(pos2Path, storagePath);
    console.log('35yo URL:', url2);
  }

  let url3 = null;
  if (pos3Path) {
    const tsMatch = pos3Path.match(/(\d{10,})/);
    const ts = tsMatch ? tsMatch[1] : Date.now();
    const storagePath = `ai-models/${productId}-48yo-${ts}.jpg`;
    console.log(`Uploading 48yo to ${storagePath}...`);
    url3 = await uploadFile(pos3Path, storagePath);
    console.log('48yo URL:', url3);
  }

  if (url2 && url3) {
    const toShift = currentImages.filter(img => img.display_order >= 2).sort((a, b) => b.display_order - a.display_order);
    for (const img of toShift) {
      await supabase.from('product_images').update({ display_order: img.display_order + 2 }).eq('id', img.id);
    }
    await supabase.from('product_images').insert({
      product_id: productId,
      url: url2,
      is_primary: false,
      display_order: 2
    });
    await supabase.from('product_images').insert({
      product_id: productId,
      url: url3,
      is_primary: false,
      display_order: 3
    });
    console.log('Successfully inserted pos 2 and pos 3!');
  }

  const { data: finalGallery } = await supabase
    .from('product_images')
    .select('id, url, is_primary, display_order')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });

  console.log('\nFinal gallery:');
  finalGallery.forEach(img => console.log(`  Pos ${img.display_order} | Primary: ${img.is_primary} | ${img.url}`));
}

async function main() {
  const baseDir = 'C:/Users/91787/.gemini/antigravity/brain/e578abc5-5725-4731-888c-367320536024';
  await updateProductGallery(
    'f355e192-4974-413f-b4d4-473ff399abe7',
    'Rank 23 - The Folklore Patchwork Bomber',
    `${baseDir}/luxury_folklore_bomber_editorial_1792073297267.jpg`,
    `${baseDir}/folklore_boho_bomber_editorial_1792073365523.jpg`
  );
}

main().catch(console.error);
