const fs = require('fs');
let content = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

// 1. Rewrite Micro Trust & Add Global Buyer Answers
const oldMicroTrust = `{/* Micro-Trust */}
                  <div className="flex items-center gap-3 mt-4 mb-2 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                    <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Secure Checkout</span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9/5 Rating</span>
                  </div>
                </div>`;

const newMicroTrust = `{/* Micro-Trust */}
                  <div className="flex items-center gap-3 mt-4 mb-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                    <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Secure Checkout</span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9/5 Rating</span>
                  </div>
                  
                  {/* Global Buyer Answers */}
                  <div className="bg-[#fbfbf9] rounded-lg p-3.5 border border-[#e5e5df] text-[11px] text-zinc-700 space-y-2 mb-4">
                    <p className="flex justify-between items-center border-b border-zinc-100 pb-1.5">
                      <span className="text-zinc-500 flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Delivery:</span> 
                      <strong className="text-zinc-900">5-9 Business Days (Global)</strong>
                    </p>
                    <p className="flex justify-between items-center border-b border-zinc-100 pb-1.5">
                      <span className="text-zinc-500 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Shipping Cost:</span> 
                      <strong className="text-green-700">Free Worldwide Shipping</strong>
                    </p>
                    <p className="flex justify-between items-center border-b border-zinc-100 pb-1.5">
                      <span className="text-zinc-500 flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> Duties & Taxes:</span> 
                      <strong className="text-zinc-900">Pre-paid by us. No hidden fees.</strong>
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="text-zinc-500 flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Returns:</span> 
                      <strong className="text-zinc-900 text-right">7 Days | We pay return shipping on defects | Full Refund</strong>
                    </p>
                  </div>
                </div>`;

if (content.includes(oldMicroTrust)) {
  content = content.replace(oldMicroTrust, newMicroTrust);
  console.log('Successfully replaced Micro-Trust');
} else {
  console.log('Failed to find Micro-Trust block. Trying fallback.');
  // fallback if spaces differ
  const idx = content.indexOf('{/* Micro-Trust */}');
  const endIdx = content.indexOf('</div>', content.indexOf('</div>', idx) + 6);
  if(idx !== -1 && endIdx !== -1) {
    content = content.substring(0, idx) + newMicroTrust + content.substring(endIdx + 6);
    console.log('Successfully replaced Micro-Trust using index fallback');
  }
}

// 2. Rewrite Collapsible Sections (Accordions)
const oldAccordionsStart = '                        <details className="group bg-white border border-zinc-200 rounded-lg overflow-hidden';
const oldAccordionsEndRegex = /<\/details>\s*<\/div>\s*<\/div>\s*\{\/\* Desktop Main Images/s;

// We will replace the entire accordion block up to Desktop Main Images
const match = content.match(oldAccordionsEndRegex);
if(match) {
  const matchIdx = match.index;
  const startIdx = content.lastIndexOf(oldAccordionsStart, matchIdx);
  
  if (startIdx !== -1) {
    const newAccordions = `                        <details className="group bg-white border border-zinc-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                          <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-semibold text-zinc-900 group-open:bg-zinc-50 transition-colors">
                            Shipping & Delivery
                            <ChevronDown className="h-4 w-4 text-zinc-500 group-open:-rotate-180 transition-transform duration-200" />
                          </summary>
                          <div className="p-3 pt-0 text-xs text-zinc-600 leading-relaxed bg-zinc-50 border-t border-zinc-100">
                            We provide free worldwide shipping via premium couriers. Estimated delivery is 5-9 business days globally. Need it sooner? Contact us for expedited options.
                          </div>
                        </details>
                        <details className="group bg-white border border-zinc-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                          <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-semibold text-zinc-900 group-open:bg-zinc-50 transition-colors">
                            Customs & Duties
                            <ChevronDown className="h-4 w-4 text-zinc-500 group-open:-rotate-180 transition-transform duration-200" />
                          </summary>
                          <div className="p-3 pt-0 text-xs text-zinc-600 leading-relaxed bg-zinc-50 border-t border-zinc-100">
                            There are NO custom fees or hidden charges for you. We prepay and take care of all import taxes and duties on your behalf.
                          </div>
                        </details>
                        <details className="group bg-white border border-zinc-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                          <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-semibold text-zinc-900 group-open:bg-zinc-50 transition-colors">
                            Returns & Exchanges
                            <ChevronDown className="h-4 w-4 text-zinc-500 group-open:-rotate-180 transition-transform duration-200" />
                          </summary>
                          <div className="p-3 pt-0 text-xs text-zinc-600 leading-relaxed bg-zinc-50 border-t border-zinc-100">
                            We accept returns within 7 days for damaged or incorrect items, providing a full refund. We cover return shipping costs for defects. For change of mind, returns are generally not accepted to protect artistic integrity.
                          </div>
                        </details>
                        <details className="group bg-white border border-zinc-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                          <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-semibold text-zinc-900 group-open:bg-zinc-50 transition-colors">
                            Care Instructions
                            <ChevronDown className="h-4 w-4 text-zinc-500 group-open:-rotate-180 transition-transform duration-200" />
                          </summary>
                          <div className="p-3 pt-0 text-xs text-zinc-600 leading-relaxed bg-zinc-50 border-t border-zinc-100">
                            Dry clean only. Keep away from direct sunlight to preserve the vibrant natural dyes. Handle with care as these are handcrafted heritage pieces.
                          </div>
                        </details>
                        <details className="group bg-white border border-zinc-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                          <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-semibold text-zinc-900 group-open:bg-zinc-50 transition-colors">
                            About Suzani Handwork
                            <ChevronDown className="h-4 w-4 text-zinc-500 group-open:-rotate-180 transition-transform duration-200" />
                          </summary>
                          <div className="p-3 pt-0 text-xs text-zinc-600 leading-relaxed bg-zinc-50 border-t border-zinc-100">
                            Each piece features authentic Suzani embroidery, a traditional Central Asian art form. Artisans spend weeks hand-stitching intricate floral and geometric motifs, making every item completely unique.
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Main Images`;
    
    content = content.substring(0, startIdx) + newAccordions + content.substring(matchIdx + match[0].length - 23); // 23 is length of " {/* Desktop Main Images"
    console.log('Successfully replaced accordions');
  }
} else {
  console.log('Failed to find accordions block');
}

fs.writeFileSync('src/components/ProductPageClient.tsx', content);
