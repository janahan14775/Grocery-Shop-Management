// User Model - Stores registered users with role-based access
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: true,
      trim: true
    },

    // User's email address (unique identifier for login)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Hashed password using bcryptjs
    password: {
      type: String,
      required: true
    },

    // Optional phone number
    phone: {
      type: String,
      trim: true
    },

    // Role-based access: 'customer' or 'admin'
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },

    // Whether the user verified their email via OTP
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
