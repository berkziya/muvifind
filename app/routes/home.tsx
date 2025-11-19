import { MoviesGrid } from '../components/MoviesGrid';
import { ActorsGrid } from '../components/ActorsGrid';
import { SearchBox } from '../components/SearchBox';
import { useActors } from '../hooks/useActors';
import { useMovies } from '../hooks/useMovies';
import type { MetaArgs, LoaderArgs, ComponentProps } from '../types';

export function meta({}: MetaArgs) {
  return [
    { title: "MuviFInd - Discover Movies by Popular Actors" },
    { name: "description", content: "Find movies by searching for actors or browsing popular ones. Powered by TMDB for comprehensive actor discovery." },
  ];
}

export default function Home({ loaderData }: ComponentProps) {
  const {
    selectedActors,
    allActors,
    displayedActors,
    isLoadingActors,
    selectActor,
    removeActor,
    clearAllActors,
    loadMoreActors,
  } = useActors();

  const { movies, isLoading } = useMovies(selectedActors);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden transition-colors duration-200">
      {/* Bauhaus geometric decorations */}
      <div className="bauhaus-circle w-64 h-64 bg-[#ffb703] opacity-80 -top-32 -left-32"></div>
      <div className="bauhaus-circle w-48 h-48 bg-[#e63946] opacity-70 top-20 right-10"></div>
      <div className="bauhaus-square w-40 h-40 bg-[#1d3557] dark:bg-[#457b9d] opacity-60 bottom-40 left-20 rotate-45"></div>
      <div className="bauhaus-circle w-32 h-32 bg-[#ffb703] opacity-50 bottom-10 right-40"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Bauhaus Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-[#e63946] rounded-full flex items-center justify-center overflow-hidden relative border-4 border-black dark:border-white">
              <div className="absolute w-8 h-8 bg-[#ffb703] rounded-full top-1 right-1"></div>
              <div className="absolute w-6 h-6 bg-[#1d3557] bottom-2 left-3 rotate-45"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-black dark:text-white tracking-tighter uppercase">
              Muvi<span className="text-[#e63946]">Find</span>
            </h1>
            <div className="w-4 h-16 bg-[#ffb703]"></div>
          </div>
          <p className="text-lg text-[#1d3557] dark:text-[#a8dadc] max-w-2xl mx-auto mb-2 font-medium">
            Find movies by selecting actors. Powered by TMDB for comprehensive results!
          </p>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-1 bg-[#e63946]"></div>
            <p className="text-sm text-black dark:text-white font-bold uppercase tracking-wide">
              Discover Cinema
            </p>
            <div className="w-8 h-1 bg-[#1d3557] dark:bg-[#a8dadc]"></div>
          </div>
          
          {/* Search Box */}
          <SearchBox 
            onSelectActor={selectActor}
            selectedActors={selectedActors}
          />
        </header>

        {/* Movies Section */}
        <MoviesGrid 
          selectedActors={selectedActors}
          movies={movies}
          isLoading={isLoading}
        />

        {/* Actor Grid Section */}
        <ActorsGrid
          displayedActors={displayedActors}
          selectedActors={selectedActors}
          isLoadingActors={isLoadingActors}
          allActors={allActors}
          onSelectActor={selectActor}
          onRemoveActor={removeActor}
          onClearAll={clearAllActors}
          onLoadMore={loadMoreActors}
        />

        {/* Empty State */}
        {!isLoadingActors && displayedActors.length === 0 && (
          <div className="text-center text-black dark:text-white max-w-md mx-auto py-12">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-[#e63946] rounded-full opacity-20 animate-pulse"></div>
              <svg className="w-full h-full text-[#1d3557] dark:text-[#a8dadc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-lg font-bold">No actors found. Try refreshing the page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
