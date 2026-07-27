// Orders Page - Customer order history with Pickup Token & Timeline
import { useEffect, useState } from 'react';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaTicketAlt, FaCheckCircle, FaCheck, FaBox } from 'react-icons/fa';
import { FaStore, FaUserCheck, FaBoxesPacking } from 'react-icons/fa6';

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

  // Order timeline stages definition
  const TIMELINE_STAGES = [
    { key: 'Payment Successful', label: 'Payment Done', icon: <FaCheckCircle /> },
    { key: 'Order Accepted', label: 'Order Accepted', icon: <FaUserCheck /> },
    { key: 'Packing', label: 'Packing Groceries', icon: <FaBoxesPacking /> },
    { key: 'Ready for Pickup', label: 'Ready for Pickup', icon: <FaStore /> },
    { key: 'Completed', label: 'Order Completed', icon: <FaBox /> }
  ];

  // Helper to determine step status
  const getStepIndex = (status) => {
    switch (status) {
      case 'Payment Successful':
      case 'Confirmed':
        return 0;
      case 'Order Accepted':
        return 1;
      case 'Packing':
        return 2;
      case 'Ready for Pickup':
        return 3;
      case 'Completed':
      case 'Delivered':
        return 4;
      default:
        return 0;
    }
  };

  if (loading) return <LoadingSpinner message='Loading your grocery orders...' />;

  return (
    <div className='container mt-4 mb-5'>
      <h2 className='fw-bold mb-4 d-flex align-items-center gap-2'>
        <FaStore className='text-success' /> My Grocery Orders & Pickup Tokens
      </h2>

      {orders.length === 0 ? (
        <div className='text-center py-5 bg-white rounded-4 shadow-sm p-4'>
          <div style={{ fontSize: '4rem' }}>🛒</div>
          <h4 className='text-muted mt-3'>No orders placed yet</h4>
          <p className='text-muted'>Explore fresh groceries and place your first pickup order!</p>
        </div>
      ) : (
        orders.map(order => {
          const currentStep = getStepIndex(order.status);
          const isReady = order.status === 'Ready for Pickup';

          return (
            <div key={order._id} className='card border-0 shadow-sm rounded-4 mb-4 overflow-hidden'>

              {/* Card Header with Order ID & Pickup Token Badge */}
              <div className='card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2 border-bottom'>
                <div>
                  <div className='d-flex align-items-center gap-2'>
                    <span className='fw-bold text-dark fs-5'>
                      {order.orderId || `ORD-${order._id.slice(-8).toUpperCase()}`}
                    </span>
                    {order.isPaid && (
                      <span className='badge bg-success-subtle text-success border border-success px-2 py-1 small rounded-pill'>
                        ✓ Paid Online
                      </span>
                    )}
                  </div>
                  <p className='mb-0 small text-muted'>
                    Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* PROMINENT PICKUP TOKEN BADGE */}
                <div className={`p-2 px-4 rounded-4 text-center border ${isReady ? 'bg-warning-subtle border-warning' : 'bg-light border-success'}`}>
                  <div className='small text-muted fw-bold d-flex align-items-center gap-1 justify-content-center'>
                    <FaTicketAlt className='text-success' /> STORE PICKUP TOKEN
                  </div>
                  <div className='fs-3 fw-bold text-success' style={{ letterSpacing: '3px' }}>
                    {order.pickupToken || 'GK-STORE'}
                  </div>
                </div>
              </div>

              {/* Interactive Timeline Progress Bar */}
              <div className='bg-light p-4 border-bottom'>
                <p className='small text-muted fw-semibold mb-3'>Pickup Status Timeline:</p>
                <div className='d-flex justify-content-between align-items-center position-relative px-2'>

                  {/* Progress Line */}
                  <div
                    className='position-absolute top-50 start-0 translate-middle-y bg-secondary-subtle'
                    style={{ height: '4px', width: '100%', zIndex: 1 }}
                  />
                  <div
                    className='position-absolute top-50 start-0 translate-middle-y bg-success transition-all'
                    style={{
                      height: '4px',
                      width: `${(currentStep / 4) * 100}%`,
                      zIndex: 2,
                      transition: 'width 0.4s ease'
                    }}
                  />

                  {/* Stage Nodes */}
                  {TIMELINE_STAGES.map((stage, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div key={stage.key} className='text-center position-relative' style={{ zIndex: 3 }}>
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm ${
                            isCompleted ? 'bg-success text-white' : 'bg-white text-secondary border'
                          } ${isCurrent ? 'ring-4 ring-success' : ''}`}
                          style={{
                            width: '42px',
                            height: '42px',
                            fontSize: '1.1rem',
                            border: isCurrent ? '3px solid #f57c00' : 'none'
                          }}
                        >
                          {isCompleted ? <FaCheck /> : stage.icon}
                        </div>
                        <span className={`d-block small mt-2 fw-semibold ${isCurrent ? 'text-success fw-bold' : 'text-muted'}`} style={{ fontSize: '0.78rem' }}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ready for pickup notification banner */}
              {isReady && (
                <div className='alert alert-warning border-0 mb-0 rounded-0 p-3 d-flex align-items-center gap-3'>
                  <FaStore className='fs-2 text-warning flex-shrink-0' />
                  <div>
                    <strong className='d-block text-dark fs-6'>🎉 Your groceries are packed and ready for pickup!</strong>
                    <span className='small text-secondary'>
                      Please visit our store counter and present Pickup Token <strong>{order.pickupToken}</strong> to collect your order.
                    </span>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className='card-body px-4 py-3'>
                <h6 className='small fw-bold text-muted mb-3'>Ordered Items ({order.items?.length || 0})</h6>
                {order.items && order.items.map((item, index) => (
                  <div key={index} className='d-flex align-items-center gap-3 mb-2 pb-2 border-bottom last-border-0'>
                    <img
                      src={item.image || 'https://via.placeholder.com/50'}
                      alt={item.name}
                      className='rounded'
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
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

              {/* Pickup & Address Footer */}
              <div className='card-footer bg-white py-3 px-4 border-top'>
                <div className='row align-items-center g-2'>
                  <div className='col-md-7 small text-secondary'>
                    <p className='mb-1'>
                      📅 <strong>Pickup Date & Time:</strong> {order.pickupDate || 'Today'} ({order.pickupTime || 'Standard Hours'})
                    </p>
                    <p className='mb-0'>
                      📍 <strong>Store Branch:</strong> {order.storeLocation || 'Main Supermarket Store'}
                    </p>
                    {order.assignedStaff && order.assignedStaff !== 'Unassigned' && (
                      <p className='mb-0 text-success mt-1'>
                        👨‍🍳 <strong>Assigned Packer:</strong> {order.assignedStaff}
                      </p>
                    )}
                  </div>
                  <div className='col-md-5 text-md-end'>
                    <p className='mb-0 small text-muted'>Total Amount Paid</p>
                    <h4 className='fw-bold mb-0' style={{ color: '#2e7d32' }}>
                      ₹{order.totalAmount?.toFixed(2)}
                    </h4>
                  </div>
                </div>
              </div>

            </div>
          );
        })
      )}
    </div>
  );
}

export default Orders;
