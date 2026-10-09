const fs = require('fs');
let content = fs.readFileSync('src/utils/metaTracking.ts', 'utf8');

const oldGetCookie = `const getCookie = (name: string) => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : undefined;
};`;

const newGetCookie = `const getCookie = (name: string) => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  let val = match ? match[2] : undefined;
  
  // Auto-generate _fbp if missing to guarantee 100% CAPI coverage on first page load
  if (name === '_fbp' && !val) {
    const time = Date.now();
    const random = Math.floor(Math.random() * 1000000000);
    val = \`fb.1.\${time}.\${random}\`;
    document.cookie = \`_fbp=\${val}; path=/; max-age=7776000; SameSite=Lax\`; // 90 days expiration
  }
  return val;
};`;

if (content.includes(oldGetCookie)) {
  content = content.replace(oldGetCookie, newGetCookie);
  fs.writeFileSync('src/utils/metaTracking.ts', content);
  console.log('Successfully upgraded getCookie to auto-generate _fbp');
} else {
  console.log('Failed to find oldGetCookie');
}
