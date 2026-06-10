// Auth Controller - Handles registration (with OTP), login, and profile
const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure Nodemailer transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ============================
// SEND OTP - Send 6-digit OTP to email
// POST /api/auth/send-otp
// ============================
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    // Generate a random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email });

    // Save new OTP to database (auto-expires in 5 minutes via TTL)
    await new Otp({ email, otp }).save();

    // Send OTP via email
    const mailOptions = {
      from: `"JanaStore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your JanaStore Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2e7d32;">🏪 JanaStore</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #2e7d32; font-size: 36px; letter-spacing: 8px; text-align: center; background: #f5f5f5; padding: 20px; border-radius: 10px;">${otp}</h1>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: 'OTP sent successfully to your email'
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      message: 'Failed to send OTP. Please try again.'
    });
  }
};

// ============================
// VERIFY OTP - Verify the OTP entered by user
// POST /api/auth/verify-otp
// ============================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required'
      });
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        message: 'Invalid or expired OTP'
      });
    }

    // Delete the used OTP
    await Otp.deleteMany({ email });

    res.json({
      message: 'OTP verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      message: 'OTP verification failed'
    });
  }
};

// ============================
// REGISTER - Create new user (after OTP verification)
// POST /api/auth/register
// ============================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (marked as verified since OTP was verified before calling register)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: true
    });

    await user.save();

    res.status(201).json({
      message: 'Registration successful! Please login.'
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      message: 'Registration failed. Please try again.'
    });
  }
};

// ============================
// LOGIN - Authenticate user and return JWT
// POST /api/auth/login
// ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: 'No account found with this email'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Incorrect password'
      });
    }

    // Generate JWT with user ID and role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return token and user data (without password)
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      message: 'Login failed. Please try again.'
    });
  }
};

// ============================
// GET PROFILE - Return current user from token
// GET /api/auth/profile
// ============================
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get profile'
    });
  }
};