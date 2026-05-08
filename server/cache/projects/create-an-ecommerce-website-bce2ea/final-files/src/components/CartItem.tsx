interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  };
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
}

const CartItem = ({ item, onRemove, onQuantityChange }: CartItemProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
      <img src={item?.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400'} alt={item?.name ?? 'Cart Item'} className="w-16 h-16 object-cover rounded-lg" />
      <div className="flex-1">
        <h4 className="text-white font-medium">{item?.name ?? 'Unknown Item'}</h4>
        <p className="text-gray-400">${item?.price?.toFixed(2) ?? '0.00'}</p>
        <div className="flex items-center mt-2">
          <button onClick={() => onQuantityChange(item.id, item.quantity - 1)} className="px-2 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">-</button>
          <span className="mx-2 text-white">{item?.quantity ?? 0}</span>
          <button onClick={() => onQuantityChange(item.id, item.quantity + 1)} className="px-2 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">+</button>
        </div>
      </div>
      <button onClick={() => onRemove(item.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">Remove</button>
    </div>
  );
};

export default CartItem;
