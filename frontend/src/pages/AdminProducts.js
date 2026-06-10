// AdminProducts Page - Manage all products with edit/delete
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaPlusCircle, FaEdit, FaTrash } from 'react-icons/fa';

function AdminProducts() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products?showAll=true');
      setProducts(res.data);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await API.delete(`/products/${id}`);
        fetchProducts(); // Refresh list
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete product');
      }
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

        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h2 className='fw-bold mb-0'>Products ({products.length})</h2>
          <Link to='/admin/add-product' className='btn btn-success rounded-3'>
            <FaPlusCircle className='me-2' /> Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className='text-center py-5'>
            <h4 className='text-muted'>No products added yet</h4>
            <Link to='/admin/add-product' className='btn btn-success mt-3'>Add Your First Product</Link>
          </div>
        ) : (
          <div className='card border-0 shadow-sm rounded-4'>
            <div className='table-responsive'>
              <table className='table table-hover align-middle mb-0'>
                <thead className='table-light'>
                  <tr>
                    <th className='ps-4'>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Expiry</th>
                    <th className='pe-4'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td className='ps-4'>
                        <img
                          src={product.image || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className='rounded'
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      </td>
                      <td className='fw-semibold'>{product.name}</td>
                      <td>
                        <span className='badge' style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                          {product.category}
                        </span>
                      </td>
                      <td className='fw-semibold'>₹{product.price}</td>
                      <td>
                        {product.quantity === 0 ? (
                          <span className='badge bg-danger'>Out of Stock</span>
                        ) : product.quantity < 5 ? (
                          <span className='badge bg-warning text-dark'>{product.quantity} left</span>
                        ) : (
                          <span className='text-success fw-semibold'>{product.quantity}</span>
                        )}
                      </td>
                      <td className='small text-muted'>
                        {product.expiryDate
                          ? new Date(product.expiryDate).toLocaleDateString()
                          : '—'
                        }
                      </td>
                      <td className='pe-4'>
                        <div className='d-flex gap-2'>
                          <Link
                            to={`/admin/edit-product/${product._id}`}
                            className='btn btn-sm btn-outline-primary rounded-circle'
                            style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title='Edit'
                          >
                            <FaEdit style={{ fontSize: '0.75rem' }} />
                          </Link>
                          <button
                            className='btn btn-sm btn-outline-danger rounded-circle'
                            style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => handleDelete(product._id, product.name)}
                            title='Delete'
                          >
                            <FaTrash style={{ fontSize: '0.75rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminProducts;
