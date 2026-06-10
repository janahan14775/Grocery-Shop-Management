import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div
      className='bg-dark text-white p-3'
      style={{
        width: '250px',
        minHeight: '100vh'
      }}
    >
      <h3 className='mb-4'>Admin Panel</h3>

      <ul className='list-unstyled'>

        <li className='mb-3'>
          <Link
            to='/admin'
            className='text-white text-decoration-none'
          >
            Dashboard
          </Link>
        </li>

        <li className='mb-3'>
          <Link
            to='/products'
            className='text-white text-decoration-none'
          >
            Products
          </Link>
        </li>

        <li className='mb-3'>
          <Link
            to='/orders'
            className='text-white text-decoration-none'
          >
            Orders
          </Link>
        </li>

      </ul>
    </div>
  );
}

export default Sidebar;