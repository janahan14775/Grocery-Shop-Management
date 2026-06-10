const Order =require("../models/Order");

exports.createOrder =
async (req, res) => {

  try {

    const { products } = req.body;

    // CALCULATE TOTAL
    const totalAmount =
      products.reduce(

        (acc, item) =>

          acc +
          item.price * item.quantity,

        0
      );

    const order = new Order({

      products,

      totalAmount

    });

    await order.save();

    res.json(order);

  } catch (error) {

    res.status(500).json(error);

  }

};