const express = require('express');
const multer = require('multer');

const {
  createProduct,
  getProducts,
  deleteProduct
} = require('../controllers/productController');

const router = express.Router();

const upload = multer({
  dest: 'uploads/'
});

router.post('/', upload.single('image'), createProduct);

router.get('/', getProducts);

router.delete('/:id', deleteProduct);

module.exports = router;