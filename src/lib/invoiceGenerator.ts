import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export async function generateInvoiceBuffer(order: any, orderItems: any[], user: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      // Load Custom Fonts
            const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc
        .font('Helvetica-Bold')
        .fillColor('#444444')
        .fontSize(20)
        .text('Textile Jaipur', 50, 57)
        .font('Helvetica')
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
        .text(new Date().toLocaleDateString(), 150, customerInfoTop + 15)
        .text('Order Total:', 50, customerInfoTop + 30)
        .text(
          `${order.total_display_currency} ${order.display_currency || 'INR'}`,
          150,
          customerInfoTop + 30
        );

      // Customer Details
      doc
        .text('Billed To:', 300, customerInfoTop)
        .font('Helvetica-Bold')
        .text(user.full_name || 'Valued Customer', 300, customerInfoTop + 15)
        .font('Helvetica')
        .text(user.email, 300, customerInfoTop + 30);

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
      for (const item of orderItems) {
        doc.text(item.product_name || `Product ID: ${item.product_id}`, 50, position);
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
      doc.text(`${order.total_display_currency} ${order.display_currency || 'INR'}`, 470, subtotalPosition, { width: 90, align: 'right' });

      // Footer
      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Payment processed securely. Thank you for your business.', 50, 700, { align: 'center', width: 500 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
