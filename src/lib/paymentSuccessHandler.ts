import { SupabaseClient } from '@supabase/supabase-js';
import { generateInvoiceBuffer } from './invoiceGenerator';

export async function handlePaymentSuccess(orderId: string, supabaseAdmin: SupabaseClient) {
  try {
    // 1. Standardize Order Status
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .update({ payment_status: 'completed', status: 'processing' })
      .eq('id', orderId)
      .select('*, shipping_addresses(phone)')
      .single();

    if (orderError) {
      console.error(`[handlePaymentSuccess] Failed to update order ${orderId}:`, orderError);
      throw new Error(`Failed to update order status: ${orderError.message}`);
    }

    // 2. Decrement Inventory & Fetch details for PDF
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error(`[handlePaymentSuccess] Failed to fetch items for order ${orderId}:`, itemsError);
    } else if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        if (!item.product_id || !item.quantity) continue;
        
        // Fetch current stock
        const { data: product, error: productError } = await supabaseAdmin
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single();

        if (productError) {
          console.error(`[handlePaymentSuccess] Failed to fetch product ${item.product_id}:`, productError);
          continue;
        }

        // Calculate new stock (prevent going below 0)
        const newStock = Math.max(0, (product.stock_quantity || 0) - item.quantity);

        // Update product stock
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product_id);

        if (updateError) {
          console.error(`[handlePaymentSuccess] Failed to update stock for product ${item.product_id}:`, updateError);
        }
      }
    }

    // 3 & 4 & 5. WhatsApp & PDF Invoice & Email Notification
    if (order?.user_id) {
      try {
        const { data: userData } = await supabaseAdmin.from('users').select('email, full_name').eq('id', order.user_id).single();
        const userEmail = userData?.email;
        const userName = userData?.full_name || 'Valued Customer';
        
        // Email & PDF Invoice
        if (userEmail && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          let pdfBuffer: Buffer | null = null;
          try {
            // Map items for PDF generator
            const mappedItems = (orderItems || []).map((item: any) => ({
              ...item,
              product_name: item.products?.name
            }));
            pdfBuffer = await generateInvoiceBuffer(order, mappedItems, { ...userData, email: userEmail });
          } catch (pdfErr) {
            console.error(`[handlePaymentSuccess] Failed to generate PDF for order ${orderId}:`, pdfErr);
          }

          const nodemailer = require('nodemailer');
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          const mailOptions: any = {
            from: `"Textile Jaipur" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: `Order Confirmation - ${order.order_number || orderId}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d4af37;">Thank you for your order, ${userName}!</h2>
                <p>We are thrilled to confirm that your payment was successful and your order <strong>#${order.order_number || orderId}</strong> is now being processed.</p>
                <p>We have attached your official invoice to this email.</p>
                <p>We will send you another update as soon as your items have shipped.</p>
                <p>Warm regards,<br>The Textile Jaipur Team</p>
              </div>
            `
          };

          if (pdfBuffer) {
            mailOptions.attachments = [
              {
                filename: `Invoice_${order.order_number || orderId}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ];
          }

          await transporter.sendMail(mailOptions);
          console.log(`[handlePaymentSuccess] Order confirmation email (with PDF) sent to: ${userEmail}`);
        }
      } catch (err) {
        console.error(`[handlePaymentSuccess] Failed during notification/PDF step:`, err);
      }
    }

    return { success: true };
  } catch (error) {
    console.error(`[handlePaymentSuccess] Error processing order ${orderId}:`, error);
    throw error;
  }
}
