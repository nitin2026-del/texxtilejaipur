import 'dotenv/config';
import paypal from '@paypal/checkout-server-sdk';

async function testPayPal() {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  const isSandbox = process.env.PAYPAL_SANDBOX === 'true';

  if (!clientId || !clientSecret) {
    console.error('FAIL: Missing PayPal credentials in environment variables.');
    process.exit(1);
  }

  const environment = isSandbox
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);
    
  const client = new paypal.core.PayPalHttpClient(environment);

  console.log(`Testing PayPal Connection. Sandbox mode: ${isSandbox}`);
  
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: "test-order-" + Date.now(),
      amount: {
        currency_code: 'USD',
        value: '1.00',
      }
    }],
    application_context: {
      return_url: 'https://example.com/return',
      cancel_url: 'https://example.com/cancel'
    }
  });

  try {
    const response = await client.execute(request);
    console.log('SUCCESS: Connected to PayPal and created test intent successfully.');
    console.log('Created Order ID:', response.result.id);
    console.log('Approval URL:', response.result.links?.find((l: any) => l.rel === 'approve')?.href);
  } catch (error: any) {
    console.error('FAIL: PayPal API Error:');
    console.error(error.message || error);
    if (error.statusCode) {
        console.error('Status Code:', error.statusCode);
    }
    process.exit(1);
  }
}

testPayPal();
