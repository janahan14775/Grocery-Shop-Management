// CartItem Component - Individual cart item with quantity controls
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

function CartItem({ item }) {

  const { updateQuantity, removeFromCart } = useCart();

  const subtotal = item.price * item.quantity;

  return (
    <div className='card mb-3 border-0 shadow-sm rounded-3 overflow-hidden'>
      <div className='card-body p-3'>
        <div className='row align-items-center'>

          {/* Product Image */}
          <div className='col-md-2 col-3'>
            <img
              src={item.image || 'https://via.placeholder.com/80x80?text=No+Image'}
              alt={item.name}
              className='rounded-3'
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Product Details */}
          <div className='col-md-3 col-4'>
            <h6 className='fw-bold mb-1'>{item.name}</h6>
            <p className='text-muted mb-0' style={{ fontSize: '0.85rem' }}>
              ₹{item.price} each
            </p>
          </div>

          {/* Quantity Controls */}
          <div className='col-md-3 col-3'>
            <div className='d-flex align-items-center gap-2'>
              <button
                className='btn btn-sm btn-outline-secondary rounded-circle'
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                <FaMinus style={{ fontSize: '0.65rem' }} />
              </button>

              <span className='fw-bold' style={{ minWidth: '24px', textAlign: 'center' }}>
                {item.quantity}
              </span>

              <button
                className='btn btn-sm btn-outline-secondary rounded-circle'
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                disabled={item.quantity >= (item.availableStock || 999)}
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                <FaPlus style={{ fontSize: '0.65rem' }} />
              </button>
            </div>
          </div>

          {/* Subtotal */}
          <div className='col-md-2 col-1 text-end'>
            <h6 className='fw-bold mb-0' style={{ color: '#2e7d32' }}>
              ₹{subtotal.toFixed(2)}
            </h6>
          </div>

          {/* Remove Button */}
          <div className='col-md-2 col-1 text-end'>
            <button
              className='btn btn-sm btn-outline-danger rounded-circle'
              onClick={() => removeFromCart(item._id)}
              style={{ width: '36px', height: '36px', padding: 0 }}
              title='Remove from cart'
            >
              <FaTrash style={{ fontSize: '0.75rem' }} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CartItem;
