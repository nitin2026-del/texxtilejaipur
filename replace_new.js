const fs = require('fs');
const lines = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8').split('\n');

const replacement = `                {/* Premium Live Viewers & Scarcity */}
                <div className="flex flex-col mb-4 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                    </span>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                      High Demand &middot; Currently viewed by {viewers} others
                    </p>
                  </div>
                  {product.stock_quantity > 0 && product.stock_quantity < 3 && (
                    <p className="text-amber-700 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                      <Flame className="h-4 w-4" /> 
                      High in demand
                    </p>
                  )}
                </div>

                {/* Add to Cart Actions */}
                <div className="pt-2 pb-2">
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                    {isInCart ? (
                      <button
                        onClick={() => setCartOpen(true)}
                        className="flex-1 h-14 bg-white border-2 border-[#1a1464] text-[#1a1464] font-bold text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors hover:bg-[#f0f0f5]"
                      >
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>Added to Cart</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        disabled={product.stock_quantity === 0}
                        className="flex-1 h-14 bg-white border-2 border-[#1a1464] text-[#1a1464] font-bold text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors hover:bg-[#f0f0f5] disabled:opacity-50"
                      >
                        {product.stock_quantity === 0 ? 'Out of Stock' : 'ADD TO CART'}
                      </button>
                    )}
                    <button
                      onClick={handleBuyNow}
                      disabled={product.stock_quantity === 0}
                      className="flex-1 h-14 bg-[#1a1464] text-white font-bold text-[13px] uppercase tracking-widest flex items-center justify-center transition-colors hover:bg-[#120e45] disabled:opacity-50"
                    >
                      Buy Now
                    </button>
                  </div>
                  
                  {/* Micro-Trust & Global Buyer Info */}
                  <div className="flex items-center gap-3 mt-4 mb-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                    <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Secure Checkout</span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9/5 Rating</span>
                  </div>

                  <div className="bg-[#fbfbf9] rounded-lg p-3.5 border border-[#e5e5df] text-[11px] text-zinc-700 space-y-2 mb-4 max-w-md">
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

                  {/* Payment Badges */}
                  <div className="mt-2 mb-6 flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-zinc-200 shadow-sm max-w-max">
                    <svg viewBox="0 0 256 83" className="h-3.5 object-contain" width="35" height="11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M111.4 81.36L129.28 0h30.06L140.48 81.36h-29.08zM242.06 8.35c-5.74-2.23-14.73-4.58-26.31-4.58-29.35 0-50.04 15.65-50.21 38.08-.18 16.59 14.88 25.86 26.23 31.42 11.69 5.75 15.63 9.4 15.6 14.51-.04 7.84-9.39 11.45-18.06 11.45-12.38 0-18.91-1.9-28.98-6.38l-4.08-1.91-4.22 26.23c6.88 3.19 19.67 5.96 32.96 6.11 31.06 0 51.48-15.35 51.71-39.11.21-13.4-8.08-23.75-25.26-31.95-10.45-5.32-15.02-8.83-15-13.79.03-4.69 5.34-9.59 17.06-9.59 9.8 0 16.73 2.12 21.95 4.54l2.67 1.25 4.24-26.26zM203.49 81.36h28.16L213.1 0h-23.94c-6.86 0-12.72 4.02-15.53 10.33l-34.99 71.03h29.68l5.92-16.48h36.31l3.43 16.48zm-19.98-38.38l12.44-34.33h.36l6.81 34.33h-19.61zM73.54 0L53.79 55.43 51.05 41.5C46.85 24.36 31.4 10.3 12.02 5.06l16.14 76.3h29.83l45.47-81.36H73.54z" fill="#1434CB"/><path d="M31.11 0C21.71 0 5.43 .72 .03 5.06c24.58 6.03 41.69 20.35 48.74 37.69l-7.39-36.9C39.77 2.37 36.39 0 31.11 0z" fill="#F2A900"/></svg>
                    <img src="/mastercard.svg" alt="Mastercard" className="h-5 object-contain" />
                    <img src="/amex.svg" alt="Amex" className="h-4 object-contain" />
                  </div>

                  {/* Collapsible Info Sections */}
                  <div className="space-y-2 max-w-md">
                    <details className="group bg-white border border-zinc-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-semibold text-zinc-900 group-open:bg-zinc-50 transition-colors">
                        Shipping & Delivery
                        <ChevronDown className="h-4 w-4 text-zinc-500 group-open:-rotate-180 transition-transform duration-200" />
                      </summary>
                      <div className="p-3 pt-0 text-xs text-zinc-600 leading-relaxed bg-zinc-50 border-t border-zinc-100">
                        We provide free, fully-tracked worldwide shipping via premium couriers. Estimated delivery is 5-9 business days to all global destinations. Need it sooner? Contact us for expedited options.
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
                        We accept returns within 7 days for damaged or incorrect items, providing a full refund. We cover return shipping costs for defects. For change of mind, returns are generally not accepted to protect the artistic integrity of these handcrafted pieces.
                      </div>
                    </details>
                    <details className="group bg-white border border-zinc-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-semibold text-zinc-900 group-open:bg-zinc-50 transition-colors">
                        Care Instructions
                        <ChevronDown className="h-4 w-4 text-zinc-500 group-open:-rotate-180 transition-transform duration-200" />
                      </summary>
                      <div className="p-3 pt-0 text-xs text-zinc-600 leading-relaxed bg-zinc-50 border-t border-zinc-100">
                        Dry clean only. Keep away from direct sunlight to preserve the vibrant natural dyes. Handle with care as these are delicate, handcrafted heritage pieces.
                      </div>
                    </details>
                    <details className="group bg-white border border-zinc-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-semibold text-zinc-900 group-open:bg-zinc-50 transition-colors">
                        About Suzani Handwork
                        <ChevronDown className="h-4 w-4 text-zinc-500 group-open:-rotate-180 transition-transform duration-200" />
                      </summary>
                      <div className="p-3 pt-0 text-xs text-zinc-600 leading-relaxed bg-zinc-50 border-t border-zinc-100">
                        Each piece features authentic Suzani embroidery, a traditional Central Asian art form. Artisans spend weeks hand-stitching intricate floral and geometric motifs, making every single item completely unique.
                      </div>
                    </details>
                  </div>
                </div>`;

const newLines = [];
let i = 0;
while(i < lines.length) {
  if (lines[i].includes('{/* Premium Live Viewers & Scarcity */}')) {
    newLines.push(replacement);
    while (i < lines.length && !lines[i].includes('{/* Actions (Wishlist/Share) & AI Sizing */}')) {
      i++;
    }
    // we are now at END_ACTIONS line
  }
  if (i < lines.length) {
    newLines.push(lines[i]);
  }
  i++;
}

fs.writeFileSync('src/components/ProductPageClient.tsx', newLines.join('\n'));
console.log('Successfully applied new block.');
