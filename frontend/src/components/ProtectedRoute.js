// ProtectedRoute Component - Route guard for auth and admin routes
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }) {

  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Redirect to home if admin-only route and user is not admin
  if (adminOnly && !isAdmin) {
    return <Navigate to='/' replace />;
  }

  return children;
}

export default ProtectedRoute;
