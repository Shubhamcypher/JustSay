import React from 'react';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  };
}

const CartItem = ({ item }: CartItemProps) => {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-700">
      <img src={item?.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400"} alt={item?.name} className="w-16 h-16 object-cover rounded-lg" />
      <div className="flex-1">
        <h4 className="text-white font-medium">{item?.name ?? "Unknown Item"}</h4>
        <p className="text-gray-400">${item?.price?.toFixed(2) ?? "0.00"}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors">-</button>
        <span className="text-white">{item?.quantity ?? 0}</span>
        <button className="px-2 py-1 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors">+</button>
      </div>
      <button className="ml-4 px-2 py-1 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors">
        Remove
      </button>
    </div>
  );
};

export default CartItem;
