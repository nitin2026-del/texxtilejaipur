const fs = require('fs');
const https = require('https');
const path = require('path');

const urls = [
  // Rank 23: Folklore Patchwork Bomber
  { name: 'b10_r23_cover.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/a1efc045-3811-438b-a0da-87afbc7a408e.webp' },
  { name: 'b10_r23_detail.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/82aec3ed-6689-4c85-9046-ebd81582e61f.webp' },

  // Rank 24: Brown Evil Eye Suzani Jacket
  { name: 'b10_r24_cover.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/98371970-beed-42a3-b0b4-eae64a94dfcc.webp' },
  { name: 'b10_r24_detail.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/7c243dc8-017f-4b78-87eb-a62f7310d4d2.webp' },

  // Rank 27: Blue & Gold Paisley Suzani Jacket
  { name: 'b10_r27_cover.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/0fafaf69-7a86-465e-b1a1-efd996407b97.webp' },
  { name: 'b10_r27_detail.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/ab67e4b2-7b78-4e48-948b-6825fa83198d.webp' },

  // Rank 29: Fuchsia Pink Velvet Suzani Jacket
  { name: 'b10_r29_cover.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/d360d902-2852-483b-aaf5-f1993759bdd4.webp' },
  { name: 'b10_r29_detail.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/1e2740ad-161a-4c9b-b83c-1d62c6c175c9.webp' },

  // Rank 30: Lilac Purple Suzani Jacket
  { name: 'b10_r30_cover.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/a6c507c5-5555-4674-8b1d-f8ec009d186c.webp' }
];

async function download(item) {
  const dest = path.join(__dirname, item.name);
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(item.url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log('Downloaded:', item.name);
          resolve();
        });
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const item of urls) {
    try {
      await download(item);
    } catch (e) {
      console.error('Failed to download:', item.name, e);
    }
  }
}

main();
