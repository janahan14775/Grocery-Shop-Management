const express = require("express");

const Product =
require("../models/Product");

const Order =
require("../models/Order");

const router = express.Router();

router.get(
  "/stats",

  async (req, res) => {

    const totalProducts =
      await Product.countDocuments();

    const totalOrders =
      await Order.countDocuments();

    const orders =
      await Order.find();

    const totalSales =
      orders.reduce(

        (acc, order) =>

          acc + order.totalAmount,

        0
      );

    res.json({

      totalProducts,

      totalOrders,

      totalSales

    });

  }
);

module.exports = router;