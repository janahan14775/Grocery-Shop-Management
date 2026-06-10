import { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await API.post('/auth/login', {
        email,
        password
      });

      localStorage.setItem(
        'token',
        res.data.token
      );

      alert('Login Successful');

      navigate('/products');

    } catch (error) {
      alert('Invalid Credentials');
    }
  };

  return (
    <div className='container mt-5'>

      <div className='row justify-content-center'>

        <div className='col-md-5'>

          <div className='card shadow border-0 p-4'>

            <h2 className='text-center mb-4'>
              Login
            </h2>

            <form onSubmit={handleLogin}>

              <input
                type='email'
                placeholder='Email'
                className='form-control mb-3'
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <input
                type='password'
                placeholder='Password'
                className='form-control mb-3'
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button className='btn btn-success w-100'>
                Login
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;