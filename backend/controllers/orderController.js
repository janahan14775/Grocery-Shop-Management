const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendReadyForPickupEmail } = require('../utils/emailService');

// Helper to generate unique order ID (ORD-YYYYMMDD-XXXX)
const generateOrderId = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomDigits}`;
};

// Helper to generate unique pickup token (GK-XXXXXX)
const generatePickupToken = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `GK-${randomNum}`;
};

// ============================
// CREATE ORDER - Customer places an order
// POST /api/orders
// ============================
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, pickupDate, pickupTime, storeLocation, customerInfo } = req.body;

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

    // Generate unique Order ID & Pickup Token
    const orderId = generateOrderId();
    const pickupToken = generatePickupToken();

    // Create order
    const order = new Order({
      orderId,
      pickupToken,
      userId: req.user._id,
      customerInfo: {
        name: customerInfo?.name || shippingAddress.name || req.user.name,
        phone: customerInfo?.phone || shippingAddress.phone || req.user.phone || '',
        email: req.user.email
      },
      pickupDate: pickupDate || new Date().toISOString().slice(0, 10),
      pickupTime: pickupTime || '10:00 AM - 12:00 PM',
      storeLocation: storeLocation || 'Main Supermarket Branch, Downtown',
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
      .populate('userId', 'name email phone')
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
      .populate('userId', 'name email phone');

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
// VERIFY PICKUP TOKEN - Admin/Staff verifies token at store counter
// POST /api/orders/verify-token
// ============================
exports.verifyPickupToken = async (req, res) => {
  try {
    const { pickupToken } = req.body;

    if (!pickupToken) {
      return res.status(400).json({ message: 'Pickup token or Order ID is required' });
    }

    const trimmedToken = pickupToken.trim().toUpperCase();

    // Search by pickupToken or orderId
    const order = await Order.findOne({
      $or: [
        { pickupToken: trimmedToken },
        { orderId: trimmedToken }
      ]
    }).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        valid: false,
        message: 'No matching order found for this token/ID'
      });
    }

    res.json({
      valid: true,
      order
    });

  } catch (error) {
    console.error('Verify Token Error:', error);
    res.status(500).json({ message: 'Failed to verify pickup token' });
  }
};

// ============================
// ASSIGN STAFF & UPDATE STATUS - Admin assigns staff & changes status
// PUT /api/orders/:id/staff-status
// ============================
exports.assignStaffAndStatus = async (req, res) => {
  try {
    const { assignedStaff, status } = req.body;

    const updateFields = {};
    if (assignedStaff !== undefined) updateFields.assignedStaff = assignedStaff;
    if (status !== undefined) updateFields.status = status;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Trigger Ready for Pickup email if status changed to 'Ready for Pickup'
    if (status === 'Ready for Pickup') {
      sendReadyForPickupEmail(order, order.userId);
    }

    res.json(order);
  } catch (error) {
    console.error('Assign Staff Error:', error);
    res.status(500).json({ message: 'Failed to update staff/status' });
  }
};

// ============================
// UPDATE ORDER STATUS - Admin changes status
// PUT /api/orders/:id/status
// ============================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      'Pending',
      'Payment Successful',
      'Confirmed',
      'Order Accepted',
      'Packing',
      'Ready for Pickup',
      'Completed',
      'Shipped',
      'Delivered'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Trigger email notification if status updated to Ready for Pickup
    if (status === 'Ready for Pickup') {
      sendReadyForPickupEmail(order, order.userId);
    }

    res.json(order);
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({
      message: 'Failed to update order status'
    });
  }
};