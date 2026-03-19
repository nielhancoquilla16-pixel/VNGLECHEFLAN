import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load cart from localStorage
    setCart(storage.getCart());
  }, []);

  const addToCart = (product, quantity = 1) => {
    const cartItem = {
      productId: product.id,
      quantity,
      price: product.price,
    };

    storage.addToCart(cartItem);
    // Automatically deduct inventory from storage to reflect current stock.
    const newStock = Math.max(0, (product.inventory ?? 0) - quantity);
    storage.updateInventory(product.id, newStock);

    setCart(storage.getCart());
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      storage.updateCartItem(productId, quantity);
      setCart(storage.getCart());
    }
  };

  const removeFromCart = (productId) => {
    storage.removeFromCart(productId);
    setCart(storage.getCart());
  };

  const clearCart = () => {
    storage.clearCart();
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
