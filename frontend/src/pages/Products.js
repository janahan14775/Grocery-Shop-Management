// Products Page - Browse products with search, filter, and sort
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaSearch, FaFilter } from 'react-icons/fa';

// All 19 categories
const CATEGORIES = [
  'All', 'Rice', 'Black Gram', 'Green Gram', 'Toor Dal', 'Wheat Flour',
  'Sugar', 'Salt', 'Milk', 'Curd', 'Butter', 'Biscuits', 'Shampoo',
  'Soap', 'Toothpaste', 'Cooking Oil', 'Vegetables', 'Fruits', 'Snacks', 'Beverages'
];

function Products() {

  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort]);

  // Update category from URL params
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      setCategory(urlCategory);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (sort) params.append('sort', sort);

      const res = await API.get(`/products?${params.toString()}`);
      setProducts(res.data);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1b5e20, #388e3c)',
        padding: '3rem 0'
      }}>
        <div className='container text-center text-white'>
          <h1 className='display-5 fw-bold mb-2'>Fresh Grocery Delivered Fast</h1>
          <p className='lead mb-0' style={{ opacity: 0.9 }}>
            Buy fruits, vegetables, dairy and groceries online
          </p>
        </div>
      </div>

      <div className='container mt-4'>

        {/* Search & Filter Bar */}
        <div className='card border-0 shadow-sm rounded-4 p-3 mb-4'>
          <div className='row g-3 align-items-center'>

            {/* Search */}
            <div className='col-md-5'>
              <form onSubmit={handleSearch}>
                <div className='input-group'>
                  <span className='input-group-text bg-white border-end-0'>
                    <FaSearch className='text-muted' />
                  </span>
                  <input
                    type='text'
                    className='form-control border-start-0 ps-0'
                    placeholder='Search products...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className='btn btn-success px-4' type='submit'>
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Category Filter */}
            <div className='col-md-4'>
              <div className='input-group'>
                <span className='input-group-text bg-white border-end-0'>
                  <FaFilter className='text-muted' />
                </span>
                <select
                  className='form-select border-start-0 ps-0'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className='col-md-3'>
              <select
                className='form-select'
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value='newest'>Newest First</option>
                <option value='price_asc'>Price: Low to High</option>
                <option value='price_desc'>Price: High to Low</option>
                <option value='name_asc'>Name: A to Z</option>
              </select>
            </div>

          </div>
        </div>

        {/* Products Count */}
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h5 className='fw-bold mb-0'>
            {category !== 'All' ? category : 'All Products'}
            <span className='text-muted ms-2' style={{ fontSize: '0.85rem' }}>
              ({products.length} items)
            </span>
          </h5>
        </div>

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner message='Loading products...' />
        ) : products.length === 0 ? (
          <div className='text-center py-5'>
            <div style={{ fontSize: '4rem' }}>🔍</div>
            <h4 className='text-muted mt-3'>No products found</h4>
            <p className='text-muted'>Try a different search or category</p>
          </div>
        ) : (
          <div className='row'>
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Products;