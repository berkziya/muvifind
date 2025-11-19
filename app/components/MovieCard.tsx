import type { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="flex-shrink-0 w-40 bg-white border-4 border-black overflow-hidden hover:transform hover:scale-105 transition-all duration-150 shadow-lg">
      {movie.poster_path ? (
        <div className="relative w-full aspect-[2/3]">
          {/* Placeholder background */}
          <div className="absolute inset-0 bg-[#e5e5e5] animate-pulse"></div>
          <img
            src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <div className="w-full aspect-[2/3] bg-[#e5e5e5] flex items-center justify-center">
          <span className="text-black text-xs font-bold">No Poster</span>
        </div>
      )}
      <div className="p-2 bg-[#1d3557]">
        <h4 className="text-xs font-bold text-white mb-1 truncate uppercase">{movie.title}</h4>
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#ffb703] font-bold">{movie.release_date ? new Date(movie.release_date).getFullYear() : '?'}</span>
          <span className="text-[#ffb703] font-bold">⭐ {movie.vote_average.toFixed(1)}</span>
        </div>
        {/* Show match indicator when 3+ actors selected */}
        {movie.matching_actors && movie.total_selected_actors && movie.total_selected_actors > 2 && (
          <div className={`mt-1 text-xs font-bold ${
            movie.is_perfect_match 
              ? 'text-[#ffb703]'
              : 'text-[#e63946]'
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
    <div className="flex-shrink-0 w-40 bg-white border-4 border-black overflow-hidden opacity-50">
      <div className="w-full aspect-[2/3] bg-[#e5e5e5]"></div>
      <div className="p-2 bg-[#1d3557]">
        <div className="h-4 bg-[#ffb703] mb-1"></div>
        <div className="flex justify-between items-center text-xs">
          <div className="h-3 w-8 bg-[#ffb703]"></div>
          <div className="h-4 w-12 bg-[#ffb703]"></div>
        </div>
      </div>
    </div>
  );
}

export function MovieCardPlaceholder() {
  return <MovieCardSkeleton />;
}
