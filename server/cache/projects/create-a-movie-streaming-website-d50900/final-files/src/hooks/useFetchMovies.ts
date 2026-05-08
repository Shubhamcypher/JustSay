import { useState, useEffect } from 'react';
import { MOCK_MOVIES } from '../utils/constants';

const useFetchMovies = () => {
  const [movies, setMovies] = useState(MOCK_MOVIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        // Simulate a network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMovies(MOCK_MOVIES);
      } catch (err) {
        setError('Failed to fetch movies.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return { movies, loading, error };
};

export default useFetchMovies;
