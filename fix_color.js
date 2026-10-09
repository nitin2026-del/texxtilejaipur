const fs = require('fs');

// 1. Revert imageUtils.ts to just q=90 (remove sat/con as they might be failing on weserv)
let utilCode = fs.readFileSync('src/utils/imageUtils.ts', 'utf8');
utilCode = utilCode.replace('&con=5&sat=15', '');
fs.writeFileSync('src/utils/imageUtils.ts', utilCode);

// 2. Add CSS filter to globals.css
let cssCode = fs.readFileSync('src/app/globals.css', 'utf8');
const filterCss = `
/* Global Photography Vibrancy Boost */
/* Counteracts web compression dullness natively in the browser */
img.object-cover, img.object-contain {
  filter: saturate(1.20) contrast(1.05) !important;
}
`;
if (!cssCode.includes('filter: saturate')) {
  fs.appendFileSync('src/app/globals.css', filterCss);
  console.log('Successfully appended CSS filter');
}
