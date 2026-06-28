const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value) acc[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
  return acc;
}, {});

fetch('https://evtjgujsfllegfmtqspq.supabase.co/rest/v1/products?slug=eq.boho-velvet-suzani-jacket-k7sj', {
  method: 'PATCH',
  headers: {
    'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({ display_rank: -10 })
}).then(r => r.json()).then(data => {
  console.log('Updated product:', data);
}).catch(console.error);
