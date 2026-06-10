// Payment Model - Stores Razorpay payment details linked to orders
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // Reference to the order this payment is for
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },

    // Reference to the user who made the payment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Razorpay order ID (created before payment)
    razorpayOrderId: {
      type: String,
      required: true
    },

    // Razorpay payment ID (received after payment)
    razorpayPaymentId: {
      type: String
    },

    // Razorpay signature for verification
    razorpaySignature: {
      type: String
    },

    // Payment amount in INR
    amount: {
      type: Number,
      required: true
    },

    // Payment status
    status: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created'
    },

    // When the payment was completed
    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
