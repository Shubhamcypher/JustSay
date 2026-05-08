import React from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../utils/constants';

const ProductPage = () => {
  const { productId } = useParams();
  const product = MOCK_PRODUCTS.find(p => p.id === productId);

  if (!product) {
    return <div className="flex items-center justify-center h-64 text-center text-white">Product not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row gap-8">
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" alt="" className="w-full md:w-1/2 rounded-xl shadow-lg" alt={product.name}/>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
          <p className="text-gray-400 mb-4">{product.description}</p>
          <p className="text-xl text-white font-semibold mb-4">${(product.price ?? 0).toFixed(2)}</p>
          <button className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
