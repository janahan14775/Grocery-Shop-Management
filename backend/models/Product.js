const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: String,

    price: Number,

    category: String,

    quantity: Number,

    description: String,

    image: String,

    expiryDate: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);