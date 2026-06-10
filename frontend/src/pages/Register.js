// Register Page - Multi-step registration with Email OTP verification
import { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaStore, FaKey } from 'react-icons/fa';

function Register() {

  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // UI state
  const [step, setStep] = useState(1); // Step 1: Details, Step 2: OTP
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Start countdown timer for OTP resend
  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await API.post('/auth/send-otp', { email });

      setSuccess('OTP sent to your email! Check your inbox.');
      setStep(2);
      startTimer();

    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // First verify OTP
      await API.post('/auth/verify-otp', { email, otp });

      // Then register the user
      await API.post('/auth/register', {
        name,
        email,
        password
      });

      setSuccess('Registration successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message || 'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      await API.post('/auth/send-otp', { email });
      setSuccess('New OTP sent to your email!');
      startTimer();
    } catch (err) {
      setError('Failed to resend OTP');
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
                <div style={{ fontSize: '2.5rem', color: '#2e7d32' }}>
                  <FaStore />
                </div>
                <h3 className='fw-bold mt-2'>Create Account</h3>
                <p className='text-muted'>
                  {step === 1 ? 'Enter your details to get started' : 'Enter the OTP sent to your email'}
                </p>

                {/* Step Indicator */}
                <div className='d-flex justify-content-center gap-2 mt-2'>
                  <div style={{
                    width: '40px', height: '4px', borderRadius: '2px',
                    background: '#2e7d32'
                  }}></div>
                  <div style={{
                    width: '40px', height: '4px', borderRadius: '2px',
                    background: step >= 2 ? '#2e7d32' : '#ddd'
                  }}></div>
                </div>
              </div>

              {/* Alerts */}
              {error && (
                <div className='alert alert-danger py-2 rounded-3'>{error}</div>
              )}
              {success && (
                <div className='alert alert-success py-2 rounded-3'>{success}</div>
              )}

              {/* Step 1: User Details */}
              {step === 1 && (
                <form onSubmit={handleSendOtp}>

                  <div className='mb-3'>
                    <label className='form-label small fw-semibold'>Full Name</label>
                    <div className='input-group'>
                      <span className='input-group-text bg-light border-end-0'>
                        <FaUser className='text-muted' />
                      </span>
                      <input
                        type='text'
                        placeholder='Enter your name'
                        className='form-control border-start-0 ps-0'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

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
                        placeholder='Minimum 6 characters'
                        className='form-control border-start-0 ps-0'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
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
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP →'
                    )}
                  </button>

                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <form onSubmit={handleVerifyAndRegister}>

                  <div className='mb-3 text-center'>
                    <p className='small text-muted'>
                      OTP sent to <strong>{email}</strong>
                    </p>
                  </div>

                  <div className='mb-4'>
                    <label className='form-label small fw-semibold'>Enter OTP</label>
                    <div className='input-group'>
                      <span className='input-group-text bg-light border-end-0'>
                        <FaKey className='text-muted' />
                      </span>
                      <input
                        type='text'
                        placeholder='Enter 6-digit OTP'
                        className='form-control border-start-0 ps-0 text-center fw-bold'
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        maxLength={6}
                        style={{ fontSize: '1.2rem', letterSpacing: '8px' }}
                      />
                    </div>
                  </div>

                  <button
                    className='btn w-100 fw-bold py-2'
                    type='submit'
                    disabled={loading || otp.length !== 6}
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
                        Verifying...
                      </>
                    ) : (
                      'Verify & Register'
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className='text-center mt-3'>
                    {timer > 0 ? (
                      <p className='small text-muted'>
                        Resend OTP in <strong>{timer}s</strong>
                      </p>
                    ) : (
                      <button
                        type='button'
                        className='btn btn-link small text-decoration-none'
                        onClick={handleResendOtp}
                        disabled={loading}
                        style={{ color: '#2e7d32' }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {/* Go Back */}
                  <div className='text-center'>
                    <button
                      type='button'
                      className='btn btn-link small text-muted text-decoration-none'
                      onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                    >
                      ← Back to details
                    </button>
                  </div>

                </form>
              )}

              {/* Login Link */}
              <p className='text-center mt-3 mb-0 small'>
                Already have an account?{' '}
                <Link to='/login' className='fw-bold text-decoration-none' style={{ color: '#2e7d32' }}>
                  Login here
                </Link>
              </p>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;