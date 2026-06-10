// App.js - Main application with routing and providers
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';

// Customer Pages (Auth Required)
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

// Admin Pages (Auth + Admin Required)
import AdminDashboard from './pages/AdminDashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/products' element={<Products />} />
        <Route path='/product/:id' element={<ProductDetails />} />

        {/* Customer Protected Routes */}
        <Route path='/cart' element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />

        <Route path='/checkout' element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />

        <Route path='/orders' element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />

        {/* Admin Protected Routes */}
        <Route path='/admin' element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path='/admin/products' element={
          <ProtectedRoute adminOnly>
            <AdminProducts />
          </ProtectedRoute>
        } />

        <Route path='/admin/add-product' element={
          <ProtectedRoute adminOnly>
            <AddProduct />
          </ProtectedRoute>
        } />

        <Route path='/admin/edit-product/:id' element={
          <ProtectedRoute adminOnly>
            <EditProduct />
          </ProtectedRoute>
        } />

        <Route path='/admin/orders' element={
          <ProtectedRoute adminOnly>
            <AdminOrders />
          </ProtectedRoute>
        } />

        <Route path='/admin/low-stock' element={
          <ProtectedRoute adminOnly>
            <AdminProducts />
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;