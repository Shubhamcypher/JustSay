import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../utils/constants';

const HomePage = () => {
  const [products] = useState(MOCK_PRODUCTS);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-white">Fresh Vegetables Delivered to Your Doorstep</h1>
        <p className="text-gray-400 mb-6">Explore our wide range of fresh and organic vegetables.</p>
        <button className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/40">
          Shop Now
        </button>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(products ?? []).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
