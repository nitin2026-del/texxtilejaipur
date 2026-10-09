const fs = require('fs');
let content = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

const rx = /const\s+\[activeBadge,\s*setActiveBadge\]\s*=\s*useState<string\s*\|\s*null>\(null\);\s*/;
content = content.replace(rx, '');
fs.writeFileSync('src/components/ProductPageClient.tsx', content);
