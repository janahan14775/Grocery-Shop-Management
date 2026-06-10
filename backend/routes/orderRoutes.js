// Order Routes - Create, view, manage orders
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

// Customer routes (auth protected)
router.post('/', authMiddleware, createOrder);              // POST /api/orders
router.get('/my-orders', authMiddleware, getMyOrders);      // GET /api/orders/my-orders

// Admin routes (auth + admin)
router.get('/all', authMiddleware, adminMiddleware, getAllOrders);                      // GET /api/orders/all
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);          // PUT /api/orders/:id/status

// Shared route (auth - controller checks ownership)
router.get('/:id', authMiddleware, getOrderById);           // GET /api/orders/:id

module.exports = router;