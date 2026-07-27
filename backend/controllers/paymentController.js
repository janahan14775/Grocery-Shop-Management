// Payment Controller - Razorpay payment integration
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { sendPaymentSuccessEmail, sendAdminNewOrderEmail } = require('../utils/emailService');

// Initialize Razorpay instance with credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ============================
// CREATE RAZORPAY ORDER - Generate payment order
// POST /api/payment/create-order
// ============================
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Create Razorpay order (amount in paise = INR * 100)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: orderId.toString(),
      notes: {
        orderId: orderId.toString(),
        userId: req.user._id.toString()
      }
    });

    // Save payment record
    const payment = new Payment({
      orderId: order._id,
      userId: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      status: 'created'
    });

    await payment.save();

    // Update order with Razorpay order ID
    order.paymentInfo.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id
    });

  } catch (error) {
    console.error('Create Razorpay Order Error:', error);
    res.status(500).json({
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// ============================
// VERIFY PAYMENT - Verify Razorpay signature and mark order as paid
// POST /api/payment/verify
// ============================
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId
    } = req.body;

    // Verify signature using HMAC SHA256
    const body = razorpayOrderId + '|' + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      return res.status(400).json({
        message: 'Payment verification failed. Invalid signature.'
      });
    }

    // Update order with payment details
    const order = await Order.findById(orderId).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    order.isPaid = true;
    order.status = 'Payment Successful';
    order.paymentInfo = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paidAt: new Date()
    };

    await order.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
        paidAt: new Date()
      }
    );

    // Trigger Email 1: Customer Payment Success Email
    sendPaymentSuccessEmail(order, order.userId);

    // Trigger Email 2: Admin New Order Alert Email
    sendAdminNewOrderEmail(order, order.userId);

    res.json({
      message: 'Payment verified successfully',
      order
    });

  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// ============================
// GET RAZORPAY KEY - Return public key for frontend
// GET /api/payment/razorpay-key
// ============================
exports.getRazorpayKey = (req, res) => {
  res.json({
    key: process.env.RAZORPAY_KEY_ID
  });
};

// ============================
// GET PAYMENT BY ORDER - Fetch payment details for an order
// GET /api/payment/order/:orderId
// ============================
exports.getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      orderId: req.params.orderId
    });

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get Payment Error:', error);
    res.status(500).json({
      message: 'Failed to fetch payment details'
    });
  }
};
