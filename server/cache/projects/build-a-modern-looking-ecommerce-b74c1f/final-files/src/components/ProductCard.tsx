import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl shadow-md p-4 hover:shadow-lg hover:border-indigo-500/50 hover:bg-gray-800 transition-all duration-200">
      <img src={product?.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400"} alt={product?.name} className="w-full h-48 object-cover rounded-xl mb-4" />
      <h3 className="text-white font-medium mb-2">{product?.name ?? "Unknown Product"}</h3>
      <p className="text-gray-400 mb-4">${product?.price?.toFixed(2) ?? "0.00"}</p>
      <button className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
