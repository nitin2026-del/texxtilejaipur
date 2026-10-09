const fs = require('fs');
let code = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

const searchStr = "className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ?";
const searchStr2 = "'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}";

const idx1 = code.indexOf(searchStr);
if (idx1 !== -1) {
  const endIdx = code.indexOf("}`}", idx1) + 3;
  const chunk = code.substring(idx1, endIdx);
  const newChunk = "className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isActive ? 'opacity-100 z-10 scale-100 blur-0' : 'opacity-0 z-0 scale-[1.04] blur-sm pointer-events-none'}`}";
  code = code.replace(chunk, newChunk);
  console.log("Successfully updated transition!");
  fs.writeFileSync('src/components/ProductPageClient.tsx', code);
} else {
  console.log("Could not find the transition string.");
}
