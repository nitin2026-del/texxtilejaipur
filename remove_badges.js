const fs = require('fs');
let content = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('{/* Circular Badges */}'));

let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].includes('AS SEEN IN OUR AD') || lines[i].includes('{/* AI Heritage & Styling Guide */}')) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx);
  fs.writeFileSync('src/components/ProductPageClient.tsx', lines.join('\n'));
  console.log('Successfully removed circular badges');
} else {
  console.log('Failed to find start or end index', {startIdx, endIdx});
}
