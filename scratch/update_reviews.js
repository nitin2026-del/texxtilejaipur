const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'components');

const filesToUpdateShipping = [
  'BlueFloralReviews.tsx',
  'CottonSuzaniReviews.tsx',
  'HandcraftedSuzaniCottonReviews.tsx',
  'PinkVelvetReviews.tsx',
  'SuzaniReviews.tsx',
  'TealVelvetSuzaniReviews.tsx'
];

for (const file of filesToUpdateShipping) {
  const filePath = path.join(srcDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace('Free Shipping · Secure Checkout', 'Fast Shipping · Secure Checkout');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated shipping text in ${file}`);
  }
}

const filesToUpdateReviews = {
  'TntSuzaniReviews.tsx': {
    old: "I bought this jacket along with a matching tote to get my cart over $120, and the automatic 25% off discount applied flawlessly. The jacket itself is incredibly soft breathable cotton and the dimensional floral needlework is flawless. Highly recommend paying with PayPal for a quick checkout!",
    new: "The jacket itself is incredibly soft breathable cotton and the dimensional floral needlework is flawless. Highly recommend paying with PayPal for a quick checkout!"
  },
  'UniqueTntSuzaniReviews.tsx': {
    old: "I'm obsessed with the raw, natural texture of the coarse cotton fabric. The way the thick green vines climb up the front is just so artistic and earthy. I paired this with a dress to get my cart over $120 and got 25% off my entire order! Such an incredible deal for this level of authentic craftsmanship.",
    new: "I'm obsessed with the raw, natural texture of the coarse cotton fabric. The way the thick green vines climb up the front is just so artistic and earthy. Such an incredible deal for this level of authentic craftsmanship."
  },
  'VintageSuzaniReviews.tsx': {
    old: "This is easily the most beautiful piece of outerwear I own. The contrast of the bright embroidery against the rich velvet is stunning, and it feels surprisingly warm for those crisp evenings. I paired it with a scarf to push my cart over $120, which triggered the automatic 25% off discount! Such an amazing deal for authentic handmade quality.",
    new: "This is easily the most beautiful piece of outerwear I own. The contrast of the bright embroidery against the rich velvet is stunning, and it feels surprisingly warm for those crisp evenings. Such an amazing deal for authentic handmade quality."
  }
};

for (const [file, changes] of Object.entries(filesToUpdateReviews)) {
  const filePath = path.join(srcDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(changes.old, changes.new);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated review text in ${file}`);
  }
}

// Also update TntSuzaniReviews for free shipping text inside the review
const tntFilePath = path.join(srcDir, 'TntSuzaniReviews.tsx');
if (fs.existsSync(tntFilePath)) {
  let content = fs.readFileSync(tntFilePath, 'utf8');
  content = content.replace("Between the free shipping, the PayPal option", "Between the fast shipping, the PayPal option");
  fs.writeFileSync(tntFilePath, content, 'utf8');
  console.log('Updated specific review in TntSuzaniReviews');
}
