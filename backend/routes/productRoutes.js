// Product Routes - CRUD with admin protection, search, filter
const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getCategories
} = require('../controllers/productController');

const router = express.Router();

// Multer setup for temp file uploads (Cloudinary handles final storage)
const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/', getProducts);                         // GET /api/products
router.get('/categories', getCategories);              // GET /api/products/categories
router.get('/low-stock', authMiddleware, adminMiddleware, getLowStockProducts); // GET /api/products/low-stock
router.get('/:id', getProductById);                    // GET /api/products/:id

// Admin-only routes (auth + admin middleware)
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createProduct);    // POST /api/products
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateProduct);  // PUT /api/products/:id
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);                       // DELETE /api/products/:id

module.exports = router;