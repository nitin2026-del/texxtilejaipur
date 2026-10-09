const fs = require('fs');
let code = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');
const lines = code.split('\n');

const startIndex = lines.findIndex(l => l.includes("5 - Math.round(dynamicReviews.reduce"));
if (startIndex !== -1) {
  lines.splice(startIndex, 5);
  fs.writeFileSync('src/components/ProductPageClient.tsx', lines.join('\n'));
  console.log("Successfully removed 5 bad lines.");
} else {
  console.log("Could not find the bad lines.");
}
