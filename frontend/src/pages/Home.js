import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <>

      <Navbar />

      <div className='container mt-5'>

        <div className='row align-items-center'>

          <div className='col-md-6'>

            <h1 className='display-4 fw-bold'>
              Smart Grocery Store
            </h1>

            <p className='lead mt-3'>
              Manage grocery products, orders,
              inventory, and customers with a
              modern smart retail platform.
            </p>

            <Link
              to='/products'
              className='btn btn-success btn-lg mt-3'
            >
              Shop Now
            </Link>

          </div>

          <div className='col-md-6'>

            <img
              src='https://images.unsplash.com/photo-1542838132-92c53300491e'
              alt='grocery'
              className='img-fluid rounded shadow'
            />

          </div>

        </div>

      </div>

    </>
  );
}

export default Home;