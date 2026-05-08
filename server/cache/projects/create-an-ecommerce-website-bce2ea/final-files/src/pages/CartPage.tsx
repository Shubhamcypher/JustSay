import React from 'react';
import useCart from '../hooks/useCart';
import CartItem from '../components/CartItem';

const CartPage = () => {
  const { cartItems, total, removeItem, updateQuantity } = useCart();

  if (!cartItems || cartItems.length === 0) {
    return <div className="flex items-center justify-center h-64 text-center text-white">Your cart is empty. Start shopping now!</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
      <div className="flex flex-col gap-6">
        {(cartItems ?? []).map(item => (
          <CartItem key={item.id} item={item} onRemove={removeItem} onUpdateQuantity={updateQuantity} />
        ))}
      </div>
      <div className="mt-12 text-right">
        <p className="text-xl text-white font-semibold">Total: ${total.toFixed(2)}</p>
        <button className="mt-4 px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md">Proceed to Checkout</button>
      </div>
    </div>
  );
};

export default CartPage;
