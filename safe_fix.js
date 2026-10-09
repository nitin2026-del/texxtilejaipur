const fs = require('fs');
let content = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

// 1. Inject viewers state safely after useMemo
const useMemoEnd = '}, [product]);';
if (content.includes(useMemoEnd) && !content.includes('const [viewers, setViewers] = useState(0);')) {
  content = content.replace(useMemoEnd, useMemoEnd + '\n  const [viewers, setViewers] = useState(0);\n  useEffect(() => { setViewers(Math.floor(Math.random() * 13) + 12); }, []);');
}

// 2. Inject Live Viewers above Add to Cart Actions
const actionsComment = '{/* Add to Cart Actions */}';
const liveViewersJSX = `
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

                `;
if (content.includes(actionsComment) && !content.includes('Premium Live Viewers & Scarcity')) {
  content = content.replace(actionsComment, liveViewersJSX + actionsComment);
}

// 3. Inject Buy Now button and Trust Badges after the flex row
const flexRowEnd = `                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>`;

const buyNowJSX = `
                    
                    <button
                      onClick={handleBuyNow}
                      disabled={product.stock_quantity === 0}
                      className="mt-3 w-full max-w-md h-14 bg-[#1a1464] text-white font-bold text-[13px] uppercase tracking-widest flex items-center justify-center transition-colors hover:bg-[#120e45] disabled:opacity-50"
                    >
                      Buy Now
                    </button>
                    
                    {/* Micro-Trust */}
                    <div className="flex items-center gap-3 mt-3 max-w-md text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                      <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Secure Checkout</span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9/5 Rating</span>
                    </div>`;

if (content.includes(flexRowEnd) && !content.includes('Secure Checkout')) {
  content = content.replace(flexRowEnd, flexRowEnd + buyNowJSX);
}

fs.writeFileSync('src/components/ProductPageClient.tsx', content);
console.log('Success');
