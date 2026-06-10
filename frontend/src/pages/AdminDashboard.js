// AdminDashboard Page - Stats, recent orders, low stock, revenue
import { useEffect, useState } from 'react';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaChartLine, FaShoppingBag, FaBoxOpen,
  FaUsers, FaExclamationTriangle
} from 'react-icons/fa';

function AdminDashboard() {

  const [stats, setStats] = useState({
    totalSales: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, lowStockRes, revenueRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/recent-orders'),
        API.get('/dashboard/low-stock'),
        API.get('/dashboard/revenue')
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
      setLowStock(lowStockRes.data);
      setRevenue(revenueRes.data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Sales', value: `₹${stats.totalSales?.toLocaleString()}`, icon: <FaChartLine />, color: '#2e7d32', bg: '#e8f5e9' },
    { title: 'Total Orders', value: stats.totalOrders, icon: <FaShoppingBag />, color: '#1565c0', bg: '#e3f2fd' },
    { title: 'Total Products', value: stats.totalProducts, icon: <FaBoxOpen />, color: '#e65100', bg: '#fff3e0' },
    { title: 'Total Customers', value: stats.totalUsers, icon: <FaUsers />, color: '#6a1b9a', bg: '#f3e5f5' }
  ];

  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'warning', 'Confirmed': 'success',
      'Shipped': 'primary', 'Delivered': 'info'
    };
    return <span className={`badge bg-${colors[status] || 'secondary'}`}>{status}</span>;
  };

  if (loading) return (
    <div className='d-flex'>
      <Sidebar />
      <div className='flex-grow-1'><LoadingSpinner /></div>
    </div>
  );

  return (
    <div className='d-flex'>
      <Sidebar />

      <div className='flex-grow-1 p-4' style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>

        <h2 className='fw-bold mb-4'>Dashboard</h2>

        {/* Stat Cards */}
        <div className='row g-3 mb-4'>
          {statCards.map((card, index) => (
            <div key={index} className='col-md-3 col-6'>
              <div className='card border-0 shadow-sm rounded-4 p-3 h-100'>
                <div className='d-flex align-items-center gap-3'>
                  <div className='rounded-3 d-flex align-items-center justify-content-center'
                    style={{ width: '50px', height: '50px', background: card.bg, color: card.color, fontSize: '1.3rem' }}>
                    {card.icon}
                  </div>
                  <div>
                    <p className='mb-0 small text-muted'>{card.title}</p>
                    <h4 className='fw-bold mb-0'>{card.value}</h4>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='row g-4'>

          {/* Recent Orders */}
          <div className='col-lg-8'>
            <div className='card border-0 shadow-sm rounded-4 p-4'>
              <h5 className='fw-bold mb-3'>Recent Orders</h5>

              {recentOrders.length === 0 ? (
                <p className='text-muted'>No orders yet</p>
              ) : (
                <div className='table-responsive'>
                  <table className='table table-hover align-middle'>
                    <thead className='table-light'>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order._id}>
                          <td className='fw-semibold small'>#{order._id.slice(-6).toUpperCase()}</td>
                          <td>{order.userId?.name || 'N/A'}</td>
                          <td className='fw-semibold'>₹{order.totalAmount?.toFixed(2)}</td>
                          <td>{getStatusBadge(order.status)}</td>
                          <td className='small text-muted'>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className='col-lg-4'>
            <div className='card border-0 shadow-sm rounded-4 p-4'>
              <h5 className='fw-bold mb-3'>
                <FaExclamationTriangle className='text-warning me-2' />
                Low Stock Alerts
              </h5>

              {lowStock.length === 0 ? (
                <p className='text-muted'>All products are well stocked 👍</p>
              ) : (
                <div className='d-flex flex-column gap-2'>
                  {lowStock.map(product => (
                    <div key={product._id}
                      className='d-flex justify-content-between align-items-center p-2 rounded-3'
                      style={{ background: product.quantity === 0 ? '#ffebee' : '#fff3e0' }}>
                      <div>
                        <p className='mb-0 fw-semibold small'>{product.name}</p>
                        <p className='mb-0 text-muted' style={{ fontSize: '0.75rem' }}>{product.category}</p>
                      </div>
                      <span className={`badge ${product.quantity === 0 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revenue by Month */}
            <div className='card border-0 shadow-sm rounded-4 p-4 mt-4'>
              <h5 className='fw-bold mb-3'>Monthly Revenue</h5>
              {revenue.filter(m => m.revenue > 0).length === 0 ? (
                <p className='text-muted'>No revenue data yet</p>
              ) : (
                <div className='d-flex flex-column gap-2'>
                  {revenue.filter(m => m.revenue > 0).map((month, index) => (
                    <div key={index} className='d-flex justify-content-between align-items-center'>
                      <span className='small fw-semibold'>{month.month}</span>
                      <div className='d-flex align-items-center gap-2'>
                        <div style={{
                          width: `${Math.min(100, (month.revenue / Math.max(...revenue.map(m => m.revenue))) * 100)}px`,
                          height: '8px',
                          background: 'linear-gradient(90deg, #4caf50, #2e7d32)',
                          borderRadius: '4px'
                        }}></div>
                        <span className='small text-muted'>₹{month.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;