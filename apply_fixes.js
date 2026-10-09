const fs = require('fs');
let code = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

// 1. Rating
const startR = code.indexOf('{dynamicReviews.length > 0 && (\n                        <div \n                          className="flex items-center gap-1.5 text-[11px]');
if(startR > -1) {
  const endR = code.indexOf(')}', startR + 100) + 2;
  const oldR = code.substring(startR, endR);
  if(oldR.includes('REVIEW')) {
    const newRating = `<div 
                          className="flex items-center gap-1.5 text-[12px] font-bold text-[#1a1464] uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        >
                          <div className="flex text-amber-400 gap-0.5">
                            <Star className="h-4 w-4 fill-amber-400" />
                            <Star className="h-4 w-4 fill-amber-400" />
                            <Star className="h-4 w-4 fill-amber-400" />
                            <Star className="h-4 w-4 fill-amber-400" />
                            <Star className="h-4 w-4 fill-amber-400" />
                          </div>
                          <span className="underline underline-offset-2 ml-1">4.9/5 Rating</span>
                        </div>`;
    code = code.replace(oldR, newRating);
    console.log('Fixed Rating');
  }
} else {
  // alternative search
  const idx = code.indexOf('dynamicReviews.reduce(');
  if (idx > -1) {
     const startBlock = code.lastIndexOf('{dynamicReviews.length > 0 && (', idx);
     const endBlock = code.indexOf(')}', idx) + 2;
     const oldR = code.substring(startBlock, endBlock);
     const newRating = `<div 
                          className="flex items-center gap-1.5 text-[12px] font-bold text-[#1a1464] uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        >
                          <div className="flex text-amber-400 gap-0.5">
                            <Star className="h-4 w-4 fill-amber-400" />
                            <Star className="h-4 w-4 fill-amber-400" />
                            <Star className="h-4 w-4 fill-amber-400" />
                            <Star className="h-4 w-4 fill-amber-400" />
                            <Star className="h-4 w-4 fill-amber-400" />
                          </div>
                          <span className="underline underline-offset-2 ml-1">4.9/5 Rating</span>
                        </div>`;
    code = code.replace(oldR, newRating);
    console.log('Fixed Rating (alt search)');
  }
}

// 2. Description
const startD = code.indexOf('<details className="group mt-2 mb-4');
if(startD > -1) {
  const endD = code.indexOf('</details>', startD) + 10;
  const oldD = code.substring(startD, endD);
  const newDesc = `<div className="mt-4 mb-5 pt-1">
                    <p className="text-zinc-700 text-[14px] leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'en' ? product.description : (product.details?.translations?.[language as keyof typeof product.details.translations] || product.description)}
                    </p>
                  </div>`;
  code = code.replace(oldD, newDesc);
  console.log('Fixed Description');
}

fs.writeFileSync('src/components/ProductPageClient.tsx', code);
