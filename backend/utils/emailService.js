// Email Service Utility for Smart Grocery Shop Notifications
const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * 1. Customer Email Notification: Payment Successful & Order Confirmed
 */
exports.sendPaymentSuccessEmail = async (order, customer) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('Nodemailer not configured (EMAIL_USER or EMAIL_PASS missing). Skipping email.');
      return;
    }

    const customerName = customer?.name || order.customerInfo?.name || 'Valued Customer';
    const recipientEmail = customer?.email || order.customerInfo?.email;

    if (!recipientEmail) return;

    const itemsListHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background: #2e7d32; color: #ffffff; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 26px;">🏪 Smart Grocery Store</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">Payment Successful - Order Confirmed</p>
        </div>

        <div style="padding: 25px;">
          <p style="font-size: 16px; color: #333333;">Hello <strong>${customerName}</strong>,</p>
          <p style="color: #555555; line-height: 1.6;">Your payment has been successfully processed! Your order details are below:</p>

          <div style="background: #f1f8e9; border: 2px dashed #2e7d32; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #555555; font-size: 14px;">YOUR UNIQUE PICKUP TOKEN</p>
            <h2 style="margin: 5px 0; color: #2e7d32; font-size: 32px; letter-spacing: 4px;">${order.pickupToken || 'GK-ONLINE'}</h2>
            <p style="margin: 0; color: #666666; font-size: 13px;">Order ID: <strong>${order.orderId || order._id}</strong></p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f5f5f5; color: #333333;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
          </table>

          <div style="text-align: right; margin-bottom: 20px;">
            <p style="margin: 4px 0; color: #555555;">Subtotal: <strong>₹${order.itemsAmount.toFixed(2)}</strong></p>
            <p style="margin: 4px 0; color: #555555;">Tax (5%): <strong>₹${order.taxAmount.toFixed(2)}</strong></p>
            <h3 style="margin: 10px 0 0 0; color: #2e7d32;">Total Amount Paid: ₹${order.totalAmount.toFixed(2)}</h3>
          </div>

          <div style="background: #fafafa; border-left: 4px solid #f57c00; padding: 15px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #f57c00;">Pickup Details</h4>
            <p style="margin: 4px 0; color: #444444;">📅 <strong>Date:</strong> ${order.pickupDate || 'Today'}</p>
            <p style="margin: 4px 0; color: #444444;">⏰ <strong>Time Slot:</strong> ${order.pickupTime || 'Standard Hours'}</p>
            <p style="margin: 4px 0; color: #444444;">📍 <strong>Store Address:</strong> ${order.storeLocation || 'Main Supermarket Store'}</p>
          </div>

          <p style="background: #e8f5e9; padding: 15px; border-radius: 8px; color: #2e7d32; font-weight: bold; text-align: center;">
            "Your order has been received successfully. We will notify you again once your groceries are packed and ready for pickup."
          </p>

          <p style="color: #888888; font-size: 13px; text-align: center; margin-top: 25px;">
            Thank you for shopping with Smart Grocery Store!
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Smart Grocery Store" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Payment Successful - Order Confirmed (${order.orderId || 'Order'})`,
      html: htmlContent
    });
    console.log(`Payment success email sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending Payment Success Email:', error.message);
  }
};

/**
 * 2. Admin Notification: New Order Placed
 */
exports.sendAdminNewOrderEmail = async (order, customer) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const adminEmail = process.env.EMAIL_USER;
    if (!adminEmail) return;

    const customerName = customer?.name || order.customerInfo?.name || 'Customer';
    const customerPhone = customer?.phone || order.customerInfo?.phone || 'N/A';

    const itemsSummary = order.items.map(i => `${i.name} x ${i.quantity}`).join(', ');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; padding: 25px; border-radius: 10px;">
        <h2 style="color: #2e7d32; margin-top: 0;">🔔 New Order Received - Action Required</h2>
        <p>A new customer order has been successfully placed and paid online!</p>

        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;">👤 <strong>Customer:</strong> ${customerName} (${customerPhone})</p>
          <p style="margin: 5px 0;">🆔 <strong>Order ID:</strong> ${order.orderId || order._id}</p>
          <p style="margin: 5px 0;">🎟️ <strong>Pickup Token:</strong> <span style="background: #2e7d32; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${order.pickupToken}</span></p>
          <p style="margin: 5px 0;">💰 <strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
          <p style="margin: 5px 0;">🛒 <strong>Items:</strong> ${itemsSummary}</p>
          <p style="margin: 5px 0;">⏰ <strong>Pickup Slot:</strong> ${order.pickupDate} (${order.pickupTime})</p>
        </div>

        <p style="color: #f57c00; font-weight: bold;">Please log into the Admin Dashboard to assign a staff member for packing.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Smart Grocery System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🚨 New Order Alert! [${order.orderId || 'Order'}] - Token: ${order.pickupToken}`,
      html: htmlContent
    });
    console.log(`Admin notification email sent to ${adminEmail}`);
  } catch (error) {
    console.error('Error sending Admin Notification Email:', error.message);
  }
};

/**
 * 3. Customer Email Notification: Grocery Packed & Ready for Pickup
 */
exports.sendReadyForPickupEmail = async (order, customer) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const customerName = customer?.name || order.customerInfo?.name || 'Valued Customer';
    const recipientEmail = customer?.email || order.customerInfo?.email || order.userId?.email;

    if (!recipientEmail) return;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background: #f57c00; color: #ffffff; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 26px;">🎉 Your Order is Ready!</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">Grocery Supermarket Pickup Notification</p>
        </div>

        <div style="padding: 25px;">
          <p style="font-size: 16px; color: #333333;">Hello <strong>${customerName}</strong>,</p>

          <div style="background: #fff3e0; border: 2px dashed #f57c00; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #666666; font-size: 14px;">SHOW THIS PICKUP TOKEN AT THE STORE COUNTER</p>
            <h2 style="margin: 8px 0; color: #f57c00; font-size: 36px; letter-spacing: 6px;">${order.pickupToken}</h2>
            <p style="margin: 0; color: #444444; font-size: 14px;">Order ID: <strong>${order.orderId || order._id}</strong></p>
          </div>

          <p style="background: #e8f5e9; border-left: 5px solid #2e7d32; padding: 15px; color: #2e7d32; font-size: 15px; font-weight: bold; line-height: 1.5;">
            "Your groceries have been packed successfully. Please visit the store and show your Pickup Token at the collection counter to receive your order."
          </p>

          <div style="background: #fafafa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #333333;">📍 Collection Details</h4>
            <p style="margin: 4px 0; color: #555555;">📅 <strong>Pickup Date:</strong> ${order.pickupDate || 'Today'}</p>
            <p style="margin: 4px 0; color: #555555;">⏰ <strong>Pickup Time Slot:</strong> ${order.pickupTime || 'Standard Hours'}</p>
            <p style="margin: 4px 0; color: #555555;">🏪 <strong>Store Address:</strong> ${order.storeLocation || 'Main Supermarket Branch'}</p>
            <p style="margin: 4px 0; color: #555555;">📞 <strong>Store Contact:</strong> +91 98765 43210</p>
          </div>

          <p style="color: #888888; font-size: 13px; text-align: center; margin-top: 25px;">
            Thank you for choosing Smart Grocery Store!
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Smart Grocery Store" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Your Grocery Order is Ready for Pickup [Token: ${order.pickupToken}]`,
      html: htmlContent
    });
    console.log(`Ready for pickup email sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending Ready For Pickup Email:', error.message);
  }
};
