// Checkout Page - Shipping address form + Razorpay payment
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaTruck, FaCreditCard } from 'react-icons/fa';

function Checkout() {

  const navigate = useNavigate();
  const { cart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping address form state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');

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
      // Step 1: Create order in backend
      const orderItems = cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const orderRes = await API.post('/orders', {
        items: orderItems,
        shippingAddress: { address, city, state, pincode, phone }
      });

      const order = orderRes.data;

      // Step 2: Create Razorpay payment order
      const paymentRes = await API.post('/payment/create-order', {
        orderId: order._id
      });

      // Step 3: Load Razorpay and open checkout
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
        name: 'JanaStore Grocery',
        description: `Order #${order._id.slice(-8)}`,
        order_id: paymentRes.data.razorpayOrderId,
        handler: async (response) => {
          try {
            // Step 4: Verify payment
            await API.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id
            });

            // Success - clear cart and redirect
            clearCart();
            navigate('/orders');
            
          } catch (err) {
            setError('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
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

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className='container mt-4 mb-5'>

      <h2 className='fw-bold mb-4'>Checkout</h2>

      {error && (
        <div className='alert alert-danger rounded-3'>{error}</div>
      )}

      <div className='row g-4'>

        {/* Shipping Address Form */}
        <div className='col-lg-7'>
          <div className='card border-0 shadow-sm rounded-4 p-4'>
            <h5 className='fw-bold mb-3'>
              <FaTruck className='me-2 text-success' /> Shipping Address
            </h5>

            <form onSubmit={handleCheckout}>

              <div className='mb-3'>
                <label className='form-label small fw-semibold'>Street Address</label>
                <textarea
                  className='form-control'
                  rows='2'
                  placeholder='Enter your full address'
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className='row g-3 mb-3'>
                <div className='col-md-6'>
                  <label className='form-label small fw-semibold'>City</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='City'
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className='col-md-6'>
                  <label className='form-label small fw-semibold'>State</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='State'
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className='row g-3 mb-4'>
                <div className='col-md-6'>
                  <label className='form-label small fw-semibold'>Pincode</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='6-digit pincode'
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                  />
                </div>
                <div className='col-md-6'>
                  <label className='form-label small fw-semibold'>Phone Number</label>
                  <input
                    type='tel'
                    className='form-control'
                    placeholder='10-digit phone number'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              <button
                className='btn w-100 fw-bold py-2'
                type='submit'
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.05rem'
                }}
              >
                {loading ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2'></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard className='me-2' /> Pay ₹{grandTotal.toFixed(2)} with Razorpay
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className='col-lg-5'>
          <div className='card border-0 shadow-sm rounded-4 p-4' style={{ position: 'sticky', top: '90px' }}>
            <h5 className='fw-bold mb-3'>Order Summary</h5>

            {/* Items */}
            {cart.map(item => (
              <div key={item._id} className='d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom'>
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

            <div className='mt-3'>
              <div className='d-flex justify-content-between mb-1'>
                <span className='text-muted'>Subtotal</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className='d-flex justify-content-between mb-1'>
                <span className='text-muted'>Tax (5%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className='d-flex justify-content-between mb-2'>
                <span className='text-muted'>Shipping</span>
                <span>{shippingAmount === 0 ? <span className='text-success'>FREE</span> : `₹${shippingAmount}`}</span>
              </div>
              <hr />
              <div className='d-flex justify-content-between'>
                <span className='fw-bold fs-5'>Total</span>
                <span className='fw-bold fs-5' style={{ color: '#2e7d32' }}>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
