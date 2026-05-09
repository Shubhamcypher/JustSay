import VideoCard from '../components/VideoCard';
import useFetchVideos from '../hooks/useFetchVideos';
import { CHANNEL_VIDEOS } from '../utils/constants';

const ChannelPage = () => {
  const { videos: channelVideos, loading: channelLoading } = useFetchVideos(CHANNEL_VIDEOS);

  if (channelLoading) return <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>;
  if (!channelVideos.length) return <div className="flex justify-center items-center h-64 text-gray-400">No videos available on this channel</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <header className="flex items-center gap-6 mb-12">
        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100" alt="Channel" className="w-20 h-20 rounded-full" />
        <div>
          <h1 className="text-3xl font-bold text-white">Channel Name</h1>
          <p className="text-gray-400">Channel description goes here.</p>
        </div>
      </header>
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Uploaded Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(channelVideos ?? []).map(video => <VideoCard key={video.id} video={video} />)}
        </div>
      </section>
    </div>
  );
};

export default ChannelPage;
