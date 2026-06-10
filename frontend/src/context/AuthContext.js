// Auth Context - Global authentication state management
import { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

// Create the auth context
export const AuthContext = createContext();

// Custom hook for easy access to auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider = ({ children }) => {

  // Initialize state from localStorage (persists across page refresh)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [loading, setLoading] = useState(false);

  // Computed properties
  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  // Login - Save user and token to state + localStorage
  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenValue);
  };

  // Logout - Clear everything
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
  };

  // Verify token is still valid on app load
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/profile');
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (error) {
          // Token invalid - logout
          logout();
        }
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        setLoading,
        isAuthenticated,
        isAdmin,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
