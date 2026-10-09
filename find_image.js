const fs = require('fs');
const lines = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8').split('\n');
const start = lines.findIndex((l, i) => l.includes('<div className=') && l.includes('md:col-span-1'));
if(start !== -1) {
  console.log(lines.slice(start, start + 80).join('\n'));
} else {
  // Let's just grep for "selectedMediaIndex" again and find where it's rendering the Image component
  const indices = [];
  lines.forEach((l, i) => { if (l.includes('selectedMediaIndex') && l.includes('<img')) indices.push(i); });
  if (indices.length > 0) {
    console.log(lines.slice(indices[0] - 20, indices[0] + 20).join('\n'));
  } else {
    // Grep for "<Image "
    const imgIndices = [];
    lines.forEach((l, i) => { if (l.includes('<Image ')) imgIndices.push(i); });
    console.log("Image found at lines:", imgIndices);
    if(imgIndices.length > 0) {
      console.log(lines.slice(imgIndices[0] - 10, imgIndices[0] + 30).join('\n'));
    }
  }
}
