// Product Controller - CRUD operations with search, filter, sort, and inventory
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// ============================
// CREATE PRODUCT - Admin adds a new product
// POST /api/products
// ============================
exports.createProduct = async (req, res) => {
  try {
    let imageUrl = '';

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'freshmart_products'
      });
      imageUrl = result.secure_url;

      // Clean up temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Temp file cleanup error:', err);
      });
    }

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      quantity: req.body.quantity,
      description: req.body.description,
      expiryDate: req.body.expiryDate,
      image: imageUrl
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// ============================
// GET ALL PRODUCTS - With search, filter, and sort
// GET /api/products?search=rice&category=Rice&sort=price_asc
// ============================
exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort, showAll } = req.query;

    // Build query filter
    let filter = {};

    // Only show in-stock products for customers (unless admin requests all)
    if (showAll !== 'true') {
      filter.quantity = { $gt: 0 };
    }

    // Search by product name (case-insensitive partial match)
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Filter by category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Build sort options
    let sortOption = { createdAt: -1 }; // Default: newest first

    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'name_asc') {
      sortOption = { name: 1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filter).sort(sortOption);

    res.json(products);
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      message: 'Failed to fetch products'
    });
  }
};

// ============================
// GET SINGLE PRODUCT - Product details by ID
// GET /api/products/:id
// ============================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Get Product Error:', error);
    res.status(500).json({
      message: 'Failed to fetch product'
    });
  }
};

// ============================
// UPDATE PRODUCT - Admin updates product details
// PUT /api/products/:id
// ============================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Update fields from request body
    product.name = req.body.name || product.name;
    product.price = req.body.price !== undefined ? req.body.price : product.price;
    product.category = req.body.category || product.category;
    product.quantity = req.body.quantity !== undefined ? req.body.quantity : product.quantity;
    product.description = req.body.description !== undefined ? req.body.description : product.description;
    product.expiryDate = req.body.expiryDate || product.expiryDate;

    // Upload new image to Cloudinary if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'freshmart_products'
      });
      product.image = result.secure_url;

      // Clean up temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Temp file cleanup error:', err);
      });
    }

    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// ============================
// DELETE PRODUCT - Admin removes a product
// DELETE /api/products/:id
// ============================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({
      message: 'Failed to delete product'
    });
  }
};

// ============================
// GET LOW STOCK PRODUCTS - Products with quantity < 5
// GET /api/products/low-stock
// ============================
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      quantity: { $gt: 0, $lt: 5 }
    }).sort({ quantity: 1 });

    res.json(products);
  } catch (error) {
    console.error('Low Stock Error:', error);
    res.status(500).json({
      message: 'Failed to fetch low stock products'
    });
  }
};

// ============================
// GET CATEGORIES - Return all available categories
// GET /api/products/categories
// ============================
exports.getCategories = async (req, res) => {
  try {
    const { CATEGORIES } = require('../models/Product');
    res.json(CATEGORIES);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch categories'
    });
  }
};