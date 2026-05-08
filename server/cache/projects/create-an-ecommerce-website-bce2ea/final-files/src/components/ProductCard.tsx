interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
}

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="group relative bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 hover:bg-gray-800 transition-all duration-200">
      <img src={product?.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400'} alt={product?.name ?? 'Product'} className="w-full h-40 object-cover rounded-xl mb-4" />
      <h3 className="text-white font-medium mb-1">{product?.name ?? 'Unknown Product'}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">${product?.price?.toFixed(2) ?? '0.00'}</p>
      <div className="flex items-center mt-2">
        <span className="text-yellow-400">{'★'.repeat(product?.rating ?? 0)}</span>
        <span className="text-gray-400 ml-2">({product?.rating ?? 0})</span>
      </div>
    </div>
  );
};

export default ProductCard;
