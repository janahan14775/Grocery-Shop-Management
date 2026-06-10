// Sidebar Component - Admin navigation panel with icons
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaPlusCircle,
  FaClipboardList,
  FaExclamationTriangle
} from 'react-icons/fa';

function Sidebar() {
  const location = useLocation();

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    backgroundColor: isActive(path) ? 'rgba(255,255,255,0.15)' : 'transparent',
    borderRadius: '8px',
    padding: '10px 15px',
    transition: 'all 0.2s ease'
  });

  return (
    <div
      className='text-white p-3 d-flex flex-column'
      style={{
        width: '250px',
        minHeight: 'calc(100vh - 70px)',
        background: 'linear-gradient(180deg, #1a1a2e, #16213e)'
      }}
    >
      <h5 className='mb-4 px-2 fw-bold' style={{ color: '#4caf50' }}>
        Admin Panel
      </h5>

      <ul className='list-unstyled d-flex flex-column gap-1'>

        <li>
          <Link
            to='/admin'
            className='text-white text-decoration-none d-flex align-items-center'
            style={linkStyle('/admin')}
          >
            <FaTachometerAlt className='me-2' /> Dashboard
          </Link>
        </li>

        <li>
          <Link
            to='/admin/products'
            className='text-white text-decoration-none d-flex align-items-center'
            style={linkStyle('/admin/products')}
          >
            <FaBoxOpen className='me-2' /> Products
          </Link>
        </li>

        <li>
          <Link
            to='/admin/add-product'
            className='text-white text-decoration-none d-flex align-items-center'
            style={linkStyle('/admin/add-product')}
          >
            <FaPlusCircle className='me-2' /> Add Product
          </Link>
        </li>

        <li>
          <Link
            to='/admin/orders'
            className='text-white text-decoration-none d-flex align-items-center'
            style={linkStyle('/admin/orders')}
          >
            <FaClipboardList className='me-2' /> Orders
          </Link>
        </li>

        <li>
          <Link
            to='/admin/low-stock'
            className='text-white text-decoration-none d-flex align-items-center'
            style={linkStyle('/admin/low-stock')}
          >
            <FaExclamationTriangle className='me-2' style={{ color: '#ff9800' }} /> Low Stock
          </Link>
        </li>

      </ul>
    </div>
  );
}

export default Sidebar;