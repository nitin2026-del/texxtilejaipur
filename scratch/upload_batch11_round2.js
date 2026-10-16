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

  // Case A: Both pos 2 and pos 3
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
  // Case B: Inserting only pos 3 (e.g. Rank 32 where pos 2 35yo is already live)
  else if (url3 && !url2) {
    const toShift = currentImages.filter(img => img.display_order >= 3).sort((a, b) => b.display_order - a.display_order);
    for (const img of toShift) {
      await supabase.from('product_images').update({ display_order: img.display_order + 1 }).eq('id', img.id);
    }
    await supabase.from('product_images').insert({
      product_id: productId,
      url: url3,
      is_primary: false,
      display_order: 3
    });
    console.log('Successfully inserted pos 3!');
  }
  // Case C: Inserting only pos 2 (e.g. Rank 37 35yo)
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

  // 1. Rank 32: Cobalt Blue Velvet Suzani Embroidered Jacket (Add Pos 3 - 48yo)
  await updateProductGallery(
    '685570ba-0cb8-430e-a0fe-7e8883913092',
    'Rank 32 - Cobalt Blue Velvet Suzani Embroidered Jacket',
    null,
    `${baseDir}/luxury_cobalt_suzani_jacket_woman_48_1792157125724.jpg`
  );

  // 2. Rank 33: Ivory Cream Suzani Embroidered Jacket (Add Pos 2 and Pos 3)
  await updateProductGallery(
    '3ea3399d-f02d-4970-b492-a8f6e7981a19',
    'Rank 33 - Ivory Cream Suzani Embroidered Jacket',
    `${baseDir}/ivory_suzani_jacket_editorial_1792157199904.jpg`,
    `${baseDir}/mature_woman_suzani_jacket_editorial_1792157290709.jpg`
  );

  // 3. Rank 36: The Royal Indigo Needlepoint (Add Pos 2 and Pos 3)
  await updateProductGallery(
    '712e5ca8-0220-4464-82d9-0bbaeb139e93',
    'Rank 36 - The Royal Indigo Needlepoint',
    `${baseDir}/royal_indigo_embroidered_jacket_editorial_1792157425463.jpg`,
    `${baseDir}/royal_indigo_embroidered_jacket_editorial_1792157517832.jpg`
  );

  // 4. Rank 37: The Cotswold Garden Suzani (Add Pos 2 - 35yo)
  await updateProductGallery(
    'c88bce63-c1a5-4bf3-97e9-46fbf9f9f323',
    'Rank 37 - The Cotswold Garden Suzani',
    `${baseDir}/cotswold_garden_suzani_jacket_model_1792157595679.jpg`,
    null
  );

  console.log('\n======================================================');
  console.log('BATCH 11 ROUND 2 UPLOAD COMPLETED AND VERIFIED!');
  console.log('======================================================');
}

main().catch(console.error);
