// Auth Middleware - Verifies JWT token and attaches user to request
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer <token>)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided. Please login.'
      });
    }

    // Extract token after "Bearer "
    const token = authHeader.split(' ')[1];

    // Verify token and decode payload
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach full user object (without password) to request
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User not found. Token invalid.'
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      message: 'Token is invalid or expired. Please login again.'
    });
  }
};