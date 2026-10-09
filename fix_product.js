const fs = require('fs');
let code = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

// 1. Remove sticky mobile bar
const stickyBarRegex = /\{\/\* Sticky Mobile Add-to-Cart Bar \*\/\}[\s\S]*?(?=<\/main>)/g;
// Wait, the sticky bar is right above </main> usually or somewhere near the end. Let's find it exactly.
const stickyStart = code.indexOf('{/* Sticky Mobile Add-to-Cart Bar */}');
if (stickyStart !== -1) {
  // find the closing parenthesis for the `{product && (` block
  const blockStart = code.indexOf('{product && (', stickyStart);
  let openBrackets = 0;
  let idx = blockStart + '{product && ('.length;
  let endIdx = -1;
  while(idx < code.length) {
    if (code[idx] === '(') openBrackets++;
    if (code[idx] === ')') {
      if (openBrackets === 0) { endIdx = idx; break; }
      openBrackets--;
    }
    idx++;
  }
  if (endIdx !== -1) {
    // Also remove the `)}`
    endIdx = code.indexOf(')}', endIdx) + 2;
    const oldSticky = code.substring(stickyStart, endIdx);
    code = code.replace(oldSticky, '');
    console.log("Removed sticky mobile bar.");
  }
}

// Write it back to see if we succeeded.
fs.writeFileSync('src/components/ProductPageClient.tsx', code);
