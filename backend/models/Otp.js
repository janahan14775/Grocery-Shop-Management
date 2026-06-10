// OTP Model - Stores temporary OTPs for email verification with auto-expiry
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  // Email address the OTP was sent to
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  // 6-digit OTP code
  otp: {
    type: String,
    required: true
  },

  // Auto-delete after 5 minutes using MongoDB TTL index
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes in seconds
  }
});

module.exports = mongoose.model('Otp', otpSchema);
