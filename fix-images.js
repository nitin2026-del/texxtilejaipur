const fs = require('fs');
const path = 'src/components/ProductPageClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure next/image is imported
if (!content.includes(import Image from 'next/image')) {
  content = content.replace(import Link from 'next/link';, import Link from 'next/link';\nimport Image from 'next/image';);
}

// 1. Gallery main image
content = content.replace(
  /<img\s*\n\s*src=\{getOptimizedUrl\(media\.url, 800\)\}\s*\n\s*alt=\{\\$\{product\.name\} view \$\{idx \+ 1\} - \$\{product\.category\} from Textile Jaipur\\}\s*\n\s*className="w-full h-full object-cover/g,
  '<Image src={getOptimizedUrl(media.url, 800)} alt={${product.name} view } fill priority={idx === 0} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover'
);

// 2. Thumbnails
content = content.replace(
  /<img\s*\n\s*src=\{media\.type === 'image' \? getOptimizedUrl\(media\.url, 200\) : getOptimizedUrl\(product\.images\?\.\[0\], 200\)\}\s*\n\s*alt=\{\Thumbnail \$\{idx\}\\}\s*\n\s*className="w-full h-full object-cover/g,
  '<Image src={media.type === "image" ? getOptimizedUrl(media.url, 200) : getOptimizedUrl(product.images?.[0], 200)} alt={Thumbnail } fill sizes="100px" className="object-cover'
);

// 3. Related products
content = content.replace(
  /<img\s*\n\s*src=\{getOptimizedUrl\(rp\.image, 400\)\}\s*\n\s*alt=\{rp\.name\}\s*\n\s*className="w-full h-full object-cover/g,
  '<Image src={getOptimizedUrl(rp.image, 400)} alt={rp.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover'
);

// 4. Sibling products
content = content.replace(
  /<img\s*\n\s*src=\{getOptimizedUrl\(sib\.image \|\| '', 100\)\}\s*\n\s*alt=\{sib\.name\}\s*\n\s*className="w-full h-full object-cover/g,
  '<Image src={getOptimizedUrl(sib.image || "", 100)} alt={sib.name} fill sizes="100px" className="object-cover'
);

// 5. Cross-sell image (the modal one)
content = content.replace(
  /<img\s*\n\s*src=\{getOptimizedUrl\(product\.images\?\.\[0\] \|\| '', 100\)\}\s*\n\s*alt=\{product\.name\}\s*\n\s*className="w-full h-full object-cover/g,
  '<Image src={getOptimizedUrl(product.images?.[0] || "", 100)} alt={product.name} fill sizes="100px" className="object-cover'
);

fs.writeFileSync(path, content);
console.log('Image optimization applied successfully!');
