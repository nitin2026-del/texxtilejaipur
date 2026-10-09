const fs = require('fs');
const lines = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('<div className="grid lg:grid-cols-2') || l.includes('<div className="grid md:grid-cols-2') || l.includes('grid '));
if(start !== -1) {
  console.log(lines.slice(start, start + 120).join('\n'));
} else {
  const start2 = lines.findIndex(l => l.includes('<main'));
  console.log(lines.slice(start2, start2 + 120).join('\n'));
}
