import {
  Link,
  useNavigate
} from 'react-router-dom';

import {
  FaShoppingCart,
  FaStore
} from 'react-icons/fa';

function Navbar() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem('user')
  );

  const logout = () => {

    localStorage.removeItem('user');
    localStorage.removeItem('token');

    navigate('/login');
  };

  return (

    <nav className='navbar navbar-expand-lg navbar-dark bg-success shadow'>

      <div className='container'>

        <Link
          className='navbar-brand fw-bold fs-3'
          to='/'
        >

          <FaStore className='me-2' />

          FreshMart

        </Link>

        <button
          className='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarNav'
        >
          <span className='navbar-toggler-icon'></span>
        </button>

        <div
          className='collapse navbar-collapse'
          id='navbarNav'
        >

          <ul className='navbar-nav ms-auto align-items-center'>

            <li className='nav-item'>

              <Link
                className='nav-link text-white fw-semibold'
                to='/'
              >
                Products
              </Link>

            </li>

            {
              user && (
                <li className='nav-item'>

                  <Link
                    className='nav-link text-white fw-semibold'
                    to='/cart'
                  >
                    <FaShoppingCart /> Cart
                  </Link>

                </li>
              )
            }

            {
              user?.role === 'admin' && (
                <li className='nav-item'>

                  <Link
                    className='nav-link text-white fw-semibold'
                    to='/admin'
                  >
                    Dashboard
                  </Link>

                </li>
              )
            }

            {
              !user ? (
                <>

                  <li className='nav-item'>

                    <Link
                      className='btn btn-light ms-2'
                      to='/login'
                    >
                      Login
                    </Link>

                  </li>

                  <li className='nav-item'>

                    <Link
                      className='btn btn-warning ms-2'
                      to='/register'
                    >
                      Register
                    </Link>

                  </li>

                </>
              ) : (

                <li className='nav-item'>

                  <button
                    className='btn btn-danger ms-2'
                    onClick={logout}
                  >
                    Logout
                  </button>

                </li>

              )
            }

          </ul>

        </div>

      </div>

    </nav>

  );
}

export default Navbar;