import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { MOCK_MOVIES } from '../utils/constants';

const MovieDetailsPage = () => {
  const { movieId } = useParams();
  const [loading, setLoading] = useState(false);
  const movie = MOCK_MOVIES.find(m => m.id === movieId);

  if (loading) return <Loader />;
  if (!movie) return <div className="text-center text-gray-400">Movie not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>
      <p className="text-gray-400 mb-6">{movie.description}</p>
      <div className="flex gap-4">
        <button className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">Play</button>
        <button className="px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors">Add to Watchlist</button>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
