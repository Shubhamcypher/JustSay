const MOCK_WATCHLIST = [
  { id: "1", name: "watchlist One", price: 29.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400", description: "Quality watchlist" },
  { id: "2", name: "watchlist Two", price: 49.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", description: "Premium watchlist" },
  { id: "3", name: "watchlist Three", price: 19.99, image: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400", description: "Affordable watchlist" },
  { id: "4", name: "watchlist Four", price: 39.99, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400", description: "Popular watchlist" },
];

import React, { useState } from 'react';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';

const WatchlistPage = () => {
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState(MOCK_WATCHLIST);

  if (loading) return <Loader />;
  if (!watchlist || watchlist.length === 0) return <div className="text-center text-gray-400">Your watchlist is empty</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-white mb-8">My Watchlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(watchlist ?? []).map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default WatchlistPage;
