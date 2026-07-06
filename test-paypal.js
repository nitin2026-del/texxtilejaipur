require('dotenv').config({ path: '.env.local' });
const paypal = require('@paypal/checkout-server-sdk');

async function testPayPal() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const isSandbox = process.env.PAYPAL_SANDBOX === 'true';

  const environment = isSandbox
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);
    
  const client = new paypal.core.PayPalHttpClient(environment);

  console.log(`Testing PayPal Connection with whole number "70"`);
  
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: "test-order-" + Date.now(),
      amount: {
        currency_code: 'USD',
        value: '70', // Missing decimals
      }
    }],
    application_context: {
      return_url: 'https://example.com/return',
      cancel_url: 'https://example.com/cancel'
    }
  });

  try {
    const response = await client.execute(request);
    console.log('SUCCESS: Accepted whole number.');
  } catch (error) {
    console.error('FAIL: PayPal API Error:');
    console.error(error.message || error);
    process.exit(1);
  }
}

testPayPal();
