const fs = require('fs');
let content = fs.readFileSync('src/app/layout.tsx', 'utf8');

const oldOrg = `  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Textile Jaipur',
    url: 'https://textilejaipur.com',
    logo: 'https://textilejaipur.com/about/img1.jpg',
    description: 'Premium handcrafted Indian ethnic wear — embroidered jackets, Boho dresses, block print textiles, suzani masterpieces — shipped worldwide from Jaipur, Rajasthan.',
    address: {`;

const newOrg = `  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Textile Jaipur',
    url: 'https://textilejaipur.com',
    logo: 'https://textilejaipur.com/about/img1.jpg',
    description: 'Premium handcrafted Indian ethnic wear — embroidered jackets, Boho dresses, block print textiles, suzani masterpieces — shipped worldwide from Jaipur, Rajasthan.',
    sameAs: [
      'https://instagram.com/textileofjaipur',
      'https://www.facebook.com/textilejaipur'
    ],
    address: {`;

if (content.includes(oldOrg)) {
  content = content.replace(oldOrg, newOrg);
} else {
  // Use regex
  const rx = /const organizationSchema = \{\s*'@context': 'https:\/\/schema\.org',\s*'@type': 'Organization',\s*name: 'Textile Jaipur',\s*url: 'https:\/\/textilejaipur\.com',\s*logo: 'https:\/\/textilejaipur\.com\/about\/img1\.jpg',\s*description: '.*?Rajasthan\.',\s*address: \{/s;
  
  const match = content.match(rx);
  if (match) {
    const replacement = match[0].replace('address: {', `sameAs: [\n      'https://instagram.com/textileofjaipur'\n    ],\n    address: {`);
    content = content.replace(rx, replacement);
  }
}

fs.writeFileSync('src/app/layout.tsx', content);
