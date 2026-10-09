const fs = require('fs');
let content = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

content = content.replace('{r.imageUrls.map((img, idx) => (', '{r.imageUrls.map((img: string, idx: number) => (');

fs.writeFileSync('src/components/ProductPageClient.tsx', content);
console.log('Fixed typings');
