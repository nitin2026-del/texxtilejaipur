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

  // Case A: Both pos2 and pos3
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
  // Case B: Only pos2 (e.g. 35yo model generated, 48yo pending quota)
  else if (url2 && !url3) {
    const toShift = currentImages.filter(img => img.display_order >= 2).sort((a, b) => b.display_order - a.display_order);
    for (const img of toShift) {
      await supabase.from('product_images').update({ display_order: img.display_order + 1 }).eq('id', img.id);
    }
    await supabase.from('product_images').insert({
      product_id: productId,
      url: url2,
      is_primary: false,
      display_order: 2
    });
    console.log('Successfully inserted pos 2!');
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

  // 1. Rank 28: The Valentine Artisan Fleece / Suzani Jacket
  await updateProductGallery(
    'aab54b7b-ed43-4c9f-8e2d-cf69bb37c707',
    'Rank 28 - The Valentine Artisan Fleece',
    `${baseDir}/valentine_artisan_jacket_editorial_1792078856130.jpg`,
    `${baseDir}/valentine_jacket_mature_model_1792078926760.jpg`
  );

  // 2. Rank 31: Velvet Suzani Embroidered Short Kimono Jacket
  await updateProductGallery(
    '05deadbe-796f-4a58-bfec-7dbacfcba275',
    'Rank 31 - Velvet Suzani Embroidered Short Kimono Jacket',
    `${baseDir}/luxury_velvet_suzani_kimono_1792078980471.jpg`,
    `${baseDir}/velvet_suzani_kimono_editorial_1792079032909.jpg`
  );

  // 3. Rank 32: Cobalt Blue Velvet Suzani Embroidered Jacket (Pos 2 - 35yo)
  await updateProductGallery(
    '685570ba-0cb8-430e-a0fe-7e8883913092',
    'Rank 32 - Cobalt Blue Velvet Suzani Embroidered Jacket',
    `${baseDir}/cobalt_velvet_suzani_editorial_1792079091348.jpg`,
    null
  );

  console.log('\n======================================================');
  console.log('BATCH 11 GENERATED IMAGES UPLOADED AND LIVE!');
  console.log('======================================================');
}

main().catch(console.error);
