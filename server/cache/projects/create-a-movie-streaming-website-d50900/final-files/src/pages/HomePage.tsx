import React, { useState } from 'react';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import { MOCK_MOVIES } from '../utils/constants';

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState(MOCK_MOVIES);

  if (loading) return <Loader />;
  if (!movies || movies.length === 0) return <div className="text-center text-gray-400">No movies available</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-white mb-8">Featured Movies</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(movies ?? []).map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
