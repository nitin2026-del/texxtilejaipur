const fs = require('fs');
let content = fs.readFileSync('src/context/CartContext.tsx', 'utf8');

const startStr = 'const addToCart = (product: CartContextProduct, quantity = 1) => {';
const endStr = 'const addFreeGift = (product: CartContextProduct) => {';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if(startIndex > -1 && endIndex > -1) {
  const originalBlock = content.substring(startIndex, endIndex);
  
  const newBlock = `const addToCart = (product: CartContextProduct, quantity = 1) => {
    const parsedPriceInr = typeof product.price_inr === 'string' ? parseFloat(product.price_inr) : product.price_inr;

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      const updated = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      );
      saveCart(updated);
    } else {
      const newItem: CartItem = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        price_inr: parsedPriceInr,
        images: product.images,
        quantity: quantity,
        category: product.category,
      };
      saveCart([...cart, newItem]);
    }
    
    // Fire AddToCart event (whether new or existing)
    const productPrice = Number((parsedPriceInr * FX_RATES[currency]).toFixed(2));
    trackMetaEvent('AddToCart', {
      content_ids: [product.id],
      content_type: 'product',
      value: productPrice,
      currency: currency
    });
  };

  `;
  
  content = content.replace(originalBlock, newBlock);
  fs.writeFileSync('src/context/CartContext.tsx', content);
  console.log('Fixed ATC block by index replacement');
}
