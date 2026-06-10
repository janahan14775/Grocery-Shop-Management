import { useEffect, useState } from 'react';

import API from '../services/api';

import ProductCard from '../components/ProductCard';

function Products() {

  const [products, setProducts] = useState([]);

  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    try {

      const res = await API.get('/products');

      setProducts(res.data);

    } catch (error) {

      console.log(error);

    }
  };

  return (

    <div>

      {/* HERO SECTION */}
      <div className='bg-success text-white py-5'>

        <div className='container text-center'>

          <h1 className='display-4 fw-bold'>
            Fresh Grocery Delivered Fast
          </h1>

          <p className='lead mt-3'>
            Buy fruits, vegetables, dairy and groceries online.
          </p>

        </div>

      </div>

      {/* PRODUCTS */}
      <div className='container mt-5'>

        <h2 className='mb-4 fw-bold'>
          Popular Products
        </h2>

        <div className='row'>

          {
            products.map(product => (

              <ProductCard
                key={product._id}
                product={product}
              />

            ))
          }

        </div>

      </div>

    </div>

  );
}

export default Products;