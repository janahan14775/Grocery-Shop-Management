import { useContext } from 'react';

import {
  CartContext
} from '../context/CartContext';

function ProductCard({ product }) {

  const { addToCart } =
    useContext(CartContext);

  const user = JSON.parse(
    localStorage.getItem('user')
  );

  return (

    <div className='col-md-4 mb-4'>

      <div className='card shadow border-0 h-100 rounded-4 overflow-hidden'>

        <img
          src={product.image}
          alt={product.name}
          className='card-img-top'
          style={{
            height: '250px',
            objectFit: 'cover'
          }}
        />

        <div className='card-body'>

          <h5 className='fw-bold'>
            {product.name}
          </h5>

          <p className='text-muted'>
            {product.category}
          </p>

          <h4 className='text-success fw-bold'>
            ₹ {product.price}
          </h4>

          <button
            className='btn btn-success w-100 mt-3'
            onClick={() => {

              if (!user) {

                window.location.href = '/login';
                return;
              }

              addToCart(product);
            }}
          >
            Add To Cart
          </button>

        </div>

      </div>

    </div>

  );
}

export default ProductCard;