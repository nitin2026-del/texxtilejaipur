const fs = require('fs');
const https = require('https');
const path = require('path');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  const fontDir = path.join(process.cwd(), 'public', 'fonts');
  await download('https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Regular.ttf', path.join(fontDir, 'Roboto-Regular.ttf'));
  await download('https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Bold.ttf', path.join(fontDir, 'Roboto-Bold.ttf'));
  console.log('Fonts downloaded successfully.');
}

main();
