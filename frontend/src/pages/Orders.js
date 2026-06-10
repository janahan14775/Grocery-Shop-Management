// Orders Page - Customer order history
import { useEffect, useState } from 'react';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaBox, FaCheckCircle, FaTruck, FaClock } from 'react-icons/fa';

function Orders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/my-orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      'Pending': { bg: '#fff3e0', color: '#e65100', icon: <FaClock /> },
      'Confirmed': { bg: '#e8f5e9', color: '#2e7d32', icon: <FaCheckCircle /> },
      'Shipped': { bg: '#e3f2fd', color: '#1565c0', icon: <FaTruck /> },
      'Delivered': { bg: '#e8f5e9', color: '#1b5e20', icon: <FaBox /> }
    };
    const style = styles[status] || styles['Pending'];
    return (
      <span className='badge px-3 py-2' style={{ background: style.bg, color: style.color }}>
        {style.icon} <span className='ms-1'>{status}</span>
      </span>
    );
  };

  if (loading) return <LoadingSpinner message='Loading orders...' />;

  return (
    <div className='container mt-4 mb-5'>

      <h2 className='fw-bold mb-4'>My Orders</h2>

      {orders.length === 0 ? (
        <div className='text-center py-5'>
          <div style={{ fontSize: '4rem' }}>📦</div>
          <h4 className='text-muted mt-3'>No orders yet</h4>
          <p className='text-muted'>Start shopping to see your orders here</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order._id} className='card border-0 shadow-sm rounded-4 mb-4 overflow-hidden'>

            {/* Order Header */}
            <div className='card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2'>
              <div>
                <p className='mb-0 small text-muted'>
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className='mb-0 small text-muted'>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <div className='d-flex align-items-center gap-3'>
                {getStatusBadge(order.status)}
                {order.isPaid && (
                  <span className='badge bg-success px-3 py-2'>
                    ✓ Paid
                  </span>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className='card-body px-4'>
              {order.items && order.items.map((item, index) => (
                <div key={index} className='d-flex align-items-center gap-3 mb-2 pb-2 border-bottom'>
                  <img
                    src={item.image || 'https://via.placeholder.com/50'}
                    alt={item.name}
                    className='rounded'
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                  <div className='flex-grow-1'>
                    <p className='mb-0 fw-semibold small'>{item.name}</p>
                    <p className='mb-0 text-muted' style={{ fontSize: '0.75rem' }}>
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <span className='fw-semibold'>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className='card-footer bg-white py-3 px-4'>
              <div className='d-flex justify-content-between align-items-center'>
                <div className='small text-muted'>
                  {order.shippingAddress && (
                    <span>
                      📍 {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </span>
                  )}
                </div>
                <div className='text-end'>
                  <p className='mb-0 small text-muted'>Grand Total</p>
                  <h5 className='fw-bold mb-0' style={{ color: '#2e7d32' }}>
                    ₹{order.totalAmount?.toFixed(2)}
                  </h5>
                </div>
              </div>
            </div>

          </div>
        ))
      )}
    </div>
  );
}

export default Orders;
