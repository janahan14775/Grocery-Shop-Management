// ProductDetails Page - Single product view with full details
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaShoppingCart, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

function ProductDetails() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error('Fetch product error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  if (loading) return <LoadingSpinner message='Loading product...' />;

  if (!product) {
    return (
      <div className='container mt-5 text-center'>
        <h3>Product not found</h3>
        <Link to='/products' className='btn btn-success mt-3'>Back to Products</Link>
      </div>
    );
  }

  const isOutOfStock = product.quantity <= 0;
  const isNearExpiry = product.expiryDate &&
    new Date(product.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    new Date(product.expiryDate) > new Date();

  return (
    <div className='container mt-4 mb-5'>

      {/* Back Button */}
      <Link to='/products' className='btn btn-outline-secondary mb-4 rounded-3'>
        <FaArrowLeft className='me-2' /> Back to Products
      </Link>

      <div className='row g-4'>

        {/* Product Image */}
        <div className='col-md-5'>
          <div className='card border-0 shadow-sm rounded-4 overflow-hidden'>
            <img
              src={product.image || 'https://via.placeholder.com/500x400?text=No+Image'}
              alt={product.name}
              className='img-fluid'
              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className='col-md-7'>
          <div className='card border-0 shadow-sm rounded-4 p-4 h-100'>

            <span className='badge mb-3' style={{
              background: '#2e7d32',
              width: 'fit-content',
              fontSize: '0.8rem'
            }}>
              {product.category}
            </span>

            <h2 className='fw-bold mb-2'>{product.name}</h2>

            <h3 className='fw-bold mb-3' style={{ color: '#2e7d32' }}>
              ₹{product.price}
            </h3>

            <p className='text-muted mb-3' style={{ lineHeight: '1.6' }}>
              {product.description || 'No description available.'}
            </p>

            {/* Stock Status */}
            <div className='mb-3'>
              {isOutOfStock ? (
                <span className='badge bg-danger fs-6'>Out of Stock</span>
              ) : product.quantity < 5 ? (
                <span className='badge bg-warning text-dark fs-6'>
                  Low Stock - Only {product.quantity} left
                </span>
              ) : (
                <span className='badge bg-success fs-6'>
                  In Stock ({product.quantity} available)
                </span>
              )}
            </div>

            {/* Expiry Date */}
            {product.expiryDate && (
              <p className={`mb-3 ${isNearExpiry ? 'text-warning' : 'text-muted'}`}>
                {isNearExpiry && <FaExclamationTriangle className='me-1' />}
                Expiry Date: {new Date(product.expiryDate).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            )}

            {/* Quantity Selector + Add to Cart */}
            {!isAdmin && !isOutOfStock && (
              <div className='d-flex align-items-center gap-3 mt-3'>
                <div className='d-flex align-items-center border rounded-3 overflow-hidden'>
                  <button
                    className='btn btn-light px-3 py-2 border-0'
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    −
                  </button>
                  <span className='px-3 fw-bold'>{quantity}</span>
                  <button
                    className='btn btn-light px-3 py-2 border-0'
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  >
                    +
                  </button>
                </div>

                <button
                  className='btn btn-lg fw-bold px-4'
                  onClick={handleAddToCart}
                  style={{
                    background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px'
                  }}
                >
                  <FaShoppingCart className='me-2' /> Add To Cart
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductDetails;
