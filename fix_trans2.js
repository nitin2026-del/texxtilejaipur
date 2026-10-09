const fs = require('fs');
let code = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

const targetRegex = /className=\{\`absolute inset-0 transition-all duration-700 ease-\[cubic-bezier\(0\.25,0\.1,0\.25,1\)\] \$\{isActive \? 'opacity-100 z-10 scale-100 blur-0' : 'opacity-0 z-0 scale-\[1\.04\] blur-sm pointer-events-none'\}\`\}/g;

const replacement = "className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}";

if (targetRegex.test(code)) {
  code = code.replace(targetRegex, replacement);
  fs.writeFileSync('src/components/ProductPageClient.tsx', code);
  console.log("Successfully replaced the complex transition with a simple elegant crossfade.");
} else {
  console.log("Target string not found. Trying flexible replace...");
  // Fallback
  const idx = code.indexOf("scale-[1.04] blur-sm");
  if (idx !== -1) {
    const startIdx = code.lastIndexOf("className={`absolute", idx);
    const endIdx = code.indexOf("}`}", idx) + 3;
    const chunk = code.substring(startIdx, endIdx);
    code = code.replace(chunk, replacement);
    fs.writeFileSync('src/components/ProductPageClient.tsx', code);
    console.log("Replaced via fallback.");
  } else {
    console.log("Could not find the transition string.");
  }
}
