const https = require('https');
https.get('https://www.textilejaipur.com', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const scripts = [...data.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => m[1]);
    let found = false;
    let checked = 0;
    if (scripts.length === 0) return console.log('? No scripts found on www');
    scripts.forEach(src => {
      https.get('https://www.textilejaipur.com' + src, (jsRes) => {
        let js = '';
        jsRes.on('data', c => js += c);
        jsRes.on('end', () => {
          checked++;
          if (js.includes('/api/auth/welcome')) { found = true; console.log('? FOUND IN LIVE CODE:', src); }
          if (checked === scripts.length && !found) console.log('? NOT IN LIVE CODE');
        });
      });
    });
  });
});
