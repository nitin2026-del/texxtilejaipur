const fs = require('fs');
const content = fs.readFileSync('src/app/product/[id]/page.tsx', 'utf-8');
const { parse } = require('@babel/parser');

try {
  parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log("No syntax errors found by babel!");
} catch (e) {
  console.error("Syntax error at", e.loc);
  console.error(e.message);
}
