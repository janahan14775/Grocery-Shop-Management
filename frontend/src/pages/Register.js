import { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      await API.post('/auth/register', formData);

      alert('Registration Successful');

      navigate('/login');

    } catch (error) {
      alert('Registration Failed');
    }
  };

  return (
    <div className='container mt-5'>

      <div className='row justify-content-center'>

        <div className='col-md-5'>

          <div className='card shadow border-0 p-4'>

            <h2 className='text-center mb-4'>
              Register
            </h2>

            <form onSubmit={handleRegister}>

              <input
                type='text'
                placeholder='Name'
                className='form-control mb-3'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value
                  })
                }
              />

              <input
                type='email'
                placeholder='Email'
                className='form-control mb-3'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value
                  })
                }
              />

              <input
                type='password'
                placeholder='Password'
                className='form-control mb-3'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value
                  })
                }
              />

              <button className='btn btn-primary w-100'>
                Register
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;