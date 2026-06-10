// Order Controller - Create orders, manage status, view history
const Order = require('../models/Order');
const Product = require('../models/Product');

// ============================
// CREATE ORDER - Customer places an order
// POST /api/orders
// ============================
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: 'No items in order'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        message: 'Shipping address is required'
      });
    }

    // Validate stock and build order items
    const orderItems = [];
    let itemsAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.name || item.productId}`
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`
        });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });

      itemsAmount += product.price * item.quantity;
    }

    // Calculate tax (5%) and total
    const taxAmount = Math.round(itemsAmount * 0.05 * 100) / 100;
    const shippingAmount = itemsAmount >= 500 ? 0 : 40; // Free shipping above ₹500
    const totalAmount = itemsAmount + taxAmount + shippingAmount;

    // Create order
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      shippingAddress,
      itemsAmount,
      taxAmount,
      shippingAmount,
      totalAmount,
      status: 'Pending',
      isPaid: false
    });

    await order.save();

    // Reduce product inventory
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity }
      });
    }

    res.status(201).json(order);

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// ============================
// GET MY ORDERS - Customer's order history
// GET /api/orders/my-orders
// ============================
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get My Orders Error:', error);
    res.status(500).json({
      message: 'Failed to fetch orders'
    });
  }
};

// ============================
// GET ALL ORDERS - Admin views all orders
// GET /api/orders/all
// ============================
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get All Orders Error:', error);
    res.status(500).json({
      message: 'Failed to fetch all orders'
    });
  }
};

// ============================
// GET ORDER BY ID - Single order details
// GET /api/orders/:id
// ============================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Ensure customer can only see their own orders
    if (req.user.role !== 'admin' &&
        order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to view this order'
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({
      message: 'Failed to fetch order'
    });
  }
};

// ============================
// UPDATE ORDER STATUS - Admin changes status
// PUT /api/orders/:id/status
// ============================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({
      message: 'Failed to update order status'
    });
  }
};