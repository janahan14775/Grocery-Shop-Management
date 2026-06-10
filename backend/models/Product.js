// Product Model - Stores grocery product details with Cloudinary image
const mongoose = require('mongoose');

// All 19 grocery categories as specified in requirements
const CATEGORIES = [
  'Rice',
  'Black Gram',
  'Green Gram',
  'Toor Dal',
  'Wheat Flour',
  'Sugar',
  'Salt',
  'Milk',
  'Curd',
  'Butter',
  'Biscuits',
  'Shampoo',
  'Soap',
  'Toothpaste',
  'Cooking Oil',
  'Vegetables',
  'Fruits',
  'Snacks',
  'Beverages'
];

const productSchema = new mongoose.Schema(
  {
    // Product display name
    name: {
      type: String,
      required: true,
      trim: true
    },

    // Category must be one of the predefined grocery categories
    category: {
      type: String,
      required: true,
      enum: CATEGORIES
    },

    // Price in INR (₹)
    price: {
      type: Number,
      required: true,
      min: 0
    },

    // Available stock quantity
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    // Product description
    description: {
      type: String,
      trim: true
    },

    // Cloudinary secure_url for product image
    image: {
      type: String
    },

    // Product expiry date
    expiryDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Export the categories array so it can be used in controllers
module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;