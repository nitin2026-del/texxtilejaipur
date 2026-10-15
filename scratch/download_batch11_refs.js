const fs = require('fs');
const https = require('https');
const path = require('path');

const urls = [
  // Rank 28: The Valentine Artisan Fleece / Suzani Jacket
  { name: 'b11_r28_cover.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/f26e089e-ec17-40dd-b55d-938f01c4c769.webp' },
  // Rank 31: Velvet Suzani Short Kimono Jacket
  { name: 'b11_r31_cover.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/bb13a6d7-2703-40f5-b41e-bf35cbc63a8f.webp' },
  // Rank 32: Cobalt Blue Velvet Suzani Jacket
  { name: 'b11_r32_cover.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/e5d9292c-79f4-48c4-b08b-b7285243e73f.webp' },
  // Rank 33: Ivory Cream Suzani Jacket
  { name: 'b11_r33_cover.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/d15663f1-67d4-4278-bfb6-1e6717c7d57b.webp' },
  // Rank 36: The Royal Indigo Needlepoint
  { name: 'b11_r36_cover.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/c356fa57-d3be-40ee-a78f-98718bc964ae.webp' },
  // Rank 37: The Cotswold Garden Suzani
  { name: 'b11_r37_cover.webp', url: 'https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/e274b429-6745-429f-aba8-4efa9590ab57.webp' }
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
