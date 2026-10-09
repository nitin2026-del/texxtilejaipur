const fs = require('fs');
const path = 'src/components/ProductPageClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure next/image is imported
if (!content.includes("import Image from 'next/image'")) {
  content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport Image from 'next/image';");
}

// 1. Gallery main image
content = content.replace(
  /<img\s+src=\{getOptimizedUrl\(media\.url,\s*800\)\}\s+alt=\{[^}]+\}\s+className="([^"]+)"\s*\/>/g,
  '<Image src={getOptimizedUrl(media.url, 800)} alt={`${product.name} view ${idx + 1}`} fill priority={idx === 0} sizes="(max-width: 768px) 100vw, 50vw" className="$1" />'
);

// 2. Thumbnails
content = content.replace(
  /<img\s+src=\{media\.type === 'image' \? getOptimizedUrl\(media\.url, 200\) : getOptimizedUrl\(product\.images\?\.\[0\], 200\)\}\s+alt=\{`Thumbnail \$\{idx\}`\}\s+loading="lazy"\s+className="([^"]+)"\s*\/>/g,
  '<Image src={media.type === "image" ? getOptimizedUrl(media.url, 200) : getOptimizedUrl(product.images?.[0], 200)} alt={`Thumbnail ${idx}`} fill sizes="100px" className="$1" />'
);

// 3. Related products
content = content.replace(
  /<img\s+src=\{getOptimizedUrl\(rp\.image,\s*400\)\}\s+alt=\{rp\.name\}\s+loading="lazy"\s+className="([^"]+)"\s*\/>/g,
  '<Image src={getOptimizedUrl(rp.image, 400)} alt={rp.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="$1" />'
);

// 4. Sibling products
content = content.replace(
  /<img\s+src=\{getOptimizedUrl\(sib\.image \|\| '',\s*100\)\}\s+alt=\{sib\.name\}\s+className="([^"]+)"\s*\/>/g,
  '<Image src={getOptimizedUrl(sib.image || "", 100)} alt={sib.name} fill sizes="100px" className="$1" />'
);

// 5. Cross-sell image (the modal one)
content = content.replace(
  /<img\s+src=\{getOptimizedUrl\(product\.images\?\.\[0\] \|\| '',\s*100\)\}\s+alt=\{product\.name\}\s+className="([^"]+)"\s*\/>/g,
  '<Image src={getOptimizedUrl(product.images?.[0] || "", 100)} alt={product.name} fill sizes="100px" className="$1" />'
);

fs.writeFileSync(path, content);
console.log('Image optimization applied successfully!');
