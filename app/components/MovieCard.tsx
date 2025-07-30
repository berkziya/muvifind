import type { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="flex-shrink-0 w-40 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-150">
      {movie.poster_path ? (
        <div className="relative w-full aspect-[2/3]">
          {/* Placeholder background */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-700 animate-pulse"></div>
          <img
            src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center">
          <span className="text-gray-400 text-xs">No Poster</span>
        </div>
      )}
      <div className="p-2">
        <h4 className="text-xs font-semibold text-white mb-1 truncate">{movie.title}</h4>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">{movie.release_date ? new Date(movie.release_date).getFullYear() : '?'}</span>
          <span className="text-yellow-400 font-medium">⭐ {movie.vote_average.toFixed(1)}</span>
        </div>
        {/* Show match indicator when 3+ actors selected */}
        {movie.matching_actors && movie.total_selected_actors && movie.total_selected_actors > 2 && (
          <div className={`mt-1 text-xs font-medium ${
            movie.is_perfect_match 
              ? 'text-green-400' // Perfect matches in green
              : 'text-orange-400' // Partial matches in orange
          }`}>
            {movie.is_perfect_match ? '✓ All actors' : `${movie.matching_actors}/${movie.total_selected_actors} actors`}
          </div>
        )}
      </div>
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-40 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden opacity-50">
      <div className="w-full aspect-[2/3] bg-gradient-to-b from-gray-700 to-gray-800"></div>
      <div className="p-2">
        {/* Title skeleton - match real text height */}
        <div className="h-4 bg-gray-700 rounded mb-1"></div>
        <div className="flex justify-between items-center text-xs">
          <div className="h-3 w-8 bg-gray-700 rounded"></div>
          <div className="h-4 w-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function MovieCardPlaceholder() {
  return <MovieCardSkeleton />;
}
