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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-5xl">🔮</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Muvi<span className="text-purple-400">Find</span>
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-2">
            Find movies by selecting actors. Enhanced search with Wikidata + TMDB for comprehensive results!
          </p>
          <p className="text-sm text-purple-300 mb-6">
            ✨ Discover hidden gems and perfect actor combinations
          </p>
          
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
          <div className="text-center text-gray-300 max-w-md mx-auto py-12">
            <div className="text-6xl mb-4">🎭</div>
            <p className="text-lg">No actors found. Try refreshing the page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
