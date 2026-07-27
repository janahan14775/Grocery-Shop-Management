// Sidebar Component - Admin navigation panel with responsive mobile layout
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

  const isActive = (path) => location.pathname === path;

  const links = [
    { path: '/admin', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/admin/products', label: 'Products', icon: <FaBoxOpen /> },
    { path: '/admin/add-product', label: 'Add Product', icon: <FaPlusCircle /> },
    { path: '/admin/orders', label: 'Orders', icon: <FaClipboardList /> },
    { path: '/admin/low-stock', label: 'Low Stock', icon: <FaExclamationTriangle color='#ff9800' /> }
  ];

  return (
    <>
      {/* Desktop Sidebar (visible on md and up) */}
      <div
        className='text-white p-3 d-none d-md-flex flex-column flex-shrink-0'
        style={{
          width: '240px',
          minHeight: 'calc(100vh - 70px)',
          background: 'linear-gradient(180deg, #1a1a2e, #16213e)'
        }}
      >
        <h5 className='mb-4 px-2 fw-bold' style={{ color: '#4caf50' }}>
          Admin Panel
        </h5>

        <ul className='list-unstyled d-flex flex-column gap-1 mb-0'>
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className='text-white text-decoration-none d-flex align-items-center'
                style={{
                  backgroundColor: isActive(link.path) ? 'rgba(255,255,255,0.18)' : 'transparent',
                  borderRadius: '8px',
                  padding: '10px 15px',
                  fontWeight: isActive(link.path) ? '600' : 'normal',
                  transition: 'all 0.2s ease'
                }}
              >
                <span className='me-2 fs-5'>{link.icon}</span> {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Top Scrollable Admin Bar (visible on mobile screens < md) */}
      <div className='d-md-none bg-dark text-white p-2 border-bottom sticky-top overflow-x-auto' style={{ zIndex: 1020, background: '#1a1a2e' }}>
        <div className='d-flex gap-2 text-nowrap px-1'>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`btn btn-sm d-inline-flex align-items-center gap-1 ${
                isActive(link.path) ? 'btn-success text-white fw-bold' : 'btn-outline-light border-0'
              }`}
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Sidebar;