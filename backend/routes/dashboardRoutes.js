// Dashboard Routes - Admin analytics endpoints
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getStats,
  getRecentOrders,
  getLowStockProducts,
  getRevenueAnalytics
} = require('../controllers/dashboardController');

const router = express.Router();

// All dashboard routes require admin access
router.get('/stats', authMiddleware, adminMiddleware, getStats);                    // GET /api/dashboard/stats
router.get('/recent-orders', authMiddleware, adminMiddleware, getRecentOrders);     // GET /api/dashboard/recent-orders
router.get('/low-stock', authMiddleware, adminMiddleware, getLowStockProducts);     // GET /api/dashboard/low-stock
router.get('/revenue', authMiddleware, adminMiddleware, getRevenueAnalytics);       // GET /api/dashboard/revenue

module.exports = router;