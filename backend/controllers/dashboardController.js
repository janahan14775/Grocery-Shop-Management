// Dashboard Controller - Admin analytics and reporting
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// ============================
// GET DASHBOARD STATS - Total sales, orders, products, users
// GET /api/dashboard/stats
// ============================
exports.getStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });

    // Status breakdowns
    const pendingOrders = await Order.countDocuments({ status: { $in: ['Pending', 'Payment Successful', 'Confirmed', 'Order Accepted'] } });
    const packingOrders = await Order.countDocuments({ status: 'Packing' });
    const readyForPickupOrders = await Order.countDocuments({ status: 'Ready for Pickup' });
    const completedOrders = await Order.countDocuments({ status: { $in: ['Completed', 'Delivered'] } });

    // Calculate total sales from paid orders
    const orders = await Order.find({ isPaid: true });
    const totalSales = orders.reduce(
      (acc, order) => acc + order.totalAmount,
      0
    );

    res.json({
      totalProducts,
      totalOrders,
      totalSales: Math.round(totalSales * 100) / 100,
      totalUsers,
      pendingOrders,
      packingOrders,
      readyForPickupOrders,
      completedOrders
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard stats'
    });
  }
};

// ============================
// GET RECENT ORDERS - Last 10 orders for admin dashboard
// GET /api/dashboard/recent-orders
// ============================
exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(orders);

  } catch (error) {
    console.error('Recent Orders Error:', error);
    res.status(500).json({
      message: 'Failed to fetch recent orders'
    });
  }
};

// ============================
// GET LOW STOCK PRODUCTS - Products with quantity < 5
// GET /api/dashboard/low-stock
// ============================
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      quantity: { $lt: 5 }
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
// GET REVENUE ANALYTICS - Monthly revenue for current year
// GET /api/dashboard/revenue
// ============================
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing months with zero values
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const analytics = months.map((month, index) => {
      const found = monthlyRevenue.find(m => m._id === index + 1);
      return {
        month,
        revenue: found ? Math.round(found.revenue * 100) / 100 : 0,
        orders: found ? found.orders : 0
      };
    });

    res.json(analytics);

  } catch (error) {
    console.error('Revenue Analytics Error:', error);
    res.status(500).json({
      message: 'Failed to fetch revenue analytics'
    });
  }
};
