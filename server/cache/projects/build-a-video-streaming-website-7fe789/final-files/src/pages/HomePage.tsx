import VideoCard from '../components/VideoCard';
import useFetchVideos from '../hooks/useFetchVideos';
import { TRENDING_VIDEOS, RECOMMENDED_VIDEOS } from '../utils/constants';

const HomePage = () => {
  const { videos: trendingVideos, loading: trendingLoading } = useFetchVideos(TRENDING_VIDEOS);
  const { videos: recommendedVideos, loading: recommendedLoading } = useFetchVideos(RECOMMENDED_VIDEOS);

  if (trendingLoading || recommendedLoading) return <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>;
  if (!trendingVideos.length && !recommendedVideos.length) return <div className="flex justify-center items-center h-64 text-gray-400">No videos available</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-6">Trending Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(trendingVideos ?? []).map(video => <VideoCard key={video.id} video={video} />)}
        </div>
      </section>
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Recommended for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(recommendedVideos ?? []).map(video => <VideoCard key={video.id} video={video} />)}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
