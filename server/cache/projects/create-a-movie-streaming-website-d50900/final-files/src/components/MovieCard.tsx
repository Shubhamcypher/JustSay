interface Movie {
  id: string;
  title: string;
  genre: string;
  rating: number;
  image: string;
}

const MovieCard = ({ movie }: { movie: Movie }) => {
  return (
    <div className="group relative bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 cursor-pointer hover:border-indigo-500/50 hover:bg-gray-800 transition-all duration-200">
      <img
        src={movie?.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400'}
        alt={movie?.title ?? 'Movie Image'}
        className="w-full h-48 object-cover rounded-xl mb-4"
      />
      <h3 className="text-white font-medium mb-1">{movie?.title ?? 'Untitled'}</h3>
      <p className="text-gray-400 text-sm mb-2">{movie?.genre ?? 'Unknown Genre'}</p>
      <p className="text-gray-400 text-sm">Rating: {movie?.rating ?? 0}/10</p>
    </div>
  );
};

export default MovieCard;
