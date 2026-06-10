// ProductCard Component - Displays product with stock status and add to cart
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart, FaExclamationTriangle } from 'react-icons/fa';

function ProductCard({ product }) {

  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Stock status logic
  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity < 5;

  // Check if product is near expiry (within 7 days)
  const isNearExpiry = product.expiryDate &&
    new Date(product.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    new Date(product.expiryDate) > new Date();

  const isExpired = product.expiryDate &&
    new Date(product.expiryDate) <= new Date();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  return (
    <div className='col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-4'>
      <div className='card product-card shadow-sm border-0 h-100 rounded-4 overflow-hidden'>

        {/* Product Image */}
        <div className='position-relative'>
          <Link to={`/product/${product._id}`}>
            <img
              src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
              alt={product.name}
              className='card-img-top'
              style={{
                height: '200px',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
            />
          </Link>

          {/* Category Badge */}
          <span className='badge position-absolute top-0 start-0 m-2'
            style={{ background: 'rgba(46, 125, 50, 0.9)', fontSize: '0.7rem' }}>
            {product.category}
          </span>

          {/* Stock Badge */}
          {isOutOfStock && (
            <span className='badge bg-danger position-absolute top-0 end-0 m-2'>
              Out of Stock
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className='badge bg-warning text-dark position-absolute top-0 end-0 m-2'>
              Only {product.quantity} left
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className='card-body d-flex flex-column'>

          <Link to={`/product/${product._id}`} className='text-decoration-none text-dark'>
            <h6 className='fw-bold mb-1' style={{ fontSize: '0.95rem' }}>
              {product.name}
            </h6>
          </Link>

          <p className='text-muted mb-2' style={{ fontSize: '0.8rem' }}>
            {product.description ? product.description.substring(0, 60) + (product.description.length > 60 ? '...' : '') : ''}
          </p>

          <h5 className='fw-bold mb-1' style={{ color: '#2e7d32' }}>
            ₹{product.price}
          </h5>

          <p className='mb-2' style={{ fontSize: '0.8rem', color: '#666' }}>
            Stock: {product.quantity} available
          </p>

          {/* Expiry Warning */}
          {isNearExpiry && (
            <p className='text-warning mb-2' style={{ fontSize: '0.75rem' }}>
              <FaExclamationTriangle className='me-1' />
              Expiring soon: {new Date(product.expiryDate).toLocaleDateString()}
            </p>
          )}
          {isExpired && (
            <p className='text-danger mb-2' style={{ fontSize: '0.75rem' }}>
              <FaExclamationTriangle className='me-1' />
              Expired
            </p>
          )}

          {/* Add to Cart Button */}
          <div className='mt-auto'>
            {!isAdmin && (
              <button
                className='btn w-100 fw-semibold'
                style={{
                  background: isOutOfStock || isExpired ? '#ccc' : 'linear-gradient(135deg, #2e7d32, #4caf50)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px'
                }}
                onClick={handleAddToCart}
                disabled={isOutOfStock || isExpired}
              >
                <FaShoppingCart className='me-1' />
                {isOutOfStock ? 'Out of Stock' : isExpired ? 'Expired' : 'Add To Cart'}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default ProductCard;