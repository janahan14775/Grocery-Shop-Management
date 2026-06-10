import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Navbar from './components/Navbar';

import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';

function App() {

  const user = JSON.parse(
    localStorage.getItem('user')
  );

  return (

    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path='/'
          element={<Products />}
        />

        <Route
          path='/login'
          element={<Login />}
        />

        <Route
          path='/register'
          element={<Register />}
        />

        <Route
          path='/cart'
          element={<Cart />}
        />

        <Route
          path='/admin'
          element={
            user?.role === 'admin'
              ? <AdminDashboard />
              : <Login />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;