const fs = require('fs');
let code = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

// Fix aspect ratio
if (code.includes('aspect-[4/5]')) {
  code = code.replace('aspect-[4/5]', 'aspect-[3/4]');
  console.log('Fixed aspect ratio');
}

// Enhance transition
const oldTrans = "`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? \n'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`";
const oldTransAlt = "`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`";

// I'll just use a regex replace for safety
code = code.replace(
  /className=\`absolute inset-0 transition-opacity duration-700 ease-in-out \$\{isActive \? \\n'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'\}\`/g,
  "className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isActive ? 'opacity-100 z-10 scale-100 blur-0' : 'opacity-0 z-0 scale-105 blur-[2px] pointer-events-none'}`}"
);

code = code.replace(
  /className=\`absolute inset-0 transition-opacity duration-700 ease-in-out \$\{isActive \? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'\}\`/g,
  "className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isActive ? 'opacity-100 z-10 scale-100 blur-0' : 'opacity-0 z-0 scale-[1.03] blur-[2px] pointer-events-none'}`}"
);


fs.writeFileSync('src/components/ProductPageClient.tsx', code);
