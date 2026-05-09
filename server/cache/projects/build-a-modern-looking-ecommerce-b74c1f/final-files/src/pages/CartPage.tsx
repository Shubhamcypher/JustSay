import React from 'react';
import CartItem from '../components/CartItem';
import useCart from '../hooks/useCart';

const CartPage = () => {
  const { cartItems, totalAmount } = useCart();

  if (!cartItems || cartItems.length === 0) {
    return <div className="p-6 text-center text-gray-400">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold text-white mb-4">Shopping Cart</h1>
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-md p-6">
        {(cartItems ?? []).map(item => (
          <CartItem key={item.id} item={item} />
        ))}
        <div className="flex justify-between items-center mt-6">
          <span className="text-lg text-white">Total:</span>
          <span className="text-lg font-semibold text-white">${totalAmount.toFixed(2)}</span>
        </div>
        <button className="mt-4 w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/40">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
