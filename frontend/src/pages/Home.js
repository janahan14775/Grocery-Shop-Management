// Home Page - Landing page with hero section and featured categories
import { Link } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaTag, FaLeaf } from 'react-icons/fa';

function Home() {

  // Featured categories to display
  const categories = [
    { name: 'Rice', emoji: '🍚' },
    { name: 'Fruits', emoji: '🍎' },
    { name: 'Vegetables', emoji: '🥬' },
    { name: 'Milk', emoji: '🥛' },
    { name: 'Snacks', emoji: '🍪' },
    { name: 'Beverages', emoji: '🥤' },
    { name: 'Cooking Oil', emoji: '🫒' },
    { name: 'Biscuits', emoji: '🍪' }
  ];

  const features = [
    { icon: <FaTruck />, title: 'Fast Delivery', desc: 'Same day delivery for all orders' },
    { icon: <FaShieldAlt />, title: 'Secure Payment', desc: 'Powered by Razorpay gateway' },
    { icon: <FaTag />, title: 'Best Prices', desc: 'Competitive prices on all items' },
    { icon: <FaLeaf />, title: 'Fresh Products', desc: 'Quality assured fresh groceries' }
  ];

  return (
    <div>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #4caf50 100%)',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-lg-6 text-white mb-4 mb-lg-0'>
              <h1 className='display-3 fw-bold mb-3' style={{ lineHeight: '1.2' }}>
                Fresh Groceries<br />
                <span style={{ color: '#ffc107' }}>Delivered Fast</span>
              </h1>
              <p className='lead mb-4' style={{ opacity: 0.9, fontSize: '1.15rem' }}>
                Your one-stop smart grocery store. Browse fresh fruits, vegetables,
                dairy products, and daily essentials — all at the best prices.
              </p>
              <div className='d-flex gap-3 flex-wrap'>
                <Link to='/products' className='btn btn-warning btn-lg fw-bold px-4 shadow'>
                  🛒 Shop Now
                </Link>
                <Link to='/register' className='btn btn-outline-light btn-lg px-4'>
                  Create Account
                </Link>
              </div>
            </div>
            <div className='col-lg-6 text-center'>
              <div style={{
                fontSize: '12rem',
                lineHeight: '1',
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
              }}>
                🛒
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='py-5' style={{ background: '#f8f9fa' }}>
        <div className='container'>
          <div className='row g-4'>
            {features.map((feature, index) => (
              <div key={index} className='col-md-3 col-6'>
                <div className='text-center p-3'>
                  <div className='mb-2' style={{ fontSize: '2rem', color: '#2e7d32' }}>
                    {feature.icon}
                  </div>
                  <h6 className='fw-bold'>{feature.title}</h6>
                  <p className='text-muted small mb-0'>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className='py-5'>
        <div className='container'>
          <h2 className='text-center fw-bold mb-2'>Shop by Category</h2>
          <p className='text-center text-muted mb-4'>Browse our wide range of grocery categories</p>

          <div className='row g-3 justify-content-center'>
            {categories.map((cat, index) => (
              <div key={index} className='col-lg-3 col-md-4 col-6'>
                <Link
                  to={`/products?category=${cat.name}`}
                  className='text-decoration-none'
                >
                  <div className='card border-0 shadow-sm rounded-4 text-center p-4 category-card'
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}>
                    <div style={{ fontSize: '3rem' }}>{cat.emoji}</div>
                    <h6 className='fw-bold mt-2 mb-0 text-dark'>{cat.name}</h6>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className='text-center mt-4'>
            <Link to='/products' className='btn btn-success btn-lg px-5 fw-semibold'>
              View All Products →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='py-4 text-center' style={{ background: '#1a1a2e', color: '#aaa' }}>
        <div className='container'>
          <p className='mb-0'>© 2026 JanaStore Grocery. Smart Grocery Store Management System.</p>
        </div>
      </div>

    </div>
  );
}

export default Home;