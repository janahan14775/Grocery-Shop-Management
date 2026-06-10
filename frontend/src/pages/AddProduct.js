// AddProduct Page - Admin form to add new product with image upload
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import { FaCloudUploadAlt } from 'react-icons/fa';

// All 19 categories
const CATEGORIES = [
  'Rice', 'Black Gram', 'Green Gram', 'Toor Dal', 'Wheat Flour',
  'Sugar', 'Salt', 'Milk', 'Curd', 'Butter', 'Biscuits', 'Shampoo',
  'Soap', 'Toothpaste', 'Cooking Oil', 'Vegetables', 'Fruits', 'Snacks', 'Beverages'
];

function AddProduct() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    expiryDate: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('quantity', formData.quantity);
      data.append('description', formData.description);
      data.append('expiryDate', formData.expiryDate);
      if (image) {
        data.append('image', image);
      }

      await API.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Product added successfully!');

      // Reset form
      setFormData({ name: '', category: '', price: '', quantity: '', description: '', expiryDate: '' });
      setImage(null);
      setPreview(null);

      setTimeout(() => navigate('/admin/products'), 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='d-flex'>
      <Sidebar />

      <div className='flex-grow-1 p-4' style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
        <div className='container' style={{ maxWidth: '800px' }}>

          <h2 className='fw-bold mb-4'>Add New Product</h2>

          {error && <div className='alert alert-danger rounded-3'>{error}</div>}
          {success && <div className='alert alert-success rounded-3'>{success}</div>}

          <div className='card border-0 shadow-sm rounded-4 p-4'>
            <form onSubmit={handleSubmit}>

              <div className='row g-3'>

                <div className='col-md-6'>
                  <label className='form-label small fw-semibold'>Product Name *</label>
                  <input type='text' name='name' className='form-control'
                    placeholder='e.g., Basmati Rice 5kg'
                    value={formData.name} onChange={handleChange} required />
                </div>

                <div className='col-md-6'>
                  <label className='form-label small fw-semibold'>Category *</label>
                  <select name='category' className='form-select'
                    value={formData.category} onChange={handleChange} required>
                    <option value=''>Select Category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className='col-md-4'>
                  <label className='form-label small fw-semibold'>Price (₹) *</label>
                  <input type='number' name='price' className='form-control'
                    placeholder='0.00' min='0' step='0.01'
                    value={formData.price} onChange={handleChange} required />
                </div>

                <div className='col-md-4'>
                  <label className='form-label small fw-semibold'>Quantity *</label>
                  <input type='number' name='quantity' className='form-control'
                    placeholder='0' min='0'
                    value={formData.quantity} onChange={handleChange} required />
                </div>

                <div className='col-md-4'>
                  <label className='form-label small fw-semibold'>Expiry Date</label>
                  <input type='date' name='expiryDate' className='form-control'
                    value={formData.expiryDate} onChange={handleChange} />
                </div>

                <div className='col-12'>
                  <label className='form-label small fw-semibold'>Description</label>
                  <textarea name='description' className='form-control' rows='3'
                    placeholder='Product description...'
                    value={formData.description} onChange={handleChange} />
                </div>

                <div className='col-12'>
                  <label className='form-label small fw-semibold'>Product Image</label>
                  <div className='border rounded-3 p-4 text-center' style={{ borderStyle: 'dashed !important', cursor: 'pointer' }}>
                    <input type='file' accept='image/*' className='d-none' id='imageUpload'
                      onChange={handleImageChange} />
                    <label htmlFor='imageUpload' style={{ cursor: 'pointer' }}>
                      {preview ? (
                        <img src={preview} alt='Preview' className='rounded-3'
                          style={{ maxHeight: '200px', objectFit: 'cover' }} />
                      ) : (
                        <>
                          <FaCloudUploadAlt style={{ fontSize: '2rem', color: '#2e7d32' }} />
                          <p className='mb-0 mt-2 text-muted'>Click to upload product image</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

              </div>

              <button className='btn w-100 mt-4 fw-bold py-2' type='submit' disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                  color: 'white', border: 'none', borderRadius: '10px'
                }}>
                {loading ? (
                  <><span className='spinner-border spinner-border-sm me-2'></span> Adding Product...</>
                ) : 'Add Product'}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AddProduct;
