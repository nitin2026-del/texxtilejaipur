const fs = require('fs');
let content = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

const startStr = '{/* Add to Cart Actions */}';
const endStr = '{/* Payment Badges under Add to Cart */}';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `
                {/* Premium Live Viewers & Scarcity */}
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
                  {product.stock_quantity > 0 && product.stock_quantity < 5 && (
                    <p className="text-amber-700 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                      <Flame className="h-4 w-4" /> 
                      Rare piece — Only {product.stock_quantity} left in stock
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
                  
                  {/* Micro-Trust */}
                  <div className="flex items-center gap-3 mt-4 mb-2 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                    <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Secure Checkout</span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9/5 Rating</span>
                  </div>
                </div>
  `;
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/components/ProductPageClient.tsx', content);
  console.log('Success replacing section');
} else {
  console.log('Failed to find indices');
}
