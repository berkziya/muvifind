import { MovieCard, MovieCardSkeleton, MovieCardPlaceholder } from './MovieCard';
import type { Actor, Movie } from '../types';

interface MoviesGridProps {
  selectedActors: Actor[];
  movies: Movie[];
  isLoading: boolean;
}

export function MoviesGrid({ selectedActors, movies, isLoading }: MoviesGridProps) {
  if (selectedActors.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-center mb-6 py-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              Ready to Discover Movies?
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Search for actors above or select from the popular ones below. 
              Your movie recommendations will appear here!
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="overflow-x-auto py-4 scrollbar-hide">
            <div className="flex space-x-3 min-w-max px-4">
              {Array.from({ length: 15 }, (_, i) => (
                <MovieCardPlaceholder key={`movie-placeholder-${i}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-center mb-4 py-4">
        <div className="text-center max-w-2xl">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-2xl">🎭</span>
            <h3 className="text-xl font-bold text-white">
              Movies with {selectedActors.length === 1 
                ? selectedActors[0].name 
                : selectedActors.length === 2
                ? `${selectedActors[0].name} & ${selectedActors[1].name}`
                : `${selectedActors[0].name} & ${selectedActors.length - 1} others`
              }
            </h3>
          </div>
          {selectedActors.length > 2 && movies.length > 0 && (
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-green-400">Perfect matches</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span className="text-orange-400">Partial matches</span>
              </span>
            </div>
          )}
          {/* Fixed height container for loading state to prevent layout shift */}
          <div className="h-6 flex items-center justify-center">
            {isLoading && (
              <p className="text-gray-400 text-sm">
                <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2"></span>
                Finding movies...
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="overflow-x-auto py-4 scrollbar-hide">
          <div className="flex space-x-3 min-w-max px-4">
            {movies.length > 0 ? (
              movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))
            ) : isLoading ? (
              Array.from({ length: 20 }, (_, i) => (
                <MovieCardSkeleton key={`movie-skeleton-${i}`} />
              ))
            ) : (
              // Show a few skeletons even when not loading to maintain box height
              Array.from({ length: 15 }, (_, i) => (
                <MovieCardSkeleton key={`movie-placeholder-${i}`} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
