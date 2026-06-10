// Admin Middleware - Checks if authenticated user has admin role
// Must be used AFTER authMiddleware (req.user must exist)

module.exports = (req, res, next) => {
  // Check if user exists and has admin role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      message: 'Access denied. Admin privileges required.'
    });
  }
};
