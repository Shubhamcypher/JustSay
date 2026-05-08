import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  const { cartState, dispatch } = context;

  const addItemToCart = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItemFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateItemQuantity = (itemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return {
    cartItems: cartState.items,
    totalAmount: cartState.totalAmount,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearCart,
  };
};

export default useCart;
