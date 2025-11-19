import { MoviesGrid } from '../components/MoviesGrid';
import { ActorsGrid } from '../components/ActorsGrid';
import { SearchBox } from '../components/SearchBox';
import { useActors } from '../hooks/useActors';
import { useMovies } from '../hooks/useMovies';
import type { MetaArgs, LoaderArgs, ComponentProps } from '../types';

export function meta({}: MetaArgs) {
  return [
    { title: "MuviFInd - Discover Movies by Popular Actors" },
    { name: "description", content: "Find movies by searching for actors or browsing popular ones. Enhanced search powered by Wikidata and TMDB for comprehensive actor discovery." },
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Bauhaus geometric decorations */}
      <div className="bauhaus-circle w-64 h-64 bg-[#ffb703] opacity-80 -top-32 -left-32"></div>
      <div className="bauhaus-circle w-48 h-48 bg-[#e63946] opacity-70 top-20 right-10"></div>
      <div className="bauhaus-square w-40 h-40 bg-[#1d3557] opacity-60 bottom-40 left-20 rotate-45"></div>
      <div className="bauhaus-circle w-32 h-32 bg-[#ffb703] opacity-50 bottom-10 right-40"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Bauhaus Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-[#e63946] rounded-full flex items-center justify-center">
              <span className="text-3xl">🔮</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-black tracking-tighter uppercase">
              Muvi<span className="text-[#e63946]">Find</span>
            </h1>
            <div className="w-4 h-16 bg-[#ffb703]"></div>
          </div>
          <p className="text-lg text-[#1d3557] max-w-2xl mx-auto mb-2 font-medium">
            Find movies by selecting actors. Enhanced search with Wikidata + TMDB for comprehensive results!
          </p>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-1 bg-[#e63946]"></div>
            <p className="text-sm text-black font-bold uppercase tracking-wide">
              Discover Cinema
            </p>
            <div className="w-8 h-1 bg-[#1d3557]"></div>
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
          <div className="text-center text-black max-w-md mx-auto py-12">
            <div className="text-6xl mb-4">🎭</div>
            <p className="text-lg font-bold">No actors found. Try refreshing the page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
