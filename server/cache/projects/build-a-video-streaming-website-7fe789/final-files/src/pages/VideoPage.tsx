import VideoCard from '../components/VideoCard';
import useFetchVideos from '../hooks/useFetchVideos';
import { RELATED_VIDEOS } from '../utils/constants';

const VideoPage = () => {
  const { videos: relatedVideos, loading: relatedLoading } = useFetchVideos(RELATED_VIDEOS);

  if (relatedLoading) return <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>;
  if (!relatedVideos.length) return <div className="flex justify-center items-center h-64 text-gray-400">No related videos available</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <video controls className="w-full rounded-xl">
              <source src="https://www.example.com/video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Comments</h2>
            <div className="text-gray-400">No comments yet.</div>
          </div>
        </div>
        <aside className="w-full lg:w-1/3">
          <h2 className="text-2xl font-semibold text-white mb-6">Related Videos</h2>
          <div className="grid grid-cols-1 gap-4">
            {(relatedVideos ?? []).map(video => <VideoCard key={video.id} video={video} />)}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VideoPage;
