const fs = require('fs');
let code = fs.readFileSync('src/context/CartContext.tsx', 'utf8');

// Update useAuth destructuring
code = code.replace(
  "const { tierDiscountPercentage } = useAuth();",
  "const { tierDiscountPercentage, user, profile } = useAuth();"
);

// Update trackMetaEvent
const oldTrack = `    trackMetaEvent('AddToCart', {
      content_ids: [product.id],
      content_type: 'product',
      value: productPrice,
      currency: currency
    });`;

const newTrack = `    trackMetaEvent('AddToCart', {
      content_ids: [product.id],
      content_type: 'product',
      value: productPrice,
      currency: currency
    }, undefined, false, {
      email: profile?.email || user?.email,
      firstName: profile?.first_name || profile?.name?.split(' ')[0],
      lastName: profile?.name?.split(' ').slice(1).join(' ') || undefined
    });`;

if (code.includes(oldTrack)) {
  code = code.replace(oldTrack, newTrack);
  fs.writeFileSync('src/context/CartContext.tsx', code);
  console.log('Successfully updated CartContext to pass user data to Meta Pixel');
} else {
  console.log('Failed to find old trackMetaEvent block');
}
