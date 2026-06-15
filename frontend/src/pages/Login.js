// Login Page - Email/password login with AuthContext integration
import { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import logo from '../logo.svg';

function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/google-login', {
        token: response.credential
      });

      // Save to AuthContext + localStorage
      login(res.data.user, res.data.token);

      // Redirect based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Google login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id-here.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse
        });

        const container = document.getElementById('googleSignInButton');
        if (container) {
          container.innerHTML = ''; // Prevent duplicates in React Dev Mode
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: 320
          });
        }
      }
    };

    // If script is already loaded
    if (window.google) {
      initializeGoogle();
    } else {
      // Wait for it to load
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        script.addEventListener('load', initializeGoogle);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', {
        email,
        password
      });

      // Save to AuthContext + localStorage
      login(res.data.user, res.data.token);

      // Redirect based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/products');
      }

    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className='container'>
        <div className='row justify-content-center'>
          <div className='col-md-5 col-lg-4'>

            <div className='card shadow-lg border-0 rounded-4 p-4'>

              {/* Header */}
              <div className='text-center mb-4'>
                <img src={logo} alt="JanaStore Logo" className='mb-2' style={{ height: '70px', width: '70px' }} />
                <h3 className='fw-bold mt-2'>Welcome Back</h3>
                <p className='text-muted'>Login to your JanaStore account</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className='alert alert-danger py-2 rounded-3' role='alert'>
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin}>

                <div className='mb-3'>
                  <label className='form-label small fw-semibold'>Email Address</label>
                  <div className='input-group'>
                    <span className='input-group-text bg-light border-end-0'>
                      <FaEnvelope className='text-muted' />
                    </span>
                    <input
                      type='email'
                      placeholder='Enter your email'
                      className='form-control border-start-0 ps-0'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className='mb-4'>
                  <label className='form-label small fw-semibold'>Password</label>
                  <div className='input-group'>
                    <span className='input-group-text bg-light border-end-0'>
                      <FaLock className='text-muted' />
                    </span>
                    <input
                      type='password'
                      placeholder='Enter your password'
                      className='form-control border-start-0 ps-0'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  className='btn w-100 fw-bold py-2'
                  type='submit'
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px'
                  }}
                >
                  {loading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2'></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>

              </form>

              {/* Divider */}
              <div className='d-flex align-items-center my-3'>
                <hr className='flex-grow-1 text-muted' style={{ opacity: 0.2 }} />
                <span className='mx-2 text-muted small fw-semibold'>OR</span>
                <hr className='flex-grow-1 text-muted' style={{ opacity: 0.2 }} />
              </div>

              {/* Google Sign-In Button */}
              <div className='d-flex justify-content-center mb-2'>
                <div id="googleSignInButton"></div>
              </div>

              {/* Register Link */}
              <p className='text-center mt-3 mb-0 small'>
                Don't have an account?{' '}
                <Link to='/register' className='fw-bold text-decoration-none' style={{ color: '#2e7d32' }}>
                  Register here
                </Link>
              </p>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;