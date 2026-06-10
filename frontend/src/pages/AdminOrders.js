// AdminOrders Page - View and manage all customer orders
import { useEffect, useState } from 'react';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';

function AdminOrders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/all');
      setOrders(res.data);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'warning',
      'Confirmed': 'success',
      'Shipped': 'primary',
      'Delivered': 'info'
    };
    return colors[status] || 'secondary';
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

        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h2 className='fw-bold mb-0'>All Orders ({orders.length})</h2>
        </div>

        {orders.length === 0 ? (
          <div className='text-center py-5'>
            <h4 className='text-muted'>No orders yet</h4>
          </div>
        ) : (
          <div className='card border-0 shadow-sm rounded-4'>
            <div className='table-responsive'>
              <table className='table table-hover align-middle mb-0'>
                <thead className='table-light'>
                  <tr>
                    <th className='ps-4'>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className='pe-4'>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td className='ps-4 fw-semibold small'>
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <div>
                          <p className='mb-0 fw-semibold small'>{order.userId?.name || 'N/A'}</p>
                          <p className='mb-0 text-muted' style={{ fontSize: '0.75rem' }}>
                            {order.userId?.email || ''}
                          </p>
                        </div>
                      </td>
                      <td className='small'>{order.items?.length || 0} items</td>
                      <td className='fw-semibold'>₹{order.totalAmount?.toFixed(2)}</td>
                      <td>
                        {order.isPaid ? (
                          <span className='badge bg-success'>Paid</span>
                        ) : (
                          <span className='badge bg-danger'>Unpaid</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className='small text-muted'>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className='pe-4'>
                        <select
                          className='form-select form-select-sm'
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          style={{ width: '130px' }}
                        >
                          <option value='Pending'>Pending</option>
                          <option value='Confirmed'>Confirmed</option>
                          <option value='Shipped'>Shipped</option>
                          <option value='Delivered'>Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminOrders;
