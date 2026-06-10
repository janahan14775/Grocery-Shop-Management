// Cart Context - Shopping cart state with localStorage persistence
import { createContext, useState, useEffect, useContext } from 'react';

export const CartContext = createContext();

// Custom hook for easy access to cart context
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {

  // Initialize cart from localStorage (persists across page refresh)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ADD TO CART - Add product or increase quantity if already in cart
  const addToCart = (product) => {
    const existingItem = cart.find(
      item => item._id === product._id
    );

    if (existingItem) {
      // Don't exceed available stock
      if (existingItem.quantity >= product.quantity) {
        return;
      }

      const updatedCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          availableStock: product.quantity
        }
      ]);
    }
  };

  // UPDATE QUANTITY - Set specific quantity for a cart item
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    const updatedCart = cart.map(item =>
      item._id === id
        ? { ...item, quantity: Math.min(newQuantity, item.availableStock || 999) }
        : item
    );
    setCart(updatedCart);
  };

  // REMOVE FROM CART
  const removeFromCart = (id) => {
    const updatedCart = cart.filter(
      item => item._id !== id
    );
    setCart(updatedCart);
  };

  // CLEAR CART - Remove all items (used after checkout)
  const clearCart = () => {
    setCart([]);
  };

  // COMPUTED VALUES
  const cartCount = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        totalAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};