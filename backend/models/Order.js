// Order Model - Stores customer orders with shipping, payment, and status tracking
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    // Reference to the product
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    // Snapshot of product name at time of order
    name: {
      type: String,
      required: true
    },
    // Snapshot of price at time of order
    price: {
      type: Number,
      required: true
    },
    // Quantity ordered
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    // Snapshot of product image
    image: {
      type: String
    }
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Custom human-readable Order ID (e.g. ORD-20260727-1054)
    orderId: {
      type: String,
      unique: true,
      sparse: true
    },

    // Unique Pickup Token (e.g. GK-583921)
    pickupToken: {
      type: String,
      index: true
    },

    // Reference to the customer who placed the order
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Customer details captured at checkout
    customerInfo: {
      name: { type: String },
      phone: { type: String },
      email: { type: String }
    },

    // Store pickup details
    pickupDate: { type: String },
    pickupTime: { type: String },
    storeLocation: { type: String, default: 'Main Supermarket Store - 123 Fresh Way' },

    // Staff member assigned for packing
    assignedStaff: { type: String, default: 'Unassigned' },

    // Array of ordered items with snapshots of product data
    items: [orderItemSchema],

    // Shipping or Contact address
    shippingAddress: shippingAddressSchema,

    // Subtotal before tax
    itemsAmount: {
      type: Number,
      required: true
    },

    // Tax amount (5% of subtotal)
    taxAmount: {
      type: Number,
      required: true,
      default: 0
    },

    // Shipping charges
    shippingAmount: {
      type: Number,
      default: 0
    },

    // Grand total (items + tax + shipping)
    totalAmount: {
      type: Number,
      required: true
    },

    // Order status tracking (supports original & new pickup workflow)
    status: {
      type: String,
      enum: [
        'Pending',
        'Payment Successful',
        'Confirmed',
        'Order Accepted',
        'Packing',
        'Ready for Pickup',
        'Completed',
        'Shipped',
        'Delivered'
      ],
      default: 'Pending'
    },

    // Payment information from Razorpay
    paymentInfo: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      paidAt: { type: Date }
    },

    // Whether the order has been paid
    isPaid: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);