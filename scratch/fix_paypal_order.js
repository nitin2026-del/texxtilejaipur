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

// Latest pending orders that might be paid
fixOrder('0f7a66b9-e938-4630-ad98-468bbd88110e', '7YJ89108HH9842926');
