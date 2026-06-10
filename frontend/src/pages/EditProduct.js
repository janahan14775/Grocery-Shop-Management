// EditProduct Page - Admin form to edit existing product
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaCloudUploadAlt } from 'react-icons/fa';

const CATEGORIES = [
  'Rice', 'Black Gram', 'Green Gram', 'Toor Dal', 'Wheat Flour',
  'Sugar', 'Salt', 'Milk', 'Curd', 'Butter', 'Biscuits', 'Shampoo',
  'Soap', 'Toothpaste', 'Cooking Oil', 'Vegetables', 'Fruits', 'Snacks', 'Beverages'
];

function EditProduct() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', category: '', price: '', quantity: '', description: '', expiryDate: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      const p = res.data;
      setFormData({
        name: p.name || '',
        category: p.category || '',
        price: p.price || '',
        quantity: p.quantity || '',
        description: p.description || '',
        expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : ''
      });
      setCurrentImage(p.image || '');
    } catch (error) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('quantity', formData.quantity);
      data.append('description', formData.description);
      data.append('expiryDate', formData.expiryDate);
      if (image) data.append('image', image);

      await API.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Product updated successfully!');
      setTimeout(() => navigate('/admin/products'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className='d-flex'>
      <Sidebar />
      <div className='flex-grow-1'><LoadingSpinner /></div>
    </div>
  );

  return (
    <div className='d-flex'>
      <Sidebar />

      <div className='flex-grow-1 p-4' style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
        <div className='container' style={{ maxWidth: '800px' }}>

          <h2 className='fw-bold mb-4'>Edit Product</h2>

          {error && <div className='alert alert-danger rounded-3'>{error}</div>}
          {success && <div className='alert alert-success rounded-3'>{success}</div>}

          <div className='card border-0 shadow-sm rounded-4 p-4'>
            <form onSubmit={handleSubmit}>

              <div className='row g-3'>
                <div className='col-md-6'>
                  <label className='form-label small fw-semibold'>Product Name *</label>
                  <input type='text' name='name' className='form-control'
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
                    min='0' step='0.01'
                    value={formData.price} onChange={handleChange} required />
                </div>
                <div className='col-md-4'>
                  <label className='form-label small fw-semibold'>Quantity *</label>
                  <input type='number' name='quantity' className='form-control'
                    min='0' value={formData.quantity} onChange={handleChange} required />
                </div>
                <div className='col-md-4'>
                  <label className='form-label small fw-semibold'>Expiry Date</label>
                  <input type='date' name='expiryDate' className='form-control'
                    value={formData.expiryDate} onChange={handleChange} />
                </div>
                <div className='col-12'>
                  <label className='form-label small fw-semibold'>Description</label>
                  <textarea name='description' className='form-control' rows='3'
                    value={formData.description} onChange={handleChange} />
                </div>
                <div className='col-12'>
                  <label className='form-label small fw-semibold'>Product Image</label>
                  <div className='border rounded-3 p-4 text-center' style={{ cursor: 'pointer' }}>
                    <input type='file' accept='image/*' className='d-none' id='imageUpload'
                      onChange={handleImageChange} />
                    <label htmlFor='imageUpload' style={{ cursor: 'pointer' }}>
                      {preview ? (
                        <img src={preview} alt='Preview' className='rounded-3'
                          style={{ maxHeight: '200px', objectFit: 'cover' }} />
                      ) : currentImage ? (
                        <div>
                          <img src={currentImage} alt='Current' className='rounded-3'
                            style={{ maxHeight: '200px', objectFit: 'cover' }} />
                          <p className='mt-2 text-muted small'>Click to change image</p>
                        </div>
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

              <div className='d-flex gap-3 mt-4'>
                <button className='btn flex-grow-1 fw-bold py-2' type='submit' disabled={saving}
                  style={{
                    background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                    color: 'white', border: 'none', borderRadius: '10px'
                  }}>
                  {saving ? <><span className='spinner-border spinner-border-sm me-2'></span> Saving...</> : 'Update Product'}
                </button>
                <button type='button' className='btn btn-outline-secondary px-4 rounded-3'
                  onClick={() => navigate('/admin/products')}>
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;
