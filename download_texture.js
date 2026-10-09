const https = require('https');
const fs = require('fs');

const url = 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&q=80'; // a nice block print / textile texture pattern from Unsplash
const file = fs.createWriteStream('public/jaipur_pattern.jpg');

https.get(url, response => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Texture downloaded successfully!');
  });
}).on('error', err => {
  fs.unlink('public/jaipur_pattern.jpg');
  console.error('Error downloading:', err.message);
});
