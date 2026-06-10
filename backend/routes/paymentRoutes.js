// Payment Routes - Razorpay payment integration
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey,
  getPaymentByOrderId
} = require('../controllers/paymentController');

const router = express.Router();

// Public route - frontend needs the key to initialize Razorpay checkout
router.get('/razorpay-key', getRazorpayKey);                                    // GET /api/payment/razorpay-key

// Protected routes
router.post('/create-order', authMiddleware, createRazorpayOrder);              // POST /api/payment/create-order
router.post('/verify', authMiddleware, verifyPayment);                          // POST /api/payment/verify
router.get('/order/:orderId', authMiddleware, getPaymentByOrderId);             // GET /api/payment/order/:orderId

module.exports = router;
