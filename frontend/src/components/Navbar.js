// Navbar Component - Navigation with auth-aware links and cart badge
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBoxes, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../logo.svg';

function Navbar() {

  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (

    <nav className='navbar navbar-expand-lg shadow-sm sticky-top' style={{
      background: 'linear-gradient(135deg, #1b5e20, #2e7d32, #388e3c)',
      padding: '0.8rem 0'
    }}>

      <div className='container'>

        <Link className='navbar-brand fw-bold fs-4 text-white d-flex align-items-center' to='/'>
          <img src={logo} alt="JanaStore Logo" className='me-2' style={{ height: '36px', width: '36px' }} />
          JanaStore
        </Link>

        {/* Mobile toggle */}
        <button
          className='navbar-toggler border-0'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarNav'
          style={{ filter: 'brightness(2)' }}
        >
          <span className='navbar-toggler-icon'></span>
        </button>

        <div className='collapse navbar-collapse' id='navbarNav'>
          <ul className='navbar-nav ms-auto align-items-center gap-1'>

            {/* Products - Always visible */}
            <li className='nav-item'>
              <Link className='nav-link text-white fw-semibold px-3' to='/products'>
                <FaBoxes className='me-1' /> Products
              </Link>
            </li>

            {/* Cart - Visible when logged in */}
            {isAuthenticated && !isAdmin && (
              <li className='nav-item'>
                <Link className='nav-link text-white fw-semibold px-3 position-relative' to='/cart'>
                  <FaShoppingCart className='me-1' /> Cart
                  {cartCount > 0 && (
                    <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill'
                      style={{ background: '#ff5722', fontSize: '0.65rem' }}>
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
            )}

            {/* My Orders - Visible for customers */}
            {isAuthenticated && !isAdmin && (
              <li className='nav-item'>
                <Link className='nav-link text-white fw-semibold px-3' to='/orders'>
                  <FaClipboardList className='me-1' /> My Orders
                </Link>
              </li>
            )}

            {/* Admin Dashboard - Visible for admin */}
            {isAdmin && (
              <li className='nav-item'>
                <Link className='nav-link text-white fw-semibold px-3' to='/admin'>
                  Dashboard
                </Link>
              </li>
            )}

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <>
                <li className='nav-item ms-2'>
                  <Link className='btn btn-outline-light btn-sm px-3' to='/login'>
                    Login
                  </Link>
                </li>
                <li className='nav-item ms-2'>
                  <Link className='btn btn-warning btn-sm px-3 fw-semibold' to='/register'>
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <li className='nav-item ms-2 d-flex align-items-center gap-2'>
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

  );
}

export default Navbar;