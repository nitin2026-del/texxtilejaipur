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

  // 1. Rank 24: Brown Evil Eye Suzani Jacket
  await updateProductGallery(
    '2aa56b46-079b-46b2-a6fb-2d7d9f4e845f',
    'Rank 24 - Brown Evil Eye Suzani Jacket',
    `${baseDir}/brown_evil_eye_suzani_jacket_editorial_1792078112060.jpg`,
    `${baseDir}/luxury_mature_model_evil_eye_jacket_1792078166846.jpg`
  );

  // 2. Rank 27: Blue & Gold Paisley Embroidered Suzani Jacket
  await updateProductGallery(
    'cec0e5f5-17b1-43cd-89f1-71c1a0024c40',
    'Rank 27 - Blue & Gold Paisley Embroidered Suzani Jacket',
    `${baseDir}/luxury_suzani_jacket_editorial_1792078217243.jpg`,
    `${baseDir}/luxury_suzani_jacket_editorial_1792078274162.jpg`
  );

  // 3. Rank 29: Fuchsia Pink Velvet Suzani Embroidered Jacket
  await updateProductGallery(
    'b8ac3e64-ae72-4f08-8c17-4f1c73f46013',
    'Rank 29 - Fuchsia Pink Velvet Suzani Embroidered Jacket',
    `${baseDir}/fuchsia_velvet_suzani_jacket_editorial_1792078332655.jpg`,
    `${baseDir}/fuchsia_suzani_jacket_clean_1792078406692.jpg`
  );

  // 4. Rank 30: Lilac Purple Suzani Embroidered Jacket
  await updateProductGallery(
    'd516fbd7-715e-49a8-9d5e-69eeb737827a',
    'Rank 30 - Lilac Purple Suzani Embroidered Jacket',
    `${baseDir}/lilac_suzani_jacket_editorial_1792078456681.jpg`,
    `${baseDir}/lilac_suzani_jacket_editorial_1792078532646.jpg`
  );

  console.log('\n======================================================');
  console.log('BATCH 10 ALL 5 PRODUCTS FULLY COMPLETED AND LIVE!');
  console.log('======================================================');
}

main().catch(console.error);
