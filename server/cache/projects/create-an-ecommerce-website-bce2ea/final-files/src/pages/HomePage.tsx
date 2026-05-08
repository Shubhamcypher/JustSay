import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../utils/constants';

const HomePage = () => {
  const [products] = useState(MOCK_PRODUCTS);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Our Store</h1>
        <p className="text-gray-400 text-lg">Discover our range of products and find what suits you best.</p>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(products ?? []).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
};

export default HomePage;
