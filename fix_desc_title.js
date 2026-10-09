const fs = require('fs');
let code = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

const target = `<div className="mt-4 mb-5 pt-1">
                    <p className="text-zinc-700 text-[14px] leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>`;

const replacement = `<div className="mt-6 mb-5 pt-2 border-t border-zinc-100">
                    <h3 className="text-[15px] font-bold text-[#1a1464] mb-3">Product Description</h3>
                    <p className="text-zinc-700 text-[14.5px] leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/ProductPageClient.tsx', code);
  console.log("Updated description block with a static title.");
} else {
  console.log("Could not find the target block.");
}
