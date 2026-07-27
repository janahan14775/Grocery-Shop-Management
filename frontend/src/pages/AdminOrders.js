// AdminOrders Page - View and manage store pickup orders & staff packing workflow
import { useEffect, useState } from 'react';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaTicketAlt, FaSearch, FaUserCircle } from 'react-icons/fa';
import { FaUserCheck, FaBoxesPacking, FaStore, FaCheckDouble } from 'react-icons/fa6';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [staffInputs, setStaffInputs] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/all');
      setOrders(res.data);
      // Initialize staff inputs map
      const map = {};
      res.data.forEach(o => {
        map[o._id] = o.assignedStaff || '';
      });
      setStaffInputs(map);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const currentStaff = staffInputs[orderId] || 'Store Packer 1';
      await API.put(`/orders/${orderId}/staff-status`, {
        status: newStatus,
        assignedStaff: currentStaff
      });
      fetchOrders();
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const handleStaffChange = (orderId, val) => {
    setStaffInputs(prev => ({ ...prev, [orderId]: val }));
  };

  const saveStaffAssignment = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/staff-status`, {
        assignedStaff: staffInputs[orderId]
      });
      fetchOrders();
    } catch (error) {
      console.error('Save staff error:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Payment Successful':
      case 'Confirmed':
        return 'bg-info text-white';
      case 'Order Accepted':
        return 'bg-primary text-white';
      case 'Packing':
        return 'bg-warning text-dark';
      case 'Ready for Pickup':
        return 'bg-success text-white fw-bold';
      case 'Completed':
      case 'Delivered':
        return 'bg-secondary text-white';
      default:
        return 'bg-light text-dark border';
    }
  };

  // Filter orders by search term (Token / OrderID / Customer Name) and Status Tab
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.pickupToken && order.pickupToken.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.orderId && order.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerInfo?.name && order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.userId?.name && order.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order._id && order._id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'All' ? true : order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className='d-flex'>
      <Sidebar />
      <div className='flex-grow-1'><LoadingSpinner message='Loading orders & pickup tokens...' /></div>
    </div>
  );

  return (
    <div className='d-flex'>
      <Sidebar />

      <div className='flex-grow-1 p-4' style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>

        {/* Title Header */}
        <div className='d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2'>
          <div>
            <h2 className='fw-bold mb-1 d-flex align-items-center gap-2'>
              <FaStore className='text-success' /> Store Pickup & Packing Workflow ({filteredOrders.length})
            </h2>
            <p className='text-muted small mb-0'>Verify Pickup Tokens, Assign Packing Staff, and Manage Order Lifecycle</p>
          </div>
        </div>

        {/* Verification & Search Bar */}
        <div className='card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white'>
          <div className='row g-3 align-items-center'>
            <div className='col-md-7'>
              <div className='input-group'>
                <span className='input-group-text bg-light border-0 text-success fs-5'>
                  <FaTicketAlt />
                </span>
                <input
                  type='text'
                  className='form-control border-0 bg-light py-2 shadow-none'
                  placeholder='Search by Pickup Token (e.g. GK-583921), Order ID, or Customer Name...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className='btn btn-light border-0' onClick={() => setSearchTerm('')}>Clear</button>
                )}
              </div>
            </div>

            {/* Filter Status Tabs */}
            <div className='col-md-5 d-flex gap-1 overflow-x-auto'>
              {['All', 'Payment Successful', 'Order Accepted', 'Packing', 'Ready for Pickup', 'Completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`btn btn-sm rounded-pill text-nowrap px-3 ${filterStatus === st ? 'btn-success fw-bold' : 'btn-outline-secondary border-0'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List / Cards */}
        {filteredOrders.length === 0 ? (
          <div className='text-center py-5 bg-white rounded-4 shadow-sm p-4'>
            <FaSearch className='fs-1 text-muted mb-2' />
            <h5 className='text-muted'>No orders match your search criteria</h5>
            <p className='text-muted small'>Try clearing your search term or selecting a different status filter.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order._id} className='card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-white'>
              <div className='card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2 border-bottom'>
                <div>
                  <div className='d-flex align-items-center gap-2'>
                    <span className='fw-bold text-dark fs-5'>
                      {order.orderId || `ORD-${order._id.slice(-8).toUpperCase()}`}
                    </span>
                    <span className={`badge px-3 py-2 rounded-pill ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className='mb-0 small text-muted'>
                    Customer: <strong>{order.customerInfo?.name || order.userId?.name || 'Customer'}</strong> ({order.customerInfo?.phone || order.userId?.phone || 'No phone'}) • {order.customerInfo?.email || order.userId?.email}
                  </p>
                </div>

                {/* PROMINENT PICKUP TOKEN BADGE FOR ADMIN VERIFICATION */}
                <div className='bg-success-subtle border border-success p-2 px-3 rounded-3 text-center'>
                  <div className='small text-success fw-bold me-1 d-flex align-items-center gap-1'>
                    <FaTicketAlt /> PICKUP TOKEN
                  </div>
                  <div className='fs-4 fw-bold text-success' style={{ letterSpacing: '2px' }}>
                    {order.pickupToken || 'GK-ONLINE'}
                  </div>
                </div>
              </div>

              <div className='card-body px-4'>
                <div className='row g-3 align-items-center'>
                  {/* Items summary */}
                  <div className='col-lg-5'>
                    <h6 className='small fw-bold text-muted mb-2'>Ordered Products ({order.items?.length})</h6>
                    <div className='d-flex flex-column gap-1' style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} className='d-flex justify-content-between small border-bottom pb-1 me-1'>
                          <span>{item.name} <strong className='text-success'>× {item.quantity}</strong></span>
                          <span className='fw-semibold'>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pickup date/time details */}
                  <div className='col-lg-3 border-start ps-3 small text-secondary'>
                    <p className='mb-1'>📅 <strong>Date:</strong> {order.pickupDate || 'Today'}</p>
                    <p className='mb-1'>⏰ <strong>Slot:</strong> {order.pickupTime || 'Standard'}</p>
                    <p className='mb-0'>💰 <strong>Total Paid:</strong> <span className='fw-bold text-success'>₹{order.totalAmount?.toFixed(2)}</span></p>
                  </div>

                  {/* Staff Packing Assignment */}
                  <div className='col-lg-4 border-start ps-3'>
                    <label className='form-label small fw-bold text-dark d-flex align-items-center gap-1 mb-1'>
                      <FaUserCircle className='text-success' /> Assigned Packing Staff:
                    </label>
                    <div className='input-group input-group-sm mb-3'>
                      <input
                        type='text'
                        className='form-control'
                        placeholder='Enter staff name (e.g. John)'
                        value={staffInputs[order._id] || ''}
                        onChange={(e) => handleStaffChange(order._id, e.target.value)}
                      />
                      <button
                        className='btn btn-outline-success'
                        onClick={() => saveStaffAssignment(order._id)}
                      >
                        Save
                      </button>
                    </div>

                    {/* Fast Status Change Actions */}
                    <div className='d-flex flex-wrap gap-1'>
                      <button
                        className={`btn btn-xs ${order.status === 'Order Accepted' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleStatusUpdate(order._id, 'Order Accepted')}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <FaUserCheck className='me-1' /> Accept
                      </button>
                      <button
                        className={`btn btn-xs ${order.status === 'Packing' ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => handleStatusUpdate(order._id, 'Packing')}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <FaBoxesPacking className='me-1' /> Packing
                      </button>
                      <button
                        className={`btn btn-xs ${order.status === 'Ready for Pickup' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => handleStatusUpdate(order._id, 'Ready for Pickup')}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <FaStore className='me-1' /> Ready for Pickup
                      </button>
                      <button
                        className={`btn btn-xs ${order.status === 'Completed' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => handleStatusUpdate(order._id, 'Completed')}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <FaCheckDouble className='me-1' /> Complete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default AdminOrders;
