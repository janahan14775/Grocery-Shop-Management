// Cart Page - Shopping cart with items, totals, and checkout link
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaArrowRight } from 'react-icons/fa';

function Cart() {

  const { cart, totalAmount, clearCart, cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Tax calculation (5%)
  const taxAmount = Math.round(totalAmount * 0.05 * 100) / 100;
  const shippingAmount = totalAmount >= 500 ? 0 : 40;
  const grandTotal = totalAmount + taxAmount + shippingAmount;

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className='container mt-5 text-center' style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '5rem' }}>🛒</div>
        <h3 className='fw-bold mt-3'>Your cart is empty</h3>
        <p className='text-muted'>Looks like you haven't added any products yet</p>
        <Link to='/products' className='btn btn-success btn-lg mt-2 px-4'>
          <FaShoppingBag className='me-2' /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className='container mt-4 mb-5'>

      <h2 className='fw-bold mb-4'>
        Shopping Cart
        <span className='text-muted ms-2' style={{ fontSize: '1rem' }}>
          ({cartCount} items)
        </span>
      </h2>

      <div className='row g-4'>

        {/* Cart Items */}
        <div className='col-lg-8'>
          {cart.map(item => (
            <CartItem key={item._id} item={item} />
          ))}

          {/* Clear Cart Button */}
          <div className='d-flex justify-content-between align-items-center mt-3'>
            <Link to='/products' className='btn btn-outline-success'>
              ← Continue Shopping
            </Link>
            <button
              className='btn btn-outline-danger'
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className='col-lg-4'>
          <div className='card border-0 shadow-sm rounded-4 p-4' style={{ position: 'sticky', top: '90px' }}>
            <h5 className='fw-bold mb-3'>Order Summary</h5>

            <div className='d-flex justify-content-between mb-2'>
              <span className='text-muted'>Subtotal</span>
              <span className='fw-semibold'>₹{totalAmount.toFixed(2)}</span>
            </div>

            <div className='d-flex justify-content-between mb-2'>
              <span className='text-muted'>Tax (5%)</span>
              <span className='fw-semibold'>₹{taxAmount.toFixed(2)}</span>
            </div>

            <div className='d-flex justify-content-between mb-3'>
              <span className='text-muted'>Shipping</span>
              <span className='fw-semibold'>
                {shippingAmount === 0 ? (
                  <span className='text-success'>FREE</span>
                ) : (
                  `₹${shippingAmount}`
                )}
              </span>
            </div>

            {totalAmount < 500 && (
              <p className='small text-muted mb-3'>
                💡 Add ₹{(500 - totalAmount).toFixed(2)} more for free shipping
              </p>
            )}

            <hr />

            <div className='d-flex justify-content-between mb-4'>
              <span className='fw-bold fs-5'>Total</span>
              <span className='fw-bold fs-5' style={{ color: '#2e7d32' }}>
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <button
              className='btn w-100 fw-bold py-2'
              onClick={handleProceedToCheckout}
              style={{
                background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.05rem'
              }}
            >
              Proceed to Checkout <FaArrowRight className='ms-2' />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Cart;