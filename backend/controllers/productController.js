const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

exports.createProduct = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      req.file.path
    );

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      quantity: req.body.quantity,
      description: req.body.description,
      expiryDate: req.body.expiryDate,
      image: result.secure_url
    });

    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.json(products);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Product Deleted'
    });
  } catch (error) {
    res.status(500).json(error);
  }
};