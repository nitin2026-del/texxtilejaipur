const crypto = require('crypto');

// ==========================================
// 1. FILL IN YOUR PIXEL AND TOKEN DETAILS
// ==========================================
const PIXEL_ID = ''; // Your Meta Pixel ID
const ACCESS_TOKEN = '';

// ==========================================
// 2. FILL IN THE ORDER DETAILS
// ==========================================
// IMPORTANT: The event_time must be within the last 7 days!
const EVENT_TIME = Math.floor(new Date('2026-07-16T12:00:00Z').getTime() / 1000); // 16th July 
const ORDER_ID = 'shamila_naleer_16july';
const CURRENCY = 'USD'; // Assuming USD from $94.50
const VALUE = 94.50; // The total value of the order

// ==========================================
// 3. FILL IN THE CUSTOMER DETAILS
// ==========================================
// Provide raw values below. The script will automatically format and SHA-256 hash them for Meta.
const CUSTOMER = {
  email: 'nalshamila98@gmail.com',
  phone: '61468415549',
  first_name: 'Shamila',
  last_name: 'Naleer',
  city: 'Docklands',
  state: 'vic',
  zip: '3008',
  country: 'au',
  client_user_agent: '',
  client_ip_address: ''
};

// ==========================================
// DO NOT EDIT BELOW THIS LINE
// ==========================================
function hash(val) {
  if (!val) return undefined;
  return crypto.createHash('sha256').update(val.toString().trim().toLowerCase()).digest('hex');
}

async function sendManualPurchase() {
  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: EVENT_TIME,
        action_source: 'website',
        event_id: ORDER_ID,
        user_data: {
          em: [hash(CUSTOMER.email)],
          ph: [hash(CUSTOMER.phone)],
          fn: [hash(CUSTOMER.first_name)],
          ln: [hash(CUSTOMER.last_name)],
          ct: [hash(CUSTOMER.city)],
          st: [hash(CUSTOMER.state)],
          zp: [hash(CUSTOMER.zip)],
          country: [hash(CUSTOMER.country)],
          client_ip_address: CUSTOMER.client_ip_address || undefined,
          client_user_agent: CUSTOMER.client_user_agent || undefined
        },
        custom_data: {
          currency: CURRENCY,
          value: VALUE,
          order_id: ORDER_ID
        }
      }
    ]
  };

  console.log('Sending payload to Meta...');
  
  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Meta API Response:', result);
    
    if (result.events_received === 1) {
      console.log('✅ Success! The manual purchase event was received by Meta.');
      console.log('Note: It may take 20-30 minutes for it to appear in Events Manager and be attributed to the ad.');
    } else {
      console.log('❌ Something went wrong.');
    }
  } catch (error) {
    console.error('Error sending request to Meta:', error);
  }
}

sendManualPurchase();
