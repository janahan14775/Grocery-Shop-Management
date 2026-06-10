import { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState([]);

  // ADD TO CART
  const addToCart = (product) => {

    const existingItem = cart.find(
      item => item._id === product._id
    );

    if (existingItem) {

      const updatedCart = cart.map(item =>

        item._id === product._id
          ? {
              ...item,
              quantity: item.quantity + 1
            }
          : item
      );

      setCart(updatedCart);

    } else {

      setCart([
        ...cart,
        {
          ...product,
          quantity: 1
        }
      ]);

    }

  };

  // REMOVE ITEM
  const removeFromCart = (id) => {

    const updatedCart = cart.filter(
      item => item._id !== id
    );

    setCart(updatedCart);

  };

  // TOTAL AMOUNT
  const totalAmount = cart.reduce(

    (acc, item) =>

      acc + item.price * item.quantity,

    0
  );

  return (

    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        totalAmount
      }}
    >

      {children}

    </CartContext.Provider>

  );

};