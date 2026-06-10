// LoadingSpinner Component - Full-page loading overlay
function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className='d-flex flex-column justify-content-center align-items-center'
      style={{ minHeight: '400px' }}>
      <div className='spinner-border text-success' role='status'
        style={{ width: '3rem', height: '3rem' }}>
        <span className='visually-hidden'>Loading...</span>
      </div>
      <p className='mt-3 text-muted fw-semibold'>{message}</p>
    </div>
  );
}

export default LoadingSpinner;
