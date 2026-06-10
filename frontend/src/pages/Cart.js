import { useContext } from "react";

import {
  CartContext
} from "../context/CartContext";

import API from "../services/api";

function Cart() {

  const {

    cart,

    removeFromCart,

    totalAmount

  } = useContext(CartContext);

  // CHECKOUT
  const checkout = async () => {

    try {

      await API.post(
        "/orders",
        {
          products: cart
        }
      );

      alert("Order Placed");

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="container mt-5">

      <h2 className="mb-4">
        Shopping Cart
      </h2>

      {
        cart.map(item => (

          <div
            key={item._id}
            className="card mb-3 p-3"
          >

            <div className="d-flex justify-content-between">

              <div>

                <h5>{item.name}</h5>

                <p>
                  ₹ {item.price}
                </p>

                <p>
                  Quantity:
                  {item.quantity}
                </p>

              </div>

              <button
                className="btn btn-danger"

                onClick={() =>
                  removeFromCart(item._id)
                }
              >
                Remove
              </button>

            </div>

          </div>

        ))
      }

      <h3>
        Total: ₹ {totalAmount}
      </h3>

      <button
        className="btn btn-primary mt-3"

        onClick={checkout}
      >
        Checkout
      </button>

    </div>

  );
}

export default Cart;