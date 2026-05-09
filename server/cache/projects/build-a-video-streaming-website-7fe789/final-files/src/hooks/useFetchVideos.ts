import { useState, useEffect } from 'react';
import { MOCK_VIDEOS } from '../utils/constants';

const useFetchVideos = () => {
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setVideos(MOCK_VIDEOS);
      } catch (err) {
        setError('Failed to fetch videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return { videos, loading, error };
};

export default useFetchVideos;
