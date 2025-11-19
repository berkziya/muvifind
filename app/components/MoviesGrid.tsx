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
          <div className="text-center max-w-md relative">
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#ffb703] opacity-50 rotate-45"></div>
            <div className="w-20 h-20 mx-auto mb-4 relative z-10 flex items-center justify-center">
              <svg className="w-full h-full text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-black dark:text-white mb-2 uppercase">
              Ready to Discover Movies?
            </h3>
            <p className="text-[#1d3557] dark:text-[#a8dadc] text-sm leading-relaxed font-medium">
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
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-[#e63946] flex items-center justify-center border-2 border-black dark:border-white">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-black dark:text-white uppercase">
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
                <span className="w-3 h-3 bg-[#ffb703] border-2 border-black dark:border-white"></span>
                <span className="text-black dark:text-white font-bold">Perfect matches</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 bg-[#e63946] border-2 border-black dark:border-white"></span>
                <span className="text-black dark:text-white font-bold">Partial matches</span>
              </span>
            </div>
          )}
          {/* Fixed height container for loading state to prevent layout shift */}
          <div className="h-6 flex items-center justify-center">
            {isLoading && (
              <p className="text-black dark:text-white text-sm font-bold">
                <span className="inline-block w-2 h-2 bg-[#1d3557] dark:bg-[#a8dadc] rounded-full animate-pulse mr-2"></span>
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
