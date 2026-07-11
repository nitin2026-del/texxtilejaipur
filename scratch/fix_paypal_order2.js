async function fixOrder(orderId, paypalOrderId) {
  try {
    const res = await fetch('http://localhost:3000/api/payments/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'capture',
        orderId: orderId,
        paypalOrderId: paypalOrderId
      })
    });
    
    const data = await res.json();
    console.log(`Order ${orderId} capture response:`, data);
  } catch (err) {
    console.error(`Error capturing order ${orderId}:`, err);
  }
}

fixOrder('0df2302f-902b-4044-b83f-7d6d484ae8c9', '4TH77512WH269934E');
