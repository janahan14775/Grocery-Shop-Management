// Auth Routes - Login, Register, OTP, Profile
const express = require('express');
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  getProfile
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);        // POST /api/auth/register
router.post('/login', login);              // POST /api/auth/login
router.post('/send-otp', sendOtp);         // POST /api/auth/send-otp
router.post('/verify-otp', verifyOtp);     // POST /api/auth/verify-otp

// Protected routes
router.get('/profile', authMiddleware, getProfile); // GET /api/auth/profile

module.exports = router;