import { useParams } from 'react-router-dom';
import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../utils/constants';

const ProductPage = () => {
  const { id } = useParams();
  const [product] = useState(() => (MOCK_PRODUCTS ?? []).find(p => p.id === id));

  if (!product) {
    return <div className="text-center py-20 text-gray-400">Product not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row gap-8">
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" alt="" className="w-full md:w-1/2 rounded-xl shadow-md" alt={product?.name}/>
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-4 text-white">{product?.name}</h2>
          <p className="text-gray-400 mb-4">{product?.description}</p>
          <p className="text-xl font-semibold mb-4 text-white">${product?.price ?? 0}</p>
          <button className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/40">
            Add to Cart
          </button>
        </div>
      </div>
      <section className="mt-12">
        <h3 className="text-2xl font-semibold mb-4 text-white">Related Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(MOCK_PRODUCTS ?? []).filter(p => p.id !== id).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductPage;
