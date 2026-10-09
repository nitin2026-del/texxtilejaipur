const fs = require('fs');
let content = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

const oldScarcity = `                  {product.stock_quantity > 0 && product.stock_quantity < 5 && (
                    <p className="text-amber-700 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                      <Flame className="h-4 w-4" /> 
                      {product.stock_quantity < 3 
                        ? "Rare piece — High in demand" 
                        : \`Rare piece — Only \${product.stock_quantity} left in stock\`}
                    </p>
                  )}`;

const newScarcity = `                  {product.stock_quantity > 0 && product.stock_quantity < 3 && (
                    <p className="text-amber-700 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                      <Flame className="h-4 w-4" /> 
                      High in demand
                    </p>
                  )}`;

if (content.includes(oldScarcity)) {
  content = content.replace(oldScarcity, newScarcity);
  fs.writeFileSync('src/components/ProductPageClient.tsx', content);
  console.log('Success updating scarcity logic');
} else {
  console.log('Failed to find old scarcity text');
}
