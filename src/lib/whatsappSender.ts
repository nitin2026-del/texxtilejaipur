export async function sendWhatsAppNotification(phone: string, orderId: string, customerName: string) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.warn('[WhatsApp] Skipping notification. WHATSAPP_TOKEN or WHATSAPP_PHONE_ID not set.');
    return false;
  }

  // Format the phone number: Remove non-numeric characters
  let formattedPhone = phone.replace(/\D/g, '');
  
  // Basic validation (length)
  if (formattedPhone.length < 10) {
    console.warn(`[WhatsApp] Skipping notification. Invalid phone number: ${phone}`);
    return false;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`;
    
    // For Phase 1, we attempt a standard text message. 
    // Note: If outside the 24-hour service window, Meta requires a template message.
    // Replace with a template payload if needed in production.
    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: {
        body: `Hi ${customerName},\n\nThank you for your order (#${orderId}) from Textile Jaipur!\nYour payment was successful and we are processing your order. We'll notify you once it ships.`
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp] API Error:', data);
      return false;
    }

    console.log(`[WhatsApp] Notification sent successfully for Order ${orderId}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Failed to send notification:', error);
    return false;
  }
}
