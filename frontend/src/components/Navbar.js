// Navbar Component - Navigation with auth-aware links, mobile cart header, and floating cart bar
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBoxes, FaClipboardList, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../logo.svg';

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, totalAmount } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className='navbar navbar-expand-lg shadow-sm sticky-top' style={{
        background: 'linear-gradient(135deg, #1b5e20, #2e7d32, #388e3c)',
        padding: '0.8rem 0'
      }}>
        <div className='container d-flex align-items-center justify-content-between'>

          {/* Logo & Brand */}
          <Link className='navbar-brand fw-bold fs-4 text-white d-flex align-items-center' to='/'>
            <img src={logo} alt="JanaStore Logo" className='me-2' style={{ height: '36px', width: '36px' }} />
            JanaStore
          </Link>

          {/* Mobile Right Controls: Quick Cart Icon + Hamburger Menu */}
          <div className='d-flex align-items-center gap-2 d-lg-none'>
            {/* Quick Access Mobile Cart Button */}
            <Link to='/cart' className='btn btn-warning btn-sm fw-bold d-flex align-items-center gap-1 rounded-pill px-3 py-1 text-dark shadow-sm'>
              <FaShoppingCart />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className='badge bg-danger rounded-circle ms-1' style={{ fontSize: '0.75rem' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Navbar Hamburger Toggle */}
            <button
              className='navbar-toggler border-0 p-1'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#navbarNav'
              aria-controls='navbarNav'
              aria-expanded='false'
              aria-label='Toggle navigation'
              style={{ filter: 'brightness(2)' }}
            >
              <span className='navbar-toggler-icon'></span>
            </button>
          </div>

          {/* Main Navigation Links */}
          <div className='collapse navbar-collapse' id='navbarNav'>
            <ul className='navbar-nav ms-auto align-items-center gap-2 mt-3 mt-lg-0'>

              {/* Products */}
              <li className='nav-item w-100 w-lg-auto'>
                <Link className='nav-link text-white fw-semibold px-3' to='/products'>
                  <FaBoxes className='me-1' /> Products
                </Link>
              </li>

              {/* Cart Link (Always Visible) */}
              <li className='nav-item w-100 w-lg-auto'>
                <Link className='nav-link text-white fw-semibold px-3 position-relative d-inline-flex align-items-center' to='/cart'>
                  <FaShoppingCart className='me-1' /> Cart
                  {cartCount > 0 && (
                    <span className='badge rounded-pill bg-warning text-dark ms-2' style={{ fontSize: '0.75rem' }}>
                      {cartCount} items
                    </span>
                  )}
                </Link>
              </li>

              {/* My Orders (Customer) */}
              {isAuthenticated && !isAdmin && (
                <li className='nav-item w-100 w-lg-auto'>
                  <Link className='nav-link text-white fw-semibold px-3' to='/orders'>
                    <FaClipboardList className='me-1' /> My Orders
                  </Link>
                </li>
              )}

              {/* Admin Dashboard */}
              {isAdmin && (
                <li className='nav-item w-100 w-lg-auto'>
                  <Link className='nav-link text-warning fw-bold px-3' to='/admin'>
                    ⚙️ Admin Panel
                  </Link>
                </li>
              )}

              {/* Auth Buttons */}
              {!isAuthenticated ? (
                <div className='d-flex align-items-center gap-2 ms-lg-2 w-100 w-lg-auto mt-2 mt-lg-0'>
                  <Link className='btn btn-outline-light btn-sm px-3 flex-grow-1' to='/login'>
                    Login
                  </Link>
                  <Link className='btn btn-warning btn-sm px-3 fw-semibold flex-grow-1' to='/register'>
                    Register
                  </Link>
                </div>
              ) : (
                <li className='nav-item ms-lg-2 d-flex align-items-center gap-2 mt-2 mt-lg-0'>
                  <span className='text-white-50 small'>
                    <FaUser className='me-1' />
                    {user?.name}
                  </span>
                  <button
                    className='btn btn-outline-light btn-sm px-3'
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              )}

            </ul>
          </div>

        </div>
      </nav>

      {/* Floating Bottom Cart Bar for Mobile Phones */}
      {cartCount > 0 && (
        <div
          className='d-lg-none fixed-bottom p-3 shadow-lg'
          style={{
            background: 'linear-gradient(90deg, #1b5e20, #2e7d32)',
            zIndex: 1040,
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
          }}
        >
          <div className='d-flex align-items-center justify-content-between text-white'>
            <div>
              <span className='badge bg-warning text-dark fw-bold me-2 px-2 py-1'>
                {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}
              </span>
              <span className='fw-bold fs-5'>₹{totalAmount.toFixed(2)}</span>
            </div>
            <Link
              to='/cart'
              className='btn btn-warning fw-bold text-dark rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm'
            >
              View Cart <FaArrowRight />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;