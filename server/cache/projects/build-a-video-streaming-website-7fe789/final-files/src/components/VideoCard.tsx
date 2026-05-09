interface Video {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  duration: string;
}

const VideoCard = ({ video }: { video: Video }) => (
  <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
    <img
      src={video?.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400'}
      alt={video?.title ?? 'Video Thumbnail'}
      className="w-full h-48 object-cover"
    />
    <div className="p-4">
      <h3 className="text-white font-medium mb-1">{video?.title ?? 'Untitled Video'}</h3>
      <p className="text-gray-400 text-sm">{(video?.views ?? 0).toLocaleString()} views • {video?.duration ?? '0:00'}</p>
    </div>
  </div>
);

export default VideoCard;
