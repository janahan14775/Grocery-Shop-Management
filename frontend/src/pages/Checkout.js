// Checkout Page - Pickup details form + Razorpay payment + Pickup Token Modal
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaStore, FaCreditCard, FaTicketAlt, FaCalendarAlt, FaClock, FaUser, FaPhone } from 'react-icons/fa';

function Checkout() {
  const navigate = useNavigate();
  const { cart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Customer & Pickup Details
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Default to today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [pickupTime, setPickupTime] = useState('10:00 AM - 12:00 PM');
  const [storeLocation, setStoreLocation] = useState('Main Supermarket Store - 123 Fresh Way, City Center');

  // Address fields for delivery / record
  const [address] = useState('Store Pickup Collection');
  const [city] = useState('City');
  const [state] = useState('State');
  const [pincode] = useState('123456');

  // Calculations
  const taxAmount = Math.round(totalAmount * 0.05 * 100) / 100;
  const shippingAmount = totalAmount >= 500 ? 0 : 40;
  const grandTotal = totalAmount + taxAmount + shippingAmount;

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Create order in backend with pickup details
      const orderItems = cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const orderRes = await API.post('/orders', {
        items: orderItems,
        customerInfo: {
          name: customerName,
          phone: phone,
          email: user?.email
        },
        pickupDate,
        pickupTime,
        storeLocation,
        shippingAddress: { address, city, state, pincode, phone }
      });

      const order = orderRes.data;

      // Step 2: Create Razorpay payment order
      const paymentRes = await API.post('/payment/create-order', {
        orderId: order._id
      });

      // Step 3: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      // Get Razorpay key
      const keyRes = await API.get('/payment/razorpay-key');

      const options = {
        key: keyRes.data.key,
        amount: paymentRes.data.amount,
        currency: paymentRes.data.currency,
        name: 'Smart Grocery Shop',
        description: `Pickup Token #${order.pickupToken || order.orderId}`,
        order_id: paymentRes.data.razorpayOrderId,
        handler: async (response) => {
          try {
            // Step 4: Verify payment
            const verifyRes = await API.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id
            });

            // Success - clear cart and show pickup token modal
            clearCart();
            setSuccessOrder(verifyRes.data.order || order);

          } catch (err) {
            setError('Payment verification failed. Please contact store support.');
          }
        },
        prefill: {
          name: customerName || user?.name || '',
          email: user?.email || '',
          contact: phone
        },
        theme: {
          color: '#2e7d32'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      setError(
        err.response?.data?.message || 'Checkout failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !successOrder) {
    navigate('/cart');
    return null;
  }

  return (
    <div className='container mt-4 mb-5'>

      {/* SUCCESS MODAL FOR PICKUP TOKEN */}
      {successOrder && (
        <div className='modal d-block tab-modal' style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className='modal-dialog modal-dialog-centered modal-lg'>
            <div className='modal-content border-0 rounded-4 shadow-lg overflow-hidden'>
              <div className='p-4 text-center text-white' style={{ background: 'linear-gradient(135deg, #2e7d32, #4caf50)' }}>
                <div className='bg-white text-success rounded-circle d-inline-flex p-3 mb-2 shadow-sm'>
                  <FaTicketAlt style={{ fontSize: '2.5rem' }} />
                </div>
                <h3 className='fw-bold mb-1'>Payment Successful!</h3>
                <p className='mb-0 opacity-90'>Your Grocery Pickup Order is Confirmed</p>
              </div>

              <div className='modal-body p-4 text-center'>
                <div className='p-4 rounded-4 my-3 text-center border border-2 border-success' style={{ background: '#f1f8e9' }}>
                  <p className='text-muted small fw-bold mb-1 text-uppercase tracking-wider'>Your Unique Pickup Token</p>
                  <h1 className='display-4 fw-bold text-success my-2' style={{ letterSpacing: '4px' }}>
                    {successOrder.pickupToken || 'GK-SUCCESS'}
                  </h1>
                  <p className='mb-0 text-dark small'>
                    Order ID: <strong>{successOrder.orderId || successOrder._id}</strong>
                  </p>
                </div>

                <div className='row text-start bg-light p-3 rounded-3 my-3 g-2 small'>
                  <div className='col-6'>
                    <strong>📅 Pickup Date:</strong> {successOrder.pickupDate || pickupDate}
                  </div>
                  <div className='col-6'>
                    <strong>⏰ Time Slot:</strong> {successOrder.pickupTime || pickupTime}
                  </div>
                  <div className='col-12 mt-2'>
                    <strong>📍 Store Branch:</strong> {successOrder.storeLocation || storeLocation}
                  </div>
                </div>

                <div className='alert alert-success border-0 small text-start my-3'>
                  <strong>📧 Email Notification Sent:</strong> A confirmation email with your Pickup Token and item details has been sent to <strong>{user?.email}</strong>.
                </div>

                <p className='text-muted small'>
                  "Your order has been received successfully. We will notify you again once your groceries are packed and ready for pickup."
                </p>

                <button
                  className='btn btn-success fw-bold px-4 py-2 rounded-pill mt-2'
                  onClick={() => navigate('/orders')}
                >
                  View My Orders & Pickup Timeline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className='fw-bold mb-4 d-flex align-items-center gap-2'>
        <FaStore className='text-success' /> Grocery Store Checkout & Pickup Details
      </h2>

      {error && (
        <div className='alert alert-danger rounded-3'>{error}</div>
      )}

      <div className='row g-4'>

        {/* Pickup & Customer Details Form */}
        <div className='col-lg-7'>
          <div className='card border-0 shadow-sm rounded-4 p-4 mb-4'>
            <h5 className='fw-bold mb-3 text-success d-flex align-items-center gap-2'>
              <FaUser /> Customer Contact Information
            </h5>

            <form onSubmit={handleCheckout}>
              <div className='row g-3 mb-4'>
                <div className='col-md-6'>
                  <label className='form-label small fw-semibold d-flex align-items-center gap-1'>
                    <FaUser className='text-muted' /> Full Name
                  </label>
                  <input
                    type='text'
                    className='form-control rounded-3'
                    placeholder='Enter your full name'
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className='col-md-6'>
                  <label className='form-label small fw-semibold d-flex align-items-center gap-1'>
                    <FaPhone className='text-muted' /> Mobile Phone Number
                  </label>
                  <input
                    type='tel'
                    className='form-control rounded-3'
                    placeholder='10-digit phone number'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              <h5 className='fw-bold mb-3 text-success d-flex align-items-center gap-2 border-top pt-3'>
                <FaStore /> Store Pickup Preferences
              </h5>

              <div className='row g-3 mb-3'>
                <div className='col-md-6'>
                  <label className='form-label small fw-semibold d-flex align-items-center gap-1'>
                    <FaCalendarAlt className='text-muted' /> Preferred Pickup Date
                  </label>
                  <input
                    type='date'
                    className='form-control rounded-3'
                    value={pickupDate}
                    min={todayStr}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  />
                </div>
                <div className='col-md-6'>
                  <label className='form-label small fw-semibold d-flex align-items-center gap-1'>
                    <FaClock className='text-muted' /> Preferred Time Slot
                  </label>
                  <select
                    className='form-select rounded-3'
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    required
                  >
                    <option value='08:00 AM - 10:00 AM'>08:00 AM - 10:00 AM</option>
                    <option value='10:00 AM - 12:00 PM'>10:00 AM - 12:00 PM</option>
                    <option value='12:00 PM - 02:00 PM'>12:00 PM - 02:00 PM</option>
                    <option value='02:00 PM - 04:00 PM'>02:00 PM - 04:00 PM</option>
                    <option value='04:00 PM - 06:00 PM'>04:00 PM - 06:00 PM</option>
                    <option value='06:00 PM - 08:00 PM'>06:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>

              <div className='mb-4'>
                <label className='form-label small fw-semibold'>Store Location</label>
                <select
                  className='form-select rounded-3'
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                >
                  <option value='Main Supermarket Store - 123 Fresh Way, City Center'>Main Supermarket Store - 123 Fresh Way, City Center</option>
                  <option value='North Express Supermarket - 45 Green Avenue'>North Express Supermarket - 45 Green Avenue</option>
                  <option value='South Market Branch - 89 Harvest Boulevard'>South Market Branch - 89 Harvest Boulevard</option>
                </select>
              </div>

              <button
                className='btn w-100 fw-bold py-3 text-white shadow-sm'
                type='submit'
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #2e7d32, #f57c00)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem'
                }}
              >
                {loading ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2'></span>
                    Processing Payment & Generating Token...
                  </>
                ) : (
                  <>
                    <FaCreditCard className='me-2' /> Pay ₹{grandTotal.toFixed(2)} & Get Pickup Token
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className='col-lg-5'>
          <div className='card border-0 shadow-sm rounded-4 p-4' style={{ position: 'sticky', top: '90px' }}>
            <h5 className='fw-bold mb-3 border-bottom pb-2'>Order Summary</h5>

            {/* Items List */}
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {cart.map(item => (
                <div key={item._id} className='d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom me-1'>
                  <div className='d-flex align-items-center gap-2'>
                    <img
                      src={item.image || 'https://via.placeholder.com/40'}
                      alt={item.name}
                      className='rounded'
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                      <p className='mb-0 small fw-semibold'>{item.name}</p>
                      <p className='mb-0 text-muted' style={{ fontSize: '0.75rem' }}>
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className='fw-semibold'>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className='mt-3'>
              <div className='d-flex justify-content-between mb-1 text-secondary'>
                <span>Subtotal</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className='d-flex justify-content-between mb-1 text-secondary'>
                <span>Tax (5%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className='d-flex justify-content-between mb-2 text-secondary'>
                <span>Packaging & Handling</span>
                <span>{shippingAmount === 0 ? <span className='text-success fw-bold'>FREE</span> : `₹${shippingAmount}`}</span>
              </div>
              <hr />
              <div className='d-flex justify-content-between align-items-center'>
                <span className='fw-bold fs-5'>Total Payable</span>
                <span className='fw-bold fs-4' style={{ color: '#2e7d32' }}>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
