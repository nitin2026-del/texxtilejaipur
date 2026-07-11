require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function generateOfflineInvoice(orderId) {
  // Fetch order
  const { data: order } = await supabase
    .from('orders')
    .select('*, shipping_addresses(*)')
    .eq('id', orderId)
    .single();

  if (!order) return console.error('Order not found');

  // Fetch items
  const { data: items } = await supabase
    .from('order_items')
    .select('*, products(name)')
    .eq('order_id', orderId);

  let userEmail = order.guest_email || 'shantellef@hotmail.ca';
  let userName = 'Valued Customer';
  if (order.shipping_addresses) {
    userName = order.shipping_addresses.full_name || userName;
  }

  // Create PDF
  const doc = new PDFDocument({ margin: 50 });
  const filename = `TJ-${order.order_number || order.id.slice(0, 8)}_Invoice.pdf`;
  const outputPath = path.join(require('os').homedir(), 'Desktop', filename);
  
  doc.pipe(fs.createWriteStream(outputPath));

  // Header
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('Textile Jaipur', 50, 57)
    .fontSize(10)
    .text('Textile Jaipur Export House', 200, 50, { align: 'right' })
    .text('Jaipur, Rajasthan, India', 200, 65, { align: 'right' })
    .text('textileofrajasthan.info@gmail.com', 200, 80, { align: 'right' })
    .moveDown();

  const hrPos = 110;
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, hrPos).lineTo(550, hrPos).stroke();

  // Order Details
  const customerInfoTop = 130;
  doc
    .fontSize(10)
    .text('Invoice Number:', 50, customerInfoTop)
    .font('Helvetica-Bold')
    .text(order.order_number || order.id.slice(0, 8), 150, customerInfoTop)
    .font('Helvetica')
    .text('Invoice Date:', 50, customerInfoTop + 15)
    .text(new Date(order.created_at).toLocaleDateString(), 150, customerInfoTop + 15)
    .text('Order Total:', 50, customerInfoTop + 30)
    .text(
      `${order.total_display_currency || '₹'+order.total} ${order.display_currency || 'INR'}`,
      150,
      customerInfoTop + 30
    );

  // Customer Details
  doc
    .text('Billed To:', 300, customerInfoTop)
    .font('Helvetica-Bold')
    .text(userName, 300, customerInfoTop + 15)
    .font('Helvetica')
    .text(userEmail, 300, customerInfoTop + 30);

  const hrPos2 = 200;
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, hrPos2).lineTo(550, hrPos2).stroke();

  // Items Table Header
  const invoiceTableTop = 230;
  doc.font('Helvetica-Bold');
  doc.text('Item', 50, invoiceTableTop);
  doc.text('Unit Cost', 280, invoiceTableTop, { width: 90, align: 'right' });
  doc.text('Quantity', 370, invoiceTableTop, { width: 90, align: 'right' });
  doc.text('Line Total', 470, invoiceTableTop, { width: 90, align: 'right' });
  doc.font('Helvetica');

  const hrPos3 = invoiceTableTop + 15;
  doc.strokeColor('#dddddd').lineWidth(1).moveTo(50, hrPos3).lineTo(550, hrPos3).stroke();

  // Items
  let position = invoiceTableTop + 30;
  for (const item of items) {
    const pName = item.products?.name || `Product ID: ${item.product_id}`;
    doc.text(pName, 50, position);
    doc.text(`${item.price_at_time}`, 280, position, { width: 90, align: 'right' });
    doc.text(`${item.quantity}`, 370, position, { width: 90, align: 'right' });
    doc.text(`${item.price_at_time * item.quantity}`, 470, position, { width: 90, align: 'right' });
    position += 20;
  }

  const hrPos4 = position + 10;
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, hrPos4).lineTo(550, hrPos4).stroke();

  // Total
  const subtotalPosition = position + 30;
  doc.font('Helvetica-Bold');
  doc.text('Total:', 370, subtotalPosition, { width: 90, align: 'right' });
  doc.text(`${order.total_display_currency || '₹'+order.total} ${order.display_currency || 'INR'}`, 470, subtotalPosition, { width: 90, align: 'right' });

  // Footer
  doc
    .font('Helvetica')
    .fontSize(10)
    .text('Payment processed securely. Thank you for your business.', 50, 700, { align: 'center', width: 500 });

  doc.end();
  console.log('Saved PDF to', outputPath);
}

generateOfflineInvoice('0f7a66b9-e938-4630-ad98-468bbd88110e');
